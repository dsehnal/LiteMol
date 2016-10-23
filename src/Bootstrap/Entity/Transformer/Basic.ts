/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Entity.Transformer.Basic {
    "use strict";
    
    import Transformer = Tree.Transformer
    
    export const Root = Transformer.create<Entity.Root, Entity.Root, {}>({
        id: 'root',
        name: 'Root',
        description: 'A transformer that always returns itself.',
        from: [Entity.Root],
        to: [Entity.Root],
        validateParams: () => void 0,  
        defaultParams: () => ({ })
    }, (ctx, a, t) => {        
        return Task.resolve('Root', 'Silent', a);
    }); 
    
    export interface CreateGroupParams { label?: string, description?: string, isCollapsed?: boolean }        
    export const CreateGroup = Transformer.create<Entity.Any, Entity.Root, CreateGroupParams>({
        id: 'create-group',
        name: 'Create Group',
        description: 'A transformer that always returns itself.',
        from: [],
        to: [Entity.Group],
        validateParams: () => void 0,  
        defaultParams: () => ({ })
    }, (ctx, a, t) => {
        let group = Entity.Group.create(t, { label: t.params.label ? t.params.label : 'Group', description: t.params.description });
        if (t.params.isCollapsed) {
            let s: Entity.State = { isCollapsed: true };
            group = Tree.Node.withState(group, s); 
        }  
        return Task.resolve('Group', 'Silent', group);
    }); 
    
    
    export interface GroupEntry<A extends Any, GlobalParams, CurrentParams> {
        params: (initial: GlobalParams, e: A) => CurrentParams; // can be undefined in which case 
        transformer: Transformer<A, Any, CurrentParams>
    }
    
    export function group<A extends Any, P>(info: Transformer.Info<A, Entity.Group, P>, transformers: GroupEntry<A, P, any>[]): Transformer<A, Entity.Group, P> {        
        return Transformer.create<A, Entity.Group, P>(info, (context, source, parent) => {            
            return Task.create(info.name, 'Background', ctx => {
                let group = CreateGroup.create({ label: info.name }).apply(context, source);                
                group.run(context).then(g => {
                    let promises = transformers.map(t => () => Task.guardedPromise<{} | undefined>(context, (resolve, reject) => {
                        
                        let params = t.params(parent.params, source);
                        if (!params) {
                            resolve(void 0);
                            return;
                        }
                        
                        let transform = t.transformer.create(params, { isBinding: true });
                        transform.apply(context, <any>g).run(context).then(b => {
                            resolve(b);
                        }).catch(reject);                         
                    }));                       
                    Task.sequencePromises(promises, true).then(() => {
                        ctx.resolve(g);
                    }).catch(ctx.reject);
                });         
            })
        }); 
    }
}