/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Visualization.Molecule {
    "use strict";

    export type Source = Entity.Molecule.Model | Entity.Molecule.Selection;

    export type DetailType = 'Automatic' | 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
    
    export type Style<Params> = Visualization.Style<Type, Params>
            
    export const TypeDescriptions = {
        'Cartoons': { label: 'Cartoon', shortLabel: 'Cartoon' } as TypeDescription,
        'Calpha': { label: 'C-\u03B1 Trace', shortLabel: 'C-\u03B1' } as TypeDescription,
        'BallsAndSticks': { label: 'Balls and Sticks', shortLabel: `B'n'S` } as TypeDescription,
        'VDWBalls': { label: 'VDW Balls', shortLabel: 'VDW' } as TypeDescription,
        'Surface': { label: 'Surface', shortLabel: 'Surface' } as TypeDescription
    };
    export type Type = keyof (typeof TypeDescriptions);
    
    export const Types: Type[] = [ 'Cartoons', 'Calpha', 'BallsAndSticks', 'VDWBalls', 'Surface' ];
    export const DetailTypes: DetailType[] = [ 'Automatic', 'Very Low', 'Low', 'Medium', 'High', 'Very High' ];
    
    export interface DetailParams {
        detail: DetailType
    }

    export interface CartoonParams extends DetailParams {
        showDirectionCone: boolean
    }
        
    export interface BallsAndSticksParams extends DetailParams {
        useVDW: boolean,
        vdwScaling?: number,
        atomRadius?: number,
        bondRadius: number,
        hideHydrogens?: boolean,
        customMaxBondLengths?: { [e: string]: number }
    }
    
    export interface SurfaceParams {
        probeRadius: number,
        automaticDensity?: boolean,
        density: number,
        smoothing: number,
        isWireframe: boolean
    }
    
    export namespace Default {        
        export const DetailParams:DetailParams = { detail: 'Automatic' }

        export const CartoonParams: CartoonParams = {
            showDirectionCone: false,
            detail: 'Automatic'
        };
        
        export const BallsAndSticksParams: BallsAndSticksParams = {
            useVDW: true,
            vdwScaling: 0.22,
            atomRadius: 0.35,
            bondRadius: 0.09,
            hideHydrogens: false,
            customMaxBondLengths: void 0,
            detail: 'Automatic'
        };
        
        export const SurfaceParams: SurfaceParams = {
            probeRadius: 0.4,
            automaticDensity: true,
            density: 1.1,
            smoothing: 10,
            isWireframe: false
        }
        
        export const Transparency: LiteMol.Visualization.Theme.Transparency = { alpha: 1.0, writeDepth: false };
                    
        export const ForType: Map<Type, Style<any>> = (function() {    
            let types = {
                'Cartoons': { type: 'Cartoons', params: CartoonParams, theme: { template: CartoonThemeTemplate, colors: CartoonThemeTemplate.colors, transparency: Transparency, interactive: true } },
                'Calpha': { type: 'Calpha', params: { detail: 'Automatic' }, theme: { template: CartoonThemeTemplate, colors: CartoonThemeTemplate.colors, transparency: Transparency, interactive: true } },
                'BallsAndSticks': { type: 'BallsAndSticks', params: BallsAndSticksParams, theme: { template: ElementSymbolThemeTemplate, colors: ElementSymbolThemeTemplate.colors, transparency: Transparency, interactive: true } },
                'VDWBalls': { type: 'VDWBalls', params: { detail: 'Automatic' }, theme: { template: ElementSymbolThemeTemplate, colors: ElementSymbolThemeTemplate.colors, transparency: Transparency, interactive: true } },
                'Surface': { type: 'Surface', params: SurfaceParams, theme: { template: SurfaceThemeTemplate, colors: SurfaceThemeTemplate.colors, transparency: { alpha: 0.33, writeDepth: false }, interactive: true } }  
            };
            let map = new Map<Type, Style<any>>();
            for (let k of Object.keys(types)) {
                map.set(<Type>k, (types as any)[k]);
            }
            return map;
        })();    
    }
}