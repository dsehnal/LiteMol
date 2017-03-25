/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.Examples {

    import Transformer = LiteMol.Bootstrap.Entity.Transformer
    import Vis = Bootstrap.Visualization

    function hideControlsIfNarrow(plugin: Plugin.Controller) {
        if (document.body.clientWidth < 825) plugin.setLayoutState({ hideControls: true });
    }

    export function Zika(plugin: Plugin.Controller) {
        LiteMol.Bootstrap.Behaviour.SuppressCreateVisualWhenModelIsAdded = true;
        hideControlsIfNarrow(plugin);

        const molecule = plugin.createTransform()
            .add(plugin.root, Transformer.Data.Download, { url: `https://webchemdev.ncbr.muni.cz/CoordinateServer/5ire/full?encoding=bcif&lowPrecisionCoords=1`, type: 'Binary', id: '5ire' })
            .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true });
   
        plugin.applyTransform(molecule).then(() => {
            const model = plugin.createTransform()
                .add('molecule', Transformer.Molecule.CreateModel, { modelIndex: 0 })
                .then(Transformer.Molecule.CreateAssembly, { name: '1' })
                .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: false, hetRef: 'het', polymerRef: 'polymer' }, { })
            plugin.applyTransform(model).then(() => {
                LiteMol.Bootstrap.Behaviour.SuppressCreateVisualWhenModelIsAdded = false;                
                const theme = { 
                    template: Vis.Molecule.Default.UniformThemeTemplate, 
                    colors: Vis.Molecule.Default.UniformThemeTemplate.colors!.set('Uniform', LiteMol.Visualization.Color.fromHex(0x00BFEF))
                };
                (plugin.context.transforms.getController(Transformer.Molecule.CreateVisual, plugin.selectEntities('polymer')[0]) as Bootstrap.Components.Transform.MoleculeVisual)
                    .updateStyleTheme(theme);
                (plugin.context.transforms.getController(Transformer.Molecule.CreateVisual, plugin.selectEntities('het')[0]) as Bootstrap.Components.Transform.MoleculeVisual)
                    .updateStyleTheme(theme);
            });

            const params: Extensions.DensityStreaming.SetupParams = { 
                server: 'https://webchem.ncbr.muni.cz/DensityServer/', //'http://localhost:1337/DensityServer/',
                id: '5ire',
                source: 'EMD',
                initialStreamingParams: { 
                    'EMD': Vis.Density.Style.create({
                        isoValue: 3,
                        isoValueType: Vis.Density.IsoValueType.Absolute,
                        color: LiteMol.Visualization.Color.fromHex(0x999999),
                        isWireframe: false,
                        transparency: { alpha: 0.2 },
                        taskType: 'Background'
                    }),
                    isoValues: { 'EMD': 3 },
                    detailLevel: 4
                }
            };
            const streaming = plugin.createTransform()
                .add('molecule', Extensions.DensityStreaming.Setup, params);
            
            plugin.applyTransform(streaming);
        });
    }

    export function HIV1Capsid(plugin: Plugin.Controller) {
        LiteMol.Bootstrap.Behaviour.SuppressCreateVisualWhenModelIsAdded = true;
        hideControlsIfNarrow(plugin);

        const molecule = plugin.createTransform()
            .add(plugin.root, Transformer.Data.Download, { url: `https://webchemdev.ncbr.muni.cz/CoordinateServer/3j3q/cartoon?encoding=bcif&lowPrecisionCoords=1`, type: 'Binary', id: '5ire' })
            .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
            .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: false, polymerRef: 'polymer' }, { });
   
        plugin.applyTransform(molecule).then(() => {
            LiteMol.Bootstrap.Behaviour.SuppressCreateVisualWhenModelIsAdded = false;                
            const theme = { 
                template: Vis.Molecule.Default.RainbowEntityThemeTemplate
            };
            (plugin.context.transforms.getController(Transformer.Molecule.CreateVisual, plugin.selectEntities('polymer')[0]) as Bootstrap.Components.Transform.MoleculeVisual)
                .updateStyleTheme(theme);
        });
    }

    export async function HIV1Protease(plugin: Plugin.Controller) {
        LiteMol.Bootstrap.Behaviour.SuppressCreateVisualWhenModelIsAdded = true;
        hideControlsIfNarrow(plugin);
        
        const molecule = plugin.createTransform()
            .add(plugin.root, Transformer.Data.Download, { url: `https://webchemdev.ncbr.muni.cz/CoordinateServer/2f80/full?encoding=bcif&lowPrecisionCoords=1`, type: 'Binary', id: '5ire' })
            .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
            .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: false, hetRef: 'het-visual', polymerRef: 'polymer-visual' }, { });
   
        await plugin.applyTransform(molecule);
        LiteMol.Bootstrap.Behaviour.SuppressCreateVisualWhenModelIsAdded = false;

        plugin.command(Bootstrap.Command.Molecule.CreateSelectInteraction, { 
            entity: plugin.selectEntities('het-visual')[0], 
            query: Core.Structure.Query.atomsById(1625)
        });

        plugin.command(Bootstrap.Command.Entity.Focus, plugin.selectEntities('polymer-visual'));

        const annotation = plugin.createTransform()
            .add('molecule', Viewer.PDBe.Validation.DownloadAndCreate, { reportRef: 'validation' });
        
        const annotationTransform = plugin.applyTransform(annotation);

        const streamingParams: Extensions.DensityStreaming.SetupParams = { 
            server: 'https://webchem.ncbr.muni.cz/DensityServer/',
            id: '2f80',
            source: 'X-ray'
        };
        const streaming = plugin.createTransform()
            .add('molecule', Extensions.DensityStreaming.Setup, streamingParams);

        plugin.applyTransform(streaming);

        await annotationTransform;
        function applyColoring() {
            const coloring = plugin.createTransform().add('validation', Viewer.PDBe.Validation.ApplyTheme, { })
            return plugin.applyTransform(coloring);
        }

        await applyColoring();
        plugin.subscribe(Bootstrap.Command.Visual.ResetScene, () => setTimeout(() => applyColoring(), 25));

    }

    export async function LigandInteraction_3a4x(plugin: Plugin.Controller) {        
        LiteMol.Bootstrap.Behaviour.SuppressCreateVisualWhenModelIsAdded = true;
        LiteMol.Bootstrap.Behaviour.Molecule.SuppressShowInteractionOnSelect = true;
        hideControlsIfNarrow(plugin);

        const styleAmb: Vis.Molecule.Style<Vis.Molecule.BallsAndSticksParams> = {
            type: 'BallsAndSticks',
            taskType: 'Background',
            params: { useVDW: false, atomRadius: 0.14, bondRadius: 0.08, detail: 'Automatic' },
            theme: { template: Vis.Molecule.Default.UniformThemeTemplate, colors: Vis.Molecule.Default.UniformThemeTemplate.colors!.set('Uniform', { r: 0.4, g: 0.4, b: 0.4 }), transparency: { alpha: 1.0 } }
        } 

        const styleLig: Vis.Molecule.Style<Vis.Molecule.BallsAndSticksParams> = {
            type: 'BallsAndSticks',
            taskType: 'Background',
            params: { useVDW: false, atomRadius: 0.30, bondRadius: 0.12, detail: 'Automatic' },
            theme: { template: Vis.Molecule.Default.UniformThemeTemplate, colors: Vis.Molecule.Default.UniformThemeTemplate.colors!.set('Uniform', { r: 0.4, g: 0.4, b: 0.4 }), transparency: { alpha: 1.0 } }
        } 

        const query = Core.Structure.Query.residues({ entityId: '2', authAsymId: 'B', authSeqNumber: 2 });
        const model = plugin.createTransform()
            .add(plugin.root, Transformer.Data.Download, { url: `https://webchemdev.ncbr.muni.cz/CoordinateServer/3a4x/ligandInteraction?modelId=1&entityId=2&authAsymId=B&authSeqNumber=2&insCode=&radius=5&atomSitesOnly=1&encoding=bcif&lowPrecisionCoords=1`, type: 'Binary', id: '3a4x' })
            .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true })        
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 });

        model
            .then(Transformer.Molecule.CreateVisual, { style: styleAmb });

        model
            .then(Transformer.Molecule.CreateSelectionFromQuery, { query, name: 'Ligand', silent: true, inFullContext: true }, { isBinding: true })
            .then(Transformer.Molecule.CreateVisual, { style: styleLig });


        await plugin.applyTransform(model);

        const annotation = plugin.createTransform()
            .add('molecule', Viewer.ValidatorDB.DownloadAndCreate, { reportRef: 'validation' });
        
        const annotationTransform = plugin.applyTransform(annotation);

        const streamingParams: Extensions.DensityStreaming.SetupParams = { 
            server: 'https://webchem.ncbr.muni.cz/DensityServer/',
            id: '3a4x',
            source: 'X-ray',
            initialStreamingParams: { 
                displayType: 'Everything',
                showEverythingExtent: 0
            }
        };
        const streaming = plugin.createTransform()
            .add('molecule', Extensions.DensityStreaming.Setup, streamingParams);

        plugin.applyTransform(streaming);

        await annotationTransform;
        function applyColoring() {
            const coloring = plugin.createTransform().add('validation', Viewer.ValidatorDB.ApplyTheme, { })
            plugin.applyTransform(coloring);
        }

        applyColoring();
        plugin.subscribe(Bootstrap.Command.Visual.ResetScene, () => setTimeout(() => applyColoring(), 25));
    }

}