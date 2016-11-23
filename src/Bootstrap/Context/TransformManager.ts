/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap {
    "use strict";
        
    import Transformer = Tree.Transformer.Any;    
        
    export class TransformManager {  
            
        private controllerCache = new Map<number, Map<string, Components.Transform.Controller<any>>>();

        private byId = new Map<string, Transformer>();
        private bySourceType = new Map<string, Transformer[]>();
        private byTargetType = new Map<string, Transformer[]>();

        private persistentState = new Map<string, Map<string, any>>();

        private addType(e: Entity.AnyType, t: Transformer, to: Map<string, Transformer[]>) {
            let xs = to.get(e.id);
            if (!xs) to.set(e.id, [t]);
            else xs.push(t); 
        }
        
        getController(t: Transformer, e: Entity.Any) {
            if (!this.byId.get(t.info.id)) {
                console.warn(`Trying to get contoller for unregistered transform (${t.info.id})`);
                return undefined;
            }

            let cs = this.controllerCache.get(e.id);
            if (!cs) {
                cs = new Map<string, Components.Transform.Controller<any>>();
                this.controllerCache.set(e.id, cs);
            }

            let c = cs.get(t.info.id);
            if (c) return c;

            let p = t.info.customController;
            if (p) c = p(this.context, t, e);
            else c = new Components.Transform.Controller<any>(this.context, t, e);

            let info = this.context.plugin && this.context.plugin.getTransformerInfo(t);
            if (info && info.initiallyCollapsed) {
                if (!this.hasPersistentState(t, 'isExpanded')) this.setPersistentState(t, 'isExpanded', false);
            } else {
                if (!this.hasPersistentState(t, 'isExpanded')) this.setPersistentState(t, 'isExpanded', true);
            }

            if (e.transform.transformer === t) {
                c.setParams(e.transform.params);
            }

            cs.set(t.info.id, c);
            return c;
        }
        
        getBySourceType(t: Entity.AnyType) {
            return this.bySourceType.get(t.id) || []; 
        }
        
        getByTargetType(t: Entity.AnyType) {
            return this.byTargetType.get(t.id) || [];
        }
        
        add(t: Transformer) {
            if (this.byId.has(t.info.id)) {
                throw `Transformer with id '${t.info.id}' is has already been added. Pick another id.`;
            }   
                        
            this.byId.set(t.info.id, t);
            for (let x of t.info.from) this.addType(x as Entity.AnyType, t, this.bySourceType);
            for (let x of t.info.to) this.addType(x as Entity.AnyType, t, this.byTargetType);
        }      

        hasPersistentState(t: Transformer, prop: string) {
            let ps = this.persistentState.get(t.info.id);
            if (!ps || !ps.has(prop)) return false;
            return true;
        }  
            
        getPersistentState<T>(t: Transformer, prop: string, defaultValue: T) {
            let ps = this.persistentState.get(t.info.id);
            if (!ps || !ps.has(prop)) return defaultValue;
            return ps.get(prop);
        }

        /**
         * returns whether the value changed or not
         */
        setPersistentState<T>(t: Transformer, prop: string, value: T): boolean {
            let ps = this.persistentState.get(t.info.id);
            if (!ps) {
                ps = new Map<string, any>();
                this.persistentState.set(t.info.id, ps);
            } 
            let old = ps.get(prop);
            ps.set(prop, value);
            return old !== value;
        }
             
        constructor(private context: Context) {
            Event.Tree.NodeRemoved.getStream(context).subscribe(e => {
                this.controllerCache.delete(e.data.id);
            })
        }   
    }     
}