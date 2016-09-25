/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Structure {
    "use strict";
    
    namespace SymmetryHelpers {

        import Mat4 = Geometry.LinearAlgebra.Matrix4;

        type Vector3 = { x: number; y: number; z: number };

        interface Sphere3 { center: Vector3, radius: number }

        function getBoudingSphere(arrays: { x: number[], y: number[], z: number[] }, indices: number[]): Sphere3 {

            let { x, y, z } = arrays;
            let center = { x: 0, y: 0, z: 0 };
            for (let aI of indices) {
                center.x += x[aI];
                center.y += y[aI];
                center.z += z[aI];
            }

            let count = indices.length > 0 ? indices.length : 1;
            center.x /= count; center.y /= count; center.z /= count;

            let r = 0;

            for (let aI of indices) {
                r = Math.max(indexedVectorDistSq(aI, center, arrays), r);
            }

            return { center, radius: Math.sqrt(r) };
        }

        function newVec(): Vector3 { return { x: 0, y: 0, z: 0 } };

        interface BoundingDataTable extends DataTable {
            x: number[];
            y: number[];
            z: number[];
            r: number[];
        }
        
        function getSphereDist(c: Vector3, r: number, q: Sphere3) {
            let dx = c.x - q.center.x,
                dy = c.y - q.center.y,
                dz = c.z - q.center.z;

            return Math.sqrt(dx * dx + dy * dy + dz * dz) - (r + q.radius);
        }
        
        function isWithinRadius(
            bounds: Sphere3, i: number, data: BoundingDataTable, t: number[], r: number, v: Vector3) {

            v.x = data.x[i]; v.y = data.y[i]; v.z = data.z[i];
            Mat4.transformVector3(v, v, t);


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
            aI: number, v: Vector3,
            arrays: { x: number[]; y: number[]; z: number[]; }) {

            let dx = arrays.x[aI] - v.x,
                dy = arrays.y[aI] - v.y,
                dz = arrays.z[aI] - v.z;

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
            model: MoleculeModel,
            boundingInfo: BoundingInfo,
            spacegroup: Spacegroup,
            radius: number,

            transform: number[],
            transformed: Vector3,
            i: number,
            j: number,
            k: number,
            op: number
        }

        function createSymmetryContext(model: MoleculeModel, boundingInfo: BoundingInfo, spacegroup: Spacegroup, radius: number): SymmetryContext {
            return {
                model,
                boundingInfo,
                spacegroup,
                radius,
                transform: Mat4.empty(),
                transformed: { x: 0, y: 0, z: 0 },
                i: 0, j: 0, k: 0, op: 0
            };
        }

        function symmetryContextMap(ctx: SymmetryContext, p: Vector3) {
            return Mat4.transformVector3(ctx.transformed, p, ctx.transform);
        }

        function symmetryContextGetTransform(ctx: SymmetryContext) {
            return createSymmetryTransform(ctx.i, ctx.j, ctx.k, ctx.op, Mat4.clone(ctx.transform));
        }

        interface SymmetryTransform {
            isIdentity: boolean,
            id: string,
            transform: number[]            
        }

        function createSymmetryTransform(i: number, j: number, k: number, opIndex: number, transform: number[]): SymmetryTransform  {
            return {
                isIdentity: !i && !j && !k && !opIndex,
                id: `${opIndex + 1}_${5 + i}${5 + j}${5 + k}`,
                transform
            }
        }

        function createAssemblyTransform(i: number, transform: number[]): SymmetryTransform  {
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

        function getBoundingInfo(model: MoleculeModel, pivotIndices: number[]): BoundingInfo {

            let atoms = model.atoms,
                residues = model.residues,
                chains = model.chains,
                entities = model.entities,
                x = atoms.x, y = atoms.y, z = atoms.z;

            let entityTable = new DataTableBuilder(entities.count),
                eX = entityTable.addColumn("x", s => new Float64Array(s)),
                eY = entityTable.addColumn("y", s => new Float64Array(s)),
                eZ = entityTable.addColumn("z", s => new Float64Array(s)),
                eR = entityTable.addColumn("r", s => new Float64Array(s)),
           
                chainTable = new DataTableBuilder(chains.count),
                cX = chainTable.addColumn("x", s => new Float64Array(s)),
                cY = chainTable.addColumn("y", s => new Float64Array(s)),
                cZ = chainTable.addColumn("z", s => new Float64Array(s)),
                cR = chainTable.addColumn("r", s => new Float64Array(s)),

                residueTable = new DataTableBuilder(residues.count),
                rX = residueTable.addColumn("x", s => new Float64Array(s)),
                rY = residueTable.addColumn("y", s => new Float64Array(s)),
                rZ = residueTable.addColumn("z", s => new Float64Array(s)),
                rR = residueTable.addColumn("r", s => new Float64Array(s));

            let allCenter = newVec(), allRadius = 0, 
                pivotCenter = newVec(), pivotRadius = 0,

                n = 0,

                eCenter = newVec(), eRadius = 0,
                cCenter = newVec(), cRadius = 0,
                rCenter = newVec(), rRadius = 0;
                        
            for (let eI = 0, _eC = entities.count; eI < _eC; eI++) {

                eCenter.x = 0; eCenter.y = 0; eCenter.z = 0;
                                
                for (let cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {

                    cCenter.x = 0; cCenter.y = 0; cCenter.z = 0;
                    
                    for (let rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {

                        rCenter.x = 0; rCenter.y = 0; rCenter.z = 0;
                        
                        for (let aI = residues.atomStartIndex[rI], _aC = residues.atomEndIndex[rI]; aI < _aC; aI++) {
                            rCenter.x += x[aI];
                            rCenter.y += y[aI];
                            rCenter.z += z[aI];
                        }

                        allCenter.x += rCenter.x;
                        allCenter.y += rCenter.y;
                        allCenter.z += rCenter.z;

                        n = residues.atomEndIndex[rI] - residues.atomStartIndex[rI];
                        
                        cCenter.x += rCenter.x;
                        cCenter.y += rCenter.y;
                        cCenter.z += rCenter.z;
                        
                        rX[rI] = rCenter.x / n; rY[rI] = rCenter.y / n; rZ[rI] = rCenter.z / n;
                    }

                    eCenter.x += cCenter.x;
                    eCenter.y += cCenter.y;
                    eCenter.z += cCenter.z;
                    
                    n = chains.atomEndIndex[cI] - chains.atomStartIndex[cI];
                    cX[cI] = cCenter.x / n; cY[cI] = cCenter.y / n; cZ[cI] = cCenter.z / n;
                }

                n = entities.atomEndIndex[eI] - entities.atomStartIndex[eI];
                eX[eI] = eCenter.x / n; eY[eI] = eCenter.y / n; eZ[eI] = eCenter.z / n;
            }
            allCenter.x /= atoms.count; allCenter.y /= atoms.count; allCenter.z /= atoms.count;

            for (let aI of pivotIndices) {
                pivotCenter.x += x[aI];
                pivotCenter.y += y[aI];
                pivotCenter.z += z[aI];
            }

            let pivotCount = pivotIndices.length > 0 ? pivotIndices.length : 1;
            pivotCenter.x /= pivotCount; pivotCenter.y /= pivotCount; pivotCenter.z /= pivotCount;


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
                entities: <BoundingDataTable>entityTable.seal(),
                chains: <BoundingDataTable>chainTable.seal(),
                residues: <BoundingDataTable>residueTable.seal(),
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
                        //for (let l = 0, lm = sg.operatorCount; l < lm; l++) {                            

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
                atoms = model.atoms,
                residues = model.residues,
                chains = model.chains,
                entities = model.entities;

            let residueIndices = new Utils.ChunkedArrayBuilder<number>(s => new Int32Array(s), ctx.model.residues.count, 1),
                operatorIndices = new Utils.ChunkedArrayBuilder<number>(s => new Int32Array(s), ctx.model.residues.count, 1);

            let v = { x: 0, y: 0, z: 0 },
                opIndex = 0;

            let atomCount = 0,
                chainCount = 0,
                entityCount = 0;
            
            for (let eI = 0, _eC = entities.count; eI < _eC; eI++) {

                //if (!isWithinRadius(hetBounds, eI, bounds.entities, t.transform, radius, v)) continue;
                
                opIndex = 0;
                let chainAdded = false;
                for (let t of transforms) {

                    for (let cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {

                        if (!isWithinRadius(targetBounds, cI, bounds.chains, t.transform, radius, v)) continue;


                        let residueAdded = false;
                        for (let rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {

                            if (!isWithinRadius(targetBounds, rI, bounds.residues, t.transform, radius, v)) continue;
                
                            residueIndices.add(rI);
                            operatorIndices.add(opIndex);

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
                residues: residueIndices.compact(),
                operators: operatorIndices.compact(),

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
        
        // class PartsSorter {
        //     private ordering: Int32Array;
        //     private entityIndex: number[];
        //     private chainIndex: number[];
        //     private residues: number[];
        //     private operators: number[];
            
        //     private compare(i: number, j: number) {
        //         let a = this.residues[i], b = this.residues[j];
        //         let E = this.entityIndex[a] - this.entityIndex[b];
        //         if (E !== 0) return E;
        //         let C = this.chainIndex[a] - this.chainIndex[b];
        //         if (C !== 0) return C;
        //         let O = this.operators[i] - this.operators[j];
        //         if (O !== 0) return O;
        //         return a - b; 
        //     }
            
        //     apply() {
        //         let buffer = new Int32Array(this.parts.residues.length);
        //         for (let i = 0, _b = this.ordering.length; i < _b; i++) buffer[i] = this.residues[this.ordering[i]];
        //         let t = this.parts.residues; 
        //         this.parts.residues = <any>buffer;
        //         buffer = <any>t;    
        //         for (let i = 0, _b = this.ordering.length; i < _b; i++) buffer[i] = this.operators[this.ordering[i]];
        //         this.parts.operators = <any>buffer;
        //     }            
            
        //     constructor(model: MoleculeModel, private parts: { residues: number[], operators: number[], atomCount: number; chainCount: number }) {
        //         this.ordering = new Int32Array(parts.residues.length);
        //         for (let i = 0, _b = this.ordering.length; i < _b; i++) this.ordering[i] = i;                
        //         let rs = model.residues;
        //         this.entityIndex = rs.entityIndex;
        //         this.chainIndex = rs.chainIndex;
        //         this.residues = parts.residues;
        //         this.operators = parts.operators;
        //         Array.prototype.sort.call(this.ordering, (i: number, j: number) => this.compare(i, j));
        //         this.apply();         
        //         //console.log(this.ordering);                             
        //     }
        // }        
        
        function assemble(
            model: MoleculeModel,
            assemblyParts: { residues: number[], operators: number[], atomCount: number; chainCount: number, entityCount: number },
            transforms: SymmetryTransform[]) {
                
            // let sorter = new PartsSorter(model, assemblyParts);
            // sorter.apply();
            // sorter = undefined;
            //sorted = undefined;
            //let partOrdeding = sorted.ordering;

            let residues = model.residues,
                residueChainIndex = residues.chainIndex,
                residueEntityIndex = residues.entityIndex,
                residueAtomStartIndex = residues.atomStartIndex,
                residueAtomEndIndex = residues.atomEndIndex,
                atoms = model.atoms,
                x = atoms.x, y = atoms.y, z = atoms.z;

            let atomTable = new DataTableBuilder(assemblyParts.atomCount),
                atomX: number[] | undefined, atomY: number[] | undefined, atomZ: number[] | undefined,
                atomId: number[] | undefined,
                atomResidue: number[] | undefined, atomChain: number[] | undefined, atomEntity: number[] | undefined,
                cols: { src: any[]; target: any[] }[] = [];

            let entityTableBuilder = model.entities.getBuilder(assemblyParts.entityCount),
                entityTable = <DefaultEntityTableSchema><any>entityTableBuilder,
                srcEntityData = model.entities.getRawData(), entityData = entityTable.getRawData(),
                entityChainStart = entityTable.chainStartIndex, entityChainEnd = entityTable.chainEndIndex,
                entityResidueStart = entityTable.residueStartIndex, entityResidueEnd = entityTable.residueEndIndex,
                entityAtomStart = entityTable.atomStartIndex, entityAtomEnd = entityTable.atomEndIndex,
                entityOffset = 0;

            let chainTableBuilder = model.chains.getBuilder(assemblyParts.chainCount),
                chainTable = <DefaultChainTableSchema><any>chainTableBuilder,
                srcChainData = model.chains.getRawData(), chainData = chainTable.getRawData(),
                chainResidueStart = chainTable.residueStartIndex, chainResidueEnd = chainTable.residueEndIndex,
                chainAtomStart = chainTable.atomStartIndex, chainAtomEnd = chainTable.atomEndIndex,
                chainId = chainTable.asymId, chainAuthId = chainTable.authAsymId,
                chainEntity = chainTable.entityIndex,
                chainSourceChainIndex = chainTableBuilder.addColumn('sourceChainIndex', s => new Int32Array(s)),
                chainOperatorIndex = chainTableBuilder.addColumn('operatorIndex', s => new Int32Array(s)),
                chainOffset = 0;

            let residueTable = <DefaultResidueTableSchema><any>model.residues.getBuilder(assemblyParts.residues.length),
                srcResidueData = model.residues.getRawData(), residueData = residueTable.getRawData(),
                residueAtomStart = residueTable.atomStartIndex, residueAtomEnd = residueTable.atomEndIndex,
                residueAsymId = residueTable.asymId, residueAuthAsymId = residueTable.authAsymId,
                residueChain = residueTable.chainIndex,
                residueEntity = residueTable.entityIndex;
            
            for (let col of model.atoms.columns) {
                let c = atomTable.addColumn(col.name, col.creator);
                if (col.name === "x") atomX = c;
                else if (col.name === "y") atomY = c;
                else if (col.name === "z") atomZ = c;
                else if (col.name === "residueIndex") atomResidue = c;
                else if (col.name === "chainIndex") atomChain = c;
                else if (col.name === "entityIndex") atomEntity = c;
                else if (col.name === "id") atomId = c;
                else {
                    cols[cols.length] = {
                        src: (<any>atoms)[col.name],
                        target: c
                    };
                }
            }

            let assemblyResidueParts = assemblyParts.residues,
                assemblyOpParts = assemblyParts.operators,
                temp = { x: 0, y: 0, z: 0 },
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
            currentAsymId = model.chains.asymId[residueChainIndex[rI]];
            currentAuthAsymId = model.chains.authAsymId[residueChainIndex[rI]];
            
            let transform = transforms[assemblyOpParts[0]];

            if (transform && !transform.isIdentity) {
                chainId[chainOffset] = model.chains.asymId[residueChainIndex[rI]] + '-' + transform.id;
                chainAuthId[chainOffset] = model.chains.authAsymId[residueChainIndex[rI]] + '-' + transform.id;
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
                    
                    // // new chain
                    // cloneRow(srcChainData, cC, chainData, chainOffset, srcChainData.length);
                    // chainEntity[chainOffset] = entityOffset;
                    // chainResidueStart[chainOffset] = residueOffset;
                    // chainAtomStart[chainOffset] = atomOffset;

                    // // update the chain identifier if needed
                    // if (!transform.isIdentity) {
                    //     chainId[chainOffset] = model.chains.asymId[cC] + '-' + transform.id;
                    //     chainAuthId[chainOffset] = model.chains.authAsymId[cC] + '-' + transform.id;
                    // }

                    // chainSourceChainIndex[chainOffset] = cC;
                    // chainOperatorIndex[chainOffset] = opI;
                    // currentAsymId = chainId[chainOffset];
                    // currentAuthAsymId = chainAuthId[chainOffset];
                } else if (cC !== currentChain) {
                    // update chain
                    chainResidueEnd[chainOffset] = residueOffset;
                    chainAtomEnd[chainOffset] = atomOffset;
                    chainOffset += 1;

                    chainChanged = true;
                    // // new chain
                    // cloneRow(srcChainData, cC, chainData, chainOffset, srcChainData.length);
                    // chainEntity[chainOffset] = entityOffset;
                    // chainResidueStart[chainOffset] = residueOffset;
                    // chainAtomStart[chainOffset] = atomOffset;

                    // // update the chain identifier if needed
                    // if (!transform.isIdentity) {
                    //     chainId[chainOffset] = model.chains.asymId[cC] + '-' + transform.id;
                    //     chainAuthId[chainOffset] = model.chains.authAsymId[cC] + '-' + transform.id;
                    // }

                    // chainSourceChainIndex[chainOffset] = cC;
                    // chainOperatorIndex[chainOffset] = opI;
                    // currentAsymId = chainId[chainOffset];
                    // currentAuthAsymId = chainAuthId[chainOffset];
                } else if (opI !== currentOp) {
                    // update chain
                    chainResidueEnd[chainOffset] = residueOffset;
                    chainAtomEnd[chainOffset] = atomOffset;
                    chainOffset += 1;

                    chainChanged = true;
                    // // new chain
                    // cloneRow(srcChainData, cC, chainData, chainOffset, srcChainData.length);
                    // chainEntity[chainOffset] = entityOffset;
                    // chainResidueStart[chainOffset] = residueOffset;
                    // chainAtomStart[chainOffset] = atomOffset;
                
                    // // update the residue identifier if needed
                    // if (!transform.isIdentity) {
                    //     chainId[chainOffset] = model.chains.asymId[cC] + '-' + transform.id;
                    //     chainAuthId[chainOffset] = model.chains.authAsymId[cC] + '-' + transform.id;
                    // }

                    // chainSourceChainIndex[chainOffset] = cC;
                    // chainOperatorIndex[chainOffset] = opI;
                    // currentAsymId = chainId[chainOffset];
                    // currentAuthAsymId = chainAuthId[chainOffset];
                }
                
                if (chainChanged) {
                    // new chain
                    cloneRow(srcChainData, cC, chainData, chainOffset, srcChainData.length);
                    chainEntity[chainOffset] = entityOffset;
                    chainResidueStart[chainOffset] = residueOffset;
                    chainAtomStart[chainOffset] = atomOffset;

                    // update the chain identifier if needed
                    if (!transform.isIdentity) {
                        chainId[chainOffset] = model.chains.asymId[cC] + '-' + transform.id;
                        chainAuthId[chainOffset] = model.chains.authAsymId[cC] + '-' + transform.id;
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

                    temp.x = x[aI]; temp.y = y[aI]; temp.z = z[aI];
                    Mat4.transformVector3(temp, temp, transform.transform);

                    atomX![atomOffset] = temp.x;
                    atomY![atomOffset] = temp.y;
                    atomZ![atomOffset] = temp.z;

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

            let finalAtoms = <DefaultAtomTableSchema>atomTable.seal(),
                finalResidues = <DefaultResidueTableSchema>(<any>residueTable).seal(),
                finalChains = <DefaultChainTableSchema>chainTableBuilder.seal(),
                finalEntities = <DefaultEntityTableSchema>entityTableBuilder.seal();
            
            // let eIdSet = new Set<number>();
            // for (let eId of finalChains.entityIndex) eIdSet.add(eId);
            // eIdSet.forEach(x => console.log('ceid', x));
            // console.log(assemblyParts.entityCount, finalEntities);
               
            let ss = buildSS(model, assemblyParts, finalResidues);
            
            return new MoleculeModel({
                id: model.id, 
                modelId: model.modelId,
                atoms: finalAtoms, 
                residues: finalResidues,
                chains: finalChains, 
                entities: finalEntities,
                componentBonds: model.componentBonds, 
                secondaryStructure: ss,
                parent: model, 
                source: MoleculeModelSource.Computed,
                operators: transforms.map(t => new Operator(t.transform, t.id, t.isIdentity))
            });
        }

        function buildSS(parent: MoleculeModel,
            assemblyParts: { residues: number[], operators: number[] },
            newResidues: DefaultResidueTableSchema) {

            let index = parent.residues.secondaryStructureIndex;
            let ss = parent.secondaryStructure;

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
            model: MoleculeModel,
            radius: number,
            pivotsQuery: Query.Source | undefined) {

            let info = model.symmetryInfo;

            if (!info
                || info.spacegroupName === "P 1"
                || (info.cellSize[0] < 1.1 && info.cellSize[1] < 1.1 && info.cellSize[2] < 1.1)) {
                return model;
            }

            let pivotIndices: number[];

            if (!pivotsQuery) pivotIndices = model.atoms.indices;
            else pivotIndices = model.query(pivotsQuery).unionAtomIndices();

            let bounds = getBoundingInfo(model, pivotIndices),
                spacegroup = new Spacegroup(info),
                ctx = createSymmetryContext(model, bounds, spacegroup, radius);

            let transforms = findSuitableTransforms(ctx),
                residues = getSymmetryResidues(ctx, transforms);
            
            return assemble(model, residues, transforms);
        }

        function findMates(model: MoleculeModel, radius: number) {
            let bounds = getBoudingSphere(model.atoms, model.atoms.indices);

            let spacegroup = new Spacegroup(model.symmetryInfo!);
            let t = Mat4.empty();
            let v = { x: 0, y: 0, z: 0 };

            let transforms: SymmetryTransform[] = [];
            
            for (let i = -3; i <= 3; i++) {
                for (let j = -3; j <= 3; j++) {
                    for (let k = -3; k <= 3; k++) {
                        for (let op = 0; op < spacegroup.operatorCount; op++) {

                            spacegroup.getOperatorMatrix(op, i, j, k, t);

                            Mat4.transformVector3(v, bounds.center, t);
                            
                            if (getSphereDist(v, bounds.radius, bounds) > radius) continue;

                            let copy = Mat4.empty();
                            Mat4.copy(copy, t);
                            transforms.push(createSymmetryTransform(i, j, k, op, copy));
                        }
                    }
                }
            }

            return transforms;
        }

        function findMateParts(model: MoleculeModel, transforms: SymmetryTransform[]) {
            
            let atoms = model.atoms,
                residues = model.residues,
                chains = model.chains,
                entities = model.entities;

            let residueIndices = new Utils.ArrayBuilder<number>(s => new Int32Array(s), model.residues.count * transforms.length, 1),
                operatorIndices = new Utils.ArrayBuilder<number>(s => new Int32Array(s), model.residues.count * transforms.length, 1);

            let v = { x: 0, y: 0, z: 0 },
                opIndex = 0;

            const atomCount = transforms.length * atoms.count;
            const chainCount = transforms.length * chains.count
            const entityCount = model.entities.count;

            for (let eI = 0, _eC = entities.count; eI < _eC; eI++) {

                opIndex = 0;
                for (let t of transforms) {                    
                    for (let cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {                        
                        for (let rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {                            
                            residueIndices.add(rI);
                            operatorIndices.add(opIndex);
                        }
                    }
                    opIndex++;
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
            model: MoleculeModel,
            radius: number) {

            let info = model.symmetryInfo;

            if (!info
                || info.spacegroupName === "P 1"
                || (info.cellSize[0] < 1.1 && info.cellSize[1] < 1.1 && info.cellSize[2] < 1.1)) {
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

        function getAssemblyTransforms(model: MoleculeModel, operators: string[][]) {

            let info = model.assemblyInfo;

            let transforms: SymmetryTransform[] = [];
            let t = Mat4.empty();

            let index = 0;
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
            
            transformsOffset: number,
            transforms: SymmetryTransform[],
            mask: Int8Array,
            residueIndices: Utils.ChunkedArrayBuilder<number>,
            operatorIndices: Utils.ChunkedArrayBuilder<number>
        }

        function getAssemblyParts(model: MoleculeModel, residueMask: Int8Array, currentTransforms: SymmetryTransform[], state: AssemblyBuildState) {
            
            let atoms = model.atoms,
                residues = model.residues,
                chains = model.chains,
                entities = model.entities;

            let residueIndices = state.residueIndices, //  new Utils.ChunkedArrayBuilder<number>(s => new Int32Array(s), model.residues.count, 1),
                operatorIndices = state.operatorIndices; // new Utils.ChunkedArrayBuilder<number>(s => new Int32Array(s), model.residues.count, 1);

            let v = { x: 0, y: 0, z: 0 },
                opIndex = 0;

            let atomCount = 0,
                chainCount = 0,
                entityCount = 0;

            for (let eI = 0, _eC = entities.count; eI < _eC; eI++) {                
                opIndex = state.transformsOffset;  //0;
                let chainAdded = false;
                for (let t of currentTransforms) {

                    for (let cI = entities.chainStartIndex[eI], _cC = entities.chainEndIndex[eI]; cI < _cC; cI++) {
                        
                        let residueAdded = false;
                        for (let rI = chains.residueStartIndex[cI], _rC = chains.residueEndIndex[cI]; rI < _rC; rI++) {

                            if (!residueMask[rI]) continue;

                            residueIndices.add(rI);
                            operatorIndices.add(opIndex);

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
            // return {
            //     residues: residueIndices.compact(),
            //     operators: operatorIndices.compact(),

            //     atomCount,
            //     chainCount,
            //     entityCount
            // };
        }
        
        export function buildAssemblyEntry(model: MoleculeModel, entry: AssemblyGenEntry, state: AssemblyBuildState) {
            
            let ops: string[][] = [],
                currentOp: string[] = [];
            for (let i = 0; i < entry.operators.length; i++) currentOp[i] = "";
            createOperators(entry.operators, ops, entry.operators.length - 1, currentOp);

            let transforms = getAssemblyTransforms(model, ops);
            state.transformsOffset += state.transforms.length;
            state.transforms.push(...transforms);
            
            let asymIds = new Set<string>();
            entry.asymIds.forEach(id => asymIds.add(id));

            let residueAsymIds = model.residues.asymId;
            let residueCount = model.residues.count;
            let mask = state.mask;
            for (var i = 0; i < residueCount; i++) {
                mask[i] = <any>asymIds.has(residueAsymIds[i]);
            }

            getAssemblyParts(model, mask, transforms, state);
        }

        export function buildAssembly(model: MoleculeModel, assembly: AssemblyGen) {            
            let state: AssemblyBuildState = {
                atomCount: 0,
                chainCount: 0,
                entityCount: 0,
                transforms: [],
                transformsOffset: 0,
                mask: new Int8Array(model.residues.count),
                residueIndices: new Utils.ChunkedArrayBuilder<number>(s => new Int32Array(s), model.residues.count, 1),
                operatorIndices: new Utils.ChunkedArrayBuilder<number>(s => new Int32Array(s), model.residues.count, 1)
            } 
            
            for (let a of assembly.gens) {
                buildAssemblyEntry(model, a, state);
            }
            
            let parts = {
                residues: state.residueIndices.compact(),
                operators: state.operatorIndices.compact(),

                atomCount: state.atomCount,
                chainCount: state.chainCount,
                entityCount: state.entityCount
            };

            return assemble(model, parts, state.transforms);
        }
    }

    export function buildPivotGroupSymmetry(
        model: MoleculeModel,
        radius: number,
        pivotsQuery?: Query.Source): MoleculeModel {
        
        return SymmetryHelpers.buildPivotGroupSymmetry(model, radius, pivotsQuery);
    }

    export function buildSymmetryMates(
        model: MoleculeModel,
        radius: number): MoleculeModel {

        return SymmetryHelpers.buildMates(model, radius);
    }

    export function buildAssembly(model: MoleculeModel, assembly: AssemblyGen) {

        return SymmetryHelpers.buildAssembly(model, assembly);
    }
}