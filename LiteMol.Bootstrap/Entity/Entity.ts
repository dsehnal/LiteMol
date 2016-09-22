/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap {
    "use strict";
        
    export interface Entity<
        E extends Entity<E, T, Props>,
        T extends Entity.Type<T, E, Props>, 
        Props extends Entity.CommonProps>         
        extends Tree.Node<E, Props, Entity.State, T, Entity.TypeInfo> {                     
    }
        
    export namespace Entity {       
                
        export interface CommonProps {
            label: string;
            description?: string;
        }
        
        
        export const enum Visibility { Full, Partial, None }        
        export interface State { isCollapsed?: boolean; visibility?: Visibility; }
                
        export interface Any extends Entity<Any, AnyType, CommonProps> { }    
        
        export type Tree = Bootstrap.Tree<Any>
       
        export function isClass(e: Any, cls: TypeClass) {
            return e.type.info.typeClass === cls;
        }
        
        export function isTypeClass(e: AnyType, cls: TypeClass) {
            return e.info.typeClass === cls;
        }
                        
        export type TypeClass = 'Root' | 'Group' | 'Data' | 'Object' | 'Visual' | 'Selection' | 'Action' | 'Behaviour'
        export interface TypeTraits { 
            isFocusable?: boolean,
            isSilent?: boolean // silent types are not automatically selected
        }
                 
        export interface TypeInfo {            
            name: string;
            shortName: string;
            description: string;
            typeClass: TypeClass;
        }
                        
        export interface Type<T extends Type<T, E, P>, E extends Entity<E, T, P>, P extends CommonProps> extends Tree.Node.Type<TypeInfo, P, E> {
            traits: TypeTraits,
            create(transform: Tree.Transform<Any, E, any>, props: P): E        
        }                                
        export type AnyType = Type<any, Any, CommonProps>
        
        export const RootClass:TypeClass = 'Root';                
        export const GroupClass:TypeClass = 'Group';
        export const DataClass:TypeClass = 'Data';
        export const ObjectClass:TypeClass = 'Object';
        export const VisualClass:TypeClass = 'Visual';
        export const SelectionClass:TypeClass = 'Selection';
        export const ActionClass:TypeClass = 'Action';
        export const BehaviourClass:TypeClass = 'Behaviour';
                
        class TypeImpl implements Type<any, any, any> {            
            create(transform: Tree.Transform.Any, props: CommonProps) {
                let ret = <Any>{    
                    id: Tree.Node.createId(),
                    
                    version: 0,
                    index: 0,
                    ref: 'undefined',
                    tag: <any>void 0,
                    tree: <any>void 0,
                    props,
                    state: { isCollapsed: false, visibility: Visibility.Full },
                    isHidden: false,
                    transform: transform,
                    parent: <any>void 0,
                    children: [],                
                    type: <any>this
                }; 
                
                return Tree.Node.update(ret) as Any;
            }
            
            constructor(public id: string, public info: TypeInfo, public traits: TypeTraits) {
                
            }
        }
        
        export function create<E extends Any, T extends AnyType, Props extends CommonProps>(info: TypeInfo, traits?: TypeTraits): T {
            return new TypeImpl(Utils.generateUUID(), info, traits ? traits : { }) as T;
        }            
    }    
}