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

    export interface CreateSurfaceVisualParams { 
        surface: Core.Geometry.Surface, 
        theme: LiteMol.Visualization.Theme, 
        label?: string, 
        tag?: any, 
        isWireframe?: boolean, 
        isNotInteractive?: boolean,
        taskType?: Task.Type
    }
    export const CreateSurfaceVisual = Bootstrap.Tree.Transformer.create<Bootstrap.Entity.Root, Bootstrap.Entity.Visual.Surface, CreateSurfaceVisualParams>({
        id: 'basic-create-surface-visual',
        name: 'Create Surface Visual',
        description: 'Create generic surface visual.',
        from: [],
        to: [Bootstrap.Entity.Visual.Surface],
        defaultParams: () => void 0,
        isUpdatable: false
    }, (context, a, t) => {
        let theme = t.params.theme!;
        let style: Bootstrap.Visualization.Style<'Surface', {}> = {
            type: 'Surface',
            taskType: t.params.taskType || 'Silent',
            isNotSelectable: !!t.params.isNotInteractive,
            params: {},
            theme: <any>void 0
        };

        return Bootstrap.Task.create<Bootstrap.Entity.Visual.Surface>(`Create Surface Visual`, t.params.taskType || 'Silent', async ctx => {
            let model = await LiteMol.Visualization.Surface.Model.create(a, { surface: t.params.surface!, theme, parameters: { isWireframe: t.params.isWireframe! } }).run(ctx);
            return Bootstrap.Entity.Visual.Surface.create(t, { 
                label: t.params.label || 'Surface', 
                model, 
                style, 
                isSelectable: !t.params.isNotInteractive,
                tag: t.params.tag 
            });
        });
    });
}