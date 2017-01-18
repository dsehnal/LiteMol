/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Utils {
    "use strict";

    export interface FastMap<K extends string | number, V> {
        readonly size: number;
        set(key: K, v: V): void;
        get(key: K): V | undefined;
        delete(key: K): boolean;
        has(key: K): boolean;
        clear(): void;
        forEach<Context>(f: (value: V, key: K, ctx?: Context) => void, ctx?: Context): void;
    }

    export interface MapLike<K extends string | number, V> {
        get(key: K): V | undefined;
        has(key: K): boolean;
    }

    export interface FastSet<T extends string | number> {
        readonly size: number;
        add(key: T): boolean;
        delete(key: T): boolean;
        has(key: T): boolean;
        clear(): void;
        forEach<Context>(f: (key: T, ctx?: Context) => void, ctx?: Context): void;
    }

    export namespace FastMap {
        function forEach(map: any, f: (value: any, key: any, ctx: any) => void, ctx: any) {
            const hasOwn = Object.prototype.hasOwnProperty;
            for (let key of Object.keys(map)) {
                if (!hasOwn.call(map, key)) continue;
                let v = map[key];
                if (v === void 0) continue;
                f(v, key, ctx);
            }
        }

        const __proto = {
            set(this: any, key: string | number, v: any) {
                if (this.data[key] === void 0 && v !== void 0) {
                    this.size++;
                }
                this.data[key] = v;
            },
            get(this: any, key: string | number) {
                return this.data[key];
            },
            delete(this: any, key: string | number) {
                if (this.data[key] === void 0) return false;
                this.data[key] = void 0;
                this.size--;
                return true;
            },
            has(this: any, key: string | number) {
                return this.data[key] !== void 0;
            },
            clear(this: any) {
                this.data = Object.create(null);
                this.size = 0;
            },
            forEach(this: any, f: (k: string | number, v: number, ctx?: any) => void, ctx?: any) {
                forEach(this.data, f, ctx !== void 0 ? ctx : void 0);
            }
        };

        export function create<K extends string | number, V>(): FastMap<K, V> {
            let ret = Object.create(__proto) as any;
            ret.data = Object.create(null);
            ret.size = 0;
            return ret;
        }

        export function of<K extends string | number, V>(data: (K | V)[][])         {
            let ret = create<K, V>();
            for (let xs of data) {
                ret.set(xs[0] as K, xs[1] as V);
            }
            return ret;
        }
    }

    export namespace FastSet {
        function forEach(map: any, f: (k: string | number, ctx: any) => void, ctx: any) {
            const hasOwn = Object.prototype.hasOwnProperty;
            for (let p of Object.keys(map)) {
                if (!hasOwn.call(map, p) || map[p] !== null) continue;
                f(p, ctx);
            }
        }

        const __proto = {
            add(this: any, key: string | number) {
                if (this.data[key] === null) return false;
                this.data[key] = null;
                this.size++;
                return true;
            },
            delete(this: any, key: string | number) {
                if (this.data[key] !== null) return false;
                this.data[key] = void 0;
                this.size--;
                return true;
            },
            has(this: any, key: string | number) {
                return this.data[key] === null;
            },
            clear(this: any) {
                this.data = Object.create(null);
                this.size = 0;
            },
            forEach(this: any, f: (k: string | number, ctx: any) => void, ctx?: any) {
                forEach(this.data, f, ctx !== void 0 ? ctx : void 0);
            }
        };

        export function create<T extends string | number>(): FastSet<T> {
            let ret = Object.create(__proto) as any;
            ret.data = Object.create(null);
            ret.size = 0;
            return ret;
        }

        export function of(xs: (string | number)[]) {
            let ret = create();
            for (let x of xs) ret.add(x);
            return ret;
        }
    }
}