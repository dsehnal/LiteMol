/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Behaviour.Molecule {
    "use strict";
    
    
    import Query = Core.Structure.Query;
    import Transforms = Entity.Transformer;
    export function ShowInteractionOnSelect(radius: number) {
        
        return (context: Context) => {
            let lastRef: string = void 0;
            
            let ligandStyle: Visualization.Molecule.Style<Visualization.Molecule.BallsAndSticksParams> = {
                type: 'BallsAndSticks',
                computeOnBackground: true,
                params: { useVDW: true, vdwScaling: 0.25, bondRadius: 0.13, detail: 'Automatic' },
                theme: { template: Visualization.Molecule.Default.ElementSymbolThemeTemplate, colors: Visualization.Molecule.Default.ElementSymbolThemeTemplate.colors.set('Bond', { r:1, g: 0, b: 0 }), transparency: { alpha: 0.4 } },
                isNotSelectable: true
            } 
                
            let ambStyle: Visualization.Molecule.Style<Visualization.Molecule.BallsAndSticksParams> = {
                type: 'BallsAndSticks',
                computeOnBackground: true,
                params: { useVDW: false, atomRadius: 0.15, bondRadius: 0.07, detail: 'Automatic' },
                theme: { template: Visualization.Molecule.Default.UniformThemeTemplate, colors: Visualization.Molecule.Default.UniformThemeTemplate.colors.set('Uniform', { r: 0.4, g: 0.4, b: 0.4 }), transparency: { alpha: 0.75 } },
                isNotSelectable: true
            }             
            
            context.behaviours.select.subscribe(info => {
                if (lastRef) {
                    Command.Tree.RemoveNode.dispatch(context, lastRef);
                    lastRef = void 0;
                }
                
                if (!info.entity || !info.visual) return;
                
                let ligandQ = Query.atomsFromIndices(info.elements).wholeResidues();
                let ambQ = Query.atomsFromIndices(info.elements).wholeResidues().ambientResidues(radius);
                
                let ref = Utils.generateUUID();
                let action = Tree.Transform.build().add(info.visual, Transforms.Basic.CreateGroup, { label: 'Interaction' }, { ref, isHidden: true });
                lastRef = ref;
                
                action.then(Transforms.Molecule.CreateSelectionFromQuery, { query: ambQ, name: 'Ambience', silent: true, inFullContext: true }, { isBinding: true })
                    .then(<Bootstrap.Tree.Transformer.To<Entity.Molecule.Visual>>Transforms.Molecule.CreateVisual, { style: ambStyle });
                action.then(Transforms.Molecule.CreateSelectionFromQuery, { query: ligandQ, name: 'Ligand', silent: true, inFullContext: true }, { isBinding: true })
                    .then(<Bootstrap.Tree.Transformer.To<Entity.Molecule.Visual>>Transforms.Molecule.CreateVisual, { style: ligandStyle });
                    
                Tree.Transform.apply(context, action).run(context);
                
            });        
        }
    }
    
    export function HighlightElementInfo(context: Context) {        
        context.highlight.addProvider(info => {
            if (!info.entity || !(Tree.Node.is(info.entity, Entity.Molecule.Model) || Tree.Node.is(info.entity, Entity.Molecule.Selection))) return undefined;       
            let data = Interactivity.Molecule.transformInteraction(info);
            return Interactivity.Molecule.formatInfo(data);
        });        
    }
    
    export function DistanceToLastClickedElement(context: Context) {
        let lastInfo: Interactivity.Info = undefined;
        let lastSel: string = undefined;      
        let lastModel: Core.Structure.MoleculeModel = undefined;  
        context.behaviours.click.subscribe(info => {
              
            if (!info.entity || !(Tree.Node.is(info.entity, Entity.Molecule.Model) || Tree.Node.is(info.entity, Entity.Molecule.Selection)) || !info.elements || !info.elements.length) {
                lastInfo = undefined;
                lastModel = undefined;
                lastSel = undefined;
            } else {
                lastInfo = info;
                let m = Utils.Molecule.findModel(info.entity);
                if (!m) {
                    lastInfo = undefined;
                    lastModel = undefined;
                    lastSel = undefined;
                } else {
                    lastModel = m.props.model;
                    lastSel = Interactivity.Molecule.formatInfoShort(Interactivity.Molecule.transformInteraction(info));
                }
            }
        });
        
        context.highlight.addProvider(info => {
            if (!info.entity || !(Tree.Node.is(info.entity, Entity.Molecule.Model) || Tree.Node.is(info.entity, Entity.Molecule.Selection)) || !info.elements || !info.elements.length) return undefined;    
            if (!lastInfo) return undefined;
            
            let m = Utils.Molecule.findModel(info.entity);
            if (!m) return undefined;
            
            let dist = Utils.Molecule.getDistanceSet(lastModel, lastInfo.elements, m.props.model, info.elements);
            if (dist < 0.0001) return undefined;
            return `<span><b>${Utils.round(dist, 2)} \u212B</b> from <b>${lastSel}</b></span>`;
        });  
        
    } 
    
}