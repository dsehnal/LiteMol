/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
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
    
    export function createPaletteThemeProvider(provider: (m: Core.Structure.Molecule.Model) => { index: number[], property: any[] }, pallete: LiteMol.Visualization.Color[]) {
        return function (e: Entity.Any, props?: LiteMol.Visualization.Theme.Props) {
            const model = Utils.Molecule.findModel(e)!.props.model;
            const map = provider(model);
            const mapping = Vis.Theme.createPalleteMapping(mappingClosure(map.index, map.property), pallete);
            return Vis.Theme.createMapping(mapping, props);   
        }
    }

    export function createCachedPaletteThemeProvider(name: string, provider: (m: Core.Structure.Molecule.Model) => { index: number[], property: any[] }, pallete: LiteMol.Visualization.Color[]) {
        return function (e: Entity.Any, props?: LiteMol.Visualization.Theme.Props) {
            const modelE = Utils.Molecule.findModel(e)!;

            const ctx = modelE.tree && modelE.tree.context;
            if (ctx) {
                const mapping = ctx.entityCache.get<Vis.Theme.ElementMapping>(modelE, 'theme-mapping-' + name);
                if (mapping) {
                    return Vis.Theme.createMapping(mapping, props);
                }
            }

            const model = modelE.props.model;
            const map = provider(model);
            const mapping = Vis.Theme.createPalleteMapping(mappingClosure(map.index, map.property), pallete);
            if (ctx) ctx.entityCache.set(e, 'theme-mapping-' + name, mapping);
            return Vis.Theme.createMapping(mapping, props);   
        }
    }
    
    export function uniformThemeProvider(e: Entity.Any, props?: LiteMol.Visualization.Theme.Props) {
        if (props && props.colors) {
            if (!props.colors.get('Bond') && props.colors.get('Uniform')) {
                const oldColors = props.colors;
                props = Utils.assign({}, props);
                const newColors = Core.Utils.FastMap.create<any, LiteMol.Visualization.Color>();
                props.colors = newColors;
                oldColors.forEach((color, key) => newColors.set(key, color));
                newColors.set('Bond', props.colors.get('Uniform')!);
            }
        }
        return Vis.Theme.createUniform(props);   
    }
    
    export function createColorMapThemeProvider(
        provider: (m: Core.Structure.Molecule.Model) => { index: number[], property: any[] }, colorMap: LiteMol.Visualization.Theme.ColorMap, fallbackColor: LiteMol.Visualization.Color) {
        return function (e: Entity.Any, props?: LiteMol.Visualization.Theme.Props) {            
            const modelE = Utils.Molecule.findModel(e)!;
            const model = modelE.props.model;
            const map = provider(model);
            const mapping = Vis.Theme.createColorMapMapping(mappingClosure(map.index, map.property), colorMap, fallbackColor);
            return Vis.Theme.createMapping(mapping, props);   
        }
    }

    export function createCachedColorMapThemeProvider(
        name: string,
        provider: (m: Core.Structure.Molecule.Model) => { index: number[], property: any[] }, colorMap: LiteMol.Visualization.Theme.ColorMap, fallbackColor: LiteMol.Visualization.Color) {
        return function (e: Entity.Any, props?: LiteMol.Visualization.Theme.Props) {            
            const modelE = Utils.Molecule.findModel(e)!;

            const ctx = modelE.tree && modelE.tree.context;
            if (ctx) {
                const mapping = ctx.entityCache.get<Vis.Theme.ElementMapping>(modelE, 'theme-mapping-map-' + name);
                if (mapping) {
                    return Vis.Theme.createMapping(mapping, props);
                }
            }

            const model = modelE.props.model;
            const map = provider(model);
            const mapping = Vis.Theme.createColorMapMapping(mappingClosure(map.index, map.property), colorMap, fallbackColor);
            if (ctx) ctx.entityCache.set(e, 'theme-mapping-map-' + name, mapping);
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

        constructor(model: Core.Structure.Molecule.Model, { r, g, b }: { r: Float32Array, g: Float32Array, b: Float32Array }) {
            this.residueIndex = model.data.atoms.residueIndex;
            this.r = r;
            this.g = g;
            this.b = b;
        }
    }

    export const RainbowPalette = [
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

    function makeRainbow(
        model: Core.Structure.Molecule.Model, 
        groupsSource: (m: Core.Structure.Molecule.Model) => Core.Structure.ChainTable | Core.Structure.EntityTable,
        groupId: (t: Core.Structure.ChainTable | Core.Structure.EntityTable, i: number) => string) {
            
        const rC = model.data.residues.count;
        const { r, g, b } = { r: new Float32Array(rC), g: new Float32Array(rC), b: new Float32Array(rC) };
        const groups = groupsSource(model);
        const { count, residueStartIndex, residueEndIndex } = groups;
        const cC = RainbowPalette.length - 1;
        const color = Vis.Color.fromHex(0);
        const strips = Core.Utils.FastMap.create<string, { count: number, index: number }>();

        for (let cI = 0; cI < count; cI++) {
            const id = groupId(groups, cI);
            const l = residueEndIndex[cI] - residueStartIndex[cI];
            if (strips.has(id)) {
                strips.get(id)!.count += l;
            } else {
                strips.set(id, { index: 0, count: l });
            }
        }

        strips.forEach(s => s.count = Math.max(s.count - 1, 1));

        for (let cI = 0; cI < count; cI++) {
            const s = residueStartIndex[cI], l = residueEndIndex[cI] - s;
            const strip = strips.get(groupId(groups, cI))!;
            const max = strip.count;

            for (let i = 0; i < l; i++) {                
                const t = cC * strip.index / max;
                const low = Math.floor(t), high = Math.ceil(t);
                Vis.Color.interpolate(RainbowPalette[low], RainbowPalette[high], t - low, color);
                r[s + i] = color.r;
                g[s + i] = color.g;
                b[s + i] = color.b;
                strip.index++;
            }
        }
        return { r, g, b };
    }

    function createRainbowProvider(
        groups: (m: Core.Structure.Molecule.Model) => Core.Structure.ChainTable | Core.Structure.EntityTable, 
        groupId: (t: Core.Structure.ChainTable | Core.Structure.EntityTable, i: number) => string) {
        return function (e: Entity.Any, props?: LiteMol.Visualization.Theme.Props) {     
            const model = Utils.Molecule.findModel(e)!.props.model;
            const colors = makeRainbow(model, groups, groupId);
            const mapping = new RainbowMapping(model, colors);
            return Vis.Theme.createMapping(mapping, props);   
        }
    }
        
    export namespace Default {        
        export const Themes: Theme.Template[] = [
            {
                name: 'Chain ID',
                description: 'Color the surface by Chain ID.',
                colors: ModelVisualBaseColors,
                provider: createCachedPaletteThemeProvider('chain-id', m => ({ index: m.data.atoms.residueIndex, property: m.data.residues.asymId }), Vis.Molecule.Colors.DefaultPallete)
            }, {
                name: 'Entity ID',
                description: 'Color the surface by Entity ID.',
                colors: ModelVisualBaseColors,
                provider: createPaletteThemeProvider(m => ({ index: m.data.atoms.residueIndex, property: m.data.residues.entityId }), Vis.Molecule.Colors.DefaultPallete)
            }, {
                name: 'Entity Type',
                description: 'Color the surface by Entity Type.',
                colors: ModelVisualBaseColors,
                provider: createPaletteThemeProvider(m => ({ index: m.data.atoms.entityIndex, property: m.data.entities.type }), Vis.Molecule.Colors.DefaultPallete)
            }, {
                name: 'Residue Name',
                description: 'Color the surface by residue name.',
                colors: ModelVisualBaseColors,
                provider: createPaletteThemeProvider(m => ({ index: m.data.atoms.residueIndex, property: m.data.residues.name }), Vis.Molecule.Colors.DefaultPallete)
            }, {
                name: 'Element Symbol',
                description: 'Color the surface by atom elemnt symbol.',
                colors: ModelVisualBaseColors,
                provider: createColorMapThemeProvider(m => ({ index: m.data.atoms.indices, property: m.data.atoms.elementSymbol }), Vis.Molecule.Colors.DefaultElementColorMap, Vis.Molecule.Colors.DefaultElementColor)
            }, {
                name: 'Rainbow (Chain)',
                description: 'Color each chain using rainbow palette.',
                colors: RainbowBaseColors,
                provider: createRainbowProvider(m => m.data.chains, (t, i) => `${(t as Core.Structure.ChainTable).asymId[i]} ${(t as Core.Structure.ChainTable).entityId[i]}` )
            }, {
                name: 'Rainbow (Entity)',
                description: 'Color each entity using rainbow palette.',
                colors: RainbowBaseColors,
                provider: createRainbowProvider(m => m.data.entities, (t, i) => (t as Core.Structure.EntityTable).entityId[i])
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
        export const RainbowEntityThemeTemplate = Themes.filter(t => t.name === 'Rainbow (Entity)')[0];
    }
}