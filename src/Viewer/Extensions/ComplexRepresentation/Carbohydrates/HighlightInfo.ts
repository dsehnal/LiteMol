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
            if (!Interactivity.Molecule.isMoleculeModelInteractivity(info)) return void 0;       
            const data = Interactivity.Molecule.transformInteraction(info);
            if (!data || data.residues.length !== 1) return void 0;

            const repr = Mapping.getResidueRepresentation(data.residues[0].name);
            if (!repr) return void 0;
            return `Carb: <b>${repr.instanceName}</b>`;
        });        
    }
}