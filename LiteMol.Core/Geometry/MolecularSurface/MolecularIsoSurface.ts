/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Geometry.MolecularSurface {
    "use strict";

    export interface MolecularIsoSurfaceParameters {
        exactBoundary?: boolean;
        boundaryDelta?: { dx: number; dy: number; dz: number };
        probeRadius?: number;
        atomRadius?: (i: number) => number;
        density?: number;
        interactive?: boolean;
        smoothingIterations?: number;
    }

    class MolecularIsoSurfaceParametersWrapper implements MolecularIsoSurfaceParameters {

        exactBoundary: boolean;
        boundaryDelta: { dx: number; dy: number; dz: number };
        probeRadius: number;
        atomRadius: (i: number) => number;
        defaultAtomRadius: number;
        density: number;
        interactive: boolean;
        smoothingIterations: number;

        constructor(params?: MolecularIsoSurfaceParameters) {

            Core.Utils.extend(this, params, <MolecularIsoSurfaceParameters>{
                exactBoundary: false,
                boundaryDelta: { dx: 1.5, dy: 1.5, dz: 1.5 },
                probeRadius: 1.4,
                atomRadii: function () { return 1.0 },
                density: 1.1,
                interactive: false,
                smoothingIterations: 1
            });

            if (this.exactBoundary) this.boundaryDelta = { dx: 0, dy: 0, dz: 0 };
            if (this.density < 0.3) this.density = 0.3;
            //if (this.probeRadius < 0) this.probeRadius = 0;
        }
    }
    
    export interface MolecularIsoField {
        data: Geometry.MarchingCubes.MarchingCubesParameters,
        bottomLeft: Geometry.LinearAlgebra.ObjectVec3,
        topRight: Geometry.LinearAlgebra.ObjectVec3,
        transform: number[],
        inputParameters: MolecularSurfaceInputParameters,
        parameters: MolecularIsoSurfaceParameters
    }
            
    class MolecularIsoFieldComputation {

        constructor(private inputParameters: MolecularSurfaceInputParameters, private ctx: Computation.Context<MolecularIsoField>) {
            this.parameters = new MolecularIsoSurfaceParametersWrapper(inputParameters.parameters);
            let positions = inputParameters.positions;
            this.x = positions.x;
            this.y = positions.y;
            this.z = positions.z;
            this.atomIndices = inputParameters.atomIndices;
        }

        atomIndices: number[];

        parameters: MolecularIsoSurfaceParametersWrapper;

        x: number[]; y: number[]; z: number[];

        minX = Number.MAX_VALUE; minY = Number.MAX_VALUE; minZ = Number.MAX_VALUE;
        maxX = -Number.MAX_VALUE; maxY = -Number.MAX_VALUE; maxZ = -Number.MAX_VALUE;

        nX = 0; nY = 0; nZ = 0;
        dX = 0.1; dY = 0.1; dZ = 0.1;

        field = new Float32Array(0); maxField = new Float32Array(0); proximityMap = new Int32Array(0);
        minIndex = { i: 0, j: 0, k: 0 }; maxIndex = { i: 0, j: 0, k: 0 };

        private findBounds() {
            for (let aI of this.atomIndices) {
                let r = this.parameters.exactBoundary ? 0 : this.parameters.atomRadius(aI) + this.parameters.probeRadius,
                    xx = this.x[aI], yy = this.y[aI], zz = this.z[aI];

                if (r < 0) continue;

                this.minX = Math.min(this.minX, xx - r);
                this.minY = Math.min(this.minY, yy - r);
                this.minZ = Math.min(this.minZ, zz - r);
                this.maxX = Math.max(this.maxX, xx + r);
                this.maxY = Math.max(this.maxY, yy + r);
                this.maxZ = Math.max(this.maxZ, zz + r);
            }

            if (this.minX === Number.MAX_VALUE) {
                this.minX = this.minY = this.minZ = -1;
                this.maxX = this.maxY = this.maxZ = 1;
            }

            this.minX -= this.parameters.boundaryDelta.dx; this.minY -= this.parameters.boundaryDelta.dy; this.minZ -= this.parameters.boundaryDelta.dz;
            this.maxX += this.parameters.boundaryDelta.dx; this.maxY += this.parameters.boundaryDelta.dy; this.maxZ += this.parameters.boundaryDelta.dz;

            this.nX = Math.floor((this.maxX - this.minX) * this.parameters.density);
            this.nY = Math.floor((this.maxY - this.minY) * this.parameters.density);
            this.nZ = Math.floor((this.maxZ - this.minZ) * this.parameters.density);

            this.nX = Math.min(this.nX, 333);
            this.nY = Math.min(this.nY, 333);
            this.nZ = Math.min(this.nZ, 333);

            this.dX = (this.maxX - this.minX) / (this.nX - 1);
            this.dY = (this.maxY - this.minY) / (this.nY - 1);
            this.dZ = (this.maxZ - this.minZ) / (this.nZ - 1);
        }



        private initData() {
            let len = this.nX * this.nY * this.nZ;

            this.field = new Float32Array(len);

            this.maxField = new Float32Array(len);
            this.proximityMap = new Int32Array(len);

            let mv = -Number.MAX_VALUE;
            for (let j = 0, _b = this.proximityMap.length; j < _b; j++) {
                this.maxField[j] = mv;
                this.proximityMap[j] = -1;
            }
        }


        private updateMinIndex(x: number, y: number, z: number) {
            this.minIndex.i = Math.max((Math.floor((x - this.minX) / this.dX)) | 0, 0);
            this.minIndex.j = Math.max((Math.floor((y - this.minY) / this.dY)) | 0, 0);
            this.minIndex.k = Math.max((Math.floor((z - this.minZ) / this.dZ)) | 0, 0);
        }

        private updateMaxIndex(x: number, y: number, z: number) {
            this.maxIndex.i = Math.min((Math.ceil((x - this.minX) / this.dX)) | 0, this.nX);
            this.maxIndex.j = Math.min((Math.ceil((y - this.minY) / this.dY)) | 0, this.nY);
            this.maxIndex.k = Math.min((Math.ceil((z - this.minZ) / this.dZ)) | 0, this.nZ);
        }

        private addBall(aI: number, strength: number) {
            let strSq = strength * strength;
            let cx = this.x[aI], cy = this.y[aI], cz = this.z[aI];

            this.updateMinIndex(cx - strength, cy - strength, cz - strength);
            this.updateMaxIndex(cx + strength, cy + strength, cz + strength);

            let mini = this.minIndex.i, minj = this.minIndex.j, mink = this.minIndex.k;
            let maxi = this.maxIndex.i, maxj = this.maxIndex.j, maxk = this.maxIndex.k;

            cx = this.minX - cx;
            cy = this.minY - cy;
            cz = this.minZ - cz;

            for (let k = mink; k < maxk; k++) {
                let tZ = cz + k * this.dZ,
                    zz = tZ * tZ,
                    oZ = k * this.nY;

                for (let j = minj; j < maxj; j++) {
                    let tY = cy + j * this.dY,
                        yy = zz + tY * tY,
                        oY = this.nX * (oZ + j);

                    for (let i = mini; i < maxi; i++) {
                        let tX = cx + i * this.dX,
                            xx = yy + tX * tX,
                            offset = oY + i;

                        let v = strSq / (0.000001 + xx) - 1;
                        //let offset = nX * (k * nY + j) + i;
                        if (v > this.maxField[offset]) {
                            this.proximityMap[offset] = aI;
                            this.maxField[offset] = v;
                        }

                        //if (xx >= maxRsq) continue;
                        //let v = strength / Math.sqrt(0.000001 + zz) - 1;
                        //v = Math.Exp(-((Dist/AtomRadius)*(Dist/AtomRadius)));

                        if (v > 0) {
                            this.field[offset] += v;
                        }
                    }
                }
            }
        }

        private currentAtom = 0;
        private chunkSize = 10000;
        private addChunk() {
            let b = this.atomIndices.length;
            
            let currentChunk = 0;
            for (; this.currentAtom < b; this.currentAtom++) {
                let aI = this.atomIndices[this.currentAtom];
                let r = this.parameters.atomRadius(aI) + this.parameters.probeRadius;
                
                currentChunk++;
                
                if (r < 0) continue;
                this.addBall(aI, r);
                
                if (currentChunk >= this.chunkSize) {
                    if (this.ctx.abortRequested) {
                        this.ctx.abort();
                        return;
                    }
                    
                    this.ctx.update('Creating field...', this.ctx.abortRequest, this.currentAtom, this.atomIndices.length);
                    this.ctx.schedule(this._addChunk);
                    return;
                }
            }
            
            this.ctx.update('Creating field...', void 0, this.currentAtom, this.atomIndices.length);
            this.finish();
        }
        
        private _addChunk = () => {
            try {
                this.addChunk(); 
            } catch (e) {
                this.ctx.reject(e);
            }
        }
        
        private finish() {
            
            // help the gc
            this.maxField = <any>null;

            let t = Geometry.LinearAlgebra.Matrix4.empty();
            Geometry.LinearAlgebra.Matrix4.fromTranslation(t, [this.minX, this.minY, this.minZ]);
            t[0] = this.dX;
            t[5] = this.dY;
            t[10] = this.dZ;

            let ret = {
                data: <Core.Geometry.MarchingCubes.MarchingCubesParameters>{
                    scalarField: new Formats.Density.Field3DZYX(<any>this.field, [this.nX, this.nY, this.nZ]),
                    annotationField: this.parameters.interactive ? new Formats.Density.Field3DZYX(<any>this.proximityMap, [this.nX, this.nY, this.nZ]) : void 0,
                    isoLevel: 0.05
                },
                bottomLeft: { x: this.minX, y: this.minY, z: this.minZ },
                topRight: { x: this.maxX, y: this.maxY, z: this.maxZ },
                transform: t,
                inputParameters: this.inputParameters,
                parameters: this.parameters
            };
            
            this.ctx.resolve(ret);
        }

        start() {           
            
            this.ctx.update('Initializing...');

            this.ctx.schedule(() => {
                try {
                    this.findBounds();
                    this.initData();
                } catch (e) {
                    this.ctx.reject(e);
                    return;
                }
                
                if (this.ctx.abortRequested) {
                    this.ctx.abort();
                    return;
                }
                
                this.ctx.update('Creating field...', this.ctx.abortRequest, 0, this.atomIndices.length);
                this.ctx.schedule(this._addChunk);              
            });
        }
    }
    
    export interface MolecularIsoSurfaceGeometryData {        
        surface: Surface,
        usedParameters: MolecularIsoSurfaceParameters          
    }
    
    function createResultResultData(field: MolecularIsoField, surface: Surface) {                
         return Computation.resolve<MolecularIsoSurfaceGeometryData>({
                surface,
                usedParameters: field.parameters 
         });
    }
        
    export function createMolecularIsoFieldAsync(parameters: MolecularSurfaceInputParameters): Computation<MolecularIsoField> {        
        return Computation.create(ctx => {
            let field = new MolecularIsoFieldComputation(parameters, ctx);
            field.start();
        });
    }
    
    
    export interface MolecularSurfaceInputParameters {
        positions: Core.Structure.PositionTableSchema,
        atomIndices: number[],
        parameters?: MolecularIsoSurfaceParameters
    } 
    
    export function computeMolecularSurfaceAsync(parameters: MolecularSurfaceInputParameters): Computation<MolecularIsoSurfaceGeometryData> {
        
        return createMolecularIsoFieldAsync(parameters)
                .bind(f => 
                    MarchingCubes.compute(f.data)
                        .bind(s => Surface.transform(s, f.transform))
                            .bind(s => Surface.laplacianSmooth(s, (f.inputParameters.parameters && f.inputParameters.parameters.smoothingIterations) || 1)
                                .bind(s => createResultResultData(f, s))));
    }
}