/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin {
    "use strict";
    
    import Transformer = Bootstrap.Entity.Transformer;
    
    export namespace DataSources {
        export const DownloadMolecule = Transformer.Molecule.downloadMoleculeSource({ 
            sourceId: 'url-molecule', 
            name: 'URL', 
            description: 'Download a molecule from the specified URL (if the host server supports cross domain requests).',  
            defaultId: 'https://webchem.ncbr.muni.cz/CoordinateServer/1tqn/cartoon',
            urlTemplate: id => id,
            isFullUrl: true
        }); 
    }
    
    import LayoutRegion = Bootstrap.Components.LayoutRegion;
        
    export function getDefaultSpecification(): Specification {
        return {
            settings: {
                'molecule.model.defaultQuery': `residues({ name: 'ALA' })`,
                'molecule.model.defaultAssemblyName': '1', 
                'molecule.coordinateStreaming.defaultId': '1jj2',
                'molecule.coordinateStreaming.defaultServer': 'https://webchem.ncbr.muni.cz/CoordinateServer',
                'molecule.coordinateStreaming.defaultRadius': 10,
                'density.defaultVisualBehaviourRadius': 5
            },
            transforms: [
                // Root transforms
                { transformer: Transformer.Molecule.CoordinateStreaming.InitStreaming, view: Views.Transform.Molecule.InitCoordinateStreaming, initiallyCollapsed: true },
                { transformer: DataSources.DownloadMolecule, view: Views.Transform.Data.WithUrlIdField, initiallyCollapsed: true },
                { transformer: Transformer.Molecule.OpenMoleculeFromFile, view: Views.Transform.Molecule.OpenFile, initiallyCollapsed: true },                
                { transformer: Transformer.Data.Download, view: Views.Transform.Data.Download, initiallyCollapsed: true },
                { transformer: Transformer.Data.OpenFile, view: Views.Transform.Data.OpenFile, initiallyCollapsed: true },
                
                // Raw data transforms
                { transformer: Transformer.Molecule.CreateFromData, view: Views.Transform.Molecule.CreateFromData },
                { transformer: Transformer.Data.ParseCif, view: Views.Transform.Empty },
                { transformer: Transformer.Density.ParseData, view: Views.Transform.Density.ParseData },
                
                // Molecule(model) transforms
                { transformer: Transformer.Molecule.CreateFromMmCif, view: Views.Transform.Molecule.CreateFromMmCif },
                { transformer: Transformer.Molecule.CreateModel, view: Views.Transform.Molecule.CreateModel, initiallyCollapsed: true },
                { transformer: Transformer.Molecule.CreateSelection, view: Views.Transform.Molecule.CreateSelection, initiallyCollapsed: true },        
                                
                { transformer: Transformer.Molecule.CreateAssembly, view: Views.Transform.Molecule.CreateAssembly, initiallyCollapsed: true },
                { transformer: Transformer.Molecule.CreateSymmetryMates, view: Views.Transform.Molecule.CreateSymmetryMates, initiallyCollapsed: true },
                
                { transformer: Transformer.Molecule.CreateMacromoleculeVisual, view: Views.Transform.Empty },
                { transformer: Transformer.Molecule.CreateVisual, view: Views.Transform.Molecule.CreateVisual },
                
                // density transforms
                { transformer: Transformer.Density.CreateVisual, view: Views.Transform.Density.CreateVisual },
                { transformer: Transformer.Density.CreateVisualBehaviour, view: Views.Transform.Density.CreateVisualBehaviour },
                
                // Coordinate streaming
                { transformer: Transformer.Molecule.CoordinateStreaming.CreateBehaviour, view: Views.Transform.Empty, initiallyCollapsed: true },
            ],
            behaviours: [
                Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
                Bootstrap.Behaviour.FocusCameraOnSelect,                
                Bootstrap.Behaviour.ApplySelectionToVisual,
                Bootstrap.Behaviour.ApplyInteractivitySelection,
                Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
                
                Bootstrap.Behaviour.Molecule.HighlightElementInfo,
                Bootstrap.Behaviour.Molecule.DistanceToLastClickedElement,
                Bootstrap.Behaviour.Molecule.ShowInteractionOnSelect(5)
            ],            
            components: [
                Components.Visualization.HighlightInfo(LayoutRegion.Main, true),               
                Components.Entity.Current('LiteMol', Plugin.VERSION.number)(LayoutRegion.Right, true),
                Components.Transform.View(LayoutRegion.Right),
                Components.Context.Log(LayoutRegion.Bottom, true),
                Components.Context.Overlay(LayoutRegion.Root),
                Components.Context.Toast(LayoutRegion.Main, true),
                Components.Context.BackgroundTasks(LayoutRegion.Main, true)
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
}