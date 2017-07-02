/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.ComplexReprensetation {
    import Model = Core.Structure.Molecule.Model
    import CU = Core.Utils
    import S = Core.Structure
    import Q = S.Query

    export interface Info {
        mainSequenceAtoms: number[],
        het: {
            commonAtoms: number[],
            carbohydrates: Carbohydrates.Info
        },
        freeWaterAtoms: number[]
    }

    const MAX_LIGAND_SEQ_LENGTH = 10;

    export async function createComplexRepresentation(computation: Core.Computation.Context, model: Model, queryCtx: Q.Context): LiteMol.Promise<Info> {        
        await computation.updateProgress('Determing main sequence atoms...');
        const cartoonAtoms = findMainSequence(model, queryCtx);

        // is everything cartoon?
        if (cartoonAtoms.length === queryCtx.atomCount) {
            const ret: Info = { mainSequenceAtoms: cartoonAtoms, het: { commonAtoms: [], carbohydrates: Carbohydrates.EmptyInto }, freeWaterAtoms: [] };
            return ret;
        }

        const waterAtoms = Q.entities({ type: 'water' }).union().compile()(queryCtx).unionAtomIndices();
        const possibleHetGroupsQ = Q.or(Q.atomsFromIndices(waterAtoms), Q.atomsFromIndices(cartoonAtoms)).complement().ambientResidues(getMaxInteractionRadius(model)).union().compile();        
        const possibleHetGroups = possibleHetGroupsQ(queryCtx).fragments[0];

        // is everything cartoon?
        if (!possibleHetGroups) {
            const ret: Info = { mainSequenceAtoms: cartoonAtoms, het: { commonAtoms: [], carbohydrates: Carbohydrates.EmptyInto }, freeWaterAtoms: waterAtoms };
            return ret;
        }

        await computation.updateProgress('Computing bonds...');
        const bonds = S.computeBonds(model, possibleHetGroups.atomIndices);

        const { entityIndex, residueIndex, count: atomCount } = model.data.atoms;
        const { type: entType } = model.data.entities;

        const { atomAIndex, atomBIndex } = bonds;

        /////////////////////////////////////////////////////
        // WATERS
        await computation.updateProgress('Identifying free waters...');

        const boundWaters = CU.FastSet.create<number>();

        for (let i = 0, __i = bonds.count; i < __i; i++) {
            const a = atomAIndex[i], b = atomBIndex[i];
            const tA = entType[entityIndex[a]], tB = entType[entityIndex[b]];
            if (tA === 'water') {
                if (tB !== 'water') boundWaters.add(residueIndex[a]);
            } else if (tB === 'water') {
                boundWaters.add(residueIndex[b]);
            }
        }
        
        const freeWaterAtoms = new Int32Array(waterAtoms.length - boundWaters.size) as any as number[];
        let waterAtomsOffset = 0;

        for (const aI of waterAtoms) {
            if (!boundWaters.has(aI)) freeWaterAtoms[waterAtomsOffset++] = aI;
        }

        /////////////////////////////////////////////////////
        // All HET GROUPS
        
        await computation.updateProgress('Identifying HET groups...');
        const cartoonsMask = CU.Mask.ofIndices(atomCount, cartoonAtoms);
        const _hetGroups = CU.ChunkedArray.forInt32(possibleHetGroups.atomCount / 2);
        const boundCartoons = CU.FastSet.create<number>();

        for (let i = 0, __i = bonds.count; i < __i; i++) {
            const a = atomAIndex[i], b = atomBIndex[i];            
            const hasA = cartoonsMask.has(a), hasB = cartoonsMask.has(b);
            
            if (hasA) {
                if (!hasB) boundCartoons.add(residueIndex[a]);
            } else if (hasB) {
                boundCartoons.add(residueIndex[b]);
            }
        }

        for (const aI of possibleHetGroups.atomIndices) {
            const rI = residueIndex[aI];
            if (cartoonsMask.has(aI) && !boundCartoons.has(rI)) continue;
            if (entType[entityIndex[aI]] === 'water' && !boundWaters.has(rI)) continue;
            CU.ChunkedArray.add(_hetGroups, aI);
        }

        const hetGroups = CU.ChunkedArray.compact(_hetGroups);

        /////////////////////////////////////////////////////
        // CARBS
        await computation.updateProgress('Identifying carbohydrates...');
        const carbohydrates = Carbohydrates.getInfo({ model, fragment: Q.Fragment.ofArray(queryCtx, hetGroups[0], hetGroups), atomMask: queryCtx.mask, bonds });

        /////////////////////////////////////////////////////
        // COMMON HET GROUPS
        await computation.updateProgress('Identifying non-carbohydrate HET groups...');
        const commonAtoms = CU.ChunkedArray.forInt32(hetGroups.length);
        const { map: carbMap } = carbohydrates;
        for (const aI of hetGroups) {
            const rI = residueIndex[aI];
            if (!carbMap.has(rI)) CU.ChunkedArray.add(commonAtoms, aI);
        }

        const ret: Info = { mainSequenceAtoms: cartoonAtoms, het: { commonAtoms: CU.ChunkedArray.compact(commonAtoms), carbohydrates }, freeWaterAtoms };
        return ret;
    }

    function getMaxInteractionRadius(model: Model) {
        let maxLength = 3;
        if (model.data.bonds.structConn) {
            for (const c of model.data.bonds.structConn.entries) {
                if (c.distance > maxLength) maxLength = c.distance;
            }
        }
        return maxLength + 0.1;
    }

    function chainLength(model: Model, cI: number, mask: CU.Mask) {
        const { residueStartIndex, residueEndIndex } = model.data.chains;
        const { atomStartIndex, atomEndIndex } = model.data.residues; 
        let len = 0;
        for (let rI = residueStartIndex[cI], __b = residueEndIndex[cI]; rI < __b; rI++) {
            for (let aI = atomStartIndex[rI], __i = atomEndIndex[rI]; aI < __i; aI++) {
                if (mask.has(aI)) {
                    len++;
                    break;
                }
            }
        }
        return len;
    }

    function findMainSequence(model: Model, queryCtx: Q.Context) {
        const { mask } = queryCtx;
        const { residueStartIndex, residueEndIndex } = model.data.chains;
        const { atomStartIndex, atomEndIndex } = model.data.residues;

        const atoms = CU.ChunkedArray.forInt32(queryCtx.atomCount);
        
        for (const cI of model.data.chains.indices) {
            const len = chainLength(model, cI, mask);
            if (len <= MAX_LIGAND_SEQ_LENGTH) continue;

            for (let rI = residueStartIndex[cI], __b = residueEndIndex[cI]; rI < __b; rI++) {
                if (!isCartoonLike(model, mask, rI)) continue;
                for (let aI = atomStartIndex[rI], __i = atomEndIndex[rI]; aI < __i; aI++) {
                    if (mask.has(aI)) {
                        CU.ChunkedArray.add(atoms, aI);
                    }
                }
            }
        }

        return CU.ChunkedArray.compact(atoms);
    }

    function _isCartoonLike(mask: CU.Mask, start: number, end: number, name: string[], a: string, b: string, isAmk: boolean) {
        let aU = false, aV = false, hasP = false;
        for (let i = start; i < end; i++) {
            if (!mask.has(i)) continue;
            let n = name[i];
            if (!aU && n === a) {
                aU = true;
            } else if (!aV && n === b) { 
                aV = true; 
            }                
            if (aU && aV) return true;
            if (n === 'P') {
                hasP = true;
            }
        }
        if (isAmk) return aU;
        return hasP;
    }

    function isCartoonLike(model: Model, mask: CU.Mask, rI: number) {
        const { secondaryStructure, residues, atoms } = model.data;
        const { atomStartIndex, atomEndIndex, secondaryStructureIndex: ssi } = residues;

        const ss = secondaryStructure[ssi[rI]].type;
        if (ss === S.SecondaryStructureType.None) return false;

        const { name } = atoms;

        if (ss === S.SecondaryStructureType.Strand) {
            return _isCartoonLike(mask, atomStartIndex[rI], atomEndIndex[rI], name, "O5'", "C3'", false);
        } else {
            return _isCartoonLike(mask, atomStartIndex[rI], atomEndIndex[rI], name, "CA", "O", true);
        }
    }
}