/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Visualization.Density {
    "use strict";

    export interface Params {
        bottomLeft?: number[],
        topRight?: number[],
        isoSigma?: number,
        smoothing?: number,
        isWireframe?: boolean
    }
    
    export type Style = Visualization.Style<{}, Params>
    
    export namespace Style {    
        export function create(params: { 
            isoSigma: number, 
            color: LiteMol.Visualization.Color, 
            isWireframe?: boolean, 
            transparency?: LiteMol.Visualization.Theme.Transparency}): Style  {
            let colors = Default.Theme.colors!.set('Uniform', params.color);
            return { 
                type: {}, 
                params: { isoSigma: params.isoSigma, smoothing: 1, isWireframe: !!params.isWireframe }, 
                theme: { template: Default.Theme, colors, transparency: params.transparency ? params.transparency : Default.Transparency, interactive: false }
            }; 
        }
    }
    
    export namespace Default {      
        
        export const Params: Params = {
            isoSigma: 0,
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
        export const Style: Style = { type: {}, params: Params, theme: { template: Theme, colors: Theme.colors, transparency: Transparency, interactive: false } } 
        
    }
    
}