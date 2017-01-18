/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Example.Transforms {    
    /**
     * We don't want the default behaviour of the plugin for our example.
     */

    import Views = Plugin.Views;
    import Bootstrap = LiteMol.Bootstrap;
    import Entity = Bootstrap.Entity;
    import Transformer = Bootstrap.Entity.Transformer;    
    import LayoutRegion = Bootstrap.Components.LayoutRegion;
    
    export const PluginSpec: Plugin.Specification = {
        settings: {
            'molecule.model.defaultQuery': `residuesByName('GLY', 'ALA')`,
            'molecule.model.defaultAssemblyName': '1'
        },
        transforms: [
            // Molecule(model) transforms
            { transformer: Transformer.Molecule.CreateModel, view: Views.Transform.Molecule.CreateModel, initiallyCollapsed: true },
            { transformer: Transformer.Molecule.CreateSelection, view: Views.Transform.Molecule.CreateSelection, initiallyCollapsed: true },        
                            
            { transformer: Transformer.Molecule.CreateAssembly, view: Views.Transform.Molecule.CreateAssembly, initiallyCollapsed: true },
            { transformer: Transformer.Molecule.CreateSymmetryMates, view: Views.Transform.Molecule.CreateSymmetryMates, initiallyCollapsed: true },
            
            { transformer: Transformer.Molecule.CreateMacromoleculeVisual, view: Views.Transform.Empty },
            { transformer: Transformer.Molecule.CreateVisual, view: Views.Transform.Molecule.CreateVisual }
        ],
        behaviours: [
            // you will find the source of all behaviours in the Bootstrap/Behaviour directory
            
            Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
            Bootstrap.Behaviour.FocusCameraOnSelect,
            
            // this colors the visual when a selection is created on it.
            Bootstrap.Behaviour.ApplySelectionToVisual,
            
            // this colors the visual when it's selected by mouse or touch
            Bootstrap.Behaviour.ApplyInteractivitySelection,
            
            // this shows what atom/residue is the pointer currently over
            Bootstrap.Behaviour.Molecule.HighlightElementInfo,

            // when the same element is clicked twice in a row, the selection is emptied
            Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
            
            // distance to the last "clicked" element
            Bootstrap.Behaviour.Molecule.DistanceToLastClickedElement,
            
            // this tracks what is downloaded and some basic actions. Does not send any private data etc. Source in Bootstrap/Behaviour/Analytics 
            Bootstrap.Behaviour.GoogleAnalytics('UA-77062725-1')
        ],            
        components: [
            Plugin.Components.Visualization.HighlightInfo(LayoutRegion.Main, true),               
            Plugin.Components.Entity.Current('LiteMol', Plugin.VERSION.number)(LayoutRegion.Right, true),
            Plugin.Components.Transform.View(LayoutRegion.Right),
            Plugin.Components.Context.Log(LayoutRegion.Bottom, true),
            Plugin.Components.Context.Overlay(LayoutRegion.Root),
            Plugin.Components.Context.Toast(LayoutRegion.Main, true),
            Plugin.Components.Context.BackgroundTasks(LayoutRegion.Main, true)
        ],
        viewport: { 
            view: Views.Visualization.Viewport,
            controlsView: Views.Visualization.ViewportControls
        },
        layoutView: Views.Layout, 
        tree: {
            region: LayoutRegion.Left,
            view: Views.Entity.Tree
        }
    };    
}