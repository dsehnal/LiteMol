/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
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

    export const Fail = Transformer.create<Entity.Any, Entity.Root, { title: string, message: string }>({
        id: 'fail',
        name: 'Fail',
        description: 'A transform that always fails.',
        from: [],
        to: [],
        validateParams: () => void 0,  
        defaultParams: () => ({ title: 'Error', message: 'Unknown error.' })
    }, (ctx, a, t) => {        
        return Task.reject(t.params.title, 'Background', t.params.message);
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

    export const Delay = Transformer.create<Entity.Root, Entity.Action, { timeoutMs: number }>({
        id: 'basic-delay',
        name: 'Delay',
        description: 'A transformer that delays by the specified timeout and does nothing.',
        from: [],
        to: [Entity.Action],
        validateParams: () => void 0,  
        defaultParams: () => ({ timeoutMs: 1000 })
    }, (ctx, a, t) => {        
        return Task.create('Delay', 'Silent', ctx => new Promise(res => {
            setTimeout(() => res(Tree.Node.Null), t.params.timeoutMs);
        }))
    }); 
}