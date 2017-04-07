/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMolPluginInstance.CustomTheme {

    import Core = LiteMol.Core
    import Visualization = LiteMol.Visualization
    import Bootstrap = LiteMol.Bootstrap
    import Q = Core.Structure.Query

    // r, g, b: numbers from 0 - 255
    // we use custom represetation here because the "internal" Visualization.Color uses
    // normalized values for r, g, b components.
    export type Color = { r: number, g: number, b: number }

    export interface SequenceEntry {
        entity_id: string,
        struct_asym_id: string, 
        start_residue_number: number, 
        end_residue_number: number,
        color: Color
    }

    export type ColorDefinition = { entries: SequenceEntry[], base: Color }

    class ColorMapper {
        private uniqueColors: Visualization.Color[] = [];
        private map = Core.Utils.FastMap.create<string, number>();

        get colorMap() {
            const map = Core.Utils.FastMap.create<number, Visualization.Color>();
            this.uniqueColors.forEach((c, i) => map.set(i, c));
            return map;
        }

        addColor(color: Color) {
            const id = `${color.r}-${color.g}-${color.b}`;
            if (this.map.has(id)) return this.map.get(id)!;
            const index = this.uniqueColors.length;
            this.uniqueColors.push(Visualization.Color.fromRgb(color.r, color.g, color.b));
            this.map.set(id, index);
            return index;
        }
    }

    export function createTheme(model: LiteMol.Core.Structure.Molecule.Model, colorDef: ColorDefinition) {
        const mapper = new ColorMapper();
        mapper.addColor(colorDef.base);
        const map = new Uint8Array(model.data.atoms.count);
        
        for (const e of colorDef.entries) {
            const query = Q.sequence(e.entity_id.toString(), e.struct_asym_id, { seqNumber: e.start_residue_number }, { seqNumber: e.end_residue_number }).compile();
            const colorIndex = mapper.addColor(e.color);
            for (const f of query(model.queryContext).fragments) {
                for (const a of f.atomIndices) {
                    map[a] = colorIndex;
                }
            }
        }

        const fallbackColor = <LiteMol.Visualization.Color>{ r: 0.6, g: 0.6, b: 0.6 };
        const selectionColor = <LiteMol.Visualization.Color>{ r: 0, g: 0, b: 1 };
        const highlightColor = <LiteMol.Visualization.Color>{ r: 1, g: 0, b: 1 };

        const colors = Core.Utils.FastMap.create<string, LiteMol.Visualization.Color>();
        colors.set('Uniform', fallbackColor)
        colors.set('Selection', selectionColor)
        colors.set('Highlight', highlightColor);   

        const mapping = Visualization.Theme.createColorMapMapping(i => map[i], mapper.colorMap, fallbackColor);
        // make the theme "sticky" so that it persist "ResetScene" command.
        return Visualization.Theme.createMapping(mapping, { colors, isSticky: true });
    }

    export function applyTheme(plugin: LiteMol.Plugin.Controller, modelRef: string, theme: Visualization.Theme) {
        const visuals = plugin.selectEntities(Bootstrap.Tree.Selection.byRef(modelRef).subtree().ofType(Bootstrap.Entity.Molecule.Visual));
        for (const v of visuals) {
            plugin.command(Bootstrap.Command.Visual.UpdateBasicTheme, { visual: v as any, theme });
        }
    }
}