/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap {
    "use strict";
    
    function createMoleculeModelSelectInteraction(context: Context, what: { entity: Bootstrap.Entity.Any, query: Core.Structure.Query.Source }) {
        if (!Utils.Molecule.findModelOrSelection(what.entity)) {
            console.warn('Select: Trying to create a selection event on a non-molecule related entity, ignoring...');
            return;
        }        
        let q = Utils.Molecule.getModelAndIndicesFromQuery(what.entity, what.query);
        if (!q || !q.indices.length) return;
        
        Event.Visual.VisualSelectElement.dispatch(context, Interactivity.Info.selection(what.entity, q.indices));
    }
 
    export function initEventsAndCommands(context: Context) {
        
        Command.Entity.SetCurrent.getStream(context).subscribe(e => Entity.setCurrent(e.data as Entity.Any));
        Command.Entity.SetVisibility.getStream(context).subscribe(e => Entity.setVisibility(e.data.entity, e.data.visible));
        Command.Entity.ToggleExpanded.getStream(context).subscribe(e => Entity.toggleExpanded(e.data));
        Command.Tree.RemoveNode.getStream(context).subscribe(e => context.select(e.data).forEach(n => Tree.remove(n)));
        Command.Tree.ApplyTransform.getStream(context).subscribe(e => { (e.data.isUpdate ? e.data.transform.update(context, e.data.node) : e.data.transform.apply(context, e.data.node)).run() });
                
        Event.Tree.NodeAdded.getStream(context).subscribe(e => {
            let vis = (e.data.parent as Entity.Any).state.visibility;
            let visible = vis !== Entity.Visibility.None;
            Entity.setVisibility(e.data, visible);
            
            if (Entity.isClass(e.data, Entity.BehaviourClass)) {
                let b = e.data as Entity.Behaviour.Any;
                b.props.behaviour.register(b);
            }
        });
        Event.Tree.NodeRemoved.getStream(context).subscribe(e => {
            Entity.updateVisibilityState(e.data.parent);
            
            if (Entity.isClass(e.data, Entity.BehaviourClass)) {
                let b = e.data as Entity.Behaviour.Any;
                b.props.behaviour.dispose();
            }
        });
                
        Event.Visual.VisualHoverElement.getStream(context)        
            .distinctUntilChanged(e => e.data, Interactivity.interactivityInfoEqual)
            .map(e => Interactivity.Molecule.transformInteraction(e.data))
            .distinctUntilChanged(e => e, (x, y) => x === y)
            .subscribe(info => Event.Molecule.ModelHighlight.dispatch(context, info));
            
        Event.Visual.VisualSelectElement.getStream(context)
            .distinctUntilChanged(e => e.data, Interactivity.interactivityInfoEqual)
            .map(e => Interactivity.Molecule.transformInteraction(e.data))            
            .distinctUntilChanged(e => e, (x, y) => x === y)
            .subscribe(info => Event.Molecule.ModelSelect.dispatch(context, info));           
        
        Command.Molecule.CreateSelectInteraction.getStream(context).subscribe(e => createMoleculeModelSelectInteraction(context, e.data));
        
    }
    
}