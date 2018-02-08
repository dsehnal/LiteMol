/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer {
    
    import Views = Plugin.Views;
    import Bootstrap = LiteMol.Bootstrap;
    import Transformer = Bootstrap.Entity.Transformer;    
    import LayoutRegion = Bootstrap.Components.LayoutRegion;
    
    export const PluginSpec: Plugin.Specification = {
        settings: {
            'molecule.model.defaultQuery': `residuesByName('GLY', 'ALA')`,
            'molecule.model.defaultAssemblyName': '1', 
            'molecule.coordinateStreaming.defaultId': '5iv5',
            'molecule.coordinateStreaming.defaultServer': 'https://webchem.ncbr.muni.cz/CoordinateServer',
            'molecule.downloadBinaryCIFFromCoordinateServer.server': 'https://webchem.ncbr.muni.cz/CoordinateServer',
            'molecule.coordinateStreaming.defaultRadius': 10,
            'density.defaultVisualBehaviourRadius': 5,

            'extensions.densityStreaming.defaultServer': 'https://webchem.ncbr.muni.cz/DensityServer/', // 'http://localhost:1337/DensityServer/'
            'extensions.rnaLoops.defaultServer': 'http://rna.bgsu.edu/rna3dhub/loops/download/#id'
        },
        transforms: [
            // Root transforms -- things that load data.
            { transformer: DataSources.ObtainMolecule, view: Viewer.Views.ObtainDownload },
            //{ transformer: PDBe.Data.DownloadBinaryCIFFromCoordinateServer, view: Viewer.PDBe.Views.DownloadBinaryCIFFromCoordinateServerView },
            { transformer: PDBe.Data.DownloadDensity, view: PDBe.Views.DownloadDensityView },
            { transformer: Examples.LoadExample, view: Viewer.Views.LoadExample },
            //{ transformer: PDBe.Data.DownloadMolecule, view: Views.Transform.Data.WithIdField, initiallyCollapsed: true },
            { transformer: Transformer.Molecule.CoordinateStreaming.InitStreaming, view: Views.Transform.Molecule.InitCoordinateStreaming, initiallyCollapsed: true },
            //{ transformer: DataSources.DownloadMolecule, view: Views.Transform.Molecule.DownloadFromUrl, initiallyCollapsed: true },
            //{ transformer: Transformer.Molecule.OpenMoleculeFromFile, view: Views.Transform.Molecule.OpenFile, initiallyCollapsed: true },                
            { transformer: Transformer.Data.Download, view: Views.Transform.Data.Download, initiallyCollapsed: true },
            { transformer: Transformer.Data.OpenFile, view: Views.Transform.Data.OpenFile, initiallyCollapsed: true },
            
            // Raw data transforms
            { transformer: Transformer.Molecule.CreateFromData, view: Views.Transform.Molecule.CreateFromData },
            { transformer: Transformer.Data.ParseCif, view: Views.Transform.Empty },
            { transformer: Transformer.Data.ParseBinaryCif, view: Views.Transform.Empty },
            { transformer: Transformer.Density.ParseData, view: Views.Transform.Density.ParseData },
            
            // Molecule(model) transforms
            { transformer: Transformer.Molecule.CreateFromMmCif, view: Views.Transform.Molecule.CreateFromMmCif },
            { transformer: Transformer.Molecule.CreateModel, view: Views.Transform.Molecule.CreateModel, initiallyCollapsed: true },
            { transformer: Transformer.Molecule.CreateSelection, view: Views.Transform.Molecule.CreateSelection, initiallyCollapsed: true },        
                            
            { transformer: Transformer.Molecule.CreateAssembly, view: Views.Transform.Molecule.CreateAssembly, initiallyCollapsed: true },
            { transformer: Transformer.Molecule.CreateSymmetryMates, view: Views.Transform.Molecule.CreateSymmetryMates, initiallyCollapsed: true },
            
            { transformer: Transformer.Molecule.CreateMacromoleculeVisual, view: Views.Transform.Empty },
            { transformer: Transformer.Molecule.CreateVisual, view: Views.Transform.Molecule.CreateVisual },

            { transformer: Transformer.Molecule.CreateLabels, view: Views.Transform.Molecule.CreateLabels },

            { transformer: Extensions.ParticleColoring.Apply, view: Extensions.ParticleColoring.UI.Apply, initiallyCollapsed: true },

            // complex representation
            { transformer: Extensions.ComplexReprensetation.Carbohydrates.Transforms.CreateVisual, view: Extensions.ComplexReprensetation.Carbohydrates.UI.CreateVisual },
            { transformer: Extensions.ComplexReprensetation.Transforms.CreateComplexInfo, view: Views.Transform.Empty },
            { transformer: Extensions.ComplexReprensetation.Transforms.CreateVisual, view: Views.Transform.Empty },
            
            // density transforms
            { transformer: Transformer.Density.CreateFromCif, view: Views.Transform.Molecule.CreateFromMmCif },
            { transformer: Transformer.Density.CreateVisual, view: Views.Transform.Density.CreateVisual },
            { transformer: Transformer.Density.CreateVisualBehaviour, view: Views.Transform.Density.CreateVisualBehaviour },
            { transformer: Extensions.DensityStreaming.Setup, view: Extensions.DensityStreaming.CreateView },
            { transformer: Extensions.DensityStreaming.CreateStreaming, view: Extensions.DensityStreaming.StreamingView },
            
            // Coordinate streaming
            { transformer: Transformer.Molecule.CoordinateStreaming.CreateBehaviour, view: Views.Transform.Empty, initiallyCollapsed: true },
            
            // Validation reports
            { transformer: PDBe.Validation.DownloadAndCreate, view: Views.Transform.Empty },
            { transformer: PDBe.Validation.ApplyTheme, view: Views.Transform.Empty },

            { transformer: ValidatorDB.DownloadAndCreate, view: Views.Transform.Empty },
            { transformer: ValidatorDB.ApplyTheme, view: Views.Transform.Empty },
            
            // annotations
            { transformer: PDBe.SequenceAnnotation.DownloadAndCreate, view: Views.Transform.Empty, initiallyCollapsed: true },
            { transformer: PDBe.SequenceAnnotation.CreateSingle, view: PDBe.Views.CreateSequenceAnnotationView, initiallyCollapsed: true },

            { transformer: Extensions.RNALoops.DownloadAndCreate, view: Extensions.RNALoops.CreateLoopAnnotationView, initiallyCollapsed: true },
            { transformer: Extensions.RNALoops.ApplyTheme, view: Views.Transform.Empty, initiallyCollapsed: false },
        ],
        behaviours: [
            // you will find the source of all behaviours in the Bootstrap/Behaviour directory
            
            Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
            Bootstrap.Behaviour.FocusCameraOnSelect,
            Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
            
            // this colors the visual when a selection is created on it.
            Bootstrap.Behaviour.ApplySelectionToVisual,
            
            // creates a visual when model is added.
            Extensions.ComplexReprensetation.Transforms.CreateRepresentationWhenModelIsAddedBehaviour,
            //Bootstrap.Behaviour.CreateVisualWhenModelIsAdded,
            
            // this colors the visual when it's selected by mouse or touch
            Bootstrap.Behaviour.ApplyInteractivitySelection,
            
            // this shows what atom/residue is the pointer currently over
            Bootstrap.Behaviour.Molecule.HighlightElementInfo,
            
            // distance to the last "clicked" element
            Bootstrap.Behaviour.Molecule.DistanceToLastClickedElement,
            
            // when somethinh is selected, this will create an "overlay visual" of the selected residue and show every other residue within 5ang
            // you will not want to use this for the ligand pages, where you create the same thing this does at startup
            Bootstrap.Behaviour.Molecule.ShowInteractionOnSelect(5),                
            
            // this tracks what is downloaded and some basic actions. Does not send any private data etc. Source in Bootstrap/Behaviour/Analytics 
            Bootstrap.Behaviour.GoogleAnalytics('UA-77062725-1'),

            // extensions
            Extensions.ComplexReprensetation.Carbohydrates.HighlightCustomElementsBehaviour
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
    }
    
}