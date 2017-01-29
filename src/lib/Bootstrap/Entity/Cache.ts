/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Entity {
    "use strict";
        
    export class Cache {         
        private data = Core.Utils.FastMap.create<number, { [key: string]: any }>()
        
        get<T>(e: Any, prop: string) {
            let c = this.data.get(e.id);
            if (c) return c[prop] as T;
            return void 0;
        }
        
        set<T>(e: Any, prop: string, value: T) {
            let c = this.data.get(e.id);
            if (c) {
                c[prop] = value;
            } else {
                this.data.set(e.id, { [prop]: value });
            }
            return value;      
        }
        
        constructor(context: Context) {
            Event.Tree.NodeRemoved.getStream(context).subscribe(e => this.data.delete(e.data.id));
        }
    }    
    
    export namespace Cache.Keys {
        export const QueryContext = 'queryContext'
    } 
}