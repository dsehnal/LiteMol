/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
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
            if (e && (e.transform.isUpdate || e.type.info.traits.isSilent)) return;
            Command.Entity.SetCurrent.dispatch(context, e);
        });
    }   
    
    /** An ugly hack that will be removed when the time comes */
    export let SuppressCreateVisualWhenModelIsAdded:boolean = false;
    export function CreateVisualWhenModelIsAdded(context: Context) {
        Event.Tree.NodeAdded.getStream(context).subscribe(e => {
            if (SuppressCreateVisualWhenModelIsAdded || !Tree.Node.is(e.data, Entity.Molecule.Model) || (e.data as Entity.Any).isHidden) {
                return;
            }             
            let prms = Entity.Transformer.Molecule.CreateMacromoleculeVisual.info.defaultParams(context, e.data)!;
            Command.Tree.ApplyTransform.dispatch(context, { node: e.data, transform: Entity.Transformer.Molecule.CreateMacromoleculeVisual.create(prms) }) 
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

    function _applyInteractivitySelection(stream: Rx.Observable<Interactivity.Info>, context: Context) {        
        let latestIndices: number[] | undefined = void 0;
        let latestModel: LiteMol.Visualization.Model | undefined = void 0;
        stream.subscribe(info => {             
             if (latestModel) {
                 latestModel.applySelection(latestIndices!,  LiteMol.Visualization.Selection.Action.RemoveSelect);
                 latestModel = void 0;
                 latestIndices = void 0;
             }          
             if (Interactivity.isEmpty(info) || !Entity.isVisual(info.source)) return;
             
             latestModel = info.source.props.model;
             latestIndices = info.elements;
             latestModel!.applySelection(latestIndices!,  LiteMol.Visualization.Selection.Action.Select);                          
        });           
    }
    
    export function ApplyInteractivitySelection(context: Context) {
        _applyInteractivitySelection(context.behaviours.click, context);
    }

    export function FilteredApplyInteractivitySelection(filter: (e: Interactivity.Info, ctx: Context) => boolean) {
        return function(context: Context) {
            _applyInteractivitySelection(context.behaviours.click.filter(e => filter(e, context)), context);
        }
    }

    export function UnselectElementOnRepeatedClick(context: Context) {
        let latest: Interactivity.Info = Interactivity.Info.empty;
        Event.Visual.VisualSelectElement.getStream(context).subscribe(e => {    
            if (Interactivity.isEmpty(e.data) || Interactivity.isEmpty(latest)) {
                latest = e.data;
                return;
            } 

            if ((Tree.Node.hasAncestor(latest.source, e.data.source) || Tree.Node.hasAncestor(e.data.source, latest.source)) && Interactivity.interactivitySelectionElementsEqual(e.data, latest)) {
                latest = Interactivity.Info.empty;
                setTimeout(() => Event.Visual.VisualSelectElement.dispatch(context, Interactivity.Info.empty), 0);
            } else {
                latest = e.data;
            }
        });
    }
    
    const center = Core.Geometry.LinearAlgebra.Vector3.zero();
    function updateCameraModel(context: Context, info: Interactivity.Info.Selection) {       
        let model = Utils.Molecule.findModel(info.source)!.props.model;
        if (!model) return;

        let elems = info.elements;
        if (info.elements!.length === 1) {
            elems = Utils.Molecule.getResidueIndices(model, info.elements![0]);
        }                                 
        let radius = Utils.Molecule.getCentroidAndRadius(model, elems!, center);      
        if (info.elements!.length === 1) {
            let a = info.elements![0];
            center[0] = model.positions.x[a];
            center[1] = model.positions.y[a];
            center[2] = model.positions.z[a];
        }     
        context.scene.camera.focusOnPoint(Core.Geometry.LinearAlgebra.Vector3.toObj(center), Math.max(radius, 7));
    }

    function updateCameraVisual(context: Context, info: Interactivity.Info) {
        if (Interactivity.isEmpty(info) || info.source.type.info.typeClass !== 'Visual') return;
        let v = info.source as Entity.Visual.Any;
        let m = v.props.model;
        if (!m) return;
        let bs = m.getBoundingSphereOfSelection(info.elements);
        if (bs) {
            context.scene.camera.focusOnPoint(Core.Geometry.LinearAlgebra.Vector3.toObj(bs.center), Math.max(bs.radius, 7));
        } else {
            context.scene.camera.focusOnModel(m);
        }
    }

    function focusCamera(stream: Rx.Observable<Interactivity.Info>, context: Context) {
        stream.subscribe(e => {
            if (Interactivity.Molecule.isMoleculeModelInteractivity(e)) updateCameraModel(context, e);
            else updateCameraVisual(context, e);
        });
    }

    export function FocusCameraOnSelect(context: Context) {
        focusCamera(context.behaviours.click, context);
    }

    export function FilteredFocusCameraOnSelect(filter: (e: Interactivity.Info, ctx: Context) => boolean) {
        return function (context: Context) {
            focusCamera(context.behaviours.click.filter(e => filter(e, context)), context);
        }
    }
}