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
                c.setExpanded(false);
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
             
             
        constructor(private context: Context) {
            Event.Tree.NodeRemoved.getStream(context).subscribe(e => {
                this.controllerCache.delete(e.data.id);
            })
        }   
    }     
}