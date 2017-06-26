/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Structure {
    'use strict';

    import DataTable = Utils.DataTable

    namespace SymmetryHelpers {

        import Mat4 = Geometry.LinearAlgebra.Matrix4;
        import Vec3 = Geometry.LinearAlgebra.Vector3;

        interface Sphere3 { center: Vec3, radius: number }

        function getBoudingSphere(arrays: { x: number[], y: number[], z: number[] }, indices: number[]): Sphere3 {

            let { x, y, z } = arrays;
            let center = Vec3.zero();
            for (let aI of indices) {
                center[0] += x[aI];
                center[1] += y[aI];
                center[2] += z[aI];
            }

            let count = indices.length > 0 ? indices.length : 1;
            center[0] /= count; 
            center[1] /= count; 
            center[2] /= count;

            let r = 0;

            for (let aI of indices) {
                r = Math.max(indexedVectorDistSq(aI, center, arrays), r);
            }

            return { center, radius: Math.sqrt(r) };
        }

        interface BoundingData { x: number, y: number, z: number, r: number }
        type BoundingDataTable = DataTable<BoundingData>

        function getSphereDist(c: Vec3, r: number, q: Sphere3) {
            return Vec3.distance(c, q.center) - (r + q.radius);
        }

        function isWithinRadius(
            bounds: Sphere3, i: number, data: BoundingDataTable, t: number[], r: number, v: Vec3) {

            v[0] = data.x[i]; v[1] = data.y[i]; v[2] = data.z[i];
            Vec3.transformMat4(v, v, t);


            return getSphereDist(v, data.r[i], bounds) <= r;
        }

        function indexedDistSq(
            aI: number, cI: number,
            arrays: { x: number[]; y: number[]; z: number[]; cX: number[]; cY: number[]; cZ: number[]; }) {

            let dx = arrays.x[aI] - arrays.cX[cI],
                dy = arrays.y[aI] - arrays.cY[cI],
                dz = arrays.z[aI] - arrays.cZ[cI];

            return dx * dx + dy * dy + dz * dz;
        }

        function indexedVectorDistSq(
            aI: number, v: Vec3,
            arrays: { x: number[]; y: number[]; z: number[]; }) {

            let dx = arrays.x[aI] - v[0],
                dy = arrays.y[aI] - v[1],
                dz = arrays.z[aI] - v[2];

            return dx * dx + dy * dy + dz * dz;
        }

        interface BoundingInfo {
            entities: BoundingDataTable,
            chains: BoundingDataTable,
            residues: BoundingDataTable,
            allAtoms: Sphere3,
            target: Sphere3
        }

        interface SymmetryContext {
            model: Molecule.Model,
            boundingInfo: BoundingInfo,
            spacegroup: Spacegroup,
            radius: number,

            transform: number[],
            transformed: Vec3,
            i: number,
            j: number,
            k: number,
            op: number
        }

        function createSymmetryContext(model: Molecule.Model, boundingInfo: BoundingInfo, spacegroup: Spacegroup, radius: number): SymmetryContext {
            return {
                model,
                boundingInfo,
                spacegroup,
                radius,
                transform: Mat4.zero(),
                transformed: Vec3.zero(),
                i: 0, j: 0, k: 0, op: 0
            };
        }

        function symmetryContextMap(ctx: SymmetryContext, p: Vec3) {
            return Vec3.transformMat4(ctx.transformed, p, ctx.transform);
        }

        function symmetryContextGetTransform(ctx: SymmetryContext) {
            return createSymmetryTransform(ctx.i, ctx.j, ctx.k, ctx.op, Mat4.clone(ctx.transform));
        }

        interface SymmetryTransform {
            isIdentity: boolean,
            id: string,
            transform: number[]
        }

        function createSymmetryTransform(i: number, j: number, k: number, opIndex: number, transform: number[]): SymmetryTransform {
            return {
                isIdentity: !i && !j && !k && !opIndex,
                id: `${opIndex + 1}_${5 + i}${5 + j}${5 + k}`,
                transform
            }
        }

        function createAssemblyTransform(i: number, transform: number[]): SymmetryTransform {
            let isIdentity = true;
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    let v = transform[4 * j + i];
                    if (i === j) {
                        if (Math.abs(v - 1) > 0.0000001) { isIdentity = false; break; }
                    } else if (Math.abs(v) > 0.0000001) { isIdentity = false; break; }
                }
                if (!isIdentity) break;
            }

            return {
                isIdentity,
                id: i.toString(),
                transform
            }
        }

        function getBoundingInfo(model: Molecule.Model, pivotIndices: number[]): BoundingInfo {

            let atoms = model.data.atoms,                
                residues = model.data.residues,
                chains = model.data.chains,
                entities = model.data.entities,
                { x, y, z } = model.positions;

            let entityTable = DataTable.builder<BoundingData>(entities.count),
                eX = entityTable.addColumn('x', s => new Float64Array(s)),
                eY = entityTable.addColumn('y', s => new Float64Array(s)),
                eZ = entityTable.addColumn('z', s => new Float64Array(s)),
                eR = entityTable.addColumn('r', s => new Float64Array(s)),

                chainTable =  DataTable.builder<BoundingData>(chains.count),
                cX = chainTable.addColumn('x', s => new Float64Array(s)),
                cY = chainTable.addColumn('y', s => new Float64Array(s)),
                cZ = chainTable.addColumn('z', s => new Float64Array(s)),
                cR = chainTable.addColumn('r', s => new Float64Array(s)),

                residueTable = DataTable.builder<BoundingData>(residues.count),
                rX = residueTable.addColumn('x', s => new Float64Array(s)),
                rY = residueTable.addColumn('y', s => new Float64Array(s)),
                rZ = residueTable.addColumn('z', s => new Float64Array(s)),
                rR = residueTable.addColumn('r', s => new Float64Array(s));

            let allCenter = Vec3.zero(), allRadius = 0,
                pivotCenter = Vec3.zero(), pivotRadius = 0,

                n = 0,

                eCenter = Vec3.zero(), eRadius = 0,
                cCenter = Vec3.zero(), cRadius = 0,
                rCenter = Vec3.zero(), rRadius = 0;

            for (let eI = 0, _eC = entities.count; eI < _eC; eI++) {
                Vec3.set(eCenter, 0, 0, 0);

                for (let cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {
                    Vec3.set(cCenter, 0, 0, 0);

                    for (let rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {
                        Vec3.set(rCenter, 0, 0, 0);

                        for (let aI = residues.atomStartIndex[rI], _aC = residues.atomEndIndex[rI]; aI < _aC; aI++) {
                            rCenter[0] += x[aI];
                            rCenter[1] += y[aI];
                            rCenter[2] += z[aI];
                        }

                        Vec3.add(allCenter, allCenter, rCenter);

                        n = residues.atomEndIndex[rI] - residues.atomStartIndex[rI];

                        Vec3.add(cCenter, cCenter, rCenter);

                        rX[rI] = rCenter[0] / n; rY[rI] = rCenter[1] / n; rZ[rI] = rCenter[2] / n;
                    }

                    Vec3.add(eCenter, eCenter, cCenter);

                    n = chains.atomEndIndex[cI] - chains.atomStartIndex[cI];
                    cX[cI] = cCenter[0] / n; cY[cI] = cCenter[1] / n; cZ[cI] = cCenter[2] / n;
                }

                n = entities.atomEndIndex[eI] - entities.atomStartIndex[eI];
                eX[eI] = eCenter[0] / n; eY[eI] = eCenter[1] / n; eZ[eI] = eCenter[2] / n;
            }
            allCenter[0] /= atoms.count; 
            allCenter[1] /= atoms.count; 
            allCenter[2] /= atoms.count;

            for (let aI of pivotIndices) {
                pivotCenter[0] += x[aI];
                pivotCenter[1] += y[aI];
                pivotCenter[2] += z[aI];
            }

            let pivotCount = pivotIndices.length > 0 ? pivotIndices.length : 1;
            pivotCenter[0] /= pivotCount; 
            pivotCenter[1] /= pivotCount; 
            pivotCenter[2] /= pivotCount;


            let eDA = { x: x, y: y, z: z, cX: <number[]><any>eX, cY: <number[]><any>eY, cZ: <number[]><any>eZ },
                cDA = { x: x, y: y, z: z, cX: <number[]><any>cX, cY: <number[]><any>cY, cZ: <number[]><any>cZ },
                rDA = { x: x, y: y, z: z, cX: <number[]><any>rX, cY: <number[]><any>rY, cZ: <number[]><any>rZ };

            for (let eI = 0, _eC = entities.count; eI < _eC; eI++) {

                eRadius = 0;

                for (let cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {

                    cRadius = 0;
                    for (let rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {

                        rRadius = 0;
                        for (let aI = residues.atomStartIndex[rI], _aC = residues.atomEndIndex[rI]; aI < _aC; aI++) {
                            rRadius = Math.max(rRadius, indexedDistSq(aI, rI, rDA));
                            cRadius = Math.max(cRadius, indexedDistSq(aI, cI, cDA));
                            eRadius = Math.max(eRadius, indexedDistSq(aI, eI, eDA));

                            allRadius = Math.max(allRadius, indexedVectorDistSq(aI, allCenter, rDA));
                        }
                        rRadius = Math.sqrt(rRadius);
                        rR[rI] = rRadius;
                    }
                    cRadius = Math.sqrt(cRadius);
                    cR[cI] = cRadius;
                }
                eRadius = Math.sqrt(eRadius);
                eR[eI] = eRadius;
            }

            allRadius = Math.sqrt(allRadius);

            for (let aI of pivotIndices) {
                pivotRadius = Math.max(pivotRadius, indexedVectorDistSq(aI, pivotCenter, rDA));
            }
            pivotRadius = Math.sqrt(pivotRadius);

            return <BoundingInfo>{
                entities: entityTable.seal(),
                chains: chainTable.seal(),
                residues: residueTable.seal(),
                allAtoms: { center: allCenter, radius: allRadius },
                target: { center: pivotCenter, radius: pivotRadius }
            };
        }

        function findSuitableTransforms(ctx: SymmetryContext) {
            let bounds = ctx.boundingInfo,
                sg = ctx.spacegroup;

            let ret: SymmetryTransform[] = [];

            ctx.transform = Mat4.identity();
            ret[0] = symmetryContextGetTransform(ctx);

            for (let i = -3; i <= 3; i++) {
                for (let j = -3; j <= 3; j++) {
                    for (let k = -3; k <= 3; k++) {
                        for (let l = (i === 0 && j === 0 && k === 0 ? 1 : 0), lm = sg.operatorCount; l < lm; l++) {
                            sg.getOperatorMatrix(l, i, j, k, ctx.transform);
                            ctx.i = i;
                            ctx.k = k;
                            ctx.j = j;
                            ctx.op = l;

                            let t = symmetryContextMap(ctx, bounds.allAtoms.center),
                                d = getSphereDist(t, bounds.allAtoms.radius, bounds.target);

                            if (d < ctx.radius) {
                                ret[ret.length] = symmetryContextGetTransform(ctx);
                            }
                        }
                    }
                }
            }

            return ret;

        }

        function getSymmetryResidues(ctx: SymmetryContext, transforms: SymmetryTransform[]) {
            let bounds = ctx.boundingInfo,
                radius = ctx.radius,
                targetBounds = bounds.target;

            let model = ctx.model,
                residues = model.data.residues,
                chains = model.data.chains,
                entities = model.data.entities;

            let residueIndices = Utils.ChunkedArray.create<number>(s => new Int32Array(s), residues.count, 1),
                operatorIndices = Utils.ChunkedArray.create<number>(s => new Int32Array(s), residues.count, 1);

            let v = Vec3.zero(),
                opIndex = 0;

            let atomCount = 0,
                chainCount = 0,
                entityCount = 0;

            for (let eI = 0, _eC = entities.count; eI < _eC; eI++) {
                opIndex = 0;
                let chainAdded = false;
                for (let t of transforms) {
                    for (let cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {
                        if (!isWithinRadius(targetBounds, cI, bounds.chains, t.transform, radius, v)) continue;

                        let residueAdded = false;
                        for (let rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {

                            if (!isWithinRadius(targetBounds, rI, bounds.residues, t.transform, radius, v)) continue;

                            Utils.ChunkedArray.add(residueIndices, rI);
                            Utils.ChunkedArray.add(operatorIndices, opIndex);

                            atomCount += residues.atomEndIndex[rI] - residues.atomStartIndex[rI];
                            residueAdded = true;
                        }
                        if (residueAdded) {
                            chainCount += 1;
                            chainAdded = true;
                        }
                    }
                    opIndex++;
                }
                if (chainAdded) {
                    entityCount++;
                }
            }

            return {
                residues: Utils.ChunkedArray.compact(residueIndices),
                operators: Utils.ChunkedArray.compact(operatorIndices),

                atomCount,
                chainCount,
                entityCount
            };
        }

        function cloneRow(src: any[][], sI: number, target: any[][], tI: number, c: number) {
            for (let i = 0; i < c; i++) {
                target[i][tI] = src[i][sI];
            }
        }

        function assemble(
            model: Molecule.Model,
            assemblyParts: { residues: number[], operators: number[], atomCount: number; chainCount: number, entityCount: number },
            transforms: SymmetryTransform[]) {

            let residues = model.data.residues,
                residueChainIndex = residues.chainIndex,
                residueEntityIndex = residues.entityIndex,
                residueAtomStartIndex = residues.atomStartIndex,
                residueAtomEndIndex = residues.atomEndIndex,
                atoms = model.data.atoms,
                { x, y, z } = model.positions;

            let atomTable = DataTable.builder<Atom>(assemblyParts.atomCount),
                atomId: number[] | undefined,
                atomResidue: number[] | undefined, atomChain: number[] | undefined, atomEntity: number[] | undefined,
                cols: { src: any[]; target: any[] }[] = [];

            let positionTable = DataTable.ofDefinition(Tables.Positions, assemblyParts.atomCount),
                atomX = positionTable.x, atomY = positionTable.y, atomZ = positionTable.z;

            let entityTableBuilder = model.data.entities.getBuilder(assemblyParts.entityCount),
                entityTable = <EntityTable><any>entityTableBuilder,
                srcEntityData = model.data.entities.getRawData(), entityData = entityTable.getRawData(),
                entityChainStart = entityTable.chainStartIndex, entityChainEnd = entityTable.chainEndIndex,
                entityResidueStart = entityTable.residueStartIndex, entityResidueEnd = entityTable.residueEndIndex,
                entityAtomStart = entityTable.atomStartIndex, entityAtomEnd = entityTable.atomEndIndex,
                entityOffset = 0;

            let chainTableBuilder = model.data.chains.getBuilder(assemblyParts.chainCount),
                chainTable = <ChainTable><any>chainTableBuilder,
                srcChainData = model.data.chains.getRawData(), chainData = chainTable.getRawData(),
                chainResidueStart = chainTable.residueStartIndex, chainResidueEnd = chainTable.residueEndIndex,
                chainAtomStart = chainTable.atomStartIndex, chainAtomEnd = chainTable.atomEndIndex,
                chainId = chainTable.asymId, chainAuthId = chainTable.authAsymId,
                chainEntity = chainTable.entityIndex,
                chainSourceChainIndex = chainTableBuilder.addColumn('sourceChainIndex', s => new Int32Array(s)),
                chainOperatorIndex = chainTableBuilder.addColumn('operatorIndex', s => new Int32Array(s)),
                chainOffset = 0;

            let residueTableBuilder = model.data.residues.getBuilder(assemblyParts.residues.length),
                residueTable = <ResidueTable><any>residueTableBuilder,
                srcResidueData = model.data.residues.getRawData(), residueData = residueTable.getRawData(),
                residueAtomStart = residueTable.atomStartIndex, residueAtomEnd = residueTable.atomEndIndex,
                residueAsymId = residueTable.asymId, residueAuthAsymId = residueTable.authAsymId,
                residueChain = residueTable.chainIndex,
                residueEntity = residueTable.entityIndex;

            for (let col of model.data.atoms.columns) {
                let c = atomTable.addColumn(col.name, col.creator);
                if (col.name === 'residueIndex') atomResidue = c;
                else if (col.name === 'chainIndex') atomChain = c;
                else if (col.name === 'entityIndex') atomEntity = c;
                else if (col.name === 'id') atomId = c;
                else {
                    cols[cols.length] = {
                        src: (<any>atoms)[col.name],
                        target: c
                    };
                }
            }

            let assemblyResidueParts = assemblyParts.residues,
                assemblyOpParts = assemblyParts.operators,
                temp = Geometry.LinearAlgebra.Vector3.zero(),
                atomOffset = 0;

            let rI = assemblyResidueParts[0],
                currentChain = residueChainIndex[rI],
                currentEntity = residueEntityIndex[rI],
                currentOp = assemblyOpParts[0],
                currentAsymId: string, currentAuthAsymId: string;

            // setup entity table
            cloneRow(srcEntityData, residueEntityIndex[rI], entityData, 0, srcEntityData.length);
            entityChainStart[0] = 0;
            entityResidueStart[0] = 0;
            entityAtomStart[0] = 0;

            //setup chain table
            cloneRow(srcChainData, residueChainIndex[rI], chainData, 0, srcChainData.length);
            chainEntity[0] = 0;
            chainResidueStart[0] = 0;
            chainAtomStart[0] = 0;
            currentAsymId = model.data.chains.asymId[residueChainIndex[rI]];
            currentAuthAsymId = model.data.chains.authAsymId[residueChainIndex[rI]];

            let transform = transforms[assemblyOpParts[0]];

            if (transform && !transform.isIdentity) {
                chainId[chainOffset] = model.data.chains.asymId[residueChainIndex[rI]] + '-' + transform.id;
                chainAuthId[chainOffset] = model.data.chains.authAsymId[residueChainIndex[rI]] + '-' + transform.id;
                chainSourceChainIndex[chainOffset] = residueChainIndex[rI];
                chainOperatorIndex[chainOffset] = currentOp;
                currentAsymId = chainId[chainOffset];
                currentAuthAsymId = chainAuthId[chainOffset];
            }

            for (let residueOffset = 0, _mi = assemblyResidueParts.length; residueOffset < _mi; residueOffset++) {
                rI = assemblyResidueParts[residueOffset];
                let opI = assemblyOpParts[residueOffset];

                transform = transforms[opI];

                cloneRow(srcResidueData, rI, residueData, residueOffset, residueData.length);
                
                let cE = residueEntityIndex[rI],
                    cC = residueChainIndex[rI];

                let chainChanged = false;

                if (cE !== currentEntity) {
                    // update chain
                    chainResidueEnd[chainOffset] = residueOffset;
                    chainAtomEnd[chainOffset] = atomOffset;
                    chainOffset += 1;

                    // update entity
                    entityChainEnd[entityOffset] = chainOffset;
                    entityResidueEnd[entityOffset] = residueOffset;
                    entityAtomEnd[entityOffset] = atomOffset;

                    // new entity
                    entityOffset += 1;
                    cloneRow(srcEntityData, cE, entityData, entityOffset, srcEntityData.length);
                    entityChainStart[entityOffset] = chainOffset;
                    entityResidueStart[entityOffset] = residueOffset;
                    entityAtomStart[entityOffset] = atomOffset;

                    chainChanged = true;
                } else if (cC !== currentChain) {
                    // update chain
                    chainResidueEnd[chainOffset] = residueOffset;
                    chainAtomEnd[chainOffset] = atomOffset;
                    chainOffset += 1;

                    chainChanged = true;
                } else if (opI !== currentOp) {
                    // update chain
                    chainResidueEnd[chainOffset] = residueOffset;
                    chainAtomEnd[chainOffset] = atomOffset;
                    chainOffset += 1;

                    chainChanged = true;
                }

                if (chainChanged) {
                    // new chain
                    cloneRow(srcChainData, cC, chainData, chainOffset, srcChainData.length);
                    chainEntity[chainOffset] = entityOffset;
                    chainResidueStart[chainOffset] = residueOffset;
                    chainAtomStart[chainOffset] = atomOffset;

                    // update the chain identifier if needed
                    if (!transform.isIdentity) {
                        chainId[chainOffset] = model.data.chains.asymId[cC] + '-' + transform.id;
                        chainAuthId[chainOffset] = model.data.chains.authAsymId[cC] + '-' + transform.id;
                    }

                    chainSourceChainIndex[chainOffset] = cC;
                    chainOperatorIndex[chainOffset] = opI;
                    currentAsymId = chainId[chainOffset];
                    currentAuthAsymId = chainAuthId[chainOffset];
                }

                currentChain = cC;
                currentEntity = cE;
                currentOp = opI;

                residueChain[residueOffset] = chainOffset;
                residueEntity[residueOffset] = entityOffset;
                residueAtomStart[residueOffset] = atomOffset;
                residueAsymId[residueOffset] = currentAsymId;
                residueAuthAsymId[residueOffset] = currentAuthAsymId;

                for (let aI = residueAtomStartIndex[rI], _mAI = residueAtomEndIndex[rI]; aI < _mAI; aI++) {

                    Vec3.set(temp, x[aI], y[aI], z[aI]);
                    Vec3.transformMat4(temp, temp, transform.transform);

                    atomX![atomOffset] = temp[0];
                    atomY![atomOffset] = temp[1];
                    atomZ![atomOffset] = temp[2];
                    atomId![atomOffset] = atomOffset + 1;

                    atomResidue![atomOffset] = residueOffset;
                    atomChain![atomOffset] = chainOffset;
                    atomEntity![atomOffset] = entityOffset;

                    for (let c of cols) {
                        c.target[atomOffset] = c.src[aI];
                    }

                    atomOffset++;
                }
                residueAtomEnd[residueOffset] = atomOffset;
            }

            // finalize entity
            entityChainEnd[entityOffset] = chainOffset + 1;
            entityResidueEnd[entityOffset] = assemblyResidueParts.length;
            entityAtomEnd[entityOffset] = atomOffset;

            // finalize chain
            chainResidueEnd[chainOffset] = assemblyResidueParts.length;
            chainAtomEnd[chainOffset] = atomOffset;

            const finalAtoms = atomTable.seal(),
                finalResidues = residueTableBuilder.seal(),
                finalChains = chainTableBuilder.seal(),
                finalEntities = entityTableBuilder.seal();

            const secondaryStructure = buildSS(model, assemblyParts, finalResidues);
            const structConn = model.data.bonds.structConn 
                ? buildStructConn(model.data.bonds.structConn, transforms, assemblyParts.residues, assemblyParts.operators, model.data.residues, finalResidues)
                : void 0;

            return Molecule.Model.create({
                id: model.id,
                modelId: model.modelId,
                data: {
                    atoms: finalAtoms,
                    residues: finalResidues,
                    chains: finalChains,
                    entities: finalEntities,
                    bonds: {
                        structConn,
                        component: model.data.bonds.component
                    },
                    secondaryStructure
                },
                positions: positionTable,
                parent: model,
                source: Molecule.Model.Source.Computed,
                operators: transforms.map(t => new Operator(t.transform, t.id, t.isIdentity))
            });
        }

        function buildStructConn(structConn: StructConn, ops: SymmetryTransform[], residueParts: number[], residueOpParts: number[],
            oldResidues: ResidueTable, newResidues: ResidueTable) {            
            const { entries } = structConn;

            const opsMap = Utils.FastMap.create<string, number>();
            for (let i = 0, __i = ops.length; i < __i; i++) {
                opsMap.set(ops[i].id, i);
            }

            const transformMap = Utils.FastMap.create<number, Utils.FastMap<number, number>>();
            for (const e of entries) {
                for (const p of e.partners) {
                    if (!transformMap.has(p.residueIndex)) {
                        transformMap.set(p.residueIndex, Utils.FastMap.create());
                    }
                }
            }

            for (let i = 0, __i = residueParts.length; i < __i; i++) {
                const r = residueParts[i];
                if (!transformMap.has(r)) continue;
                transformMap.get(r)!.set(residueOpParts[i], i);
            }

            const { atomStartIndex: oldStart } = oldResidues;
            const { atomStartIndex: newStart } = newResidues;
            const ret: StructConn.Entry[] = [];
            for (const e of entries) {
                let allId = true;
                for (const p of e.partners) {
                    if (p.symmetry !== '1_555') {
                        allId = false;
                        break;
                    }
                }

                if (allId) {
                    for (let opIndex = 0, __oi = ops.length; opIndex < __oi; opIndex++) {
                        let allMapped = true;
                        for (const p of e.partners) {
                            if (!transformMap.get(p.residueIndex)!.has(opIndex)) {
                                allMapped = false;
                                break;
                            }
                        }
                        if (!allMapped) continue;

                        ret.push({
                            bondType: e.bondType,
                            distance: e.distance,
                            partners: e.partners.map(p => {
                                const rI = transformMap.get(p.residueIndex)!.get(opIndex)!;
                                return {
                                    residueIndex: rI,
                                    atomIndex: newStart[rI] + (p.atomIndex - oldStart[p.residueIndex]),
                                    symmetry: p.symmetry
                                };
                            })
                        });
                    }
                } else {
                    const partners: StructConn.Entry['partners'] = [];
                    for (const p of e.partners) {
                        if (!opsMap.has(p.symmetry)) break;
                        const op = opsMap.get(p.symmetry)!;
                        const m = transformMap.get(p.residueIndex)!;
                        if (!m.has(op)) break;
                        const rI = m.get(op)!;
                        partners.push({
                            residueIndex: rI,
                            atomIndex: newStart[rI] + (p.atomIndex - oldStart[p.residueIndex]),
                            symmetry: p.symmetry
                        });
                    }

                    if (partners.length === e.partners.length) {
                        ret.push({
                            bondType: e.bondType,
                            distance: e.distance,
                            partners
                        });
                    }
                }
            }       

            return new StructConn(ret);
        }

        function buildSS(parent: Molecule.Model,
            assemblyParts: { residues: number[], operators: number[] },
            newResidues: ResidueTable) {

            let index = parent.data.residues.secondaryStructureIndex;
            let ss = parent.data.secondaryStructure;

            let { asymId, seqNumber, insCode, secondaryStructureIndex } = newResidues;

            let { residues, operators } = assemblyParts;
            let count = residues.length;

            let ret: SecondaryStructureElement[] = [];

            let start = 0;
            while (start < count) {
                let end = start;

                let ssI = index[residues[start]], op = operators[start];

                while (end < count && operators[end] == op && index[residues[end]] == ssI) end++;

                let s = ss[ssI];
                let e = new SecondaryStructureElement(
                    s.type,
                    new PolyResidueIdentifier(asymId[start], seqNumber[start], insCode[start]),
                    new PolyResidueIdentifier(asymId[end - 1], seqNumber[end - 1], insCode[end - 1]),
                    s.info);
                e.startResidueIndex = start;
                e.endResidueIndex = end;

                let updatedSSI = ret.length;
                for (let i = start; i < end; i++) {
                    secondaryStructureIndex[i] = updatedSSI;
                }
                ret[updatedSSI] = e;

                start = end;
            }

            return ret;
        }

        export function buildPivotGroupSymmetry(
            model: Molecule.Model,
            radius: number,
            pivotsQuery: Query.Source | undefined) {

            let info = model.data.symmetryInfo;

            if (!info || (info.cellSize[0] < 1.1 && info.cellSize[1] < 1.1 && info.cellSize[2] < 1.1)) {
                return model;
            }

            let pivotIndices: number[];

            if (!pivotsQuery) pivotIndices = model.data.atoms.indices;
            else pivotIndices = Query.apply(pivotsQuery, model).unionAtomIndices();

            let bounds = getBoundingInfo(model, pivotIndices),
                spacegroup = new Spacegroup(info),
                ctx = createSymmetryContext(model, bounds, spacegroup, radius);

            let transforms = findSuitableTransforms(ctx),
                residues = getSymmetryResidues(ctx, transforms);

            return assemble(model, residues, transforms);
        }

        function findMates(model: Molecule.Model, radius: number) {
            let bounds = getBoudingSphere(model.positions, model.positions.indices);

            let spacegroup = new Spacegroup(model.data.symmetryInfo!);
            let t = Mat4.zero();
            let v = Vec3.zero();

            let transforms: SymmetryTransform[] = [];

            for (let i = -3; i <= 3; i++) {
                for (let j = -3; j <= 3; j++) {
                    for (let k = -3; k <= 3; k++) {
                        for (let op = 0; op < spacegroup.operatorCount; op++) {
                            spacegroup.getOperatorMatrix(op, i, j, k, t);

                            Vec3.transformMat4(v, bounds.center, t);

                            if (getSphereDist(v, bounds.radius, bounds) > radius) continue;

                            let copy = Mat4.zero();
                            Mat4.copy(copy, t);
                            transforms.push(createSymmetryTransform(i, j, k, op, copy));
                        }
                    }
                }
            }

            return transforms;
        }

        function findMateParts(model: Molecule.Model, transforms: SymmetryTransform[]) {
            let { atoms, chains, entities, residues } = model.data;

            let residueIndices = Utils.ArrayBuilder.create<number>(s => new Int32Array(s), residues.count * transforms.length, 1),
                operatorIndices = Utils.ArrayBuilder.create<number>(s => new Int32Array(s), residues.count * transforms.length, 1);

            const atomCount = transforms.length * atoms.count;
            const chainCount = transforms.length * chains.count
            const entityCount = entities.count;

            for (let eI = 0, _eC = entities.count; eI < _eC; eI++) {
                for (let opIndex = 0; opIndex < transforms.length; opIndex++) {
                    for (let cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {
                        for (let rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {
                            Utils.ArrayBuilder.add(residueIndices, rI);
                            Utils.ArrayBuilder.add(operatorIndices, opIndex);
                        }
                    }
                }
            }

            return {
                residues: residueIndices.array,
                operators: operatorIndices.array,

                atomCount,
                chainCount,
                entityCount
            };
        }

        export function buildMates(
            model: Molecule.Model,
            radius: number) {

            let info = model.data.symmetryInfo;

            if (!info || (info.cellSize[0] < 1.1 && info.cellSize[1] < 1.1 && info.cellSize[2] < 1.1)) {
                return model;
            }

            let transforms = findMates(model, radius);
            let parts = findMateParts(model, transforms);

            return assemble(model, parts, transforms);
        }

        function createOperators(operators: string[][], list: string[][], i: number, current: string[]) {

            if (i < 0) {
                list[list.length] = current.slice(0);
                return;
            }

            let ops = operators[i], len = ops.length;
            for (let j = 0; j < len; j++) {
                current[i] = ops[j];
                createOperators(operators, list, i - 1, current);
            }
        }

        function getAssemblyTransforms(model: Molecule.Model, operators: string[][], offset: number) {
            let info = model.data.assemblyInfo;

            let transforms: SymmetryTransform[] = [];
            
            let index = offset;
            for (let op of operators) {
                var m = Mat4.identity();
                for (var i = 0; i < op.length; i++) {
                    Mat4.mul(m, m, info!.operators[op[i]].operator);
                }
                index++;
                transforms[transforms.length] = createAssemblyTransform(index, m);
            }

            return transforms;
        }

        interface AssemblyBuildState {
            atomCount: number,
            chainCount: number,
            entityCount: number,

            transforms: SymmetryTransform[],
            mask: Int8Array,
            residueIndices: Utils.ChunkedArray<number>,
            operatorIndices: Utils.ChunkedArray<number>
        }

        function getAssemblyParts(model: Molecule.Model, residueMask: Int8Array, currentTransforms: SymmetryTransform[], state: AssemblyBuildState, transformOffset: number) {

            let { chains, entities, residues } = model.data;

            let residueIndices = state.residueIndices, 
                operatorIndices = state.operatorIndices;

            let atomCount = 0,
                chainCount = 0,
                entityCount = 0;

            for (let eI = 0, _eC = entities.count; eI < _eC; eI++) {
                let opIndex = transformOffset;
                let chainAdded = false;
                for (let _ of currentTransforms) {
                    for (let cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {
                        let residueAdded = false;
                        
                        for (let rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {
                            if (!residueMask[rI]) continue;

                            Utils.ChunkedArray.add(residueIndices, rI);
                            Utils.ChunkedArray.add(operatorIndices, opIndex);

                            atomCount += residues.atomEndIndex[rI] - residues.atomStartIndex[rI];
                            residueAdded = true;
                        }
                        if (residueAdded) {
                            chainCount += 1;
                            chainAdded = true;
                        }

                    }
                    opIndex++;
                }
                if (chainAdded) {
                    entityCount++;
                }
            }

            state.atomCount += atomCount;
            state.chainCount += chainCount;
            state.entityCount += entityCount;
        }

        export function buildAssemblyEntry(model: Molecule.Model, entry: AssemblyGenEntry, state: AssemblyBuildState) {
            let ops: string[][] = [],
                currentOp: string[] = [];
            for (let i = 0; i < entry.operators.length; i++) currentOp[i] = '';
            createOperators(entry.operators, ops, entry.operators.length - 1, currentOp);

            const transformOffset = state.transforms.length;
            let transforms = getAssemblyTransforms(model, ops, state.transforms.length);
            state.transforms.push(...transforms);

            let asymIds = Utils.FastSet.create();
            entry.asymIds.forEach(id => asymIds.add(id));

            let residueAsymIds = model.data.residues.asymId;
            let residueCount = model.data.residues.count;
            let mask = state.mask;
            for (var i = 0; i < residueCount; i++) {
                mask[i] = <any>asymIds.has(residueAsymIds[i]);
            }
            getAssemblyParts(model, mask, transforms, state, transformOffset);
        }

        export function buildAssembly(model: Molecule.Model, assembly: AssemblyGen) {
            let state: AssemblyBuildState = {
                atomCount: 0,
                chainCount: 0,
                entityCount: 0,
                transforms: [],
                mask: new Int8Array(model.data.residues.count),
                residueIndices: Utils.ChunkedArray.create<number>(s => new Int32Array(s), model.data.residues.count, 1),
                operatorIndices: Utils.ChunkedArray.create<number>(s => new Int32Array(s), model.data.residues.count, 1)
            }

            for (let a of assembly.gens) {
                buildAssemblyEntry(model, a, state);
            }

            let parts = {
                residues: Utils.ChunkedArray.compact(state.residueIndices),
                operators: Utils.ChunkedArray.compact(state.operatorIndices),

                atomCount: state.atomCount,
                chainCount: state.chainCount,
                entityCount: state.entityCount
            };

            return assemble(model, parts, state.transforms);
        }
    }

    export function buildPivotGroupSymmetry(
        model: Molecule.Model,
        radius: number,
        pivotsQuery?: Query.Source): Molecule.Model {

        return SymmetryHelpers.buildPivotGroupSymmetry(model, radius, pivotsQuery);
    }

    export function buildSymmetryMates(
        model: Molecule.Model,
        radius: number): Molecule.Model {

        return SymmetryHelpers.buildMates(model, radius);
    }

    export function buildAssembly(model: Molecule.Model, assembly: AssemblyGen) {

        return SymmetryHelpers.buildAssembly(model, assembly);
    }
}