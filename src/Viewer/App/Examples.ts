/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.Examples {

    import Transformer = LiteMol.Bootstrap.Entity.Transformer
    import Vis = Bootstrap.Visualization

    export const ExampleMap: { [name: string]: { name: string, provider: (plugin: Plugin.Controller) => void } } = {
        'zika-cryo-em': {
            name: 'Zika Virus + Cryo-EM Map',
            provider: Zika
        },
        '5va1-cryo-em': {
            name: 'Open Human Ether-a-go-go-Related K(+) Channel hERG + Cryo-EM Map',
            provider: _5va1_cryo_em
        },
        '3a4x-lig': {
            name: 'PDB ID 3A4X Ligand Validation',
            provider: LigandInteraction_3a4x
        },
        'hiv1-protease': {
            name: 'HIV-1 Protease + PDBe Validation + X-ray Density',
            provider: HIV1Protease
        },
        'hiv1-capsid': {
            name: 'HIV-1 Capsid Cartoon Model',
            provider: HIV1Capsid
        } 
    }

    export const ExampleIds = Object.getOwnPropertyNames(ExampleMap);

    export interface LoadExampleParams { exampleId: string } 
    export const LoadExample = Bootstrap.Tree.Transformer.action<Bootstrap.Entity.Root, Bootstrap.Entity.Action, LoadExampleParams>({
        id: 'viewer-load-example',
        name: 'Examples',
        description: 'Clears the scene and loads the selected example',
        from: [Bootstrap.Entity.Root],
        to: [Bootstrap.Entity.Action],
        defaultParams: () => ({ exampleId: ExampleIds[0] })
    }, (context, a, t) => {  
        Bootstrap.Command.Tree.RemoveNode.dispatch(context, context.tree.root);

        let example = Examples.ExampleMap[t.params.exampleId];
        if (example) example.provider(new Plugin.Controller(context.plugin!));
        
        // an ugly hack to temporarily hide add button from the UIs
        const delay = t.params.exampleId === 'hiv1-capsid' ? 10000 : 2500;        
        return Bootstrap.Tree.Transform.build().add(a, Transformer.Basic.Delay, { timeoutMs: delay });
    });
    
    function hideControlsIfNarrow(plugin: Plugin.Controller) {
        if (document.body.clientWidth < 825) plugin.setLayoutState({ hideControls: true });
    }

    function unsubscribeOnDelete(plugin: Plugin.Controller, subProvider: () => { dispose: () => void }, ref: string, extraCall?: () => void) {
        let sub = subProvider();
        let del = plugin.subscribe(Bootstrap.Event.Tree.NodeRemoved, e => {
            if (!del || !sub || e.data.ref !== ref) return;
            sub.dispose();
            sub = void 0 as any;            
            if (del) {
                del.dispose();
                del = void 0 as any;
            }
            if (extraCall) extraCall();
        });
    }

    function suppressCreateModel(supp: boolean) {
        Extensions.ComplexReprensetation.Transforms.SuppressCreateVisualWhenModelIsAdded = supp;
        LiteMol.Bootstrap.Behaviour.SuppressCreateVisualWhenModelIsAdded = supp;
    }

    function Zika(plugin: Plugin.Controller) {
        suppressCreateModel(true);
        hideControlsIfNarrow(plugin);

        const molecule = plugin.createTransform()
            .add(plugin.root, Transformer.Data.Download, { url: `https://webchem.ncbr.muni.cz/CoordinateServer/5ire/full?encoding=bcif&lowPrecisionCoords=1`, type: 'Binary', id: '5ire' })
            .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true });
   
        plugin.applyTransform(molecule).then(() => {
            const model = plugin.createTransform()
                .add('molecule', Transformer.Molecule.CreateModel, { modelIndex: 0 })
                .then(Transformer.Molecule.CreateAssembly, { name: '1' })
                .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: false, hetRef: 'het', polymerRef: 'polymer' }, { })
            
            plugin.applyTransform(model).then(() => {
                suppressCreateModel(false);         
                const theme = { 
                    template: Vis.Molecule.Default.UniformThemeTemplate, 
                    colors: Vis.Molecule.Default.UniformThemeTemplate.colors!.set('Uniform', LiteMol.Visualization.Color.fromHex(0x00BFEF))
                };
                (plugin.context.transforms.getController(Transformer.Molecule.CreateVisual, plugin.selectEntities('polymer')[0]) as Bootstrap.Components.Transform.MoleculeVisual)
                    .updateStyleTheme(theme);
                (plugin.context.transforms.getController(Transformer.Molecule.CreateVisual, plugin.selectEntities('het')[0]) as Bootstrap.Components.Transform.MoleculeVisual)
                    .updateStyleTheme(theme);

                const streamingEntity = plugin.selectEntities('5ire_density_streaming')[0];
                if (streamingEntity) {
                    plugin.command(Bootstrap.Command.Entity.SetCurrent, streamingEntity);
                }
            }).catch(() => suppressCreateModel(false));

            const params: Extensions.DensityStreaming.SetupParams = { 
                server: 'https://webchem.ncbr.muni.cz/DensityServer/', //'http://localhost:1337/DensityServer/',
                id: '5ire',
                source: 'EM',
                initialStreamingParams: { 
                    'EM': Vis.Density.Style.create({
                        isoValue: 3,
                        isoValueType: Vis.Density.IsoValueType.Absolute,
                        color: LiteMol.Visualization.Color.fromHex(0x999999),
                        isWireframe: false,
                        transparency: { alpha: 0.2 },
                        taskType: 'Background'
                    }),
                    isoValues: { 'EM': 3 },
                    detailLevel: 4
                },
                streamingEntityRef: '5ire_density_streaming'
            };
            const streaming = plugin.createTransform()
                .add('molecule', Extensions.DensityStreaming.Setup, params);
            
            plugin.applyTransform(streaming);
        });
    }

    function _5va1_cryo_em(plugin: Plugin.Controller) {
        suppressCreateModel(true);
        hideControlsIfNarrow(plugin);

        const molecule = plugin.createTransform()
            .add(plugin.root, Transformer.Data.Download, { url: `https://webchem.ncbr.muni.cz/CoordinateServer/5va1/full?encoding=bcif&lowPrecisionCoords=1`, type: 'Binary', id: '5va1' })
            .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true });
   
        plugin.applyTransform(molecule).then(() => {
            const model = plugin.createTransform()
                .add('molecule', Transformer.Molecule.CreateModel, { modelIndex: 0 })
                .then(Transformer.Molecule.CreateAssembly, { name: '1' })
                .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: false, hetRef: 'het', polymerRef: 'polymer' }, { })
            plugin.applyTransform(model).then(() => {
                suppressCreateModel(false);           
                const theme = { 
                    template: Vis.Molecule.Default.RainbowEntityThemeTemplate
                };
                (plugin.context.transforms.getController(Transformer.Molecule.CreateVisual, plugin.selectEntities('polymer')[0]) as Bootstrap.Components.Transform.MoleculeVisual)
                    .updateStyleTheme(theme);

                const streamingEntity = plugin.selectEntities('5va1_density_streaming')[0];
                if (streamingEntity) {
                    plugin.command(Bootstrap.Command.Entity.SetCurrent, streamingEntity);
                }
            }).catch(() => suppressCreateModel(false));

            const params: Extensions.DensityStreaming.SetupParams = { 
                server: 'https://webchem.ncbr.muni.cz/DensityServer/', //'http://localhost:1337/DensityServer/',
                id: '5va1',
                source: 'EM',
                initialStreamingParams: { 
                    detailLevel: 4
                },
                streamingEntityRef: '5va1_density_streaming'
            };
            const streaming = plugin.createTransform()
                .add('molecule', Extensions.DensityStreaming.Setup, params);
            
            plugin.applyTransform(streaming);
        });
    }

    function HIV1Capsid(plugin: Plugin.Controller) {
        suppressCreateModel(true);
        hideControlsIfNarrow(plugin);

        const molecule = plugin.createTransform()
            .add(plugin.root, Transformer.Data.Download, { url: `https://webchem.ncbr.muni.cz/CoordinateServer/3j3q/cartoon?encoding=bcif&lowPrecisionCoords=1`, type: 'Binary', id: '3j3q' })
            .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
            .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: false, polymerRef: 'polymer' }, { });
   
        plugin.applyTransform(molecule).then(() => {
            suppressCreateModel(false);
            const theme = { 
                template: Vis.Molecule.Default.RainbowEntityThemeTemplate
            };
            (plugin.context.transforms.getController(Transformer.Molecule.CreateVisual, plugin.selectEntities('polymer')[0]) as Bootstrap.Components.Transform.MoleculeVisual)
                .updateStyleTheme(theme);
        }).catch(() => suppressCreateModel(false));

        return molecule;
    }

    async function HIV1Protease(plugin: Plugin.Controller) {
        suppressCreateModel(true);
        hideControlsIfNarrow(plugin);
        
        const rootRef = 'hiv1-protease-data';

        const molecule = plugin.createTransform()
            .add(plugin.root, Transformer.Data.Download, { url: `https://webchem.ncbr.muni.cz/CoordinateServer/2f80/full?encoding=bcif&lowPrecisionCoords=1`, type: 'Binary', id: '2f80' }, { ref: rootRef })
            .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
            .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: false, hetRef: 'het-visual', polymerRef: 'polymer-visual' }, { });
   
        await plugin.applyTransform(molecule);
        suppressCreateModel(false);

        plugin.command(Bootstrap.Command.Molecule.CreateSelectInteraction, { 
            entity: plugin.selectEntities('het-visual')[0], 
            query: Core.Structure.Query.atomsById(1625)
        });

        plugin.command(Bootstrap.Command.Entity.Focus, plugin.selectEntities('polymer-visual'));

        const annotation = plugin.createTransform()
            .add('molecule', Viewer.PDBe.Validation.DownloadAndCreate, { reportRef: 'hiv1-validation' });
        
        const annotationTransform = plugin.applyTransform(annotation);

        const streamingParams: Extensions.DensityStreaming.SetupParams = { 
            server: 'https://webchem.ncbr.muni.cz/DensityServer/',
            id: '2f80',
            source: 'X-ray', 
            initialStreamingParams: {
                radius: 1.5,
                '2Fo-Fc': Bootstrap.Visualization.Density.Style.create({
                    isoValue: 1.5,
                    isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                    color: LiteMol.Visualization.Color.fromHex(0x3362B2),
                    isWireframe: true,
                    transparency: { alpha: 0.4 },
                    taskType: 'Background'
                })
            }
        };
        const streaming = plugin.createTransform()
            .add('molecule', Extensions.DensityStreaming.Setup, streamingParams);

        plugin.applyTransform(streaming);

        await annotationTransform;
        function applyColoring() {
            const coloring = plugin.createTransform().add('hiv1-validation', Viewer.PDBe.Validation.ApplyTheme, { })
            return plugin.applyTransform(coloring);
        }

        setTimeout(() => applyColoring(), 50);
        unsubscribeOnDelete(
            plugin, 
            () => plugin.subscribe(Bootstrap.Command.Visual.ResetScene, () => setTimeout(() => applyColoring(), 25)), 
            rootRef);
    }

    async function LigandInteraction_3a4x(plugin: Plugin.Controller) {        
        suppressCreateModel(true);
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

        const rootRef = '3a4x-ligint-data';

        const query = Core.Structure.Query.residues({ entityId: '2', authAsymId: 'B', authSeqNumber: 2 });
        const model = plugin.createTransform()
            .add(plugin.root, Transformer.Data.Download, { url: `https://webchem.ncbr.muni.cz/CoordinateServer/3a4x/ligandInteraction?modelId=1&entityId=2&authAsymId=B&authSeqNumber=2&insCode=&radius=5&atomSitesOnly=1&encoding=bcif&lowPrecisionCoords=1`, type: 'Binary', id: '3a4x' }, { ref: rootRef })
            .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true })        
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 });

        model
            .then(Transformer.Molecule.CreateVisual, { style: styleAmb });

        model
            .then(Transformer.Molecule.CreateSelectionFromQuery, { query, name: 'Ligand', silent: true, inFullContext: true }, { isBinding: true })
            .then(Transformer.Molecule.CreateVisual, { style: styleLig });


        await plugin.applyTransform(model);
        suppressCreateModel(false);

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
        unsubscribeOnDelete(
            plugin, 
            () => plugin.subscribe(Bootstrap.Command.Visual.ResetScene, () => setTimeout(() => applyColoring(), 25)), 
            rootRef,
            () => LiteMol.Bootstrap.Behaviour.Molecule.SuppressShowInteractionOnSelect = false);
    }

}