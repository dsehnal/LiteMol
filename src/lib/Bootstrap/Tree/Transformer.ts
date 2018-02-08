/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
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
                return void 0;
            }
            
            apply(context: Context, node: A, t: Transform<A, B, P>): Task<B> {                                                
                if (this.info.isComposed) return this.transform(context, node, t);
                
                let a = this.getTarget(node);
                let validationFailed = this.validate(a, t);
                if (validationFailed) return validationFailed as Task<B>;  
                
                Event.Tree.TransformerApply.dispatch(context, { a, t });        

                return this.transform(context, a, t);                                 
            }
            
            update(context: Context, b: B, t: Transform<A, B, P>): Task<B> {
                let node = b.parent;                
                if (this.info.isComposed && !this.updater) return this.transform(context, node as A, t);
                
                if (this.updater) {
                    let paramValidation = this.validateParams(t);
                    if (paramValidation) return Task.reject(this.info.name, 'Normal', paramValidation);                     
                    let updated = this.updater(context, b, t);
                    if (updated) return updated;
                }              
                Event.Tree.TransformerApply.dispatch(context, { a: b.parent, t }); 
                return this.transform(context, node as A, t);
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
        

        export interface ActionWithContext<T> {
            action: Transform.Source, 
            context: T
        }

        function rejectAction<T>(
            actionContext: T,
            error: any, 
            context: Context, 
            reject: (e: any) => void,
            onError?: string | ((ctx: Context, actionCtx: T | undefined, error: any) => void)) {
            try {
                reject(error);
            } finally {
                if (onError) {
                    if (typeof onError === 'string') {
                        context.logger.error(onError);
                    } else {
                        setTimeout(() => onError.call(null, context, actionContext, error), 0);
                    }                                    
                }
            }
        }

        async function resolveAction<T>(
            src: ActionWithContext<T>, 
            context: Context, resolve: (e: Entity.Action) => void, reject: (e: any) => void,
            onDone?: string | ((ctx: Context, actionCtx: T | undefined) => void), 
            onError?: string | ((ctx: Context, actionCtx: T | undefined, error: any) => void)) {

            let hadError = false;
            try {
                await Tree.Transform.apply(context, src.action).run();
                try {
                    resolve(Tree.Node.Null)
                } finally {
                    if (onDone) {
                        if (typeof onDone === 'string') {
                            if (!hadError) context.logger.message(onDone);
                        } else {
                            setTimeout(() => onDone.call(null, context, src.context), 0);
                        }
                    }
                }
            } catch (e) {
                hadError = true;
                try {
                    reject(e);
                } finally {
                    if (onError) {
                        if (typeof onError === 'string') {
                            context.logger.error(onError);
                        } else {
                            setTimeout(() => onError.call(null, context, src.context, e), 0);
                        }                                    
                    }
                }
            }
        }

        export function action<A extends Node, B extends Node, P>(
            info: Info<A, B, P>, 
            builder: (ctx: Context, a: A, t: Transform<A, B, P>) => Transform.Source,
            onDone?: string, onError?: string): Transformer<A, B, P> {
            return create(info, (context, a, t) => {
                return Task.create<Entity.Action>(info.name, 'Background', ctx => new Promise((res, rej) => {
                    try {
                        let src = builder(context, a, t);
                        resolveAction<undefined>({ action: src, context: void 0 }, context, res, rej, onDone, onError);
                    } catch (e) {
                        rej(e);
                    }
                })) as Task<B>;
            }) 
        }

        export function actionWithContext<A extends Node, B extends Node, P, T>(
            info: Info<A, B, P>, 
            builder: (ctx: Context, a: A, t: Transform<A, B, P>) => ActionWithContext<T> | Promise<ActionWithContext<T>>,
            onDone?: (ctx: Context, actionCtx: T | undefined) => void, 
            onError?: (ctx: Context, actionCtx: T | undefined, error: any) => void): Transformer<A, B, P> {
            return create(info, (context, a, t) => {
                return Task.create<Entity.Action>(info.name, 'Background', ctx =>  new Promise((res, rej) =>{
                    try {
                        let src = builder(context, a, t);
                        if (Task.isPromise(src)) {
                            src
                                .then(s => resolveAction<T>(s, context, res, rej, onDone, onError))
                                .catch(e => rejectAction<undefined>(void 0, e, context, rej, onError));
                        } else {
                            resolveAction<T>(src, context, res, rej, onDone, onError)
                        }    
                    } catch (e) {
                        rej(e);
                    }                   
                })) as Task<B>;
            }) 
        }
    }
}