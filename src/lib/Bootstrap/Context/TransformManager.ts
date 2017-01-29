/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap {
    "use strict";
        
    import Transformer = Tree.Transformer.Any;    
        
    export class TransformManager {  
            
        private controllerCache = Core.Utils.FastMap.create<number, Core.Utils.FastMap<string, Components.Transform.Controller<any>>>();
        private state = Core.Utils.FastMap.create<number, Core.Utils.FastMap<string, any>>();

        private byId = Core.Utils.FastMap.create<string, Transformer>();
        private bySourceType = Core.Utils.FastMap.create<string, Transformer[]>();
        private byTargetType = Core.Utils.FastMap.create<string, Transformer[]>();

        private addType(e: Entity.AnyType, t: Transformer, to: Core.Utils.FastMap<string, Transformer[]>) {
            let xs = to.get(e.id);
            if (!xs) to.set(e.id, [t]);
            else xs.push(t); 
        }
        
        getController(t: Transformer, e: Entity.Any) {
            if (!e) {
                console.warn(`Trying to get controller for undefined entity.`);
                return void 0;
            }

            if (!this.byId.get(t.info.id)) {
                console.warn(`Trying to get controller for unregistered transform (${t.info.id}).`);
                return void 0;
            }

            let cs = this.controllerCache.get(e.id);
            if (!cs) {
                cs = Core.Utils.FastMap.create<string, Components.Transform.Controller<any>>();
                this.controllerCache.set(e.id, cs);
            }

            let c = cs.get(t.info.id);
            if (c) return c;

            let p = t.info.customController;
            if (p) c = p(this.context, t, e);
            else c = new Components.Transform.Controller<any>(this.context, t, e);

            let info = this.context.plugin && this.context.plugin.getTransformerInfo(t);
            if (info && info.initiallyCollapsed) {
                if (!this.hasPersistentState(t, e, 'isExpanded')) this.setPersistentState(t, e, 'isExpanded', false);
            } else {
                if (!this.hasPersistentState(t, e, 'isExpanded')) this.setPersistentState(t, e, 'isExpanded', true);
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

        hasPersistentState(t: Transformer, e: Entity.Any, prop: string) {
            let se = this.state.get(e.id);
            if (!se) return false;
            let ps = se.get(t.info.id);
            if (!ps || !ps.has(prop)) return false;
            return true;
        }  
            
        getPersistentState<T>(t: Transformer, e: Entity.Any, prop: string, defaultValue: T) {
            let se = this.state.get(e.id);
            if (!se) return defaultValue;
            let ps = se.get(t.info.id);
            if (!ps || !ps.has(prop)) return defaultValue;
            return ps.get(prop);
        }

        /**
         * returns whether the value changed or not
         */
        setPersistentState<T>(t: Transformer, e: Entity.Any, prop: string, value: T): boolean {
            let se = this.state.get(e.id);
            if (!se) {
                se = Core.Utils.FastMap.create<string, any>();
                this.state.set(e.id, se);
            }
            let ps = se.get(t.info.id);
            if (!ps) {
                ps = Core.Utils.FastMap.create<string, any>();
                se.set(t.info.id, ps);
            } 
            let old = ps.get(prop);
            ps.set(prop, value);
            return old !== value;
        }
             
        constructor(private context: Context) {
            Event.Tree.NodeRemoved.getStream(context).subscribe(e => {
                this.controllerCache.delete(e.data.id);
                this.state.delete(e.data.id);
            })
        }   
    }     
}