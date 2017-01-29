/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Tree {
    "use strict";
    
    export interface Node<Props, State, TypeInfo> {        
        id: number,    
        version: number,
        index: number,
        ref: string,       
        tag: any, 
        type: Node.Type<TypeInfo, Props, this>,        
        transform: Transform<any, this, any>,
        tree: Tree<Node.Any> | undefined,
        props: Props,
        state: State,
        isHidden: boolean,        
        parent: Node.Any,
        children: Node.Any[]
    };
    
    export module Node {
        
        export interface Any extends Node<any, any, any> { }        
        export const Null = {} as Any;
        
        export interface Type<Info, Props, T extends Node.Any> {
            id: string,
            info: Info,
            create(transform: Transform<any, T, any>, props: Props): T        
        }
        
        export type TypeOf<T extends Any> = Type<any, any, T>
        export type AnyType = Type<any, any, Any>
        
        export function is(e: Any, t: AnyType) {
            return e && e.type === t;
        }     
        
        export function hasAncestor(e: Any, a: Any) {
            if (!a) return false;
            while (true) {
                if (e === a) return true;                
                e = e.parent;
                if (!e || e === e.parent) return false;
            }
        }
        
        export function findAncestor(e: Any, t: AnyType) {
            if (!e) return void 0;
            let n = e.parent;
            while (true) {
                if (is(n, t)) return n;
                n = n.parent;
                if (n.parent === n) return void 0;
            }
        } 
        
        // search towards the root
        export function findClosestNodeOfType(e: Any, t: AnyType[]) {
            if (!e) return void 0;
            let n = e;
            while (true) {
                if (t.indexOf(n.type) >= 0) return n;
                n = n.parent;
                if (n.parent === n) {                    
                    return t.indexOf(n.type) >= 0 ? n : void 0;
                }
            }
        }
            
        let serialId = 0;
        export function createId() {
            return serialId++;
        }
                       
        export function update<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(e: T): T {
            e.version++;
            return e;
        }
        
        export function withProps<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T, props: Props) {
            let newProps = Utils.merge(n.props, props);
            if (newProps === n.props) return n;
            return update(n);
        }
        
        export function withState<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T, state: State) {
            let ns = Utils.merge(n.state, state);
            if (ns === n.state) return n;
            n.state = ns;
            return update(n);
        }
        
        export function addChild<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T, c: T) {
            c.index = n.children.length;
            n.children.push(c);
            return update(n);
        }
        
        export function removeChild<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T, child: T) {            
            let children = n.children;
            for (let i = child.index, _b = children.length - 1; i < _b; i++) {
                let c = children[i + 1];
                c.index--;
                children[i] = c;
            } 
            children.pop();            
            return update(n);
        }
                
        export function replaceChild<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T, oldChild: T, newChild: T) {
            if (!newChild) return removeChild(n, oldChild);
            newChild.index = oldChild.index;
            n.children[newChild.index] = newChild; 
            return update(n);
        }
                
        export function forEach<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T, f: (n: T) => void) {
            for (let c of n.children) forEach(c, f);
            f(n);
        }
        
         export function forEachPreorder<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T, f: (n: T) => void) {
            f(n);
            for (let c of n.children) forEach(c, f);
        }
        
        export function collect<T extends Node<Props, State, TypeInfo>, Props, State, TypeInfo>(n: T): T[] {
            let nodes: T[] = [];
            forEach(n, c => nodes.push(c));
            return nodes;
        }
        
        export function isHidden(e: Any) {     
            if (e.isHidden) return true;   
            let n = e.parent;
            if (!n) return e.isHidden;
            while (n.parent !== n) { 
                if (n.isHidden) {
                    return true;
                } 
                n = n.parent; 
                if (!n) return false;
            }
            
            return false;
        }
    }
    
}