/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Visualization.Density {
    "use strict";

    export enum IsoValueType {
        Sigma,
        Absolute
    }

    export interface Params {
        bottomLeft?: number[],
        topRight?: number[],
        isoValueType: IsoValueType, 
        isoValue: number,
        smoothing: number,
        isWireframe: boolean
    }
    
    export function areNonIsoParamsSame(a: Params, b: Params) {
        return a.bottomLeft === b.bottomLeft && b.topRight === b.topRight 
            && a.smoothing === b.smoothing && a.isWireframe === b.isWireframe;
    }

    export type Style = Visualization.Style<'Density', Params>
    
    export namespace Style {    
        export function create(params: { 
            isoValue: number,
            isoValueType: IsoValueType, 
            color: LiteMol.Visualization.Color, 
            isWireframe?: boolean, 
            disableFog?: boolean,
            transparency?: LiteMol.Visualization.Theme.Transparency,
            taskType?: Task.Type
        }): Style  {
            let colors = Default.Theme.colors!.set('Uniform', params.color);
            return <Style>{ 
                type: 'Density',
                taskType: params.taskType,
                params: { isoValue: params.isoValue, isoValueType: params.isoValueType, smoothing: 1, isWireframe: !!params.isWireframe }, 
                theme: { template: Default.Theme, colors, transparency: params.transparency ? params.transparency : Default.Transparency, interactive: false, disableFog: !!params.disableFog }
            }; 
        }
    }
    
    export namespace Default {      
        
        export const Params: Params = {
            isoValue: 0,
            isoValueType: IsoValueType.Sigma,
            smoothing: 1,
            isWireframe: false
        }; 
        import Vis = LiteMol.Visualization;
        const uniformBaseColor = Immutable.Map({ 
            'Uniform': Vis.Theme.Default.UniformColor, 
            'Highlight': Vis.Theme.Default.HighlightColor,
            'Selection': Vis.Theme.Default.SelectionColor,
        });        
        function uniformThemeProvider(e: Entity.Molecule.Model, props?: LiteMol.Visualization.Theme.Props) {
            return Vis.Theme.createUniform(props);   
        }        
        export const Themes: Theme.Template[] = [ {
                name: 'Uniform Color',
                description: 'Same color everywhere.',
                colors: uniformBaseColor,
                provider: uniformThemeProvider
            }
        ];         
        export const Transparency: LiteMol.Visualization.Theme.Transparency = { alpha: 1.0, writeDepth: false };        
        export const Theme = Themes[0];
        export const Style: Style = { type: 'Density', params: Params, theme: { template: Theme, colors: Theme.colors, transparency: Transparency, interactive: false, disableFog: false } }         
    }    
}