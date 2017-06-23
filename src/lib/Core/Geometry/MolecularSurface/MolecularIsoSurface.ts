/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
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
            if (this.density < 0.05) this.density = 0.05;
        }
    }
    
    export interface MolecularIsoField {
        data: Geometry.MarchingCubes.MarchingCubesParameters,
        bottomLeft: Geometry.LinearAlgebra.Vector3,
        topRight: Geometry.LinearAlgebra.Vector3,
        transform: number[],
        inputParameters: MolecularSurfaceInputParameters,
        parameters: MolecularIsoSurfaceParameters
    }
            
    class MolecularIsoFieldComputation {

        constructor(private inputParameters: MolecularSurfaceInputParameters, private ctx: Computation.Context) {
            this.parameters = new MolecularIsoSurfaceParametersWrapper(inputParameters.parameters);
            let positions = inputParameters.positions;
            this.x = positions.x;
            this.y = positions.y;
            this.z = positions.z;
            this.atomIndices = inputParameters.atomIndices;

            // make the atoms artificially bigger for low resolution surfaces
            if (this.parameters.density >= 0.99)  {
                // so that the number is float and not int32 internally 
                this.vdwScaleFactor = 1.000000001; 
            }
            else {
                this.vdwScaleFactor = 1 + (1 - this.parameters.density * this.parameters.density);
            }
        }

        atomIndices: number[];

        parameters: MolecularIsoSurfaceParametersWrapper;
        vdwScaleFactor: number;

        x: number[]; y: number[]; z: number[];

        minX = Number.MAX_VALUE; minY = Number.MAX_VALUE; minZ = Number.MAX_VALUE;
        maxX = -Number.MAX_VALUE; maxY = -Number.MAX_VALUE; maxZ = -Number.MAX_VALUE;

        nX = 0; nY = 0; nZ = 0;
        dX = 0.1; dY = 0.1; dZ = 0.1;

        field = new Float32Array(0); distanceField = new Float32Array(0); proximityMap = new Int32Array(0);
        minIndex = { i: 0, j: 0, k: 0 }; maxIndex = { i: 0, j: 0, k: 0 };

        private findBounds() {
            for (let aI of this.atomIndices) {
                let r = this.parameters.exactBoundary ? 0 : this.vdwScaleFactor * this.parameters.atomRadius(aI) + this.parameters.probeRadius,
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

            this.distanceField = new Float32Array(len);
            this.proximityMap = new Int32Array(len);

            let mv = Number.POSITIVE_INFINITY;
            for (let j = 0, _b = this.proximityMap.length; j < _b; j++) {
                this.distanceField[j] = mv;
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
                        if (xx < this.distanceField[offset]) {
                            this.proximityMap[offset] = aI;
                            this.distanceField[offset] = xx;
                        }

                        if (v > 0) {
                            this.field[offset] += v;
                        }
                    }
                }
            }
        }

        private async processChunks() {
            const chunkSize = 10000;
            let started = Utils.PerformanceMonitor.currentTime();
            
            await this.ctx.updateProgress('Creating field...', true);
            for (let currentAtom = 0, _b = this.atomIndices.length; currentAtom < _b; currentAtom++) {
                let aI = this.atomIndices[currentAtom];
                let r = this.vdwScaleFactor * this.parameters.atomRadius(aI) + this.parameters.probeRadius;
                                
                if (r >= 0) {
                    this.addBall(aI, r);
                }

                if ((currentAtom + 1) % chunkSize === 0) {
                    let t = Utils.PerformanceMonitor.currentTime();
                    if (t - started > Computation.UpdateProgressDelta) {
                        started = t;
                        await this.ctx.updateProgress('Creating field...', true, currentAtom, _b);
                    }
                }
            }
            
        }

        private finish() {            
            let t = Geometry.LinearAlgebra.Matrix4.zero();
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
                bottomLeft: LinearAlgebra.Vector3.fromValues(this.minX, this.minY, this.minZ),
                topRight: LinearAlgebra.Vector3.fromValues(this.maxX, this.maxY, this.maxZ),
                transform: t,
                inputParameters: this.inputParameters,
                parameters: this.parameters
            };
            
            // help the gc
            this.distanceField = <any>null;
            this.proximityMap = <any>null;
            
            return ret;
        }

        async run() {
            await this.ctx.updateProgress('Initializing...');
            this.findBounds();
            this.initData();
            await this.processChunks();  
            await this.ctx.updateProgress('Finalizing...', void 0, this.atomIndices.length, this.atomIndices.length);
            return this.finish();
        }
    }
    
    export interface MolecularIsoSurfaceGeometryData {        
        surface: Surface,
        usedParameters: MolecularIsoSurfaceParameters          
    }
            
    export function createMolecularIsoFieldAsync(parameters: MolecularSurfaceInputParameters): Computation<MolecularIsoField> {        
        return computation(async ctx => {
            let field = new MolecularIsoFieldComputation(parameters, ctx);
            return await field.run();
        });
    }
        
    export interface MolecularSurfaceInputParameters {
        positions: Core.Structure.PositionTable,
        atomIndices: number[],
        parameters?: MolecularIsoSurfaceParameters
    } 

    export function computeMolecularSurfaceAsync(parameters: MolecularSurfaceInputParameters): Computation<MolecularIsoSurfaceGeometryData> {
        return computation<MolecularIsoSurfaceGeometryData>(async ctx => {
            let field = await createMolecularIsoFieldAsync(parameters).run(ctx);
            let surface = await MarchingCubes.compute(field.data).run(ctx);
            surface = await Surface.transform(surface, field.transform).run(ctx);
            let smoothing = (parameters.parameters && parameters.parameters.smoothingIterations) || 1;

            let smoothingVertexWeight = 1.0;
            // low density results in very low detail and large distance between vertices.
            // Applying uniform laplacian smmoth to such surfaces makes the surface a lot smaller 
            // in each iteration. 
            // To reduce this behaviour, the weight of the "central" vertex is increased
            // for low desities to better preserve the shape of the surface.
            if (parameters.parameters && parameters.parameters.density! < 1) {
                smoothingVertexWeight = 2 / parameters.parameters.density!;
            }
            surface = await Surface.laplacianSmooth(surface, smoothing, smoothingVertexWeight).run(ctx);
            return { surface, usedParameters: field.parameters };
        });
    }
}