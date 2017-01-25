/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap {
    "use strict";
        
    export interface Entity<Props extends { }> extends Tree.Node<Props & Entity.CommonProps, Entity.State, Entity.TypeInfo> {          
    }
        
    export namespace Entity {       
                
        export interface CommonProps {
            label: string;
            description?: string;
        }
        
        
        export const enum Visibility { Full, Partial, None }        
        export interface State { isCollapsed?: boolean; visibility?: Visibility; }
                
        export interface Any extends Entity<{}> { }    
        
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

        export interface TypeInfoBase {
            name: string;
            shortName: string;
            description: string;
            typeClass: TypeClass;
        }
                 
        export interface TypeInfo extends TypeInfoBase {            
            traits: TypeTraits;
        }
                        
        export interface Type<P> extends Tree.Node.Type<TypeInfo, P, Entity<P>> {
            create(transform: Tree.Transform<Any, Entity<P>, any>, props: P & CommonProps): Entity<P>        
        }                                
        export type AnyType = Type<{}>
        
        export const RootClass:TypeClass = 'Root';                
        export const GroupClass:TypeClass = 'Group';
        export const DataClass:TypeClass = 'Data';
        export const ObjectClass:TypeClass = 'Object';
        export const VisualClass:TypeClass = 'Visual';
        export const SelectionClass:TypeClass = 'Selection';
        export const ActionClass:TypeClass = 'Action';
        export const BehaviourClass:TypeClass = 'Behaviour';
                
        class TypeImpl<P> implements Type<P> {            
            create(transform: Tree.Transform.Any, props: P & CommonProps) {
                let ret = <Entity<P>>{    
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
                
                return Tree.Node.update(ret) as Entity<P>;
            }

            public info: TypeInfo;
            
            constructor(public id: string, infoBase: TypeInfoBase, traits: TypeTraits) {
                this.info = Utils.assign({}, infoBase, { traits }) as any;
            }
        }
        
        export function create<Props>(info: TypeInfoBase, traits?: TypeTraits): Type<Props> {
            return new TypeImpl(Utils.generateUUID(), info, traits ? traits : { }) as Type<Props>;
        }            
    }    
}