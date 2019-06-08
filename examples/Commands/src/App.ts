/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMolPluginInstance {
    
    // For the plugin CSS, look to Plugin/Skin
    // There is also an icon font in assets/font -- CSS path to it is in Plugin/Skin/LiteMol-plugin.scss
    // To compile the scss, refer to README.md in the root dir.
    
    import Plugin = LiteMol.Plugin;
    import Views = Plugin.Views;
    import Bootstrap = LiteMol.Bootstrap;
    import Entity = Bootstrap.Entity;
    
    // everything same as before, only the namespace changed.
    import Query = LiteMol.Core.Structure.Query;
    
    // You can look at what transforms are available in Bootstrap/Entity/Transformer
    // They are well described there and params are given as interfaces.    
    import Transformer = Bootstrap.Entity.Transformer;
    import Tree = Bootstrap.Tree;
    import Transform = Tree.Transform;        
    import LayoutRegion = Bootstrap.Components.LayoutRegion;
    import CoreVis = LiteMol.Visualization;
    import Visualization = Bootstrap.Visualization;
    
    // all commands and events can be found in Bootstrap/Event folder.
    // easy to follow the types and parameters in VSCode.
    
    // you can subsribe to any command or event using <Event/Command>.getStream(plugin.context).subscribe(e => ....)
    import Command = Bootstrap.Command;
    import Event = Bootstrap.Event;
    
    function addButton(name: string, action: () => void) {
        let actions = document.getElementById('actions') as HTMLDivElement;
        let button = document.createElement('button');
        button.innerText = name;
        button.onclick = action;        
        actions.appendChild(button);
    }

    function addSeparator() {
        let actions = document.getElementById('actions') as HTMLDivElement;
        actions.appendChild(document.createElement('hr'));
    }

    function addHeader(title: string) {
        let actions = document.getElementById('actions') as HTMLDivElement;
        let h = document.createElement('h4');
        h.innerText = title;
        actions.appendChild(h);
    }

    function addTextInput(id: string, value: string, placeholder?: string) {
        let actions = document.getElementById('actions') as HTMLDivElement;
        let input = document.createElement('input') as HTMLInputElement;
        input.id = id;
        input.type = 'text';
        input.placeholder = placeholder!;
        input.value = value;
        actions.appendChild(input);
    }

    function addHoverArea(title: string, mouseEnter: () => void, mouseLeave: () => void) {
        let actions = document.getElementById('actions') as HTMLDivElement;
        let div = document.createElement('div') as HTMLDivElement;
        div.innerText = title;
        div.className = 'hover-area';
        div.onmouseenter = () => {
            if (plugin) mouseEnter();
        }
        div.onmouseleave = () => {
            if (plugin) mouseLeave();
        }
        actions.appendChild(div);
    }
    
    let moleculeId = '1cbs';
    
    let plugin: Plugin.Controller;
    let interactivityTarget = document.getElementById('interactions')!;
    function showInteraction(type: string, i: Bootstrap.Interactivity.Molecule.SelectionInfo | undefined) {
        if (!i) { // can be undefined meaning "empty interaction"
            interactivityTarget.innerHTML = `${type}: nothing<br/>` + interactivityTarget.innerHTML;
            return;    
        }
        
        // you have access to atoms, residues, chains, entities in the info object.
        interactivityTarget.innerHTML = `${type}: ${i.residues[0].authName} ${i.residues[0].chain.authAsymId} ${i.residues[0].authSeqNumber}<br/>` + interactivityTarget.innerHTML;
    }
    
    // this applies the transforms we will build later
    // it results a promise-like object that you can "then/catch".
    function applyTransforms(actions: Tree.Transform.Source) {
        return plugin.applyTransform(actions);
    }
    
    function selectNodes(what: Tree.Selector<Bootstrap.Entity.Any>) {
        return plugin.context.select(what);
    }
    
    function cleanUp() {
        // the themes will reset automatically, but you need to cleanup all the other stuff you've created that you dont want to persist
        Command.Tree.RemoveNode.dispatch(plugin.context, 'sequence-selection');
    }

    addHeader('Create & Destroy');
    
    addButton('Create Plugin', () => {
        // you will want to do a browser version check here
        // it will not work on IE <= 10 (no way around this, no WebGL in IE10)
        // also needs ES6 Map and Set -- so check browser compatibility for that, you can try a polyfill using modernizr or something 
        plugin = create(document.getElementById('app')!);
                
        let select = Event.Molecule.ModelSelect.getStream(plugin.context).subscribe(e => showInteraction('select', e.data));
        // to stop listening, select.dispose();
        let highlight = Event.Molecule.ModelHighlight.getStream(plugin.context).subscribe(e => showInteraction('highlight', e.data));
        
        Command.Visual.ResetScene.getStream(plugin.context).subscribe(() => cleanUp());
        Command.Visual.ResetTheme.getStream(plugin.context).subscribe(() => cleanUp());
        
        // you can use this to view the event/command stream
        //plugin.context.dispatcher.LOG_DISPATCH_STREAM = true;
    });
    addButton('Destroy Plugin', () => { plugin.destroy(); plugin = <any>void 0; });

    addSeparator();
    addHeader('Layout');

    addButton('Show Controls', () => Command.Layout.SetState.dispatch(plugin.context, { hideControls: false }));
    addButton('Hide Controls', () => Command.Layout.SetState.dispatch(plugin.context, { hideControls: true }));
    addButton('Expand', () => Command.Layout.SetState.dispatch(plugin.context, { isExpanded: true }));
    addButton('Set Background', () => Command.Layout.SetViewportOptions.dispatch(plugin.context, { clearColor: CoreVis.Color.fromRgb(255, 255, 255) }));
    addSeparator();
    addButton('Collapsed Controls: Portrait', () => {
        let container = document.getElementById('app')! as HTMLElement;
        container.className = 'app-portrait';
        plugin.command(Command.Layout.SetState, { collapsedControlsLayout: Bootstrap.Components.CollapsedControlsLayout.Portrait, hideControls: false });
    });
    addButton('Collapsed Controls: Landscape', () => {
        let container = document.getElementById('app')! as HTMLElement;
        container.className = 'app-landscape';
        plugin.command(Command.Layout.SetState, { collapsedControlsLayout: Bootstrap.Components.CollapsedControlsLayout.Landscape, hideControls: false });
    });
    addButton('Collapsed Controls: Outside (Default)', () => {
        let container = document.getElementById('app')! as HTMLElement;
        container.className = 'app-default';
        plugin.command(Command.Layout.SetState, { collapsedControlsLayout: Bootstrap.Components.CollapsedControlsLayout.Outside, hideControls: false });
    });
    addSeparator();
    addButton('Control Regions: Hide Left and Bottom, Sticky Right', () => {
        plugin.command(Command.Layout.SetState, { 
            regionStates: { 
                [Bootstrap.Components.LayoutRegion.Left]: 'Hidden', 
                [Bootstrap.Components.LayoutRegion.Bottom]: 'Hidden',
                [Bootstrap.Components.LayoutRegion.Right]: 'Sticky' 
            }, 
            hideControls: false 
        });
    });
    addButton('Control Regions: Show All', () => {
        plugin.command(Command.Layout.SetState, { regionStates: { }, hideControls: false });
    });
    addSeparator();
    addButton('Components: Default', () => {
        plugin.instance.setComponents(DefaultComponents);
    });
    addButton('Components: Without Log', () => {
        plugin.instance.setComponents(NoLogComponents);
    });
    addButton('Fog Factor = 0.5', () => {
        plugin.context.scene.scene.updateOptions({ fogFactor: 0.5 });
    });
    addButton('Fog Factor = 1.0', () => {
        plugin.context.scene.scene.updateOptions({ fogFactor: 1.0 });
    });
    
    addSeparator();

    addButton('Toggle "Model" sub-tree', () => {
        const e = plugin.selectEntities('model')[0];
        if (!e) return;
        plugin.command(Bootstrap.Command.Entity.ToggleExpanded, e);
    });

    addSeparator()
    addHeader('Basics');

    addButton('Load Molecule', () => {
        
        let id = moleculeId;        
        // this builds the transforms needed to create a molecule
        let action = Transform.build()
            .add(plugin.context.tree.root, Transformer.Data.Download, { url: `https://www.ebi.ac.uk/pdbe/static/entry/${id}_updated.cif`, type: 'String', id })
            .then(Transformer.Data.ParseCif, { id }, { isBinding: true })
            .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { isBinding: true })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false, ref: 'model' })
            .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true, water: true });
             // can also add hetRef and waterRef; the refs allow us to reference the model and visual later.
        
        applyTransforms(action)
            //.then(() => nextAction())
            //.catch(e => reportError(e));
    });
    
    addButton('Load Ligand', () => {
        // in the ligand instance, you will want to NOT include Bootstrap.Behaviour.ShowInteractionOnSelect(5) 
        
        
        let ligandStyle: Visualization.Molecule.Style<Visualization.Molecule.BallsAndSticksParams> = {
            type: 'BallsAndSticks',
            params: { useVDW: true, vdwScaling: 0.25, bondRadius: 0.13, detail: 'Automatic' },
            theme: { template: Visualization.Molecule.Default.ElementSymbolThemeTemplate, colors: Visualization.Molecule.Default.ElementSymbolThemeTemplate.colors, transparency: { alpha: 1.0 } }
        } 
            
        let ambStyle: Visualization.Molecule.Style<Visualization.Molecule.BallsAndSticksParams> = {
            type: 'BallsAndSticks',
            params: { useVDW: false, atomRadius: 0.15, bondRadius: 0.07, detail: 'Automatic' },
            theme: { template: Visualization.Molecule.Default.UniformThemeTemplate, colors: Visualization.Molecule.Default.UniformThemeTemplate.colors!.set('Uniform', { r: 0.4, g: 0.4, b: 0.4 }), transparency: { alpha: 0.75 } }
        }   
        
        let ligandQ = Query.residues({ name: 'REA' }); // here you will fill in the whole info 
        let ambQ =  Query.residues({ name: 'REA' }).ambientResidues(5); // adjust the radius

        let id = '1cbs:REA'
        let url = `https://cs.litemol.org/1cbs/ligandInteraction?name=REA`; // here you will fill in the full server etc ...
        let action = Transform.build()
            .add(plugin.context.tree.root, Transformer.Data.Download, { url, type: 'String', id })
            .then(Transformer.Data.ParseCif, { id }, { isBinding: true })
            .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { isBinding: true })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false, ref: 'ligand-model' });
            
        action.then(Transformer.Molecule.CreateSelectionFromQuery, { query: ambQ, name: 'Ambience' }, { isBinding: true })
            .then(Transformer.Molecule.CreateVisual, { style: ambStyle });
        action.then(Transformer.Molecule.CreateSelectionFromQuery, { query: ligandQ, name: 'Ligand' }, { isBinding: true })
            .then(Transformer.Molecule.CreateVisual, { style: ligandStyle }, { ref: 'ligand-visual' });   
            
        applyTransforms(action)
            .then(() => {
                // we select the ligand to display the density around it if it's loaded
                Command.Molecule.CreateSelectInteraction.dispatch(plugin.context, { entity: selectNodes('ligand-visual')[0], query: Query.everything() })
            });
            //.catch(e => reportError(e));
    });
    
    addButton('Load Density', () => {
        
        let id = moleculeId;        
        // this builds the transforms needed to create a molecule
        let action = Transform.build()
            .add(plugin.context.tree.root, LiteMol.Viewer.PDBe.Data.DownloadDensity, { id }, { ref: 'density' })
        
        applyTransforms(action);
    });
    
    addButton('Toggle Density', () => {                       
        let density = selectNodes('density')[0];
        if (!density) return;        
        Command.Entity.SetVisibility.dispatch(plugin.context, { entity: density, visible: density.state.visibility === Bootstrap.Entity.Visibility.None });
    });
    
    function createSelectionTheme(color: CoreVis.Color) {
        // for more options also see Bootstrap/Visualization/Molecule/Theme
        let colors = LiteMol.Core.Utils.FastMap.create<string, CoreVis.Color>();
        colors.set('Uniform', CoreVis.Color.fromHex(0xffffff));
        colors.set('Selection', color);
        colors.set('Highlight', CoreVis.Theme.Default.HighlightColor);
        return Visualization.Molecule.uniformThemeProvider(<any>void 0, { colors });
    }
    
    addButton('Select, Extract, Focus', () => {            
        let visual = selectNodes('polymer-visual')[0] as any;
        if (!visual) return;
        
        let query = Query.sequence('1', 'A', { seqNumber: 10 }, { seqNumber: 25 });
        let theme = createSelectionTheme(CoreVis.Color.fromHex(0x123456));
        let action = Transform.build()
            .add(visual, Transformer.Molecule.CreateSelectionFromQuery, { query, name: 'My name' }, { ref: 'sequence-selection' })
            // here you can create a custom style using code similar to what's in 'Load Ligand'
            .then(Transformer.Molecule.CreateVisual, { style: Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
            
        applyTransforms(action).then(() => {                
            Command.Visual.UpdateBasicTheme.dispatch(plugin.context, { visual, theme });
            Command.Entity.Focus.dispatch(plugin.context, selectNodes('sequence-selection'))
            // alternatively, you can do this
            //Command.Molecule.FocusQuery.dispatch(plugin.context, { model: selectNodes('model')[0] as any, query })
        });
    });

    addButton('Color Sequences', () => {
        let model = plugin.selectEntities('model')[0] as Bootstrap.Entity.Molecule.Model;
        if (!model) return;

        const coloring: CustomTheme.ColorDefinition = {
            base: { r: 255, g: 255, b: 255 },
            entries: [
                { entity_id: '1', struct_asym_id: 'A', start_residue_number: 10, end_residue_number: 25, color: { r: 255, g: 128, b: 64 } },
                { entity_id: '1', struct_asym_id: 'A', start_residue_number: 40, end_residue_number: 60, color: { r: 64, g: 128, b: 255 } }
            ]
        }

        const theme = CustomTheme.createTheme(model.props.model, coloring);
        // instead of "polymer-visual", "model" or any valid ref can be used: all "child" visuals will be colored.
        CustomTheme.applyTheme(plugin, 'polymer-visual', theme); 
    });
    
    addButton('Focus Query',  () => {
        let model = selectNodes('model')[0] as any;
        if (!model) return;
        let query = Query.sequence('1', 'A', { seqNumber: 10 }, { seqNumber: 25 });    
        Command.Molecule.FocusQuery.dispatch(plugin.context, { model, query });
    });
    
    addButton('Color Chains', () => {
        
        let visual = selectNodes('polymer-visual')[0] as any;
        let model = selectNodes('model')[0] as any;
        if (!model || !visual) return;
        
        let colors = new Map<string, CoreVis.Color>();
        colors.set('A', CoreVis.Color.fromRgb(125, 169, 12));
        // etc.
        
        let theme = Visualization.Molecule.createColorMapThemeProvider(
            // here you can also use m.atoms.residueIndex, m.residues.name/.... etc.
            // you can also get more creative and use "composite properties"
            // for this check Bootstrap/Visualization/Theme.ts and Visualization/Base/Theme.ts and it should be clear hwo to do that.
            //
            // You can create "validation based" coloring using this approach as it is not implemented in the plugin for now.
            m => ({ index: m.data.atoms.chainIndex, property: m.data.chains.asymId }),  
            colors,
            // this a fallback color used for elements not in the set 
            CoreVis.Color.fromRgb(0, 0, 123))
            // apply it to the model, you can also specify props, check Bootstrap/Visualization/Theme.ts
            (model);
       
        Command.Visual.UpdateBasicTheme.dispatch(plugin.context, { visual, theme });
        // if you also want to color the ligands and waters, you have to safe references to them and do it manually.          
    });
    
    addButton('Highlight On', () => {        
        let model = selectNodes('model')[0] as any;
        if (!model) return;
        let query = Query.sequence('1', 'A', { seqNumber: 10 }, { seqNumber: 25 });        
        Command.Molecule.Highlight.dispatch(plugin.context, { model, query, isOn: true });      
    });
    
    addButton('Highlight Off', () => {
        let model = selectNodes('model')[0] as any;
        if (!model) return;
        let query = Query.sequence('1', 'A', { seqNumber: 10 }, { seqNumber: 25 });        
        Command.Molecule.Highlight.dispatch(plugin.context, { model, query, isOn: false });
    });
    
    addButton('Reset Theme, Sel, Highlight', () => {
        Command.Visual.ResetTheme.dispatch(plugin.context, void 0);
        cleanUp();  
    });

    import AQ = Query.Algebraic;
    addButton('Algebraic Query', () => {            
        let model = selectNodes('model')[0] as any;
        if (!model) return;
        
        //let query = AQ.query(AQ.sidechain);
        let query = AQ.query(AQ.equal(AQ.residueName, AQ.value('ALA')));
        let action = Transform.build()
            .add(model, Transformer.Molecule.CreateSelectionFromQuery, { query, name: 'Alg. query' }, { ref: 'alg-selection' })
            .then(Transformer.Molecule.CreateVisual, { style: Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
            
        applyTransforms(action);
    });

    addSeparator();

    addHeader('Multiple Models');

    addTextInput('models-pdbid', '1grm', '4 letter PDB id...');

    addButton('Clear, Download, and Parse', () => {
        let id = (((document.getElementById('models-pdbid') as HTMLInputElement).value) || '').trim().toLowerCase();     

        if (id.length !== 4) {
            console.log('id must be a 4 letter string.');
            return;
        }

        Bootstrap.Command.Tree.RemoveNode.dispatch(plugin.context, plugin.context.tree.root);

        // this builds the transforms needed to create a molecule
        let action = Transform.build()
            .add(plugin.context.tree.root, Transformer.Data.Download, { url: `https://www.ebi.ac.uk/pdbe/static/entry/${id}_updated.cif`, type: <'String'>'String', id })
            .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF }, { ref: 'molecule' })            
            
            //.then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false, ref: 'model' })
            //.then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true, water: true });
            // can also add hetRef and waterRef; the refs allow us to reference the model and visual later.
        
        applyTransforms(action)
            //.then(() => nextAction())
            //.catch(e => reportError(e));
    });

    addButton('Create All Models', () => {
        // this function can be called 'automatically' in applyTransforms(action).then(....) from 'Clear, Download, and Parse';

        let molecule = plugin.context.select('molecule' /* accessed by ref created in 'Clear, Download, and Parse' */)[0] as Bootstrap.Entity.Molecule.Molecule;

        if (!molecule) {
            console.log('Molecule not loaded.');
            return;
        }

        let count = molecule.props.molecule.models.length;
        let action = Transform.build();

        let colors = Bootstrap.Immutable.Map<string, LiteMol.Visualization.Color>()
            .set('Selection', LiteMol.Visualization.Theme.Default.SelectionColor)
            .set('Highlight', LiteMol.Visualization.Theme.Default.HighlightColor);

        for (let i = 0; i < count; i++) {

            // More styles in Bootstrap/Visualization/Molecule/Styles.ts
            let style: Bootstrap.Visualization.Molecule.Style<Bootstrap.Visualization.Molecule.DetailParams> = {
                type: 'Cartoons',
                params: { detail: 'Automatic' },
                theme: { 
                    template: Bootstrap.Visualization.Molecule.Default.UniformThemeTemplate, 
                    colors: colors.set('Uniform', LiteMol.Visualization.Molecule.Colors.DefaultPallete[i]),
                    transparency: { } 
                }
            }; 

            action
                .add(molecule, Transformer.Molecule.CreateModel, { modelIndex: i }, { isBinding: false, ref: 'model-' + i })
                .then(Transformer.Molecule.CreateVisual, { style }, { ref: 'model-visual-' + i });
        }
        
        applyTransforms(action);
    });

    addButton('Toggle Model 2 Visibility', () => {
        let entity = plugin.context.select('model-1' /* indexed from 0 */)[0];
        if (!entity) return;

        Bootstrap.Command.Entity.SetVisibility.dispatch(plugin.context, { entity, visible: entity.state.visibility === Bootstrap.Entity.Visibility.Full ? false : true} );
    });

    addHoverArea('Hover to Highlight Model 1', () => {
        Bootstrap.Command.Entity.Highlight.dispatch(plugin.context, { entities: plugin.context.select('model-visual-0' /* indexed from 0 */), isOn: true });
    }, () => {
        Bootstrap.Command.Entity.Highlight.dispatch(plugin.context, { entities: plugin.context.select('model-visual-0' /* indexed from 0 */), isOn: false });
    });

    const DefaultComponents = [
        Plugin.Components.Visualization.HighlightInfo(LayoutRegion.Main, true),               
        Plugin.Components.Entity.Current('LiteMol', Plugin.VERSION.number)(LayoutRegion.Right, true),
        Plugin.Components.Transform.View(LayoutRegion.Right),
        Plugin.Components.Context.Log(LayoutRegion.Bottom, true),
        Plugin.Components.Context.Overlay(LayoutRegion.Root),
        Plugin.Components.Context.Toast(LayoutRegion.Main, true),
        Plugin.Components.Context.BackgroundTasks(LayoutRegion.Main, true)
    ];

    const NoLogComponents = [
        Plugin.Components.Visualization.HighlightInfo(LayoutRegion.Main, true),               
        Plugin.Components.Entity.Current('LiteMol', Plugin.VERSION.number)(LayoutRegion.Right, true),
        Plugin.Components.Transform.View(LayoutRegion.Right),
        Plugin.Components.Context.Overlay(LayoutRegion.Root),
        Plugin.Components.Context.Toast(LayoutRegion.Main, true),
        Plugin.Components.Context.BackgroundTasks(LayoutRegion.Main, true)
    ];
             
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
                
                { transformer: LiteMol.Viewer.DataSources.DownloadMolecule, view: Views.Transform.Data.WithUrlIdField },
                { transformer: Transformer.Molecule.OpenMoleculeFromFile, view: Views.Transform.Molecule.OpenFile },                
                { transformer: Transformer.Data.Download, view: Views.Transform.Data.Download },
                { transformer: Transformer.Data.OpenFile, view: Views.Transform.Data.OpenFile },
                
                // this uses the custom view defined in the CustomTransformView.tsx
                //{ transformer: Transformer.Molecule.CoordinateStreaming.InitStreaming, view: Views.Transform.Molecule.InitCoordinateStreaming },
                { transformer: Transformer.Molecule.CoordinateStreaming.InitStreaming, view: LiteMol.Example.CoordianteStreamingCustomView },
                 
                // Raw data transforms
                { transformer: Transformer.Data.ParseCif, view: Views.Transform.Empty },
                { transformer: Transformer.Density.ParseData, view: Views.Transform.Density.ParseData },
                
                // Molecule(model) transforms
                { transformer: Transformer.Molecule.CreateFromMmCif, view: Views.Transform.Molecule.CreateFromMmCif },
                { transformer: Transformer.Molecule.CreateModel, view: Views.Transform.Molecule.CreateModel },
                { transformer: Transformer.Molecule.CreateSelection, view: Views.Transform.Molecule.CreateSelection },        
                                
                { transformer: Transformer.Molecule.CreateAssembly, view: Views.Transform.Molecule.CreateAssembly },
                { transformer: Transformer.Molecule.CreateSymmetryMates, view: Views.Transform.Molecule.CreateSymmetryMates },
                
                { transformer: Transformer.Molecule.CreateMacromoleculeVisual, view: Views.Transform.Empty },
                { transformer: Transformer.Molecule.CreateVisual, view: Views.Transform.Molecule.CreateVisual },
                
                // density transforms
                { transformer: Transformer.Density.CreateVisual, view: Views.Transform.Density.CreateVisual },
                { transformer: Transformer.Density.CreateVisualBehaviour, view: Views.Transform.Density.CreateVisualBehaviour },
                
                // Coordinate streaming            
                { transformer: Transformer.Molecule.CoordinateStreaming.CreateBehaviour, view: Views.Transform.Empty },
                
                // Validation report
                { transformer: LiteMol.Viewer.PDBe.Validation.DownloadAndCreate, view: Views.Transform.Empty },
                { transformer: LiteMol.Viewer.PDBe.Validation.ApplyTheme, view: Views.Transform.Empty }
            ],
            behaviours: [
                // you will find the source of all behaviours in the Bootstrap/Behaviour directory
                
                // keep these 2
                Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
                Bootstrap.Behaviour.FocusCameraOnSelect,
                
                // this colors the visual when a selection is created on it.
                Bootstrap.Behaviour.ApplySelectionToVisual,
                
                // you will most likely not want this as this could cause trouble
                //Bootstrap.Behaviour.CreateVisualWhenModelIsAdded,
                
                // this colors the visual when it's selected by mouse or touch
                Bootstrap.Behaviour.ApplyInteractivitySelection,
                
                // this shows what atom/residue is the pointer currently over
                Bootstrap.Behaviour.Molecule.HighlightElementInfo,

                // when the same element is clicked twice in a row, the selection is emptied
                Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
                
                // distance to the last "clicked" element
                Bootstrap.Behaviour.Molecule.DistanceToLastClickedElement,
                
                // when somethinh is selected, this will create an "overlay visual" of the selected residue and show every other residue within 5ang
                // you will not want to use this for the ligand pages, where you create the same thing this does at startup
                Bootstrap.Behaviour.Molecule.ShowInteractionOnSelect(5),                
                
                // this tracks what is downloaded and some basic actions. Does not send any private data etc.
                // While it is not required for any functionality, we as authors are very much interested in basic 
                // usage statistics of the application and would appriciate if this behaviour is used.
                Bootstrap.Behaviour.GoogleAnalytics('UA-77062725-1')
            ],            
            components: DefaultComponents,
            viewport: {
                // dont touch this either 
                view: Views.Visualization.Viewport,
                controlsView: Views.Visualization.ViewportControls
            },
            layoutView: Views.Layout, // nor this
            tree: {
                // or this 
                region: LayoutRegion.Left,
                view: Views.Entity.Tree
            }
        }

        let plugin = Plugin.create({ target, customSpecification, layoutState: { hideControls: true } });
        plugin.context.logger.message(`LiteMol Plugin Commands Example ${Plugin.VERSION.number}`);
        return plugin;
    }
    
}