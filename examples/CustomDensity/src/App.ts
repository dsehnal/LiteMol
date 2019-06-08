/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Custom {
    
    import Plugin = LiteMol.Plugin;
    import Views = Plugin.Views;
    import Bootstrap = LiteMol.Bootstrap;            
    import Transformer = Bootstrap.Entity.Transformer;
    import LayoutRegion = Bootstrap.Components.LayoutRegion;
               
    export function create(target: HTMLElement) {
        
        const customSpecification: Plugin.Specification = {
            settings: {
                'density.defaultVisualBehaviourRadius': 5,
                'extensions.densityStreaming.defaultServer': 'https://ds.litemol.org/'
            },
            transforms: [                
                { transformer: Transformer.Molecule.CreateVisual, view: Views.Transform.Molecule.CreateVisual },
                { transformer: Transformer.Density.CreateVisualBehaviour, view: Views.Transform.Density.CreateVisualBehaviour },

                { transformer: DownloadDensity, view: DensityLoaderView },

                { transformer: DownloadAndCreate, view: LiteMol.Plugin.Views.Transform.Data.WithIdField, initiallyCollapsed: false },

                { transformer: Extensions.DensityStreaming.Setup, view: Extensions.DensityStreaming.CreateView },
                { transformer: Extensions.DensityStreaming.CreateStreaming, view: Extensions.DensityStreaming.StreamingView }
            ],
            behaviours: [
                // you will find the source of all behaviours in the Bootstrap/Behaviour directory
                
                // keep these 2
                Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
                Bootstrap.Behaviour.FocusCameraOnSelect,
                
                // this colors the visual when it's selected by mouse or touch
                Bootstrap.Behaviour.ApplyInteractivitySelection,
                
                // this shows what atom/residue is the pointer currently over
                Bootstrap.Behaviour.Molecule.HighlightElementInfo,
                
                // distance to the last "clicked" element
                Bootstrap.Behaviour.Molecule.DistanceToLastClickedElement,

                // when the same element is clicked twice in a row, the selection is emptied
                Bootstrap.Behaviour.UnselectElementOnRepeatedClick,

                // when somethinh is selected, this will create an "overlay visual" of the selected residue and show every other residue within 5ang
                // you will not want to use this for the ligand pages, where you create the same thing this does at startup
                Bootstrap.Behaviour.Molecule.ShowInteractionOnSelect(5),
                
                // this tracks what is downloaded and some basic actions. Does not send any private data etc.
                // While it is not required for any functionality, we as authors are very much interested in basic 
                // usage statistics of the application and would appriciate if this behaviour is used.
                Bootstrap.Behaviour.GoogleAnalytics('UA-77062725-1')
            ],            
            components: [
                Plugin.Components.Visualization.HighlightInfo(LayoutRegion.Main, true),               

                //Plugin.Components.create('RepresentationControls', ctx => new Bootstrap.Components.Transform.Action(ctx, 'model', CreateRepresentation, 'Source'), Plugin.Views.Transform.Action)(LayoutRegion.Right),
                Plugin.Components.create('SourceControls', ctx => new Bootstrap.Components.Transform.Action(ctx, ctx.tree.root, DownloadAndCreate, 'Source'), Plugin.Views.Transform.Action)(LayoutRegion.Right),
                Plugin.Components.create('DownloadDensity', ctx => new Bootstrap.Components.Transform.Action(ctx, 'density-downloader', DownloadDensity, 'Load Density'), Plugin.Views.Transform.Action)(LayoutRegion.Right),

                Plugin.Components.create('DensityControls', ctx => new Bootstrap.Components.Transform.Updater(ctx, 'density-2fo-fc', 'Density: 2Fo-Fc'), Plugin.Views.Transform.Updater)(LayoutRegion.Right),

                Plugin.Components.create('StreamingControls', ctx => new Bootstrap.Components.Transform.Updater
                    (ctx, Bootstrap.Tree.Selection.root().subtree().ofType(Extensions.DensityStreaming.Streaming), 'Density Streaming'), Plugin.Views.Transform.Updater)
                    (LayoutRegion.Right),

                Plugin.Components.Context.Log(LayoutRegion.Bottom, true),
                Plugin.Components.Context.Overlay(LayoutRegion.Root),
                Plugin.Components.Context.Toast(LayoutRegion.Main, true),
                Plugin.Components.Context.BackgroundTasks(LayoutRegion.Main, true)
            ],
            viewport: {
                // dont touch this either 
                view: Views.Visualization.Viewport,
                controlsView: Views.Visualization.ViewportControls
            },
            layoutView: Views.Layout, // nor this
            tree: void 0 //{ region: LayoutRegion.Left, view: Views.Entity.Tree }
        };

        let plugin = Plugin.create({ target, customSpecification, layoutState: { isExpanded: true } });
        plugin.context.logger.message(`LiteMol Plugin ${Plugin.VERSION.number}`);
        return plugin;
    }
    
    // create the instance...
    
    let id = '1cbs';
    let plugin = create(document.getElementById('app')!);

    let action = plugin.createTransform();    
    action.add(plugin.context.tree.root, DownloadAndCreate, { id });
    plugin.applyTransform(action);     

    export function showToast() {
        plugin.command(Bootstrap.Command.Toast.Show, {
            key: 'DownloadDensityToast',
            title: 'Density',
            message: DownloadDensityToastMessage(plugin.context),
            timeoutMs: 30 * 1000
        });
    }

    showToast();
}