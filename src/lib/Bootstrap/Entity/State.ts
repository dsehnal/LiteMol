/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Entity {
    "use strict";
  
    export function nodeUpdated(e: Any) {
        if (!e.tree) return;
        Event.Tree.NodeUpdated.dispatch(e.tree.context, e);
        if (e.tree.context.currentEntity === e) {
            Event.Entity.CurrentChanged.dispatch(e.tree.context, e);
        }     
    }
  
    export function toggleExpanded(e: Entity.Any) {
        let s: Entity.State = { isCollapsed: !e.state.isCollapsed }
        Tree.Node.withState(e, s);   
        nodeUpdated(e);     
    }
        
    export function setCurrent(e: Entity.Any) {    
        let old = e.tree!.context.currentEntity;        
        if (old === e || (e && e.isHidden)) {
            return;
        }
        let n = e.parent;
        while (n.parent !== n) { 
            if (n.isHidden) {
                return;
            } 
            n = n.parent; 
        }
        
        e.tree!.context.currentEntity = e; 
        if (old) {
            Tree.Node.update(old);
            nodeUpdated(old);
        }
        if (e) {
            Tree.Node.update(e);
            nodeUpdated(e);
        }
        Event.Entity.CurrentChanged.dispatch(e.tree!.context, e);
        if (old) Tree.updatePath(old);
        Tree.updatePath(e.parent);
    }
    
    // export function forceUpdate(e: Entity.Any) {
    //     if (!e.tree) return;
    //     Event.Tree.NodeUpdated.dispatch(e.tree.context, e);
    //     if (e.tree.context.currentEntity === e) {
    //         Event.Entity.CurrentChanged.dispatch(e.tree.context, e);
    //     }
    // } 
    
    export function updateVisibilityState(entity: Any) {
        if (!entity) return;
        
        let fullCount = 0;
        let noneCount = 0;
        for (let n of entity.children) {
            let s = n.state.visibility;
            if (s === Visibility.Full) fullCount++;
            else if (s === Visibility.None) noneCount++;
        }
        
        let visibility: Entity.Visibility;
        if (fullCount === entity.children.length) visibility = Visibility.Full;
        else if (noneCount === entity.children.length) visibility = Visibility.None;
        else visibility = Entity.Visibility.Partial;
        
        if (visibility !== entity.state.visibility) {
            let s: State = { visibility };
            Tree.Node.withState(entity, s);
            nodeUpdated(entity);
        } 
        if (entity.parent !== entity) updateVisibilityState(entity.parent);
    }
    
    export function setVisibility(entity: Any, visible: boolean) {       
        if (!entity) return;
        
        let newState = visible ? Visibility.Full : Visibility.None;
        Tree.Node.forEach(entity, n => {
            let v = n.state.visibility;
            if (v !== newState) {
                let s: State = { visibility: newState };
                Tree.Node.withState(n, s);
                nodeUpdated(n);
            }
        });    
        
        updateVisibilityState(entity.parent); 
    }
}