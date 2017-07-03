/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.ComplexReprensetation.Carbohydrates {

    import Interactivity = Bootstrap.Interactivity;

    export function formatResidueName(model: Core.Structure.Molecule.Model, r: number) {
        const { authName, authAsymId, authSeqNumber, insCode } = model.data.residues;
        return `${authName[r]} ${authAsymId[r]} ${authSeqNumber[r]}${insCode[r] !== null ? ' i: ' + insCode[r] : ''}`;
    }

    export function HighlightCustomElementsBehaviour(context: Bootstrap.Context) {        
        context.highlight.addProvider(info => {
            if  (Interactivity.isEmpty(info) || info.source.type !== Bootstrap.Entity.Visual.Surface) {
                return void 0;
            }
            
            const tag = (info.source as Bootstrap.Entity.Visual.Surface).props.tag as Tags;
            if (!tag || tag.type !== 'CarbohydrateRepresentation') return void 0;
            
            const t = tag.tags.get(info.elements[0]);
            if (!t) return void 0;
            
            switch (t.type) {
                //case 'Link': return `Link: <b>${t.link.type}</b> (${Math.round(100 * t.link.distance) / 100} Å)`;
                case 'Residue': {
                    const r = t.residueIndex;
                    return `<b>${t.instanceName}</b> (<span>${formatResidueName(t.model, r)}</span>)`;
                }
                case 'Terminal': {
                    const r = t.residueIndex;
                    return `<span>${formatResidueName(t.model, r)}</span>`;
                }
                default: return void 0;
            }
        });        
    }
}