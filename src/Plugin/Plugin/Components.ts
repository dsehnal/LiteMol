/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Components {
    "use strict";
    
    
    export function create(
        key: string, 
        controller: (ctx: Context) => Bootstrap.Components.Component<any>,
        view: ViewDefinition) {
        return (t: Bootstrap.Components.LayoutRegion, isStatic?:boolean) => ((ctx: Context) => ({
            key,
            controller: controller(ctx),
            region: t,
            view,
            isStatic
        }));
    }
    
    export class AppInfo extends Bootstrap.Components.Component<{}> {
        
        constructor(ctx: Bootstrap.Context, public appName: string, public appVersion: string) {
            super(ctx, {});
        }
    }
        
    export namespace Context {
        export const Log = create('Context.Log', s => new Bootstrap.Components.Context.Log(s), Views.Context.Log);
        export const Toast = create('Context.Toast', s => new Bootstrap.Components.Context.Toast(s), Views.Context.Toast);        
        export const Overlay = create('Context.Overlay', s => new Bootstrap.Components.Context.TaskWatcher(s, 'Normal'), Views.Context.Overlay);
        export const BackgroundTasks = create('Context.BackgroundTasks', s => new Bootstrap.Components.Context.TaskWatcher(s, 'Background'), Views.Context.BackgroundTasks);
    }
    
    export namespace Transform {
        export const View = create('Transform.View', s => new Bootstrap.Components.Transform.View(s), Views.Transform.View);        
    }
    
    export namespace Entity {                
        export const Current = (appName: string, appVersion: string) => create('EntityInfo', s => new AppInfo(s, appName, appVersion), Views.Entity.CurrentEntityControl);
    }
    
    export namespace Visualization {
        export const Viewport = create('Viewport', s => new Bootstrap.Components.Visualization.Viewport(s), Views.Visualization.Viewport);        
        export const HighlightInfo = create('HighlightInfo', s => new Bootstrap.Components.Visualization.HighlightInfo(s), Views.Visualization.HighlightInfo);       
    }
    
}