/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Utils {
    "use strict";

    export interface FastMap<K extends string | number, V> {
        readonly size: number;
        set(key: K, v: V): void;
        get(key: K): V;
        delete(key: K): boolean;
        has(key: K): boolean;
        forEach<Context>(f: (key: K, v: number, ctx?: Context) => void, ctx?: Context): void;
    }

    export interface FastSet<T extends string | number> {
        readonly size: number;
        add(key: T): boolean;
        delete(key: T): boolean;
        has(key: T): boolean;
        forEach<Context>(f: (key: T, ctx?: Context) => void, ctx?: Context): void;
    }

    export namespace FastMap {
        function forEach(map: any, f: (k: string | number, v: number, ctx: any) => void, ctx: any) {
            const hasOwn = Object.prototype.hasOwnProperty;
            for (let p of Object.keys(map)) {
                if (!hasOwn.call(map, p)) continue;
                let v = map[p];
                if (v === void 0) continue;
                f(p, v, ctx);
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