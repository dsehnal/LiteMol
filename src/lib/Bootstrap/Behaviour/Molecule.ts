/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Behaviour.Molecule {
    "use strict";
    
    import Query = Core.Structure.Query;
    import Transforms = Entity.Transformer;

    /** An ugly hack that will be removed when the time comes */
    export let SuppressShowInteractionOnSelect:boolean = false;

    export function ShowInteractionOnSelect(radius: number) {        
        return (context: Context) => {
            let lastRef: string | undefined = void 0;
            let ambRef: string | undefined = void 0;
            
            let ligandStyle: Visualization.Molecule.Style<Visualization.Molecule.BallsAndSticksParams> = {
                type: 'BallsAndSticks',
                taskType: 'Silent',
                params: { useVDW: true, vdwScaling: 0.25, bondRadius: 0.13, detail: 'Automatic' },
                theme: { template: Visualization.Molecule.Default.ElementSymbolThemeTemplate, colors: Visualization.Molecule.Default.ElementSymbolThemeTemplate.colors!.set('Bond', LiteMol.Visualization.Theme.Default.SelectionColor), transparency: { alpha: 0.4 } },
                isNotSelectable: true
            } 
                
            let ambStyle: Visualization.Molecule.Style<Visualization.Molecule.BallsAndSticksParams> = {
                type: 'BallsAndSticks',
                taskType: 'Silent',
                params: { useVDW: false, atomRadius: 0.15, bondRadius: 0.07, detail: 'Automatic' },
                theme: { template: Visualization.Molecule.Default.UniformThemeTemplate, colors: Visualization.Molecule.Default.UniformThemeTemplate.colors!.set('Uniform', { r: 0.4, g: 0.4, b: 0.4 }), transparency: { alpha: 0.75 } },
                isNotSelectable: true
            }

            function clean() {
                if (lastRef) {
                    Command.Tree.RemoveNode.dispatch(context, lastRef);
                    lastRef = void 0;
                    ambRef = void 0;
                }    
            }

            context.behaviours.click.subscribe(info => {
                if (SuppressShowInteractionOnSelect || Interactivity.isEmpty(info)) {
                    clean(); 
                    return;
                }

                if (info.source.ref === ambRef) {
                    let model = Utils.Molecule.findModel(info.source);
                    if (!model) return;

                    let query = Query.atomsFromIndices(info.elements);
                    setTimeout(Command.Molecule.CreateSelectInteraction.dispatch(context, { entity: model, query }), 0);
                    return;
                }

                let isSelectable = Entity.isVisual(info.source) ? info.source.props.isSelectable : true;
                if (!isSelectable) return;

                clean();

                if (Interactivity.isEmpty(info) || !Utils.Molecule.findModelOrSelection(info.source)) return;
                
                let ligandQ = Query.atomsFromIndices(info.elements).wholeResidues();
                let ambQ = Query.atomsFromIndices(info.elements).wholeResidues().ambientResidues(radius);
                
                let ref = Utils.generateUUID();
                let action = Tree.Transform.build().add(info.source, Transforms.Basic.CreateGroup, { label: 'Interaction' }, { ref, isHidden: true });
                lastRef = ref;

                ambRef = Utils.generateUUID();
                
                action.then(Transforms.Molecule.CreateSelectionFromQuery, { query: ambQ, name: 'Ambience', silent: true, inFullContext: true }, { isBinding: true })
                    .then(Transforms.Molecule.CreateVisual, { style: ambStyle }, { ref: ambRef });
                action.then(Transforms.Molecule.CreateSelectionFromQuery, { query: ligandQ, name: 'Ligand', silent: true, inFullContext: true }, { isBinding: true })
                    .then(Transforms.Molecule.CreateVisual, { style: ligandStyle });
                    
                Tree.Transform.apply(context, action).run();                
            });               
        }
    }
    
    export function HighlightElementInfo(context: Context) {        
        context.highlight.addProvider(info => {
            if (!Interactivity.Molecule.isMoleculeModelInteractivity(info)) return void 0;       
            let data = Interactivity.Molecule.transformInteraction(info);
            return Interactivity.Molecule.formatInfo(data);
        });        
    }
    
    export function DistanceToLastClickedElement(context: Context) {
        let lastInfo: Interactivity.Info = Interactivity.Info.empty;
        let lastSel: string | undefined = void 0;      
        let lastModel: Core.Structure.Molecule.Model | undefined = void 0;  
        context.behaviours.click.subscribe(info => {              
            if (!Interactivity.Molecule.isMoleculeModelInteractivity(info)) {
                lastInfo = Interactivity.Info.empty;
                lastModel = void 0;
                lastSel = void 0;
            } else {
                lastInfo = info;
                let m = Utils.Molecule.findModel(info.source);
                if (!m) {
                    lastInfo = Interactivity.Info.empty;
                    lastModel = void 0;
                    lastSel = void 0;
                } else {
                    lastModel = m.props.model;
                    lastSel = Interactivity.Molecule.formatInfoShort(Interactivity.Molecule.transformInteraction(info));
                }
            }
        });
        
        context.highlight.addProvider(info => {
            if (!Interactivity.Molecule.isMoleculeModelInteractivity(info)) return void 0;
            if (Interactivity.isEmpty(lastInfo)) return void 0;
            
            let m = Utils.Molecule.findModel(info.source);
            if (!m) return void 0;
            
            let dist = Utils.Molecule.getDistanceSet(lastModel!, lastInfo.elements, m.props.model, info.elements);
            if (dist < 0.0001) return void 0;
            return `<span><b>${Utils.round(dist, 2)} \u212B</b> from <b>${lastSel}</b></span>`;
        });  
        
    } 
    
}