/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.PrimitivesAndLabels {

    import Interactivity = Bootstrap.Interactivity;

    export function HighlightCustomElements(context: Bootstrap.Context) {        
        context.highlight.addProvider(info => {
            if  (Interactivity.isEmpty(info) || info.source.type !== Bootstrap.Entity.Visual.Surface) return void 0;
            
            const tag = (info.source as Bootstrap.Entity.Visual.Surface).props.tag as SurfaceTag;
            if (tag.type !== 'BindingMap') return void 0;
            
            const t = tag.tags.get(info.elements[0]);
            if (!t) return void 0;

            const { name: residueName } = t.model.data.residues;
            switch (t.kind) {
                case 'Center': return `<b>Center</b> of <b>${residueName[t.residueIndex]}</b>`;
                case 'Connector': return `<b>Connetor</b> between <b>${residueName[t.aResidueIndex]}</b> and <b>${residueName[t.bResidueIndex]}</b>`;
                default: return void 0;
            }
        });        
    }
}