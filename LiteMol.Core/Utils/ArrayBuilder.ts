/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Utils {
    
    export function integerSetToSortedTypedArray(set: Set<number>) {
        let array = new Int32Array(set.size);
        set.forEach(function(v) { this.array[this.index++] = v; }, { array, index: 0 } );
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
     */
    export class ChunkedArrayBuilder<T> {
        private creator: (size: number) => any;
        private elementSize: number;
        private chunkSize: number;
        private current: any;
        private currentIndex: number;

        parts: any[];
        elementCount: number;


        add4(x: T, y: T, z: T, w: T) {
            if (this.currentIndex >= this.chunkSize) {
                this.currentIndex = 0;
                this.current = this.creator(this.chunkSize);
                this.parts[this.parts.length] = this.current;
            }

            this.current[this.currentIndex++] = x;
            this.current[this.currentIndex++] = y;
            this.current[this.currentIndex++] = z;
            this.current[this.currentIndex++] = w;
            return this.elementCount++;
        }

        add3(x: T, y: T, z: T) {
            if (this.currentIndex >= this.chunkSize) {
                this.currentIndex = 0;
                this.current = this.creator(this.chunkSize);
                this.parts[this.parts.length] = this.current;
            }

            this.current[this.currentIndex++] = x;
            this.current[this.currentIndex++] = y;
            this.current[this.currentIndex++] = z;            
            return this.elementCount++;
        }
        
        add2(x: T, y: T) {
            if (this.currentIndex >= this.chunkSize) {
                this.currentIndex = 0;
                this.current = this.creator(this.chunkSize);
                this.parts[this.parts.length] = this.current;
            }

            this.current[this.currentIndex++] = x;
            this.current[this.currentIndex++] = y;            
            return this.elementCount++;
        }

        add(x: T) {
            if (this.currentIndex >= this.chunkSize) {
                this.currentIndex = 0;
                this.current = this.creator(this.chunkSize);
                this.parts[this.parts.length] = this.current;
            }

            this.current[this.currentIndex++] = x;            
            return this.elementCount++;
        }


        compact(): T[]{
            var ret = <any>this.creator(this.elementSize * this.elementCount),
                i: number, j: number, offset = (this.parts.length - 1) * this.chunkSize, offsetInner = 0, part: any;

            if (this.parts.length > 1) {
                if (this.parts[0].buffer) {
                    for (i = 0; i < this.parts.length - 1; i++) {
                        ret.set(this.parts[i], this.chunkSize * i);
                    }
                } else {

                    for (i = 0; i < this.parts.length - 1; i++) {
                        offsetInner = this.chunkSize * i;
                        part = this.parts[i];

                        for (j = 0; j < this.chunkSize; j++) {
                            ret[offsetInner + j] = part[j];
                        }
                    }
                }
            }

            if (this.current.buffer && this.currentIndex >= this.chunkSize) {
                ret.set(this.current, this.chunkSize * (this.parts.length - 1));
            } else {
                for (i = 0; i < this.currentIndex; i++) {
                    ret[offset + i] = this.current[i];
                }
            }
            return <any>ret;
        }

        static forVertex3D(chunkVertexCount: number = 262144): ChunkedArrayBuilder<number> {
            return new ChunkedArrayBuilder<number>(size => <any>new Float32Array(size), chunkVertexCount, 3)
        }

        static forIndexBuffer(chunkIndexCount: number = 262144): ChunkedArrayBuilder<number> {
            return new ChunkedArrayBuilder<number>(size => <any>new Uint32Array(size), chunkIndexCount, 3)
        }

        static forTokenIndices(chunkTokenCount: number = 131072): ChunkedArrayBuilder<number> {
            return new ChunkedArrayBuilder<number>(size => <any>new Int32Array(size), chunkTokenCount, 2)
        }

        static forIndices(chunkTokenCount: number = 131072): ChunkedArrayBuilder<number> {
            return new ChunkedArrayBuilder<number>(size => <any>new Int32Array(size), chunkTokenCount, 1)
        }

        static forInt32(chunkSize: number = 131072): ChunkedArrayBuilder<number> {
            return new ChunkedArrayBuilder<number>(size => <any>new Int32Array(size), chunkSize, 1)
        }

        static forFloat32(chunkSize: number = 131072): ChunkedArrayBuilder<number> {
            return new ChunkedArrayBuilder<number>(size => <any>new Float32Array(size), chunkSize, 1)
        }

        static forArray<TElement>(chunkSize: number = 131072): ChunkedArrayBuilder<TElement> {
            return new ChunkedArrayBuilder<TElement>(size => <any>[], chunkSize, 1)
        }
        
        constructor(creator: (size: number) => any, chunkElementCount: number, elementSize: number) {
            chunkElementCount = chunkElementCount | 0;
            if (chunkElementCount <= 0) chunkElementCount = 1;

            this.elementSize = elementSize;
            this.chunkSize = chunkElementCount * elementSize;
            this.creator = creator;
            this.current = creator(this.chunkSize);
            this.parts = [this.current];
            this.currentIndex = 0;
            this.elementCount = 0;
        }
    }    

    /**
     * Static size array builder.
     */
    export class ArrayBuilder<T> {
        private currentIndex: number;
        elementCount: number;
        array: T[];

        add3(x: T, y: T, z: T) {
            this.array[this.currentIndex++] = x;
            this.array[this.currentIndex++] = y;
            this.array[this.currentIndex++] = z;
            this.elementCount++;

        }

        add2(x: T, y: T) {
            this.array[this.currentIndex++] = x;
            this.array[this.currentIndex++] = y;
            this.elementCount++;
        }

        add(x: T) {
            this.array[this.currentIndex++] = x;
            this.elementCount++;
        }
        
        static forVertex3D(count: number): ArrayBuilder<number> {
            return new ArrayBuilder<number>(size => <any>new Float32Array(size), count, 3)
        }

        static forIndexBuffer(count: number): ArrayBuilder<number> {
            return new ArrayBuilder<number>(size => <any>new Int32Array(size), count, 3)
        }

        static forTokenIndices(count: number): ArrayBuilder<number> {
            return new ArrayBuilder<number>(size => <any>new Int32Array(size), count, 2)
        }

        static forIndices(count: number): ArrayBuilder<number> {
            return new ArrayBuilder<number>(size => <any>new Int32Array(size), count, 1)
        }

        static forInt32(count: number): ArrayBuilder<number> {
            return new ArrayBuilder<number>(size => <any>new Int32Array(size), count, 1)
        }

        static forFloat32(count: number): ArrayBuilder<number> {
            return new ArrayBuilder<number>(size => <any>new Float32Array(size), count, 1)
        }

        static forArray<TElement>(count: number): ArrayBuilder<TElement> {
            return new ArrayBuilder<TElement>(size => <any>[], count, 1)
        }

        constructor(creator: (size: number) => any, chunkElementCount: number, elementSize: number) {
            chunkElementCount = chunkElementCount | 0;
            this.array = creator(chunkElementCount * elementSize);
            this.currentIndex = 0;
            this.elementCount = 0;
        }
    }    
} 