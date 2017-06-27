/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Geometry.Query3D {

    /**
     * Adapted from https://github.com/arose/ngl
     * MIT License Copyright (C) 2014+ Alexander Rose
     */

    interface SpatialHash {
        size: number[],
        min: number[],
        grid: Int32Array,
        bucketOffset: Int32Array,
        bucketCounts: Int32Array,
        bucketArray: Int32Array,
        positions: number[]
    }

    interface State {
        size: number[],
        positions: number[],
        indices: Int32Array,
        bounds: Box3D
    }

    const enum Constants { Exp = 3 }

    function nearest(ctx: QueryContext<SpatialHash>) {
        const { min: [minX, minY, minZ], size: [sX, sY, sZ], bucketOffset, bucketCounts, bucketArray, grid, positions } = ctx.structure;
        const { radius: r, radiusSq: rSq, pivot: [x, y, z] } = ctx;

        const loX = Math.max(0, (x - r - minX) >> Constants.Exp);
        const loY = Math.max(0, (y - r - minY) >> Constants.Exp);
        const loZ = Math.max(0, (z - r - minZ) >> Constants.Exp);

        const hiX = Math.min(sX, (x + r - minX) >> Constants.Exp);
        const hiY = Math.min(sY, (y + r - minY) >> Constants.Exp);
        const hiZ = Math.min(sZ, (z + r - minZ) >> Constants.Exp);

        for (let ix = loX; ix <= hiX; ix++) {
            for (let iy = loY; iy <= hiY; iy++) {
                for (let iz = loZ; iz <= hiZ; iz++) {
                    const idx = (((ix * sY) + iy) * sZ) + iz;
                    const bucketIdx = grid[idx];

                    if (bucketIdx > 0) {
                        const k = bucketIdx - 1;
                        const offset = bucketOffset[k];
                        const count = bucketCounts[k];
                        const end = offset + count;

                        for (let i = offset; i < end; i++) {
                            const idx = bucketArray[i];
                            const dx = positions[3 * idx + 0] - x;
                            const dy = positions[3 * idx + 1] - y;
                            const dz = positions[3 * idx + 2] - z;
                            const distSq = dx * dx + dy * dy + dz * dz;

                            if (distSq <= rSq) {
                                QueryContext.add(ctx, distSq, idx)
                            }
                        }
                    }
                }
            }
        }
    }

    function _build(state: State): SpatialHash {
        const { bounds, size: [sX, sY, sZ], positions, indices } = state;
        const n = sX * sY * sZ;
        const count = indices.length;
        const { min: [minX, minY, minZ] } = bounds;

        let bucketCount = 0;
        const grid = new Uint32Array(n);
        const bucketIndex = new Int32Array(count);
        for (let i = 0; i < count; i++) {
            const x = (positions[3 * i + 0] - minX) >> Constants.Exp;
            const y = (positions[3 * i + 1] - minY) >> Constants.Exp;
            const z = (positions[3 * i + 2] - minZ) >> Constants.Exp;
            const idx = (((x * sY) + y) * sZ) + z;
            if ((grid[idx] += 1) === 1) {
                bucketCount += 1
            }
            bucketIndex[i] = idx;
        }

        const bucketCounts = new Int32Array(bucketCount);
        for (let i = 0, j = 0; i < n; i++) {
            const c = grid[i];
            if (c > 0) {
                grid[i] = j + 1;
                bucketCounts[j] = c;
                j += 1;
            }
        }

        const bucketOffset = new Uint32Array(count);
        for (let i = 1; i < count; ++i) {
            bucketOffset[i] += bucketOffset[i - 1] + bucketCounts[i - 1];
        }

        const bucketFill = new Int32Array(bucketCount);
        const bucketArray = new Int32Array(count);
        for (let i = 0; i < count; i++) {
            const bucketIdx = grid[bucketIndex[i]]
            if (bucketIdx > 0) {
                const k = bucketIdx - 1;
                bucketArray[bucketOffset[k] + bucketFill[k]] = i;
                bucketFill[k] += 1;
            }
        }

        return {
            size: state.size,
            bucketArray,
            bucketCounts,
            bucketOffset,
            grid,
            min: state.bounds.min,
            positions
        }
    }

    function build<T>({ elements, positions, bounds, indices }: InputData<T>): SpatialHash {
        const size = [
            ((bounds.max[0] - bounds.min[0]) >> Constants.Exp) + 1,
            ((bounds.max[1] - bounds.min[1]) >> Constants.Exp) + 1,
            ((bounds.max[2] - bounds.min[2]) >> Constants.Exp) + 1
        ];

        const state: State = {
            size,
            positions,
            indices,
            bounds
        }

        return _build(state);
    }


    export function createSpatialHash<T>(data: InputData<T>): LookupStructure<T> {
        const tree = build(data);
        return function () {
            const ctx = QueryContext.create(tree, data.elements);
            return function (x: number, y: number, z: number, radius: number) {
                QueryContext.update(ctx, x, y, z, radius);
                nearest(ctx);
                return ctx.buffer;
            }
        };
    }
}