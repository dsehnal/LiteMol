/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Visualization.Molecule {
    "use strict";

    import Vis = LiteMol.Visualization;
    
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
        return function (e: Entity.Any, props?: LiteMol.Visualization.Theme.Props) {
            let model = Utils.Molecule.findModel(e)!.props.model;
            let map = provider(model);
            let mapping = Vis.Theme.createPalleteMapping(mappingClosure(map.index, map.property), pallete);
            return Vis.Theme.createMapping(mapping, props);   
        }
    }
    
    export function uniformThemeProvider(e: Entity.Any, props?: LiteMol.Visualization.Theme.Props) {
        if (props && props.colors) {
            props.colors.set('Bond', props.colors.get('Uniform'));
        }
        return Vis.Theme.createUniform(props);   
    }
    
    export function createColorMapThemeProvider(
        provider: (m: Core.Structure.MoleculeModel) => { index: number[], property: any[] }, colorMap: Map<string, LiteMol.Visualization.Color>, fallbackColor: LiteMol.Visualization.Color) {
        return function (e: Entity.Any, props?: LiteMol.Visualization.Theme.Props) {            
            let model = Utils.Molecule.findModel(e)!.props.model;
            let map = provider(model);
            let mapping = Vis.Theme.createColorMapMapping(mappingClosure(map.index, map.property), colorMap, fallbackColor);
            return Vis.Theme.createMapping(mapping, props);   
        }
    }

    class RainbowMapping implements Vis.Theme.ElementMapping {
        private residueIndex: number[];
        private r: Float32Array;
        private g: Float32Array;
        private b: Float32Array;

        getProperty(index: number) { return this.residueIndex[index]; }

        setColor(i: number, color: Vis.Color) {
            color.r = this.r[i];
            color.g = this.g[i];
            color.b = this.b[i];
        }

        constructor(model: Core.Structure.MoleculeModel, { r, g, b }: { r: Float32Array, g: Float32Array, b: Float32Array }) {
            this.residueIndex = model.atoms.residueIndex;
            this.r = r;
            this.g = g;
            this.b = b;
        }
    }

    const rainbowPalette = [
        Vis.Color.fromHex(0xCC2200),
        Vis.Color.fromHex(0xCC7700),
        Vis.Color.fromHex(0xCCAA00),
        Vis.Color.fromHex(0x00CC00),
        Vis.Color.fromHex(0x00AACC),
        Vis.Color.fromHex(0x0000CC),
        Vis.Color.fromHex(0x892AD2),
        Vis.Color.fromHex(0xB77CE3)
    ]

    const RainbowBaseColors = Immutable.Map({ 
        'Bond': Vis.Molecule.Colors.DefaultBondColor,
        'Highlight': Vis.Color.fromHex(0xFFFFFF),
        'Selection': Vis.Color.fromHex(0x968000),
    });  

    function makeRainbow(model: Core.Structure.MoleculeModel, groups: (m: Core.Structure.MoleculeModel) => Core.Structure.DefaultChainTableSchema | Core.Structure.DefaultEntityTableSchema) {
        let rC = model.residues.count;
        let { r, g, b } = { r: new Float32Array(rC), g: new Float32Array(rC), b: new Float32Array(rC) };
        let { count, residueStartIndex, residueEndIndex } = groups(model);
        let cC = rainbowPalette.length - 1;
        let color = Vis.Color.fromHex(0);

        for (let cI = 0; cI < count; cI++) {
            let s = residueStartIndex[cI], e = residueEndIndex[cI], l = e - s, max = l - 1;
            if (max <= 1) max = 1;
            for (let i = 0; i < l; i++) {                
                let t = cC * i / max;
                let low = Math.floor(t), high = Math.ceil(t);
                Vis.Color.interpolate(rainbowPalette[low], rainbowPalette[high], t - low, color);
                r[s + i] = color.r;
                g[s + i] = color.g;
                b[s + i] = color.b;
            }
        }
        return { r, g, b };
    }

    function createRainbowProvider(groups: (m: Core.Structure.MoleculeModel) => Core.Structure.DefaultChainTableSchema | Core.Structure.DefaultEntityTableSchema) {
        return function (e: Entity.Any, props?: LiteMol.Visualization.Theme.Props) {     
            let model = Utils.Molecule.findModel(e)!.props.model;
            let colors = makeRainbow(model, groups);
            let mapping = new RainbowMapping(model, colors);
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
                name: 'Rainbow (Chain)',
                description: 'Color each chain using rainbow palette.',
                colors: RainbowBaseColors,
                provider: createRainbowProvider(m => m.chains)
            }, {
                name: 'Rainbow (Entity)',
                description: 'Color each entity using rainbow palette.',
                colors: RainbowBaseColors,
                provider: createRainbowProvider(m => m.entities)
            }, {
                name: 'Uniform Color',
                description: 'Same color everywhere.',
                colors: UniformBaseColors,
                provider: uniformThemeProvider
            }
        ]; 
        
        export const CartoonThemeTemplate = Themes.filter(t => t.name === 'Chain ID')[0];
        export const ElementSymbolThemeTemplate = Themes.filter(t => t.name === 'Element Symbol')[0];
        export const SurfaceThemeTemplate = Themes.filter(t => t.name === 'Uniform Color')[0];
        export const UniformThemeTemplate = Themes.filter(t => t.name === 'Uniform Color')[0];
    }
}