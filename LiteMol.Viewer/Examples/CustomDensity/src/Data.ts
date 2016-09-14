/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Custom {

    import Bootstrap = LiteMol.Bootstrap;
    import Entity = Bootstrap.Entity;        
    import Transformer = Bootstrap.Entity.Transformer; 

    export const DownloadAndCreate = Bootstrap.Tree.Transformer.action<Entity.Root, Entity.Action, { id?: string }>({
        id: 'litemol-custom_density_example-download-and-create',
        name: 'Data',
        description: 'Download molecule and 2Fo-Fc density.',
        from: [Entity.Root],
        to: [Entity.Action],
        defaultParams: () => ({ id: '1cbs' }),
        validateParams: (p) => p.id && p.id.trim().length > 0 ? void 0 : ['Enter Id.']
    }, (context, a, t) => {        
        let id = t.params.id.trim().toLowerCase();

        // Clear the previous data.
        Bootstrap.Command.Tree.RemoveNode.dispatch(context, context.tree.root);

        let action = Bootstrap.Tree.Transform.build();

        // Download the PDB file and create it's representation
        action.add(a, <Bootstrap.Tree.Transformer.To<Bootstrap.Entity.Data.Binary | Bootstrap.Entity.Data.String>>Transformer.Data.Download, { url: `http://www.ebi.ac.uk/pdbe/entry-files/pdb${id}.ent`, type: 'String', id })
            .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.PDB }, { })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
            .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: true }, { })
            //.then(<any>Transformer.Molecule.CreateVisual, { style: Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') }, {}) // this can be used insteadf of the CreateMacromoleculeVisual

        // Download the density and enable the interactive density display
        action.add(a, <Bootstrap.Tree.Transformer.To<Entity.Data.Binary | Entity.Data.String>>Transformer.Data.Download, { url: `http://www.ebi.ac.uk/pdbe/coordinates/files/${id}.ccp4`, type: 'Binary', id, description: '2Fo-Fc Density' })
            .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: '2Fo-Fc Density', normalize: false }, { isBinding: true })
            .then(Transformer.Density.CreateVisualBehaviour, {  
                id: '2Fo-Fc Density',
                isoSigmaMin: 0,
                isoSigmaMax: 2,                    
                radius: 5,
                style: Bootstrap.Visualization.Density.Style.create({
                    isoSigma: 1.5,
                    color: LiteMol.Visualization.Color.fromHex(0x3362B2), 
                    isWireframe: true,
                    transparency: { alpha: 0.75 }
                })
            }, { ref: 'density-2fo-fc' }); 

        return action;
    });
}