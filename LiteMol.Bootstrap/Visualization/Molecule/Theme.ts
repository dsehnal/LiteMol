/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Visualization.Molecule {
    "use strict";

    import Vis = LiteMol.Visualization;
    import MolVis = LiteMol.Visualization.Molecule;  

    export const UniformBaseColors = Immutable.Map({ 
        'Uniform': Vis.Theme.Default.UniformColor, 
        'Highlight': Vis.Theme.Default.HighlightColor,
        'Selection': Vis.Theme.Default.SelectionColor,
    });
    export const ModelVisualBaseColors = Immutable.Map({ 
        'Bond': Vis.Molecule.Colors.DefaultBondColor,
        'Highlight': Vis.Theme.Default.HighlightColor,
        'Selection': Vis.Theme.Default.SelectionColor,
    });        
    
    function mappingClosure(index: number[], property: any[]) {
        return function(i: number) { return property[index[i]] };   
    }
    
    export function createPaletteThemeProvider(provider: (m: Core.Structure.MoleculeModel) => { index: number[], property: any[] }, pallete: LiteMol.Visualization.Color[]) {
        return function (e: Entity.Molecule.Model, props?: LiteMol.Visualization.Theme.Props) {
            let model = Utils.Molecule.findModel(e).props.model;
            let map = provider(model);
            let mapping = Vis.Theme.createPalleteMapping(mappingClosure(map.index, map.property), pallete);
            return Vis.Theme.createMapping(mapping, props);   
        }
    }
    
    export function uniformThemeProvider(e: Entity.Molecule.Model, props?: LiteMol.Visualization.Theme.Props) {
        if (props.colors) {
            props.colors.set('Bond', props.colors.get('Uniform'));
        }
        return Vis.Theme.createUniform(props);   
    }
    
    export function createColorMapThemeProvider(
        provider: (m: Core.Structure.MoleculeModel) => { index: number[], property: any[] }, colorMap: Map<string, LiteMol.Visualization.Color>, fallbackColor: LiteMol.Visualization.Color) {
        return function (e: Entity.Molecule.Model, props?: LiteMol.Visualization.Theme.Props) {            
            let model = Utils.Molecule.findModel(e).props.model;
            let map = provider(model);
            let mapping = Vis.Theme.createColorMapMapping(mappingClosure(map.index, map.property), colorMap, fallbackColor);
            return Vis.Theme.createMapping(mapping, props);   
        }
    }
        
    export namespace Default {        
        export const Themes: Theme.Template[] = [
            {
                name: 'Chain ID',
                description: 'Color the surface by Chain ID.',
                colors: ModelVisualBaseColors,
                provider: createPaletteThemeProvider(m => ({ index: m.atoms.residueIndex, property: m.residues.asymId }), Vis.Molecule.Colors.DefaultPallete)
            }, {
                name: 'Entity ID',
                description: 'Color the surface by Entity ID.',
                colors: ModelVisualBaseColors,
                provider: createPaletteThemeProvider(m => ({ index: m.atoms.residueIndex, property: m.residues.entityId }), Vis.Molecule.Colors.DefaultPallete)
            }, {
                name: 'Entity Type',
                description: 'Color the surface by Entity Type.',
                colors: ModelVisualBaseColors,
                provider: createPaletteThemeProvider(m => ({ index: m.atoms.entityIndex, property: m.entities.entityType }), Vis.Molecule.Colors.DefaultPallete)
            }, {
                name: 'Residue Name',
                description: 'Color the surface by residue name.',
                colors: ModelVisualBaseColors,
                provider: createPaletteThemeProvider(m => ({ index: m.atoms.residueIndex, property: m.residues.name }), Vis.Molecule.Colors.DefaultPallete)
            }, {
                name: 'Element Symbol',
                description: 'Color the surface by atom elemnt symbol.',
                colors: ModelVisualBaseColors,
                provider: createColorMapThemeProvider(m => ({ index: m.atoms.indices, property: m.atoms.elementSymbol }), Vis.Molecule.Colors.DefaultElementColorMap, Vis.Molecule.Colors.DefaultElementColor)
            }, {
                name: 'Uniform Color',
                description: 'Same color everywhere.',
                colors: UniformBaseColors,
                provider: uniformThemeProvider
            }
        ]; 
        
        export const CartoonThemeTemplate = Themes[0];
        export const ElementSymbolThemeTemplate = Themes[4];
        export const SurfaceThemeTemplate = Themes[5];
        export const UniformThemeTemplate = Themes[5];
    }
}