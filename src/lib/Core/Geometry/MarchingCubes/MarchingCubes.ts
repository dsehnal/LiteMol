/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
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

    export function compute(parameters: MarchingCubesParameters): Computation<Surface> {
        return computation(async ctx => {
            let comp = new MarchingCubesComputation(parameters, ctx);
            return await comp.run();
        });
    }

    class MarchingCubesComputation {
        private size: number;
        private sliceSize: number;
        
        private minX = 0; private minY = 0; private minZ = 0;
        private maxX = 0; private maxY = 0; private maxZ = 0;
        private state: MarchingCubesState;

        private async doSlices() {
            let done = 0;
            let started = Utils.PerformanceMonitor.currentTime();

            for (let k = this.minZ; k < this.maxZ; k++) {
                this.slice(k);

                done += this.sliceSize;

                let t = Utils.PerformanceMonitor.currentTime();

                if (t - started > Computation.UpdateProgressDelta) {
                    await this.ctx.updateProgress('Computing surface...', true, done, this.size);
                    started = t;
                }
            }
        }

        private slice(k: number) {
            for (let j = this.minY; j < this.maxY; j++) {
                for (let i = this.minX; i < this.maxX; i++) {
                    this.state.processCell(i, j, k);
                }
            }
            this.state.clearEdgeVertexIndexSlice(k);
        }

        private finish() {
            let vertices = <any>Utils.ChunkedArray.compact(this.state.vertexBuffer) as Float32Array;
            let triangles = <any>Utils.ChunkedArray.compact(this.state.triangleBuffer) as Uint32Array;

            this.state.vertexBuffer = <any>void 0;
            this.state.verticesOnEdges = <any>void 0;

            let ret: Surface = {
                vertexCount: (vertices.length / 3) | 0,
                triangleCount: (triangles.length / 3) | 0,
                vertices,
                triangleIndices: triangles,
                annotation: this.state.annotate ? Utils.ChunkedArray.compact(this.state.annotationBuffer) : void 0
            }

            return ret;
        }

        async run() {            
            await this.ctx.updateProgress('Computing surface...', true, 0, this.size);
            await this.doSlices();
            await this.ctx.updateProgress('Finalizing...');
            return this.finish();
        }

        constructor(
            parameters: MarchingCubesParameters,
            private ctx: Computation.Context) {

            let params = <MarchingCubesParameters>Core.Utils.extend({}, parameters);

            if (!params.bottomLeft) params.bottomLeft = [0, 0, 0];
            if (!params.topRight) params.topRight = params.scalarField.dimensions;

            this.state = new MarchingCubesState(params),
                this.minX = params.bottomLeft[0]; this.minY = params.bottomLeft[1]; this.minZ = params.bottomLeft[2];
            this.maxX = params.topRight[0] - 1; this.maxY = params.topRight[1] - 1; this.maxZ = params.topRight[2] - 1;

            this.size = (this.maxX - this.minX) * (this.maxY - this.minY) * (this.maxZ - this.minZ);
            this.sliceSize = (this.maxX - this.minX) * (this.maxY - this.minY);
        }
    }

    class MarchingCubesState {
        nX: number; nY: number; nZ: number;
        isoLevel: number;
        scalarField: Formats.Density.Field3D;
        annotationField?: Formats.Density.Field3D;
        annotate: boolean;

        // two layers of vertex indices. Each vertex has 3 edges associated.
        verticesOnEdges: Int32Array;
        vertList: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        i: number = 0; j: number = 0; k: number = 0;

        vertexBuffer: Core.Utils.ChunkedArray<number>;
        annotationBuffer: Core.Utils.ChunkedArray<number>;
        triangleBuffer: Core.Utils.ChunkedArray<number>;

        private get3dOffsetFromEdgeInfo(index: Index) {
            return (this.nX * (((this.k + index.k) % 2) * this.nY + this.j + index.j) + this.i + index.i);
        }

        /**
         * This clears the "vertex index buffer" for the slice that will not be accessed anymore.
         */
        clearEdgeVertexIndexSlice(k: number) {
            // clear either the top or bottom half of the buffer...
            const start = k % 2 === 0 ? 0 : 3 * this.nX * this.nY;
            const end = k % 2 === 0 ? 3 * this.nX * this.nY : this.verticesOnEdges.length;
            for (let i = start; i < end; i++) this.verticesOnEdges[i] = 0;
        }

        private interpolate(edgeNum: number) {
            const info = EdgeIdInfo[edgeNum],
                edgeId = 3 * this.get3dOffsetFromEdgeInfo(info) + info.e;

            const ret = this.verticesOnEdges[edgeId];
            if (ret > 0) return (ret - 1) | 0;

            const edge = CubeEdges[edgeNum];
            const a = edge.a, b = edge.b;
            const li = a.i + this.i, lj = a.j + this.j, lk = a.k + this.k;
            const hi = b.i + this.i, hj = b.j + this.j, hk = b.k + this.k;
            const v0 = this.scalarField.get(li, lj, lk), v1 = this.scalarField.get(hi, hj, hk);
            const t = (this.isoLevel - v0) / (v0 - v1);

            const id = Utils.ChunkedArray.add3(
                this.vertexBuffer,
                li + t * (li - hi),
                lj + t * (lj - hj),
                lk + t * (lk - hk)) | 0;

            this.verticesOnEdges[edgeId] = id + 1;

            if (this.annotate) {
                let a = t < 0.5 ? this.annotationField!.get(li, lj, lk) : this.annotationField!.get(hi, hj, hk);
                if (a < 0) a = t < 0.5 ? this.annotationField!.get(hi, hj, hk) : this.annotationField!.get(li, lj, lk);
                Utils.ChunkedArray.add(this.annotationBuffer, a);
            }

            return id;
        }

        constructor(params: MarchingCubesParameters) {
            this.nX = params.scalarField.dimensions[0]; this.nY = params.scalarField.dimensions[1]; this.nZ = params.scalarField.dimensions[2];
            this.isoLevel = params.isoLevel; this.scalarField = params.scalarField;
            this.annotationField = params.annotationField;

            let dX = params.topRight![0] - params.bottomLeft![0], dY = params.topRight![1] - params.bottomLeft![1], dZ = params.topRight![2] - params.bottomLeft![2],
                vertexBufferSize = Math.min(262144, Math.max(dX * dY * dZ / 16, 1024) | 0),
                triangleBufferSize = Math.min(1 << 16, vertexBufferSize * 4);

            this.vertexBuffer = Core.Utils.ChunkedArray.forVertex3D(vertexBufferSize);
            this.triangleBuffer = Core.Utils.ChunkedArray.create<number>(size => new Uint32Array(size), triangleBufferSize, 3);

            this.annotate = !!params.annotationField;
            if (this.annotate) this.annotationBuffer = Core.Utils.ChunkedArray.forInt32(vertexBufferSize);

            // two layers of vertex indices. Each vertex has 3 edges associated.
            this.verticesOnEdges = new Int32Array(3 * this.nX * this.nY * 2);
        }

        processCell(i: number, j: number, k: number) {
            let tableIndex = 0;

            if (this.scalarField.get(i, j, k) < this.isoLevel) tableIndex |= 1;
            if (this.scalarField.get(i + 1, j, k) < this.isoLevel) tableIndex |= 2;
            if (this.scalarField.get(i + 1, j + 1, k) < this.isoLevel) tableIndex |= 4;
            if (this.scalarField.get(i, j + 1, k) < this.isoLevel) tableIndex |= 8;
            if (this.scalarField.get(i, j, k + 1) < this.isoLevel) tableIndex |= 16;
            if (this.scalarField.get(i + 1, j, k + 1) < this.isoLevel) tableIndex |= 32;
            if (this.scalarField.get(i + 1, j + 1, k + 1) < this.isoLevel) tableIndex |= 64;
            if (this.scalarField.get(i, j + 1, k + 1) < this.isoLevel) tableIndex |= 128;

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
                Utils.ChunkedArray.add3(this.triangleBuffer, this.vertList[triInfo[t]], this.vertList[triInfo[t + 1]], this.vertList[triInfo[t + 2]]);
            }
        }
    }

}