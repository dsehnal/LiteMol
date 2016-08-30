/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Tree {
    "use strict";
    
    import Node = Tree.Node.Any;
    export interface Transform<A extends Node, B extends Node, P> {
        props: Transform.Props,                 
        transformer: Transformer<A, B, P>,
        params?: P,
        isUpdate?: boolean,
        apply(context: Context, a: A): Task<B>
        update(context: Context, b: B): Task<B>
    }  
    
    export namespace Transform {
                        
        export type Any = Transform<Node, Node, any>       
        
        export interface Props {
            isHidden?: boolean,
            isBinding?: boolean,
            ref?: string,
        }
                
        export interface Instance {
            selector: Selector<Node>,
            transform: Any
        }
        
        
        export type Source = Instance | Instance[] | Builder.Any;       
        
        class TransformImpl<A extends Node, B extends Node, P> implements Transform<A, B, P> {
            
            private resolveAdd(ctx: Task.Context<B>, a: A, b: B) {                
                if (b === Node.Null) {
                    ctx.resolve(b);
                    return;
                }            
                b.ref = this.props.ref;
                if (this.props.isHidden) b.isHidden = true;
                if (!b.tree) {
                    b.parent = a;
                    Tree.add(b);
                } 
                ctx.resolve(b);
            }
            
            private resolveUpdate(ctx: Task.Context<B>, b: B, newB: B) {
                if (newB === Node.Null) {
                    ctx.resolve(newB);
                    return;
                }
                
                let a = b.parent;
                newB.ref= this.props.ref; 
                newB.parent = a; 
                newB.tag = b.tag;
                newB.state = b.state;
                if (this.props.isHidden) newB.isHidden = true;
                Tree.update<any>(ctx.context.tree, b, newB); 
                ctx.resolve(newB);
            }
                        
            apply(context: Context, a: A): Task<B> {       
                
                return Task.create<B>(this.transformer.info.name, 'Child', ctx => {
                    Event.Tree.TransformStarted.dispatch(context, this);
                    this.transformer.apply(context, a, this).run(ctx.context).then(b => {
                        this.resolveAdd(ctx, a, b);
                        Event.Tree.TransformFinished.dispatch(context, { transform: this });
                    }).catch(e => { 
                        ctx.reject(e);
                        Event.Tree.TransformFinished.dispatch(context, { transform: this, error: e });
                    })
                });
            }
            
            update(context: Context, b: B): Task<B> {                
                return Task.create<B>(this.transformer.info.name, 'Child', ctx => {
                    
                    this.isUpdate = true;
                    this.props.ref = b.transform.props.ref;
                    
                    Event.Tree.TransformStarted.dispatch(context, this);         
                    if (b.transform.props.isBinding) this.props.isBinding = true;
                                          
                    this.transformer.update(context, b, this).run(context)
                        .then(newB => {
                            this.resolveUpdate(ctx, b, newB);
                            Event.Tree.TransformFinished.dispatch(context, { transform: this });
                        }).catch(e => {
                            ctx.reject(e);
                            Event.Tree.TransformFinished.dispatch(context, { transform: this, error: e });
                        });
                });
            }
            
            
            isUpdate = false;
            
            constructor(public params: P, public props: Transform.Props, public transformer: Transformer<A, B, P>) {
                
            }
        }
                
        export function create<A extends Node, B extends Node, P>(params: P, props: Props, transformer: Transformer<A, B, P>): Transform<A, B, P> {
            let p = Utils.shallowClone(props);
            if (!p.ref) p.ref = Utils.generateUUID();
            return new TransformImpl(params, p, transformer);
        }
         
        export function updateInstance<A extends Node, B extends Node, P>(ctx: Context, instance: Instance) {
            let xs = ctx.select(instance.selector);            
            let tasks = xs.map(x => () => instance.transform.update(ctx, <any>x));
            return Task.sequence(ctx, 'Update transform', 'Child', tasks, true);
        } 
         
        export function applyInstance<A extends Node, B extends Node, P>(ctx: Context, instance: Instance) {
            let xs = ctx.select(instance.selector);            
            let tasks = xs.map(x => () => instance.transform.apply(ctx, <any>x));
            return Task.sequence(ctx, 'Apply transform', 'Child', tasks, true);
        }
        
        function isInstance(arg: any): arg is Instance {
            return !!arg.selector;
        }
        
        function isBuilder(arg: any): arg is Builder.Any {
            return !!arg.compile;
        }
        
        export function apply(ctx: Context, source: Source) {            
            let instances: Instance[];
            
            try {
                if (isInstance(source)) instances = [source];
                else if (isBuilder(source)) instances = source.compile();
                else instances = source;
            } catch (e) {
                return Task.reject('Apply transforms', 'Child', e);
            }
            
            let tasks = instances.map(i => () => applyInstance(ctx, i));
            return Task.sequence(ctx, 'Apply transforms', 'Child', tasks, true);           
        }
        
        export function update(ctx: Context, source: Source) {            
            let instances: Instance[];
            
            try {
                if (isInstance(source)) instances = [source];
                else if (isBuilder(source)) instances = source.compile();
                else instances = source;
            } catch (e) {
                return Task.reject('Apply transforms', 'Child', e);
            }
            
            let tasks = instances.map(i => () => updateInstance(ctx, i));
            return Task.sequence(ctx, 'Apply transforms', 'Child', tasks, true);           
        }
    }
}