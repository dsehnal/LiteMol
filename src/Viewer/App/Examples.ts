/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.Examples {

    import Transformer = LiteMol.Bootstrap.Entity.Transformer

    export function Zika(plugin: Plugin.Controller) {
        LiteMol.Bootstrap.Behaviour.SuppressCreateVisualWhenModelIsAdded = true;

        plugin.setLayoutState({ hideControls: true });

        const molecule = plugin.createTransform()
            .add(plugin.root, Transformer.Data.Download, { url: `https://webchemdev.ncbr.muni.cz/CoordinateServer/5ire/full?encoding=bcif&lowPrecisionCoords=1`, type: 'Binary', id: '5ire' })
            .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true });
   
        plugin.applyTransform(molecule).then(() => {
            const model = plugin.createTransform()
                .add('molecule', Transformer.Molecule.CreateModel, { modelIndex: 0 })
                .then(Transformer.Molecule.CreateAssembly, { name: '1' })
                .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: false, polymerRef: 'polymer' }, { })
            plugin.applyTransform(model).then(() => {
                LiteMol.Bootstrap.Behaviour.SuppressCreateVisualWhenModelIsAdded = false;
                const polymer = plugin.selectEntities('polymer')[0]
                const controller = plugin.context.transforms.getController(Transformer.Molecule.CreateVisual, polymer) as Bootstrap.Components.Transform.MoleculeVisual;
                const theme = { 
                    template: Bootstrap.Visualization.Molecule.Default.UniformThemeTemplate, 
                    colors: Bootstrap.Visualization.Molecule.Default.UniformThemeTemplate.colors!.set('Uniform', LiteMol.Visualization.Color.fromHex(0xE20F2E))
                };
                controller.updateStyleTheme(theme);
            });

            const params: Extensions.DensityStreaming.CreateParams = { 
                server: 'http://localhost:1337/DensityServer/',
                id: '5ire',
                source: 'EMD',
                initialStreamingParams: { 
                    'EMD': Bootstrap.Visualization.Density.Style.create({
                        isoValue: 3,
                        isoValueType: Bootstrap.Visualization.Density.IsoValueType.Absolute,
                        color: LiteMol.Visualization.Color.fromHex(0x888888),
                        isWireframe: false,
                        transparency: { alpha: 0.15 },
                        taskType: 'Background'
                    }),
                    isoValues: { 'EMD': 3 },
                    detailLevel: 4
                }
            };
            const streaming = plugin.createTransform()
                .add('molecule', Extensions.DensityStreaming.Create, params);
            
            plugin.applyTransform(streaming);
        });
    }

    export function HIV1Capsid(plugin: Plugin.Controller) {
        const molecule = plugin.createTransform()
            .add(plugin.root, Transformer.Data.Download, { url: `https://webchemdev.ncbr.muni.cz/CoordinateServer/3j3q/cartoon?encoding=bcif&lowPrecisionCoords=1`, type: 'Binary', id: '5ire' })
            .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 });
   
        plugin.applyTransform(molecule);
    }

}