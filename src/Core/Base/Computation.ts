/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core {
    "use strict";
          
    export class Computation<A> {                                
        bind<B>(next: (r: A) => Computation<B>): Computation<B> {            
            return Computation.create(ctx => {
                this.run(ctx as any).result.then(a => {
                    next(a).run(ctx as any).result.then(ctx.resolve).catch(ctx.reject);
                }).catch(ctx.reject);
            });    
        }
        
        map<B>(f: (r: A) => B) {
            return Computation.create(ctx => {
                this.run(ctx).result.then(r => ctx.resolve(f(r))).catch(ctx.reject);
            })
        }
                
        run(ctx?: Computation.Context<A>): Computation.RunningComputation<A>  {     
            let context = ctx ? ctx : new Computation.Context<A>();    
            
            return {
                progress: context.progressStream,
                result: new Promise<A>((resolve, reject) => {
                    try {
                        context.__push(resolve, reject);
                        this.computation(context);
                    } catch (e) {
                        context.reject(e);
                    }
                })
            };
        }
                
        constructor(private computation: (ctx: Computation.Context<A>) => void) {
            
        }
    }
    
    export module Computation {
                
        export function create<A>(computation: (ctx: Context<A>) => void) {
            return new Computation(computation);
        }   
        
        export function resolve<A>(a: A) {
            return create(ctx => ctx.resolve(a));
        }

        export function schedule<T>(ctx: Context<any>, f: () => T, afterMs = 0) {
            return new LiteMol.Core.Promise<T>(res => ctx.schedule(() => {
                try {
                    res(f());
                } finally {
                    res(undefined);
                }
            }, afterMs));
        } 
                
        export interface ProgressInfo {
            message: string;
            isIndeterminate: boolean;
            current: number;
            max: number;
            requestAbort?: () => void;
        }
                    
        export class Context<A> {        
            schedule(action: () => void, afterMs = 0) {
                setTimeout(() => {
                    try {
                        action();
                    } catch (e) {
                        this.reject(e);
                    }
                }, afterMs);
            }
            
            private _abortRequested = false;
            get abortRequested() {
                return this._abortRequested;
            }
            
            
            setRequestAbort(abort?: () => void) {
                this.progress.requestAbort = abort;
            }
            
            private _abortRequest = () => this._abortRequested = true;        
            get abortRequest() { return this._abortRequest; } 
            
            private progressTick = new Rx.Subject<ProgressInfo>();
            private progress: ProgressInfo = { message: 'Working...', current: 0, max: 0, isIndeterminate: false, requestAbort: void 0 };
            progressStream = new Rx.BehaviorSubject<ProgressInfo>(this.progress);
            update(msg: string, abort?: () => void, current = NaN, max = NaN) {
                
                this.progress.message = msg;
                this.progress.requestAbort = abort;
                
                if (isNaN(current)) {
                    this.progress.isIndeterminate = true; 
                } else {
                    this.progress.isIndeterminate = false;         
                    this.progress.current = current;
                    this.progress.max = max; 
                }            
                
                this.progressTick.onNext(this.progress);           
            }
            
            private promiseStack: { resolve: (r: A) => void, reject: (err: any) => void }[] = [];
            __push(resolve: (r: A) => void, reject: (err: any) => void) {
                this.promiseStack.push({ resolve, reject });
            }            
            
            private _resolve(result: A) {
                let top = this.promiseStack.pop();
                if (!top) {
                    throw 'Bug in code somewhere, Computation.resolve/reject called too many times.'
                }
                top.resolve(result);
                if (!this.promiseStack.length) {
                    this.progressTick.onCompleted();
                    this.progressStream.onCompleted();
                }
            }
            
            private _reject(err: any) {
                let top = this.promiseStack.pop();
                if (!top) {
                    throw 'Bug in code somewhere, Computation.resolve/reject called too many times.'
                }
                top.reject(err);
                if (!this.promiseStack.length) {
                    this.progressTick.onCompleted();
                    this.progressStream.onCompleted();
                }
            }
            
            resolve = this._resolve.bind(this);
            reject = this._reject.bind(this);
            
            abort() {
                this.reject('Aborted.');
            }
                            
            constructor() {            
                this.progressTick.throttle(1000 / 30).subscribe(p => {
                    this.progressStream.onNext({ 
                        message: p.message, 
                        isIndeterminate: p.isIndeterminate, 
                        current: p.current, 
                        max: p.max, 
                        requestAbort: p.requestAbort
                    });
                })
            }
        }
        
        export interface RunningComputation<A> {
            progress: Rx.Observable<ProgressInfo>,
            result: Promise<A>
        }                  
    }
}