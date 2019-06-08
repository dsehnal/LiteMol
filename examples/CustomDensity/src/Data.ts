/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Custom {

    import Bootstrap = LiteMol.Bootstrap;
    import Entity = Bootstrap.Entity;        
    import Transformer = Bootstrap.Entity.Transformer; 

    export type LoaderType = 'Full 2Fo-Fc' | 'Streaming'
    export const LoaderTypes: LoaderType[] = ['Full 2Fo-Fc', 'Streaming']

    export interface DensityLoader extends Entity<{ id: string }> { }
    export const DensityLoader = Entity.create<{ id: string }>({ name: 'Density Loader', typeClass: 'Data', shortName: 'DL', description: 'Represents density loader entity.' });

    export const CreateDensityLoader = Bootstrap.Tree.Transformer.create<Entity.Root, DensityLoader, { id: string }>({
        id: 'litemol-custom_density_example-create-loader',
        name: 'Load Density',
        description: 'Download 2Fo-Fc density.',
        from: [Entity.Root],
        to: [DensityLoader],
        defaultParams: () => ({ id: '1cbs' }),
        validateParams: (p) => p.id && p.id.trim().length > 0 ? void 0 : ['Enter Id.']
    }, (context, a, t) => { 
        return Bootstrap.Task.resolve('Density', 'Silent', DensityLoader.create(t, { id: t.params.id!, label: 'Density Loader' }));
    }); 

    function determineSource(ctx: Bootstrap.Context) {
        let e = ctx.select('molecule')[0] as Entity.Molecule.Molecule;
        let source: Extensions.DensityStreaming.FieldSource = 'X-ray';
        const methods = (e.props.molecule.properties.experimentMethods || []);
        for (const m of methods) {
            if (m.toLowerCase().indexOf('microscopy') >= 0) {
                source = 'EM';
                break;
            }
        }
        return source;
    }

    export const DownloadDensity = Bootstrap.Tree.Transformer.actionWithContext<DensityLoader, Entity.Action, { type: LoaderType }, string>({
        id: 'litemol-custom_density_example-download-density',
        name: 'Load Density',
        description: 'Download 2Fo-Fc density.',
        from: [DensityLoader],
        to: [Entity.Action],
        defaultParams: () => ({ type: 'Streaming' })
    }, (context, a, t) => {        
        Bootstrap.Command.Toast.Hide.dispatch(context, { key: 'DownloadDensityToast' });

        let id = a.props.id;
        let action = Bootstrap.Tree.Transform.build();

        if (t.params.type === 'Full 2Fo-Fc') {
            // Download the 2Fo-Fc density and enable the interactive density display
            action.add(context.tree.root, Transformer.Data.Download, { url: `https://www.ebi.ac.uk/pdbe/coordinates/files/${id}.ccp4`, type: 'Binary', id, description: '2Fo-Fc Density' })
                .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: '2Fo-Fc Density' }, { isBinding: true })
                .then(Transformer.Density.CreateVisualBehaviour, {  
                    id: '2Fo-Fc Density',
                    isoSigmaMin: 0,
                    isoSigmaMax: 2,                    
                    radius: 5,
                    showFull: false,
                    minRadius: 0,
                    maxRadius: 10,
                    style: Bootstrap.Visualization.Density.Style.create({
                        isoValue: 1.5,
                        isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                        color: LiteMol.Visualization.Color.fromHex(0x3362B2), 
                        isWireframe: true,
                        transparency: { alpha: 0.75 }
                    })
                }, { ref: 'density-2fo-fc' }); 
        } else {
            // Enable the streaming
            action.add('molecule', Extensions.DensityStreaming.Setup, {
                server: 'https://ds.litemol.org/',
                id,
                source: determineSource(context)
            }, { ref: 'density-streaming' });
        }

        return {
            action,
            context: a.ref
        };
    }, (ctx, ref) => {
        if (!ref) return;
        Bootstrap.Command.Tree.RemoveNode.dispatch(ctx, ref);
    });

    export const DownloadAndCreate = Bootstrap.Tree.Transformer.actionWithContext<Entity.Root, Entity.Action, { id?: string }, {}>({
        id: 'litemol-custom_density_example-download-and-create',
        name: 'Data',
        description: 'Download molecule and create the option to lazy load density.',
        from: [Entity.Root],
        to: [Entity.Action],
        defaultParams: () => ({ id: '1cbs' }),
        validateParams: (p) => p.id && p.id.trim().length > 0 ? void 0 : ['Enter Id.']
    }, (context, a, t) => {        
        let id = t.params.id!.trim().toLowerCase();

        // Clear the previous data.
        Bootstrap.Command.Tree.RemoveNode.dispatch(context, context.tree.root);

        let action = Bootstrap.Tree.Transform.build();

        // Download the CIF file and create it's representation
        action.add(a, Transformer.Data.Download, { url: `https://www.ebi.ac.uk/pdbe/static/entry/${id}_updated.cif`, type: 'String', id })
            .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF }, { ref: 'molecule' })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
            .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: true }, { })
            //.then(Transformer.Molecule.CreateVisual, { style: Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') }, {}) // this can be used insteadf of the CreateMacromoleculeVisual

        // To download the PDB file and create it's representation, use 
        //   action.add(a, Transformer.Data.Download, { url: `https://www.ebi.ac.uk/pdbe/entry-files/pdb${id}.ent`, type: 'String', id })
        //     .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.PDB }, { ref: 'molecule' })
        // the rest is the same.

        // Download the density and enable the interactive density display
        action.add(a, CreateDensityLoader, { id }, { ref: 'density-downloader' });

        return { action, context: {} };
    }, (ctx) => {
        if (ctx.select('molecule').length > 0) showToast();
    });
}