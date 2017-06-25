/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Geometry.Query3D {
    
    /**
     * Query context. Handles the actual querying.
     */
    export type QueryFunc<T> = (x: number, y: number, z: number, radius: number) => Result<T>;

    export interface Result<T> {
        readonly count: number,
        readonly elements: T[],
        readonly squaredDistances: number[]
    }

    export interface InputData<T> {
        elements: T[],
        indices: Int32Array,
        bounds: Box3D,
        positions: number[]
    }

    export type LookupStructure<T> = (radiusEstimate: number, includePriorities?: boolean) => QueryFunc<T>

    export interface ResultBuffer {
        sourceElements: any[];
        count: number;
        elements: any[];
        squaredDistances: number[];
    }

    export namespace ResultBuffer {
        export function add(buffer: ResultBuffer, distSq: number, index: number) {
            buffer.squaredDistances[buffer.count] = distSq;
            buffer.elements[buffer.count++] = buffer.sourceElements[index];
        }

        export function reset(buffer: ResultBuffer) { buffer.count = 0; }

        export function create(sourceElements: any[]): ResultBuffer {
            return {
                sourceElements,
                elements: [],
                count: 0,
                squaredDistances: []
            }
        }
    }

    /**
     * A helper to store boundary box.
     */
    export interface Box3D {
        min: number[];
        max: number[];
    }

    export namespace Box3D {   
        export function createInfinite(): Box3D {
            return {
                min: [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE],
                max: [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE]
            }
        }
    }

    interface PositionBuilder {
        _count: number;
        boundsMin: number[];
        boundsMax: number[];
        bounds: Box3D;
        data: number[];
    }

    namespace PositionBuilder {
        export function add(builder: PositionBuilder, x: number, y: number, z: number) {            
            builder.data[builder._count++] = x;
            builder.data[builder._count++] = y;
            builder.data[builder._count++] = z;
            builder.boundsMin[0] = Math.min(x, builder.boundsMin[0]);
            builder.boundsMin[1] = Math.min(y, builder.boundsMin[1]);
            builder.boundsMin[2] = Math.min(z, builder.boundsMin[2]);
            builder.boundsMax[0] = Math.max(x, builder.boundsMax[0]);
            builder.boundsMax[1] = Math.max(y, builder.boundsMax[1]);
            builder.boundsMax[2] = Math.max(z, builder.boundsMax[2]);
        }

        export function create(size: number): PositionBuilder {
            let data = <any>new Float32Array((size * 3) | 0);
            let bounds = Box3D.createInfinite();
            let boundsMin = bounds.min;
            let boundsMax = bounds.max;
            return { _count: 0, data, bounds, boundsMin, boundsMax };
        }

        export function createAdder(builder: PositionBuilder) {
            let add = PositionBuilder.add;
            return function(x: number, y: number, z: number) {
                add(builder, x, y, z);
            };
        }
    }

    export function createInputData<T>(elements: T[], f: (e: T, add: (x: number, y: number, z: number) => void) => void): InputData<T> {
        const positions = PositionBuilder.create(elements.length);
        const indices = new Int32Array(elements.length);
        const add = PositionBuilder.createAdder(positions);
        for (let i = 0; i < elements.length; i++) {
            indices[i] = i;
            f(elements[i], add);
        }
        return { elements, positions: positions.data, bounds: positions.bounds, indices };
    }
}
