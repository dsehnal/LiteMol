/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Utils {
    "use strict";
 
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    
    export function shallowClone<T>(o: T): T {
        return LiteMol.Core.Utils.extend({}, o) as T;
    }
    
    
    // // uses keys' keys to obtain values from source and return a new object
    // export function pickValues<S, T>(keys: S, source: T): S {
    //     let ret = <any>{};
    //     for (let k of Object.keys(keys)) {
    //         if (hasOwnProperty.call(keys, k)) ret[k] = (source as any)[k];
    //     }
    //     return ret;
    // };
    
    
    export function shallowEqual<T>(a: T, b: T) {  
        if (!a) {
            if (!b) return true;
            return false;
        }
        if (!b) return false;
        
        let keys = Object.keys(a);
        if (Object.keys(b).length !== keys.length) return false;
        for (let k of keys) {
            if (!hasOwnProperty.call(a, k) || (a as any)[k] !== (b as any)[k]) return false;
        }

        return true;
    }
    
    export function deepEqual<T>(a: T, b: T) {
        if (!a) {
            if (!b) return true;
            return false;
        }
        if (!b) return false;
        
        let keys = Object.keys(a);
        if (Object.keys(b).length !== keys.length) return false;
        for (let k of keys) {
            if (!hasOwnProperty.call(a, k)) return false;
            
            let u = (a as any)[k];
            let v = (b as any)[k];
            
            if (typeof u === 'object' && typeof v === 'object') {
                if (!deepEqual(u, v)) return false;
            } else if (u !== v) return false;
        }

        return true;
    }
    
    function _assign<T>(target: T): T {
        for (let s = 1; s < arguments.length; s++) {
		    let from = arguments[s];
            for (let key of Object.keys(from)) {
                if (hasOwnProperty.call(from, key)) {
                    (target as any)[key] = from[key];
                }            
            }
        }
        return target;
    }
    
    export declare function _assignType<T>(o: T, ...from: any[]): T;
    export const assign: (<T>(o: T, ...from: any[]) => T) = (Object as any).assign || _assign;
    
    function _shallowMerge1<T>(source: T, update: T) {        
        let changed = false;
        for (let k of Object.keys(update)) {
            if (!hasOwnProperty.call(update, k)) continue;
            
            if ((update as any)[k] !== (source as any)[k]) {
                changed = true;
                break;
            }
        }

        if (!changed) return source;
        return assign(shallowClone(source), update);
    }
    
    function _shallowMerge<T>(source: T) {
        let ret = source;
        
        for (let s = 1; s < arguments.length; s++) {
            if (!arguments[s]) continue;
            ret = _shallowMerge1(source, arguments[s]);
            if (ret !== source) {
                for (let i = s + 1; i < arguments.length; i++) {
                    ret = assign(ret, arguments[i]);
                }
                break;
            }
        }
        return ret;
    }
    
    export const merge: (<T>(source: T, ...rest: Partial<T>[]) => T)= _shallowMerge;
}