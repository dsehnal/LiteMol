/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.ComplexReprensetation {
    import Model = Core.Structure.Molecule.Model
    import CU = Core.Utils
    import S = Core.Structure
    import Q = S.Query

    export interface Info {
        sequence: {
            all: number[],
            interacting: number[],
            modified: number[]
        },
        het: {
            carbohydrates: Carbohydrates.Info,
            other: number[]
        },
        freeWaterAtoms: number[]
    }

    const MAX_AMINO_SEQ_LIGAND_LENGTH = 10;
    const MAX_NUCLEOTIDE_SEQ_LIGAND_LENGTH = 2;

    export async function createComplexRepresentation(computation: Core.Computation.Context, model: Model, queryCtx: Q.Context): Promise<Info> {        
        await computation.updateProgress('Determing main sequence atoms...');
        const sequenceAtoms = findMainSequence(model, queryCtx);

        const modRes = model.data.modifiedResidues;
        const hasModRes = modRes && modRes.count > 0;

        // is everything cartoon?
        if (sequenceAtoms.length === queryCtx.atomCount && !hasModRes) {
            const ret: Info = { sequence: { all: sequenceAtoms, interacting: [], modified: [] }, het: { other: [], carbohydrates: Carbohydrates.EmptyInfo([]) }, freeWaterAtoms: [] };
            return ret;
        }

        const sequenceCtx = Q.Context.ofAtomIndices(model, sequenceAtoms);
        const modifiedSequence = getModRes(model, sequenceCtx);

        if (sequenceAtoms.length === queryCtx.atomCount) {
            const ret: Info = { sequence: { all: sequenceAtoms, interacting: [], modified: modifiedSequence }, het: { other: [], carbohydrates: Carbohydrates.EmptyInfo([]) }, freeWaterAtoms: [] };
            return ret;
        }

        const waterAtoms = Q.entities({ type: 'water' }).union().compile()(queryCtx).unionAtomIndices();
        const possibleHetGroupsAndInteractingSequenceQ = Q.or(Q.atomsFromIndices(waterAtoms), Q.atomsFromIndices(sequenceAtoms)).complement().ambientResidues(getMaxInteractionRadius(model)).union().compile();        
        const possibleHetGroupsAndInteractingSequence = possibleHetGroupsAndInteractingSequenceQ(queryCtx).fragments[0];

        // is everything cartoon?
        if (!possibleHetGroupsAndInteractingSequence) {
            const ret: Info = { sequence: { all: sequenceAtoms, interacting: [], modified: modifiedSequence }, het: { other: [], carbohydrates: Carbohydrates.EmptyInfo([]) }, freeWaterAtoms: waterAtoms };
            return ret;
        }

        await computation.updateProgress('Computing bonds...');
        const bonds = S.computeBonds(model, possibleHetGroupsAndInteractingSequence.atomIndices);

        const { entityIndex, residueIndex } = model.data.atoms;
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
        // HET GROUPS with SEQUENCE RESIDUES
        
        await computation.updateProgress('Identifying HET groups...');
        const sequenceMask = sequenceCtx.mask;
        const _hetGroupsWithSequence = CU.ChunkedArray.forInt32(possibleHetGroupsAndInteractingSequence.atomCount / 2);
        const boundSequence = CU.FastSet.create<number>(), boundHetAtoms = CU.FastSet.create<number>();

        for (let i = 0, __i = bonds.count; i < __i; i++) {
            const a = atomAIndex[i], b = atomBIndex[i];            
            const hasA = sequenceMask.has(a), hasB = sequenceMask.has(b);
            
            if (hasA) {
                if (!hasB) { 
                    boundSequence.add(residueIndex[a]);
                    boundHetAtoms.add(b);
                }
            } else if (hasB) {
                boundSequence.add(residueIndex[b]);
                boundHetAtoms.add(a);
            }
        }

        for (const aI of possibleHetGroupsAndInteractingSequence.atomIndices) {
            const rI = residueIndex[aI];
            if (sequenceMask.has(aI) && !boundSequence.has(rI)) continue;
            if (entType[entityIndex[aI]] === 'water' && !boundWaters.has(rI)) continue;
            CU.ChunkedArray.add(_hetGroupsWithSequence, aI);
        }

        const hetGroupsWithSequence = CU.ChunkedArray.compact(_hetGroupsWithSequence);

        /////////////////////////////////////////////////////
        // CARBS
        await computation.updateProgress('Identifying carbohydrates...');
        const carbohydrates = Carbohydrates.getInfo({ model, fragment: Q.Fragment.ofArray(queryCtx, hetGroupsWithSequence[0], hetGroupsWithSequence), atomMask: queryCtx.mask, bonds });

        /////////////////////////////////////////////////////
        // OTHER HET GROUPS
        await computation.updateProgress('Identifying non-carbohydrate HET groups...');
        const commonAtoms = CU.ChunkedArray.forInt32(hetGroupsWithSequence.length);
        const { map: carbMap } = carbohydrates;
        for (const aI of hetGroupsWithSequence) {
            const rI = residueIndex[aI];
            if (!carbMap.has(rI) && !sequenceMask.has(aI)) CU.ChunkedArray.add(commonAtoms, aI);
        }

        /////////////////////////////////////////////////////
        // INTERACTING SEQUENCE

        await computation.updateProgress('Identifying interacting sequence residues...');
        const interactingSequenceAtoms = CU.ChunkedArray.forInt32(hetGroupsWithSequence.length);
        for (const aI of hetGroupsWithSequence) {
            const rI = residueIndex[aI];
            if (boundSequence.has(rI) || (boundHetAtoms.has(aI) && !carbMap.has(rI))) CU.ChunkedArray.add(interactingSequenceAtoms, aI);
        }

        const ret: Info = { 
            sequence: { all: sequenceAtoms, interacting: CU.ChunkedArray.compact(interactingSequenceAtoms), modified: modifiedSequence }, 
            het: { other: CU.ChunkedArray.compact(commonAtoms), carbohydrates }, 
            freeWaterAtoms 
        };
        return ret;
    }

    function getModRes(model: Model, ctx: Q.Context): number[] {
        const modRes = model.data.modifiedResidues;
        const hasModRes = modRes && modRes.count > 0;

        if (!modRes || !hasModRes) return [];

        const { asymId, seqNumber, insCode } = modRes;
        const residues: Q.ResidueIdSchema[] = [];
        for (let i = 0, __i = modRes.count; i < __i; i++) {
            residues.push({ asymId: asymId[i], seqNumber: seqNumber[i], insCode: insCode[i] });
        }
        const q = Q.residues.apply(null, residues).compile() as Q;
        return q(ctx).unionAtomIndices();
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

    function chainLengthAndType(model: Model, cI: number, mask: CU.Mask) {
        const { secondaryStructure } = model.data;
        const { residueStartIndex, residueEndIndex } = model.data.chains;
        const { atomStartIndex, atomEndIndex, secondaryStructureIndex: ssi } = model.data.residues; 
        let length = 0;
        let isAmk = false, isNucleotide = false;
        for (let rI = residueStartIndex[cI], __b = residueEndIndex[cI]; rI < __b; rI++) {

            const ss = secondaryStructure[ssi[rI]].type;
            if (ss === S.SecondaryStructureType.Strand) {
                isNucleotide = true;
            } else if (ss !== S.SecondaryStructureType.None) {
                isAmk = true;
            }

            for (let aI = atomStartIndex[rI], __i = atomEndIndex[rI]; aI < __i; aI++) {
                if (mask.has(aI)) {
                    length++;
                    break;
                }
            }
        }
        return { length, isAmk, isNucleotide };
    }

    function findMainSequence(model: Model, queryCtx: Q.Context) {
        const { mask } = queryCtx;
        const { residueStartIndex, residueEndIndex } = model.data.chains;
        const { atomStartIndex, atomEndIndex } = model.data.residues;

        const atoms = CU.ChunkedArray.forInt32(queryCtx.atomCount);
        
        for (const cI of model.data.chains.indices) {
            const { length, isAmk, isNucleotide } = chainLengthAndType(model, cI, mask);
            if ((isAmk && length <= MAX_AMINO_SEQ_LIGAND_LENGTH) || (isNucleotide && length <= MAX_NUCLEOTIDE_SEQ_LIGAND_LENGTH)) continue;

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