/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Visualization.Labels {
    "use strict";

    export type Style<P> = Visualization.Style<'Labels', P>
    
    export namespace Style {
        export function moleculeHasOnlyThemeChanged(oldS: Style<Utils.Molecule.Labels3DOptions>, newS: Style<Utils.Molecule.Labels3DOptions>) {
            return Utils.deepEqual(oldS.params, newS.params);
        }

        export function createMoleculeStyle(params: {
                kind: Utils.Molecule.Labels3DOptions['kind'], 
                labelsOptions?: LiteMol.Visualization.Labels.LabelsOptions,
                theme?: Theme.Instance
            }): Style<Utils.Molecule.Labels3DOptions>  {
            return {
                type: 'Labels', 
                params: {
                    kind: params.kind, 
                    labelsOptions: params.labelsOptions ? params.labelsOptions : Default.MoleculeLabels.params.labelsOptions 
                },
                theme: params.theme ? params.theme : Default.MoleculeLabels.theme,
            }
        }
    }

    export namespace Default {
        import Vis = LiteMol.Visualization;
        const uniformColors = Immutable.Map({ 
            'Uniform': Vis.Color.fromHexString('#eaeaea'), 
            'Background': Vis.Color.fromHexString('#777777'),
            'Outline': Vis.Color.fromHexString('#333333') 
        });
        const uniformVariables = Immutable.Map({ 
            'xOffset': 0.0,
            'yOffset': 0.0,
            'zOffset': 0.6,
            'sizeFactor': 1.5,
            'backgroundOpacity': 0.0,
            'outlineWidth': 0.1 
        });        
        function uniformThemeProvider(e: Entity.Any, props?: LiteMol.Visualization.Theme.Props) {
            return Vis.Theme.createUniform(props);   
        }        
        const Themes: Theme.Template[] = [ {
                name: 'Uniform Color',
                description: 'Same color everywhere.',
                colors: uniformColors,
                variables: uniformVariables,
                provider: uniformThemeProvider
            }
        ];         
        const Transparency: LiteMol.Visualization.Theme.Transparency = { alpha: 1.0, writeDepth: false };        
        
        export const Theme = Themes[0];
        export const MoleculeLabels: Style<Utils.Molecule.Labels3DOptions> = { 
            type: 'Labels', 
            params: {
                kind: 'Residue-Full-Id', 
                labelsOptions: Vis.Labels.DefaultLabelsOptions
            },
            theme: { 
                template: Theme, 
                colors: Theme.colors, 
                variables: Theme.variables,
                transparency: Transparency, interactive: false, disableFog: false 
            } 
        }

        export const GenericLabels: Style<Vis.Labels.LabelsOptions> = { 
            type: 'Labels', 
            params: Vis.Labels.DefaultLabelsOptions,
            theme: { 
                template: Theme, 
                colors: Theme.colors, 
                variables: Theme.variables,
                transparency: Transparency, interactive: false, disableFog: false 
            } 
        }         
    }    
}