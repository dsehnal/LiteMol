/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin {
    "use strict";
    
    export import Context = Bootstrap.Context;
    export type ViewDefinition =  React.ComponentClass<{ controller: Bootstrap.Components.Component<any> } & any>;
    
    import LayoutRegion = Bootstrap.Components.LayoutRegion;
    
    export interface TransformerInfo extends Bootstrap.Plugin.TransformerInfo {
        transformer: Bootstrap.Tree.Transformer.Any,
        view: ViewDefinition,
        initiallyCollapsed?: boolean
    } 

    export type BehaviourProvider = (stack: Context) => void;
    export type ComponentProvider = (context: Context) => Bootstrap.Components.ComponentInfo;

    export interface Specification {
        settings: { [key: string]: any }, 
        behaviours: BehaviourProvider[],
        transforms: TransformerInfo[],
        layoutView: ViewDefinition,
        tree: {
            view: ViewDefinition,
            region: LayoutRegion
        } | undefined,
        viewport: {
            view: ViewDefinition,            
            controlsView: ViewDefinition
        },
        components: ComponentProvider[]
    }
           
    export class Instance implements Bootstrap.Plugin.Instance {
        private componentMap = Core.Utils.FastMap.create<string, Bootstrap.Components.ComponentInfo>();  
        private transformersInfo = Core.Utils.FastMap.create<string, TransformerInfo>(); 
                  
        context: Bootstrap.Context = new Bootstrap.Context(this);
        
        private compose() {            
            for (let s of Object.keys(this.spec.settings)) {
                if (!Object.prototype.hasOwnProperty.call(this.spec.settings, s)) continue;
                this.context.settings.set(s, this.spec.settings[s]);
            }
            
            let targets = Bootstrap.Components.makeEmptyTargets();

            for (let b of (this.spec.behaviours || []))  {
                b(this.context);
            }
            
            for (let t of this.spec.transforms) {
                this.context.transforms.add(t.transformer);
                this.transformersInfo.set(t.transformer.info.id, t);
            }
                        
            for (let cs of this.spec.components) {
                let info = cs(this.context);
                if (this.componentMap.has(info.key)) {
                    throw `Component with key '${info.key}' was already added. Fix your spec.`;
                }
                                
                targets[info.region].components.push(info);
                this.componentMap.set(info.key, info);
            }
            
            
            return targets;
        }
        
        getTransformerInfo(transformer: Bootstrap.Tree.Transformer.Any) {
            return this.transformersInfo.get(transformer.info.id)!;
        }
        
        destroy() {
            this.context.dispatcher.finished();
            ReactDOM.unmountComponentAtNode(this.target);
            this.context = <any>void 0;
            this.componentMap = <any>void 0;
            this.spec = <any>void 0;
            this.target = <any>void 0;
        }
        
        private init() {
            let targets = this.compose();
            
            if (this.spec.tree) {
                targets[this.spec.tree.region].components.push({
                    key: 'lm-internal-tree',
                    controller: new Bootstrap.Components.Component<{}>(this.context, {}),
                    region: this.spec.tree.region,
                    view: this.spec.tree.view,
                    isStatic: true
                });
            }
            
            targets[LayoutRegion.Main].components.push({
                key: 'lm-internal-viewport',
                controller: this.context.viewport,
                region: LayoutRegion.Main,
                view: this.spec.viewport.view,
                isStatic: true
            });    
            
            this.context.createLayout(targets, this.target);        
        }

        constructor(private spec: Specification, private target: HTMLElement) {                        
            this.init();
            ReactDOM.render(React.createElement(this.spec.layoutView, { controller: this.context.layout }), target);                        
            Bootstrap.Command.Entity.SetCurrent.dispatch(this.context, this.context.tree.root);            
        }
    }
}