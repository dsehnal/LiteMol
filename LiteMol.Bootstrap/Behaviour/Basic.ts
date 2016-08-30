/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Behaviour {
    "use strict";
    
    
    export interface Dynamic {
        dispose(): void;
        register(behaviour: Entity.Behaviour.Any): void;
    }  
    
    //////////////////////////////////////////////////
    
    export function SetEntityToCurrentWhenAdded(context: Context) {
        Event.Tree.NodeAdded.getStream(context).subscribe(ev => {
            let e = ev.data as Entity.Any;
            if (e && (e.transform.isUpdate || e.type.traits.isSilent)) return;
            Command.Entity.SetCurrent.dispatch(context, e);
        });
    }   
            
    export function CreateVisualWhenModelIsAdded(context: Context) {
        Event.Tree.NodeAdded.getStream(context).subscribe(e => {
            if (!Tree.Node.is(e.data, Entity.Molecule.Model) || (e.data as Entity.Any).isHidden) {
                return;
            } 
            Command.Tree.ApplyTransform.dispatch(context, { node: e.data, transform: Entity.Transformer.Molecule.CreateMacromoleculeVisual.create(Entity.Transformer.Molecule.CreateMacromoleculeVisual.info.defaultParams(context)) }) 
        });
    }    
    
    export function ApplySelectionToVisual(context: Context) {        
        Event.Tree.NodeAdded.getStream(context).subscribe(ev => {
            let e = ev.data;
            if (Entity.isMoleculeSelection(e) && Entity.isVisual(e.parent)) {
                let s = e as Entity.Molecule.Selection;
                let v = <any>e.parent as Entity.Molecule.Visual;                
                v.props.model.applySelection(s.props.indices, LiteMol.Visualization.Selection.Action.Select);
            } 
        });          
        Event.Tree.NodeRemoved.getStream(context).subscribe(ev => {
            let e = ev.data;
            if (Entity.isMoleculeSelection(e) && Entity.isVisual(e.parent)) {
                let s = e as Entity.Molecule.Selection;
                let v = <any>e.parent as Entity.Molecule.Visual;                
                v.props.model.applySelection(s.props.indices, LiteMol.Visualization.Selection.Action.RemoveSelect);
            } 
        });        
    }
    
    export function ApplyInteractivitySelection(context: Context) {        
        let latestIndices: number[] = undefined;
        let latestModel: LiteMol.Visualization.Model = undefined;
        context.behaviours.click.subscribe(info => {             
             if (latestModel) {
                 latestModel.applySelection(latestIndices,  LiteMol.Visualization.Selection.Action.RemoveSelect);
                 latestModel = undefined;
                 latestIndices = undefined;
             }                    
             if (!info.entity || !info.visual) return;
             
             latestModel = info.visual.props.model;
             latestIndices = info.elements;
             latestModel.applySelection(latestIndices,  LiteMol.Visualization.Selection.Action.Select);                          
        });           
    }

    export function UnselectElementOnRepeatedClick(context: Context) {
        let latest: Interactivity.Info = null;
        Event.Visual.VisualSelectElement.getStream(context).subscribe(e => {            
            if (e.data.visual && !e.data.visual.props.isSelectable) return;

            if (latest && latest.entity && Interactivity.interactivityInfoEqual(e.data, latest)) {
                latest = null;
                Event.Visual.VisualSelectElement.dispatch(context, {});
            } else {
                latest = e.data;
            }
        });
    }
    
    const center = { x: 0, y: 0, z: 0 };
    function update(context: Context, info: Interactivity.Info) {
        if (!info.entity || !(Tree.Node.is(info.entity, Entity.Molecule.Model) || Tree.Node.is(info.entity, Entity.Molecule.Selection))) return;            
        let model = (Tree.Node.findClosestNodeOfType(info.entity, [Entity.Molecule.Model]) as Entity.Molecule.Model).props.model;
        if (!model) return;
        let elems = info.elements;
        if (info.elements.length === 1) {
            elems = Utils.Molecule.getResidueIndices(model, info.elements[0]);
        }                                 
        let radius = Utils.Molecule.getCentroidAndRadius(model, elems, center);      
        if (info.elements.length === 1) {
            let a = info.elements[0];
            center.x = model.atoms.x[a];
            center.y = model.atoms.y[a];
            center.z = model.atoms.z[a];
        }     
        context.scene.camera.focusOnPoint(center, Math.max(radius, 7));
    }

    export function FocusCameraOnSelect(context: Context) {
        context.behaviours.click.subscribe(e => update(context, e));
    }
}