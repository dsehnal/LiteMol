/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Tree {
    "use strict";
    
    import Node = Tree.Node.Any;
    export interface Transform<A extends Node, B extends Node, P> {
        props: Transform.Props,                 
        transformer: Transformer<A, B, P>,
        params: P,
        isUpdate?: boolean,
        apply(context: Context, a: A): Core.Computation<B>
        update(context: Context, b: B): Core.Computation<B>
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
        
        
        export type Source = Instance | Instance[] | Builder;       
        
        class TransformImpl<A extends Node, B extends Node, P> implements Transform<A, B, P> {            
            private resolveAdd(a: A, b: B): B {                
                if (b === Node.Null) {
                    return b;
                }            
                b.ref = this.props.ref!;
                if (this.props.isHidden) b.isHidden = true;
                if (!b.tree) {
                    b.parent = a;
                    Tree.add(b);
                } 
                return b;
            }
            
            private resolveUpdate(context: Context, b: B, newB: B): B {
                if (newB === Node.Null) {
                    return newB;
                }
                
                let a = b.parent;
                newB.ref= this.props.ref!; 
                newB.parent = a; 
                newB.tag = b.tag;
                newB.state = b.state;
                if (this.props.isHidden) newB.isHidden = true;
                Tree.update<any>(context.tree, b, newB); 
                return newB;
            }
                        
            apply(context: Context, a: A): Core.Computation<B> {
                return Core.computation<B>(ctx => new Promise<B>(async (res, rej) => {
                    Event.Tree.TransformStarted.dispatch(context, this);
                    this.transformer.apply(context, a, this).run(context).then(b => {
                        res(this.resolveAdd(a, b));
                        Event.Tree.TransformFinished.dispatch(context, { transform: this });
                    }).catch(e => { 
                        rej(e);
                        Event.Tree.TransformFinished.dispatch(context, { transform: this, error: e });
                    })
                }));
            }
            
            update(context: Context, b: B): Core.Computation<B> {                
                return Core.computation<B>(ctx => new Promise((res, rej) => {                    
                    this.isUpdate = true;
                    this.props.ref = b.transform.props.ref;
                    
                    Event.Tree.TransformStarted.dispatch(context, this);         
                    if (b.transform.props.isBinding) this.props.isBinding = true;
                                          
                    this.transformer.update(context, b, this).run(context)
                        .then(newB => {
                            res(this.resolveUpdate(context, b, newB));
                            Event.Tree.TransformFinished.dispatch(context, { transform: this });
                        }).catch(e => {
                            rej(e);
                            Event.Tree.TransformFinished.dispatch(context, { transform: this, error: e });
                        });
                }));
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
                 
        function isInstance(arg: any): arg is Instance {
            return !!arg.selector;
        }
        
        function isBuilder(arg: any): arg is Builder {
            return !!arg.compile;
        }

        export function execute(ctx: Context, source: Source, isUpdate: boolean) {            
            let instances: Instance[];

            try {
                if (isInstance(source)) instances = [source];
                else if (isBuilder(source)) instances = source.compile();
                else instances = source;
            } catch (e) {
                return Core.Computation.reject<void>(e);
            }

            return Core.computation<void>(async () => {
                for (let i of instances) {
                    let xs = ctx.select(i.selector);
                    for (let x of xs) {
                        try {
                            await (isUpdate ? i.transform.update(ctx, x) : i.transform.apply(ctx, x)).run();
                        } catch (e) {
                        }
                    }
                }
            });
        }
        
        export function apply(ctx: Context, source: Source) {            
            return execute(ctx, source, false);
        }
        
        export function update(ctx: Context, source: Source) {            
            return execute(ctx, source, true);
        }
    }
}