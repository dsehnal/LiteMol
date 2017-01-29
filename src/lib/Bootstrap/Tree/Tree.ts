/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap {
    "use strict";
    
    export interface Tree<T extends Tree.Node.Any> {
        refs: Core.Utils.FastMap<string, T[]>,
        root: T,
        context: Context
    }
    
    export namespace Tree {
        
        export type Any = Tree<Node.Any>
                        
        export function create<T extends Node.Any>(context: Context, root: T): Tree<T> {         
            let tree = <Tree<T>>{
                version: 0,
                refs: Core.Utils.FastMap.create<string, T[]>(),
                nodes: Core.Utils.FastSet.create<number>(),
                root,                
                context
            };
            root.parent = root;            
            root.tree = tree;
            return tree;
        }
        
        function _addRef<T extends Node.Any>(entity: T) {
            if (!entity.tree) return;
            let refs = entity.tree.refs.get(entity.ref);
            if (!refs) {
                entity.tree!.refs.set(entity.ref, [entity]);
            } else {
                refs.push(entity);
            }
        }
        
        function addRef<T extends Node.Any>(entity: T) {
            Node.forEach(entity, e => _addRef(e))
        }
        
        function _removeRef<T extends Node.Any>(tree: Tree<T>, entity: T) {
            let refs = tree.refs.get(entity.ref);
            if (!refs) return;
            let i = refs.indexOf(entity);            
            if (i < 0) return;
            refs[i] = refs[refs.length - 1];
            refs.pop();
            if (!refs.length) tree.refs.delete(entity.ref);            
        }
                                  
        export function add<T extends Node.Any>(node: T) {
            if (!node.parent) throw 'Cannot add a node without a parent.';
            
            let tree = node.parent.tree;
            Node.forEach(node, e => e.tree = tree);
            Node.addChild(node.parent, node);
            addRef(node);
            Entity.nodeUpdated(node.parent);
            notifyAdded(node);              
        }
                
        function notifyAdded<T extends Node.Any>(node: T) {
            let ctx = node.tree!.context;     
            Node.forEachPreorder(node, n => {
                Event.Tree.NodeAdded.dispatch(ctx, n);
            });
        }
        
        export function update<T extends Node.Any>(tree: Tree<T>, old: T, e: T) {
            Node.replaceChild(old.parent, old, e);
            notifyRemoved(tree.context, old);
            
            Node.forEach(e, n => n.tree = tree);
            addRef(e);
            for (let c of e.children) {
                notifyAdded(c);
            }            
            Entity.nodeUpdated(e.parent);
            Event.Tree.NodeAdded.dispatch(tree.context, e);
            if (tree.context.currentEntity === old) {
                Entity.setCurrent(e);      
            }
        }
        
        export function updatePath(node: Node.Any) {
            if (!node) return;            
            let top: Node.Any | undefined = void 0;
            while (node !== node.parent) {
                top = node;
                Node.update(node);
                node = node.parent;
            }          
            if (top) Event.Tree.NodeUpdated.dispatch(node.tree!.context, top);            
        }
        
        function clearRoot<T extends Node.Any>(tree: Tree<T>) {            
            let children = tree.root.children;            
            tree.root.children = [];            
            Node.update(tree.root);
            Entity.nodeUpdated(tree.root);            
            tree.refs.clear();
            for (let c of children) {
                notifyRemoved(tree.context, c);
            }
            Command.Entity.SetCurrent.dispatch(tree.context, tree.root);
        } 
                
        function notifyRemoved<T extends Node.Any>(ctx: Context, node: T) {
            let current = ctx.currentEntity;
            let hasCurrent = false;
            Node.forEach(node, n => {
                _removeRef(<any>ctx.tree, n);
                Event.Tree.NodeRemoved.dispatch(ctx, n);                
                n.tree = void 0;
                if (n === current) hasCurrent = true;
            });
            return hasCurrent;
        }
        
        export function remove<T extends Tree.Node.Any>(node: T) {                        
            if (!node || !node.tree) return;    
            if (node.parent === node) { // root
                clearRoot(node.tree);
                return;
            }            

            let isHidden = Node.isHidden(node);
            let index = node.index;
            let parent = node.parent;    
            let ctx = node.tree.context;
                    
            Node.removeChild(parent, node);    
            Entity.nodeUpdated(parent);
            let hasCurrent = notifyRemoved(ctx, node);
            
            if (hasCurrent && !isHidden) {          
                let foundSibling = false;
                for (let i = index; i >= 0; i--) {
                    if (parent.children[i] && !Node.isHidden(parent.children[i])) {
                        Command.Entity.SetCurrent.dispatch(ctx, parent.children[i]);
                        foundSibling = true;
                        break;
                    }       
                }

                if (!foundSibling) {
                    Command.Entity.SetCurrent.dispatch(ctx, parent);
                }                    
            }
                     
            if (node.transform.props.isBinding && !parent.children.length) {
                remove(node.parent);
            }
        }
    }    
}