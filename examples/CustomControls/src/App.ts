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
        
        let customSpecification: Plugin.Specification = {
            settings: {
                // currently these are all the 'global' settings available 
                'molecule.model.defaultQuery': `residues({ name: 'ALA' })`,
                'molecule.model.defaultAssemblyName': '1', 
                'molecule.coordinateStreaming.defaultId': '1jj2',
                'molecule.coordinateStreaming.defaultServer': 'https://cs.litemol.org/',
                'molecule.coordinateStreaming.defaultRadius': 10,
                'density.defaultVisualBehaviourRadius': 5
            },
            transforms: [
                // These are the controls that are available in the UI. Removing any of them wont break anything, but the user 
                // be able to create a particular thing if he deletes something.
                
                // Root transforms -- things that load data.
                // { transformer: LiteMol.Viewer.PDBe.Data.DownloadMolecule, view: Views.Transform.Data.WithIdField },
                // { transformer: LiteMol.Viewer.PDBe.Data.DownloadDensity, view: Views.Transform.Data.WithIdField },
                
                // { transformer: LiteMol.Viewer.DataSources.DownloadMolecule, view: Views.Transform.Data.WithUrlIdField },
                // { transformer: Transformer.Molecule.OpenCifMoleculeFromFile, view: Views.Transform.Data.OpenCifMolecule },                
                // { transformer: Transformer.Data.Download, view: Views.Transform.Data.Download },
                // { transformer: Transformer.Data.OpenFile, view: Views.Transform.Data.OpenFile },
                                 
                // Raw data transforms
                // { transformer: Transformer.Data.ParseCif, view: Views.Transform.Empty },
                // { transformer: Transformer.Density.ParseCcp4, view: Views.Transform.Density.ParseCcp4 },
                
                // Molecule(model) transforms
                // { transformer: Transformer.Molecule.CreateFromCif, view: Views.Transform.Molecule.CreateFromCif },
                // { transformer: Transformer.Molecule.CreateModel, view: Views.Transform.Molecule.CreateModel },
                // { transformer: Transformer.Molecule.CreateSelection, view: Views.Transform.Molecule.CreateSelection },        
                                
                // { transformer: Transformer.Molecule.CreateAssembly, view: Views.Transform.Molecule.CreateAssembly },
                // { transformer: Transformer.Molecule.CreateSymmetryMates, view: Views.Transform.Molecule.CreateSymmetryMates },
                
                // { transformer: Transformer.Molecule.CreateMacromoleculeVisual, view: Views.Transform.Empty },
                { transformer: Transformer.Molecule.CreateVisual, view: Views.Transform.Molecule.CreateVisual },
                
                // // density transforms
                // { transformer: Transformer.Density.CreateVisual, view: Views.Transform.Density.CreateVisual },
                // { transformer: Transformer.Density.CreateVisualBehaviour, view: Views.Transform.Density.CreateVisualBehaviour },
                
                // // Coordinate streaming            
                // { transformer: Transformer.Molecule.CoordinateStreaming.CreateBehaviour, view: Views.Transform.Empty },
                
                // // Validation report
                // { transformer: LiteMol.Viewer.PDBe.Validation.DownloadAndCreate, view: Views.Transform.Empty },
                // { transformer: LiteMol.Viewer.PDBe.Validation.ApplyTheme, view: Views.Transform.Empty }

                { transformer: CreateRepresentation, view: LiteMol.Custom.RepresentationView, initiallyCollapsed: true }
            ],
            behaviours: [
                // you will find the source of all behaviours in the Bootstrap/Behaviour directory
                
                // keep these 2
                Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
                Bootstrap.Behaviour.FocusCameraOnSelect,
                
                // this colors the visual when a selection is created on it.
                Bootstrap.Behaviour.ApplySelectionToVisual,
                                
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

                Plugin.Components.create('RepresentationControls', ctx => new Bootstrap.Components.Transform.Action(ctx, 'molecule', CreateRepresentation, 'Source'), Plugin.Views.Transform.Action)(LayoutRegion.Right),

                Plugin.Components.create('PolymerControls', ctx => new Bootstrap.Components.Transform.Updater(ctx, 'polymer-visual', 'Polymer Visual'), Plugin.Views.Transform.Updater)(LayoutRegion.Right),
                Plugin.Components.create('HetControls', ctx => new Bootstrap.Components.Transform.Updater(ctx, 'het-visual', 'HET Groups Visual'), Plugin.Views.Transform.Updater)(LayoutRegion.Right),
                Plugin.Components.create('WaterControls', ctx => new Bootstrap.Components.Transform.Updater(ctx, 'water-visual', 'Water Visual'), Plugin.Views.Transform.Updater)(LayoutRegion.Right),
                
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
            tree: void 0 // { region: LayoutRegion.Left, view: Views.Entity.Tree }
        };

        let plugin = Plugin.create({ target, customSpecification, layoutState: { isExpanded: true } });
        plugin.context.logger.message(`LiteMol Plugin ${Plugin.VERSION.number}`);
        return plugin;
    }
    
    // create the instance...
    
    let id = '1tqn';
    let plugin = create(document.getElementById('app')!);

    let action = plugin.createTransform();
    
    action.add(plugin.context.tree.root, Transformer.Data.Download, { url: `https://www.ebi.ac.uk/pdbe/static/entry/${id}_updated.cif`, type: 'String', id })
        .then(Transformer.Data.ParseCif, { id }, { isBinding: true })
        .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { ref: 'molecule' })
        .then(CreateRepresentation, { });

     plugin.applyTransform(action).then(() => {
         console.log(plugin.context.select('molecule'));
     });        
}