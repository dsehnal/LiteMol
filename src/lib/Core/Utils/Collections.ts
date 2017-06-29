/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Utils {
    "use strict";

    /**
     * An "object" based implementation of map that supports string and numeric keys
     * which should be ok for most use cases in LiteMol. 
     * 
     * The type limitation is on purpose to prevent using the type in places that are 
     * not appropriate.
     */
    export interface FastMap<K extends string | number, V> {
        readonly size: number;
        set(key: K, v: V): void;
        get(key: K): V | undefined;
        delete(key: K): boolean;
        has(key: K): boolean;
        clear(): void;
        /**
         * Iterate over the collection.
         * Optional "context" object can be supplied that is passed to the callback.
         * 
         * Enumerates only values that are not undefined.
         */
        forEach<Context>(f: (value: V, key: K, ctx?: Context) => void, ctx?: Context): void;
    }

    /**
     * An "object" based implementation of set that supports string and numeric values
     * which should be ok for most use cases in LiteMol.
     * 
     * The type limitation is on purpose to prevent using the type in places that are 
     * not appropriate.
     */
    export interface FastSet<T extends string | number> {
        readonly size: number;
        add(key: T): boolean;
        delete(key: T): boolean;
        has(key: T): boolean;
        clear(): void;
        /**
         * Iterate over the collection.
         * Optional "context" object can be supplied that is passed to the callback.
         */
        forEach<Context>(f: (key: T, ctx?: Context) => void, ctx?: Context): void;
    }

    function createMapObject() {
        let map = Object.create(null);
        // to cause deoptimization as we don't want to create hidden classes
        map["__"] = void 0;
        delete map["__"];
        return map;
    }

    type MapData = { data: any, size: number }

    export namespace FastMap {
        function forEach(data: any, f: (value: any, key: any, ctx: any) => void, ctx: any) {
            const hasOwn = Object.prototype.hasOwnProperty;
            for (let key of Object.keys(data)) {
                if (!hasOwn.call(data, key)) continue;
                let v = data[key];
                if (v === void 0) continue;
                f(v, key, ctx);
            }
        }

        const fastMap = {
            set(this: MapData, key: string | number, v: any) {
                if (this.data[key] === void 0 && v !== void 0) {
                    this.size++;
                }
                this.data[key] = v;
            },
            get(this: MapData, key: string | number) {
                return this.data[key];
            },
            delete(this: MapData, key: string | number) {
                if (this.data[key] === void 0) return false;
                delete this.data[key];
                this.size--;
                return true;
            },
            has(this: MapData, key: string | number) {
                return this.data[key] !== void 0;
            },
            clear(this: MapData) {
                this.data = createMapObject();
                this.size = 0;
            },
            forEach(this: MapData, f: (k: string | number, v: number, ctx?: any) => void, ctx?: any) {
                forEach(this.data, f, ctx !== void 0 ? ctx : void 0);
            }
        };

        /**
         * Creates an empty map.
         */
        export function create<K extends string | number, V>(): FastMap<K, V> {
            let ret = Object.create(fastMap) as any;
            ret.data = createMapObject();
            ret.size = 0;
            return ret;
        }

        /**
         * Create a map from an array of the form [[key, value], ...]
         */
        export function ofArray<K extends string | number, V>(data: (K | V)[][]) {
            let ret = create<K, V>();
            for (let xs of data) {
                ret.set(xs[0] as K, xs[1] as V);
            }
            return ret;
        }

        /**
         * Create a map from an object of the form { key: value, ... }
         */
        export function ofObject<V>(data: { [key: string]: V }) {
            let ret = create<string, V>();
            const hasOwn = Object.prototype.hasOwnProperty;
            for (let key of Object.keys(data)) {
                if (!hasOwn.call(data, key)) continue;
                let v = data[key];
                ret.set(key, v);
            }
            return ret;
        }
    }

    export namespace FastSet {
        function forEach(data: any, f: (k: string | number, ctx: any) => void, ctx: any) {
            const hasOwn = Object.prototype.hasOwnProperty;
            for (let p of Object.keys(data)) {
                if (!hasOwn.call(data, p) || data[p] !== null) continue;
                f(p, ctx);
            }
        }


        /**
         * Uses null for present values.
         */
        const fastSet = {
            add(this: MapData, key: string | number) {
                if (this.data[key] === null) return false;
                this.data[key] = null;
                this.size++;
                return true;
            },
            delete(this: MapData, key: string | number) {
                if (this.data[key] !== null) return false;
                delete this.data[key];
                this.size--;
                return true;
            },
            has(this: MapData, key: string | number) {
                return this.data[key] === null;
            },
            clear(this: MapData) {
                this.data = createMapObject();
                this.size = 0;
            },
            forEach(this: MapData, f: (k: string | number, ctx: any) => void, ctx?: any) {
                forEach(this.data, f, ctx !== void 0 ? ctx : void 0);
            }
        };

        /**
         * Create an empty set.
         */
        export function create<T extends string | number>(): FastSet<T> {
            let ret = Object.create(fastSet) as any;
            ret.data = createMapObject();
            ret.size = 0;
            return ret;
        }

        /**
         * Create a set of an "array like" sequence.
         */
        export function ofArray<T extends string | number>(xs: ArrayLike<T>) {
            let ret = create<T>();
            for (let i = 0, l = xs.length; i < l; i++) {
                ret.add(xs[i]);
            }
            return ret;
        }
    }

    /**
     * An optimized set-like structure.
     */
    export interface Mask {
        size: number;
        has(i: number): boolean;
    }

    export namespace Mask {
        class EmptyMask implements Mask {
            has(i: number) { return false; }
            constructor(public size: number) { }
        }

        class SingletonMask implements Mask {
            has(i: number) { return i === this.idx; }
            constructor(private idx: number, public size: number) { }
        }

        class BitMask implements Mask {
            has(i: number) { return <any>this.mask[i]; }
            constructor(private mask: Int8Array, public size: number) { }
        }

        class AllMask implements Mask {
            has(i: number) { return true; }
            constructor(public size: number) { }
        }

        export function ofStructure(structure: Structure.Molecule.Model): Mask {
            return new AllMask(structure.data.atoms.count);
        }

        export function ofIndices(totalCount: number, indices: number[]): Mask {
            const len = indices.length;
            if (len === 0) return new EmptyMask(totalCount);
            if (len === 1) return new SingletonMask(indices[0], totalCount);
            let f = len / totalCount;
            if (f < 1 / 12) {
                let set = Utils.FastSet.create();
                for (let i of indices) set.add(i);
                return set;
            }

            let mask = new Int8Array(totalCount);
            for (let i of indices) {
                mask[i] = 1;
            }
            return new BitMask(mask, len);
        }

        export function ofFragments(seq: Structure.Query.FragmentSeq): Mask {
            let sizeEstimate = 0;

            for (let f of seq.fragments) {
                sizeEstimate += f.atomCount;
            }

            let count = seq.context.structure.data.atoms.count;

            if (sizeEstimate / count < 1 / 12) {
                // create set;
                let mask = Utils.FastSet.create();
                for (let f of seq.fragments) {
                    for (let i of f.atomIndices) {
                        mask.add(i);
                    }
                }
                return mask;
            } else {
                let mask = new Int8Array(count);

                for (let f of seq.fragments) {
                    for (let i of f.atomIndices) {
                        mask[i] = 1;
                    }
                }

                let size = 0;
                for (let i = 0; i < count; i++) {
                    if (mask[i] !== 0) size++;
                }
                return new BitMask(mask, size);
            }
        }
    }
}