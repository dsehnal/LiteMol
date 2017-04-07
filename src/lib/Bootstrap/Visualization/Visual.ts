/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Visualization {
    "use strict";

    export interface TypeDescription {
        label: string,
        shortLabel: string,
        description?: string
    }
    
    export interface Style<Type, Params> {
        taskType?: Task.Type,
        isNotSelectable?: boolean
        type: Type,
        theme: Theme.Instance
        params: Params
    }
        
    import TransparencyDescription = LiteMol.Visualization.Theme.Transparency;
    
    export namespace Style {        
        export interface Props<T> {
            taskType?: Task.Type,
            type: T,
            theme: Theme.Instance
        }

        export function getTaskType(style: Any): Task.Type {
            return !style.taskType ? 'Normal' : style.taskType;
        }

        
        export type Any = Style<any, any>
        
        export function create<Type>(style: Style<Type, any>) {
            return style;
        }
    }    
    
    export namespace Theme {
        
        export interface Template {
            name: string,
            description?: string,            
            colors?: Immutable.Map<string, LiteMol.Visualization.Color>,
            provider: (e: Entity.Any, props?: LiteMol.Visualization.Theme.Props) => LiteMol.Visualization.Theme            
        }
        
        export interface Instance {
            template: Template,
            colors?: Immutable.Map<string, LiteMol.Visualization.Color>,
            transparency?: TransparencyDescription,
            interactive?: boolean,
            disableFog?: boolean
        }
        
        export interface Props {
            colors?: { [name:string]: LiteMol.Visualization.Color },
            transparency?: TransparencyDescription,
            interactive?: boolean
        }
        
        export function mergeProps(theme: Instance, props: Props) {
            let colors = theme.colors || Immutable.Map<string, LiteMol.Visualization.Color>();
            if (props.colors) {
                for (let c of Object.keys(props.colors)) {
                    colors.set(c, props.colors[c]);
                }
            }
            let ret = Utils.shallowClone(theme);
            ret.colors = colors;
            if (props.transparency) ret.transparency = props.transparency;
            if (props.interactive !== void 0) ret.interactive = props.interactive;
            return ret;
        }
        
        export function getProps(theme: Instance): LiteMol.Visualization.Theme.Props {
            let colors = Core.Utils.FastMap.create<string, LiteMol.Visualization.Color>();
            if (theme.colors) theme.colors.forEach((c,n) => colors.set(n!, c!));
            return {
                colors,
                transparency: theme.transparency,
                interactive: theme.interactive,
                disableFog: theme.disableFog,
                isSticky: true
            };
        }
    }
        
}    