/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap {
    "use strict";
    
    export class Settings {
        
        private settings = Core.Utils.FastMap.create<string, any>();
        
        set(key: string, value: any) {
            this.settings.set(key, value);
        }
        
        get(key: string) {
            return this.settings.get(key);
        }                
    }
      
    export class Context {        
        id = Utils.generateUUID();
        
        dispatcher = new Service.Dispatcher();
        logger = new Service.Logger(this);
        performance = new Core.Utils.PerformanceMonitor();
        scene: Visualization.SceneWrapper = <any>void 0; // injected by the Viewport component.        
        tree = Tree.create<Entity.Any>(this, Entity.Root.create(Entity.RootTransform, { label: 'Root Entity' }));        
        currentEntity: Entity.Any | undefined = void 0;        
        transforms = new TransformManager(this);
        entityCache = new Entity.Cache(this);
        viewport = new Components.Visualization.Viewport(this);
        layout: Components.Layout;
        highlight = new Interactivity.HighlightManager(this);
        behaviours = new Behaviour.Streams(this);
        settings = new Settings();
                                
        createLayout(targets: Components.LayoutTarget[], target: HTMLElement) {
            this.layout = new Components.Layout(this, targets, target);
        }
                
        select(selector: Tree.Selector<Entity.Any>) {
            return Tree.Selection.select<Entity.Any>(selector, this.tree);
        }
        
        constructor(public plugin?: Plugin.Instance) {
            initEventsAndCommands(this);
        }
    }   
}