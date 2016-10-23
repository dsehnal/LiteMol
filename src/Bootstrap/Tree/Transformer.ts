/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Tree {
    "use strict";
    
    import Node = Tree.Node.Any;
 
    export interface Transformer<A extends Node, B extends Node, P> {
        info: Transformer.Info<A, B, P>;
        apply(context: Context, a: A, t: Transform<A, B, P>): Task<B>
        update(context: Context, b: B, t: Transform<A, B, P>): Task<B>
        
        create(params: P, props?: Transform.Props): Transform<A, B, P>; 
    }
    
    export namespace Transformer {
        
        export type Any = Transformer<Node, Node, any>
        export type To<T extends Node> = Transformer<Node, T, any>
                
        export interface Info<A extends Node, B extends Node, P> {
            id: string,
            name: string,
            description: string,
            isUpdatable?: boolean,
            from: Tree.Node.TypeOf<A>[],
            to: Tree.Node.TypeOf<B>[],
            validateParams?: (params: P) => string[] | undefined, // return undefined if everything is fine, array of strings with issues otherwise
            defaultParams: (ctx: Context, e: A) => P | undefined,
            customController?: (ctx: Context, transformer: Transformer<A, B, P>, entity: Entity.Any) => Components.Transform.Controller<P>,
            isApplicable?: (e: A) => boolean,
            isComposed?: boolean     
        }
        
        class TransformerImpl<A extends Node, B extends Node, P> implements Transformer<A, B, P> {
            
            private getTarget(node: A) {
                let info = this.info;
                return (!info.from.length ? node : Node.findClosestNodeOfType(node, info.from)) as A;
            }
            
            private checkTypes(a: A, t: Transform<A, B, P>) {
                if (t.transformer !== this) {
                    return `The transform is calling an invalid transformer (got ${t.transformer.info.name}, expected ${this.info.name})`; 
                }                
                
                let info = this.info;
                if (info.from.length && info.from.indexOf(a.type) < 0) {
                    return `Transform (${info.name}): type error, expected '${info.from.map(t => t.info.name).join('/')}', got '${a.type.info.name}'.`;  
                }
                return void 0;
            }
            
            private validateParams(t: Transform<A, B, P>) {
                let info = this.info;
                if (info.validateParams) {
                    let issues = info.validateParams(t.params);
                    if (issues && issues.length > 0) {
                        return `Invalid params: ${issues.join(', ')}.`;
                    }
                }
                return void 0;
            }
            
            private validate(a: A, t: Transform<A, B, P>) {  
                let info = this.info;
                if (!a) return Task.reject(info.name, 'Normal', 'Could not find a suitable node to apply the transformer to.');                             
                let typeCheck = this.checkTypes(a, t);
                if (typeCheck) return Task.reject(info.name, 'Normal', typeCheck);                
                let paramValidation = this.validateParams(t);
                if (paramValidation) return Task.reject(info.name, 'Normal', paramValidation); 
            }
            
            apply(context: Context, node: A, t: Transform<A, B, P>): Task<B> {                                                
                if (this.info.isComposed) return this.transform(context, node, t);
                
                let a = this.getTarget(node);
                let validationFailed = this.validate(a, t);
                if (validationFailed) return validationFailed;  
                
                Event.Tree.TransformerApply.dispatch(context, { a, t });            
                                
                return this.transform(context, a, t);                                 
            }
            
            update(context: Context, b: B, t: Transform<A, B, P>): Task<B> {
                let node = b.parent;                
                if (this.info.isComposed && !this.updater) return this.transform(context, node, t);
                
                if (this.updater) {
                    let paramValidation = this.validateParams(t);
                    if (paramValidation) return Task.reject(this.info.name, 'Normal', paramValidation);                     
                    let updated = this.updater(context, b, t);
                    if (updated) return updated;
                }              
                Event.Tree.TransformerApply.dispatch(context, { a: b.parent, t }); 
                return this.transform(context, node, t);
            } 
            
            create(params: P, props?: Transform.Props): Transform<A, B, P>  {
                return Transform.create<A, B, P>(params, props ? props : {}, this);
            }
            
            constructor(
                public info: Transformer.Info<A, B, P>, 
                private transform: (ctx: Context, a: A, t: Transform<A, B, P>) => Task<B>, 
                private updater?: (ctx: Context, b: B, t: Transform<A, B, P>) => Task<B> | undefined) {
            }            
        }
        
        export function create<A extends Node, B extends Node, P>(
            info: Info<A, B, P>, 
            transform: (ctx: Context, a: A, t: Transform<A, B, P>) => Task<B>,
            updater?: (ctx: Context, b: B, t: Transform<A, B, P>) => Task<B> | undefined): Transformer<A, B, P> { 
            return new TransformerImpl(info, transform, updater);
        }

        export function internal<A extends Node, B extends Node, P>(
            id: string,
            from: Tree.Node.TypeOf<A>[],
            to: Tree.Node.TypeOf<B>[],
            transform: (ctx: Context, a: A, t: Transform<A, B, P>) => Task<B>
        ) {
            return create<Entity.Root, Entity.Root, {}>({
                id,
                name: id,
                description: '',
                from,
                to,
                validateParams: () => void 0,  
                defaultParams: () => ({ })
            }, transform);
        }
        
        export function action<A extends Node, B extends Node, P>(
            info: Info<A, B, P>, 
            builder: (ctx: Context, a: A, t: Transform<A, B, P>) => Transform.Source,
            doneMessage?: string): Transformer<A, B, P> {
            return create(info, (context, a, t) => {
                return Task.create<Entity.Action>(info.name, 'Background', ctx => {
                    let src = builder(context, a, t);
                    Tree.Transform.apply(context, src)
                        .run(context)
                        .then(r => {
                            if (doneMessage) {
                                context.logger.message(doneMessage);
                            }
                            ctx.resolve(Tree.Node.Null)
                        })
                        .catch(ctx.reject);                       
                });
            }) 
        }
    }
}