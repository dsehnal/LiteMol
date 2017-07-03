/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Utils {
    "use strict";

    export function integerSetToSortedTypedArray(set: FastSet<number>) {
        let array = new Int32Array(set.size);
        set.forEach((v, ctx) => { ctx!.array[ctx!.index++] = v; }, { array, index: 0 });
        Array.prototype.sort.call(array, function (x: number, y: number) { return x - y; });
        return <number[]><any>array;
    }

    /**
     * A a JS native array with the given size.
     */
    export function makeNativeIntArray(size: number) {
        let arr: number[] = [];
        for (let i = 0; i < size; i++) arr[i] = 0;
        return arr;
    }

    /**
     * A a JS native array with the given size.
     */
    export function makeNativeFloatArray(size: number) {
        let arr: number[] = [];
        if (!size) return arr;
        arr[0] = 0.1;
        for (let i = 0; i < size; i++) arr[i] = 0;
        return arr;
    }

    /**
     * A generic chunked array builder.
     * 
     * When adding elements, the array growns by a specified number
     * of elements and no copying is done until ChunkedArray.compact
     * is called.
     */
    export interface ChunkedArray<T> {
        creator: (size: number) => any;
        elementSize: number;
        chunkSize: number;
        current: any;
        currentIndex: number;

        parts: any[];
        elementCount: number;
    }

    export namespace ChunkedArray {
        export function is(x: any): x is ChunkedArray<any> {
            return x.creator && x.chunkSize;
        }

        export function add4<T>(array: ChunkedArray<T>, x: T, y: T, z: T, w: T) {
            if (array.currentIndex >= array.chunkSize) {
                array.currentIndex = 0;
                array.current = array.creator(array.chunkSize);
                array.parts[array.parts.length] = array.current;
            }

            array.current[array.currentIndex++] = x;
            array.current[array.currentIndex++] = y;
            array.current[array.currentIndex++] = z;
            array.current[array.currentIndex++] = w;
            return array.elementCount++;
        }

        export function add3<T>(array: ChunkedArray<T>, x: T, y: T, z: T) {
            if (array.currentIndex >= array.chunkSize) {
                array.currentIndex = 0;
                array.current = array.creator(array.chunkSize);
                array.parts[array.parts.length] = array.current;
            }

            array.current[array.currentIndex++] = x;
            array.current[array.currentIndex++] = y;
            array.current[array.currentIndex++] = z;
            return array.elementCount++;
        }

        export function add2<T>(array: ChunkedArray<T>, x: T, y: T) {
            if (array.currentIndex >= array.chunkSize) {
                array.currentIndex = 0;
                array.current = array.creator(array.chunkSize);
                array.parts[array.parts.length] = array.current;
            }

            array.current[array.currentIndex++] = x;
            array.current[array.currentIndex++] = y;
            return array.elementCount++;
        }

        export function add<T>(array: ChunkedArray<T>, x: T) {
            if (array.currentIndex >= array.chunkSize) {
                array.currentIndex = 0;
                array.current = array.creator(array.chunkSize);
                array.parts[array.parts.length] = array.current;
            }

            array.current[array.currentIndex++] = x;
            return array.elementCount++;
        }


        export function compact<T>(array: ChunkedArray<T>): T[] {
            let ret = <any>array.creator(array.elementSize * array.elementCount),
                offset = (array.parts.length - 1) * array.chunkSize, offsetInner = 0, part: any;

            if (array.parts.length === 1 && array.chunkSize === array.elementCount) {
                return array.parts[0];
            }

            if (array.parts.length > 1) {
                if (array.parts[0].buffer) {
                    for (let i = 0; i < array.parts.length - 1; i++) {
                        ret.set(array.parts[i], array.chunkSize * i);
                    }
                } else {

                    for (let i = 0; i < array.parts.length - 1; i++) {
                        offsetInner = array.chunkSize * i;
                        part = array.parts[i];

                        for (let j = 0; j < array.chunkSize; j++) {
                            ret[offsetInner + j] = part[j];
                        }
                    }
                }
            }

            if (array.current.buffer && array.currentIndex >= array.chunkSize) {
                ret.set(array.current, array.chunkSize * (array.parts.length - 1));
            } else {
                for (let i = 0; i < array.currentIndex; i++) {
                    ret[offset + i] = array.current[i];
                }
            }
            return <any>ret;
        }

        export function forVertex3D(chunkVertexCount: number = 262144): ChunkedArray<number> {
            return create<number>(size => <any>new Float32Array(size), chunkVertexCount, 3)
        }

        export function forIndexBuffer(chunkIndexCount: number = 262144): ChunkedArray<number> {
            return create<number>(size => <any>new Uint32Array(size), chunkIndexCount, 3)
        }

        export function forTokenIndices(chunkTokenCount: number = 131072): ChunkedArray<number> {
            return create<number>(size => <any>new Int32Array(size), chunkTokenCount, 2)
        }

        export function forIndices(chunkTokenCount: number = 131072): ChunkedArray<number> {
            return create<number>(size => <any>new Int32Array(size), chunkTokenCount, 1)
        }

        export function forInt32(chunkSize: number = 131072): ChunkedArray<number> {
            return create<number>(size => <any>new Int32Array(size), chunkSize, 1)
        }

        export function forFloat32(chunkSize: number = 131072): ChunkedArray<number> {
            return create<number>(size => <any>new Float32Array(size), chunkSize, 1)
        }

        export function forArray<T>(chunkSize: number = 131072): ChunkedArray<T> {
            return create<T>(size => <any>[], chunkSize, 1)
        }

        export function create<T>(creator: (size: number) => any, chunkElementCount: number, elementSize: number): ChunkedArray<T> {
            chunkElementCount = chunkElementCount | 0;
            if (chunkElementCount <= 0) chunkElementCount = 1;

            let chunkSize = chunkElementCount * elementSize;
            let current = creator(chunkSize)

            return <ChunkedArray<T>>{
                elementSize,
                chunkSize,
                creator,
                current,
                parts: [current],
                currentIndex: 0,
                elementCount: 0
            }
        }
    }

    /**
     * Static size array builder.
     */
    export interface ArrayBuilder<T> {
        currentIndex: number;
        elementCount: number;
        array: T[];
    }

    export namespace ArrayBuilder {
        export function add3<T>(array: ArrayBuilder<T>, x: T, y: T, z: T) {
            let a = array.array;
            a[array.currentIndex++] = x;
            a[array.currentIndex++] = y;
            a[array.currentIndex++] = z;
            array.elementCount++;
        }

        export function add2<T>(array: ArrayBuilder<T>, x: T, y: T) {
            let a = array.array;
            a[array.currentIndex++] = x;
            a[array.currentIndex++] = y;
            array.elementCount++;
        }

        export function add<T>(array: ArrayBuilder<T>, x: T) {
            array.array[array.currentIndex++] = x;
            array.elementCount++;
        }

        export function forVertex3D(count: number): ArrayBuilder<number> {
            return create<number>(size => <any>new Float32Array(size), count, 3)
        }

        export function forIndexBuffer(count: number): ArrayBuilder<number> {
            return create<number>(size => <any>new Int32Array(size), count, 3)
        }

        export function forTokenIndices(count: number): ArrayBuilder<number> {
            return create<number>(size => <any>new Int32Array(size), count, 2)
        }

        export function forIndices(count: number): ArrayBuilder<number> {
            return create<number>(size => <any>new Int32Array(size), count, 1)
        }

        export function forInt32(count: number): ArrayBuilder<number> {
            return create<number>(size => <any>new Int32Array(size), count, 1)
        }

        export function forFloat32(count: number): ArrayBuilder<number> {
            return create<number>(size => <any>new Float32Array(size), count, 1)
        }

        export function forArray<T>(count: number): ArrayBuilder<T> {
            return create<T>(size => <any>[], count, 1)
        }

        export function create<T>(creator: (size: number) => any, chunkElementCount: number, elementSize: number): ArrayBuilder<T> {
            chunkElementCount = chunkElementCount | 0;
            return <ArrayBuilder<T>>{
                array: creator(chunkElementCount * elementSize),
                currentIndex: 0,
                elementCount: 0
            }
        }
    }

    export interface UniqueArray<T extends number | string> {
        _set: FastSet<T>,
        array: T[]
    }

    export function UniqueArray<T extends number | string>(): UniqueArray<T> {
        return { _set: FastSet.create<T>(), array: [] };
    }

    export namespace UniqueArray {
        export function add<T extends number | string>({ _set, array }: UniqueArray<T>, e: T) {
            if (!_set.has(e)) {
                _set.add(e);
                array[array.length] = e;
            }
        }
    }
} 