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
            variables?: Immutable.Map<string, any>,
            provider: (e: Entity.Any, props?: LiteMol.Visualization.Theme.Props) => LiteMol.Visualization.Theme            
        }
        
        export interface Instance {
            template: Template,
            colors?: Immutable.Map<string, LiteMol.Visualization.Color>,
            variables?: Immutable.Map<string, any>,
            transparency?: TransparencyDescription,
            interactive?: boolean,
            disableFog?: boolean
        }
        
        export function getProps(theme: Instance): LiteMol.Visualization.Theme.Props {
            const colors = Core.Utils.FastMap.create<string, LiteMol.Visualization.Color>();
            if (theme.colors) theme.colors.forEach((c,n) => colors.set(n!, c!));
            const variables = Core.Utils.FastMap.create<string, any>();
            if (theme.variables) theme.variables.forEach((c,n) => variables.set(n!, c!));
            return {
                colors,
                variables,
                transparency: theme.transparency,
                interactive: theme.interactive,
                disableFog: theme.disableFog,
                isSticky: true
            };
        }
    }
        
}    