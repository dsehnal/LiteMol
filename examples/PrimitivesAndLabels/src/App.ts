/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.PrimitivesAndLabels {
    
    import Plugin = LiteMol.Plugin;
    import Query = LiteMol.Core.Structure.Query;
    import Views = Plugin.Views;
    import Bootstrap = LiteMol.Bootstrap;            
    import Transformer = Bootstrap.Entity.Transformer;
    import LayoutRegion = Bootstrap.Components.LayoutRegion;

    export function create(target: HTMLElement) {
        
        const customSpecification: Plugin.Specification = {
            settings: { },
            transforms: [],
            behaviours: [
                // you will find the source of all behaviours in the Bootstrap/Behaviour directory
                
                Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
                Bootstrap.Behaviour.FocusCameraOnSelect,
                
                // this colors the visual when a selection is created on it.
                //Bootstrap.Behaviour.ApplySelectionToVisual,
                                
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
                //Bootstrap.Behaviour.Molecule.ShowInteractionOnSelect(5),                
                
                // this tracks what is downloaded and some basic actions. Does not send any private data etc.
                // While it is not required for any functionality, we as authors are very much interested in basic 
                // usage statistics of the application and would appriciate if this behaviour is used.
                Bootstrap.Behaviour.GoogleAnalytics('UA-77062725-1'),

                HighlightCustomElements
            ],            
            components: [
                Plugin.Components.Visualization.HighlightInfo(LayoutRegion.Main, true),               

                Plugin.Components.Context.Log(LayoutRegion.Bottom, true),
                Plugin.Components.Context.Overlay(LayoutRegion.Root),
                Plugin.Components.Context.Toast(LayoutRegion.Main, true),
                Plugin.Components.Context.BackgroundTasks(LayoutRegion.Main, true)
            ],
            viewport: {
                view: Views.Visualization.Viewport,
                controlsView: Views.Visualization.ViewportControls
            },
            layoutView: Views.Layout, // nor this
            tree: { region: LayoutRegion.Left, view: Views.Entity.Tree }
        };

        let plugin = Plugin.create({ target, customSpecification, layoutState: { hideControls: true, isExpanded: true } });
        plugin.context.logger.message(`LiteMol ${Plugin.VERSION.number}`);
        return plugin;
    }
        
    let id = '1cbs';
    let plugin = create(document.getElementById('app')!);

    /**
     * Selection of a specific set of atoms...
     */     
    let selectionQ = Query.residuesByName('REA'); 
    let pocketQ = Query.residuesByName('REA').ambientResidues(5); 
    
    // Represent an action to perform on the app state.
    const action = plugin.createTransform();

    // This loads the model from PDBe
    const modelAction = action.add(plugin.context.tree.root, Transformer.Data.Download, { url: `https://www.ebi.ac.uk/pdbe/static/entry/${id}_updated.cif`, type: 'String', id })
        .then(Transformer.Data.ParseCif, { id }, { isBinding: true })
        .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { isBinding: true, ref: 'molecule' })
        .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false, ref: 'model' });
    
    modelAction.then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true });
    modelAction
        .then(Transformer.Molecule.CreateSelectionFromQuery, { query: selectionQ, name: 'REA', silent: true }, { })
        .then(Transformer.Molecule.CreateLabels, {
            style: Bootstrap.Visualization.Labels.Style.createMoleculeStyle({ kind: 'Atom-Name' })
        });

    const pocketStyle: Bootstrap.Visualization.Molecule.Style<Bootstrap.Visualization.Molecule.BallsAndSticksParams> = {
        type: 'BallsAndSticks',
        taskType: 'Silent',
        params: { useVDW: false, atomRadius: 0.15, bondRadius: 0.07, detail: 'Automatic' },
        theme: { template: Bootstrap.Visualization.Molecule.Default.UniformThemeTemplate, colors: Bootstrap.Visualization.Molecule.Default.UniformThemeTemplate.colors!.set('Uniform', { r: 0.7, g: 0.7, b: 0.7 }), transparency: { alpha: 0.75 } },
        isNotSelectable: true
    }

    const pocketAction = modelAction
        .then(Transformer.Molecule.CreateSelectionFromQuery, { query: pocketQ, name: 'Pocket', silent: true }, { })
    
    pocketAction.then(Transformer.Molecule.CreateVisual, { style: pocketStyle }, { isHidden: true });
    pocketAction.then(Transformer.Molecule.CreateLabels, {
        style: Bootstrap.Visualization.Labels.Style.createMoleculeStyle({ kind: 'Residue-Name' })
    })

    let loadTask = plugin.applyTransform(action);

    // to access the model after it was loaded...
    loadTask.then(() => {
        let model = plugin.context.select('model')[0] as Bootstrap.Entity.Molecule.Model;
        if (!model) return;

        createBindingMap(plugin, model.props.model);

        // console.log(model.props.model);
        //Bootstrap.Command.Molecule.FocusQuery.dispatch(plugin.context, { model, query: selectionQ });
    });        
}