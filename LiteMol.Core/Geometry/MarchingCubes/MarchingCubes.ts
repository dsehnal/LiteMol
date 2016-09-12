/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Geometry.MarchingCubes {
    "use strict";
    
    /**
     * The parameters required by the algorithm.
     */
    export interface MarchingCubesParameters {
        isoLevel: number;
        scalarField: Formats.Density.Field3D;        

        bottomLeft?: number[];
        topRight?: number[];

        annotationField?: Formats.Density.Field3D;
    }

    // export function computeCubes(parameters: MarchingCubesParameters): MarchingCubesResult {

    //     let params = <MarchingCubesParameters>Core.Utils.extend({}, parameters);

    //     if (!params.bottomLeft) params.bottomLeft = [0, 0, 0];
    //     if (!params.topRight) params.topRight = params.scalarField.dimensions;

    //      let state = new MarchingCubesState(params),
    //         minX = params.bottomLeft[0], minY = params.bottomLeft[1], minZ = params.bottomLeft[2],
    //         maxX = params.topRight[0] - 1, maxY = params.topRight[1] - 1, maxZ = params.topRight[2] - 1;

    //     for (let k = minZ; k < maxZ; k++) {
    //         for (let j = minY; j < maxY; j++) {
    //             for (let i = minX; i < maxX; i++) {
    //                 state.processCell(i, j, k);
    //             }
    //         }
    //     }

    //     let vertices = state.vertexBuffer.compact();
    //     let triangles = state.triangleBuffer.compact();

    //     state.vertexBuffer = null;
    //     state.verticesOnEdges = null;

    //     return new MarchingCubesResult(<Float32Array><any>vertices, <Uint32Array><any>triangles, state.annotate ? state.annotationBuffer.compact() : null);
    // }
    
    export function compute(parameters: MarchingCubesParameters): Computation<Surface> {
        return Computation.create(ctx => {           
            let comp = new MarchingCubesComputation(parameters, ctx);
            comp.start();
        });
    }

    class MarchingCubesComputation {
        
        private chunkSize = 80 * 80 * 80;
        private size: number; 
        private sliceSize: number;
        private done = 0;
        
        private k = 0;
        private minX = 0; private minY = 0; private minZ = 0;
        private maxX = 0; private maxY = 0; private maxZ = 0;
        private state: MarchingCubesState;
        
        private nextSlice() {
            if (this.ctx.abortRequested) {
                this.ctx.abort();
                return;
            }
            
            this.done += this.sliceSize;
            this.ctx.update('Computing surface...', this.ctx.abortRequest, this.done, this.size);
                        
            if (this.k >= this.maxZ) {
                this.finish();
            } else {            
                this.ctx.schedule(this._slice);
            }
        }
        
        private slice() {
            for (let j = this.minY; j < this.maxY; j++) {
                for (let i = this.minX; i < this.maxX; i++) {
                    this.state.processCell(i, j, this.k);
                }
            }
            this.k++;
            this.nextSlice();
        }
        
        private finish() {
            let vertices = <any>this.state.vertexBuffer.compact() as Float32Array;
            let triangles = <any>this.state.triangleBuffer.compact() as Uint32Array;

            this.state.vertexBuffer = null;
            this.state.verticesOnEdges = null;

            let ret: Surface = {
                vertexCount: (vertices.length / 3) | 0,
                triangleCount: (triangles.length / 3) | 0,
                vertices,
                triangleIndices: triangles,
                annotation: this.state.annotate ? this.state.annotationBuffer.compact() : void 0
            } 
                        
            this.ctx.resolve(ret);
        }
        
        private _slice = () => {
            try {
                this.slice();
            } catch (e) {
                this.ctx.reject('' + e);
            }
        }
        
        start() {
            this.ctx.update('Computing surface...', this.ctx.abortRequest, 0, this.size);                        
            this.ctx.schedule(this._slice);
        }
        
        constructor(
            parameters: MarchingCubesParameters, 
            private ctx: Computation.Context<Surface>) {
            
            let params = <MarchingCubesParameters>Core.Utils.extend({}, parameters);

            if (!params.bottomLeft) params.bottomLeft = [0, 0, 0];
            if (!params.topRight) params.topRight = params.scalarField.dimensions;
                    
            this.state = new MarchingCubesState(params),
            this.minX = params.bottomLeft[0]; this.minY = params.bottomLeft[1]; this.minZ = params.bottomLeft[2];
            this.maxX = params.topRight[0] - 1; this.maxY = params.topRight[1] - 1; this.maxZ = params.topRight[2] - 1;
            
            this.k = this.minZ;            
            this.size = (this.maxX - this.minX) * (this.maxY - this.minY) * (this.maxZ - this.minZ);
            this.sliceSize = (this.maxX - this.minX) * (this.maxY - this.minY);
        }
    }

    class MarchingCubesState {
        nX: number; nY: number; nZ: number;
        isoLevel: number;
        scalarField: Formats.Density.Field3D;
        annotationField: Formats.Density.Field3D;
        annotate: boolean;

        verticesOnEdges: Int32Array;
        vertList: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        i: number = 0; j: number = 0; k: number = 0;
        
        vertexBuffer: Core.Utils.ChunkedArrayBuilder<number>;
        annotationBuffer: Core.Utils.ChunkedArrayBuilder<number>;
        triangleBuffer: Core.Utils.ChunkedArrayBuilder<number>;

        private getAnnotation() {
            return this.annotationField.get(this.i, this.j, this.k);
        }

        private getFieldFromIndices(i: number, j: number, k: number) {
            return this.scalarField.get(i, j, k);
        }

        private get3dOffsetFromEdgeInfo(index: Index) {
            return (this.nX * ((this.k + index.k) * this.nY + this.j + index.j) + this.i + index.i) | 0;
        }
        
        private interpolate(edgeNum: number) {
            let info = EdgeIdInfo[edgeNum],
                edgeId = 3 * this.get3dOffsetFromEdgeInfo(info) + info.e;

            let ret = this.verticesOnEdges[edgeId];
            if (ret > 0) return (ret - 1) | 0;

            let edge = CubeEdges[edgeNum];
            let a = edge.a, b = edge.b,
                li = a.i + this.i, lj = a.j + this.j, lk = a.k + this.k,
                hi = b.i + this.i, hj = b.j + this.j, hk = b.k + this.k,
                v0 = this.getFieldFromIndices(li, lj, lk),
                v1 = this.getFieldFromIndices(hi, hj, hk),
                t = (this.isoLevel - v0) / (v0 - v1);

            let id = this.vertexBuffer.add3(
                li + t * (li - hi),
                lj + t * (lj - hj),
                lk + t * (lk - hk)) | 0;

            this.verticesOnEdges[edgeId] = id + 1;

            if (this.annotate) {
                this.annotationBuffer.add(this.getAnnotation());
            }

            return id;
        }

        constructor(params: MarchingCubesParameters) {
            this.nX = params.scalarField.dimensions[0]; this.nY = params.scalarField.dimensions[1]; this.nZ = params.scalarField.dimensions[2];
            this.isoLevel = params.isoLevel; this.scalarField = params.scalarField;
            this.annotationField = params.annotationField;

            let dX = params.topRight[0] - params.bottomLeft[0], dY = params.topRight[1] - params.bottomLeft[1], dZ = params.topRight[2] - params.bottomLeft[2],
                vertexBufferSize = Math.min(262144, Math.max(dX * dY * dZ / 16, 1024) | 0),
                triangleBufferSize = Math.min(1 << 16, vertexBufferSize * 4);

            this.vertexBuffer = Core.Utils.ChunkedArrayBuilder.forVertex3D(vertexBufferSize);
            this.triangleBuffer = new Core.Utils.ChunkedArrayBuilder<number>(size => new Uint32Array(size), triangleBufferSize, 3);

            this.annotate = !!params.annotationField;
            if (this.annotate) this.annotationBuffer = Core.Utils.ChunkedArrayBuilder.forInt32(vertexBufferSize);

            this.verticesOnEdges = new Int32Array(3 * this.nX * this.nY * this.nZ);
        }

        processCell(i: number, j: number, k: number) {
            let tableIndex = 0;
            
            if (this.getFieldFromIndices(i, j, k) < this.isoLevel) tableIndex |= 1;
            if (this.getFieldFromIndices(i + 1, j, k) < this.isoLevel) tableIndex |= 2;
            if (this.getFieldFromIndices(i + 1, j + 1, k) < this.isoLevel) tableIndex |= 4;
            if (this.getFieldFromIndices(i, j + 1, k) < this.isoLevel) tableIndex |= 8;
            if (this.getFieldFromIndices(i, j, k + 1) < this.isoLevel) tableIndex |= 16;
            if (this.getFieldFromIndices(i + 1, j, k + 1) < this.isoLevel) tableIndex |= 32;
            if (this.getFieldFromIndices(i + 1, j + 1, k + 1) < this.isoLevel) tableIndex |= 64;
            if (this.getFieldFromIndices(i, j + 1, k + 1) < this.isoLevel) tableIndex |= 128;

            if (tableIndex === 0 || tableIndex === 255) return;

            this.i = i; this.j = j; this.k = k;
            let edgeInfo = EdgeTable[tableIndex];
            if ((edgeInfo & 1) > 0) this.vertList[0] = this.interpolate(0); // 0 1
            if ((edgeInfo & 2) > 0) this.vertList[1] = this.interpolate(1); // 1 2
            if ((edgeInfo & 4) > 0) this.vertList[2] = this.interpolate(2); // 2 3
            if ((edgeInfo & 8) > 0) this.vertList[3] = this.interpolate(3); // 0 3
            if ((edgeInfo & 16) > 0) this.vertList[4] = this.interpolate(4); // 4 5
            if ((edgeInfo & 32) > 0) this.vertList[5] = this.interpolate(5); // 5 6
            if ((edgeInfo & 64) > 0) this.vertList[6] = this.interpolate(6); // 6 7
            if ((edgeInfo & 128) > 0) this.vertList[7] = this.interpolate(7); // 4 7
            if ((edgeInfo & 256) > 0) this.vertList[8] = this.interpolate(8); // 0 4
            if ((edgeInfo & 512) > 0) this.vertList[9] = this.interpolate(9); // 1 5
            if ((edgeInfo & 1024) > 0) this.vertList[10] = this.interpolate(10); // 2 6
            if ((edgeInfo & 2048) > 0) this.vertList[11] = this.interpolate(11); // 3 7

            let triInfo = TriTable[tableIndex];
            for (let t = 0; t < triInfo.length; t += 3) {
                this.triangleBuffer.add3(this.vertList[triInfo[t]], this.vertList[triInfo[t + 1]], this.vertList[triInfo[t + 2]]);
            }
        }
    }

}