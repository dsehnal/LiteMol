/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Utils {
    "use strict";

    /** Last recently used cache */
    export interface LRUCache<T> {
        entries: LinkedList<LRUCache.Entry<T>>,
        capacity: number 
    }

    export namespace LRUCache {        
        export interface Entry<T> extends LinkedElement<Entry<T>> {
            key: string, 
            data: T
        }

        export function entry<T>(key: string, data: T): Entry<T> {
            return {
                previous: null,
                next: null,
                inList: false,
                key,
                data
            };
        }

        export function create<T>(capacity: number): LRUCache<T> {
            return {
                entries: new LinkedList<Entry<T>>(),
                capacity: Math.max(1, capacity)
            };
        }

        export function get<T>(cache: LRUCache<T>, key: string) {
            for (let e = cache.entries.first; e; e = e.next) {
                if (e.key === key) {
                    cache.entries.remove(e);
                    cache.entries.addLast(e);
                    return e.data;
                }
            }
            return void 0;
        }

        export function set<T>(cache: LRUCache<T>, key: string, data: T): T {
            if (cache.entries.count >= cache.capacity) {
                cache.entries.remove(cache.entries.first!);
            }
            cache.entries.addLast(entry(key, data));
            return data;
        }
    }   
}