/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap {
    "use strict";
            
    
    export let serialTaskId = 0;        
    export class Task<A> {
        
        private _id = serialTaskId++;
        get id() { return this._id; }
        
        reportTime = false;
        
        bind<B>(name: string, type: Task.Type, next: (r: A) => Task<B>): Task<B> {            
            return Task.create(name, type, ctx => {
                this.run(ctx.context).then(a => {
                    next(a).run(ctx.context).then(ctx.resolve).catch(ctx.reject);
                }).catch(ctx.reject);
            });    
        }
        
        map<B>(name: string, type: Task.Type, f: (r: A) => B): Task<B> {
            return Task.create(name, type, ctx => {
                this.run(ctx.context).then(r => ctx.resolve(f(r))).catch(ctx.reject);
            })
        }
                        
        run(context: Context): Task.Running<A> {                 
            return new Task.Running((resolve, reject, setCtx) => {                
                Event.Task.Started.dispatch(context, this);        
                context.performance.start('task' + this.id); 
                let ctx = new Task.Context(context, this, resolve, reject);
                setCtx(ctx);
                try {    
                    this.task(new Task.Context(context, this, resolve, reject));
                } catch (e) {
                    ctx.reject(e);
                }
            });
        }
        
        setReportTime(report: boolean) {
            this.reportTime = report;
            return this;
        }
                
        constructor(public name: string, public type: Task.Type, private task: (ctx: Task.Context<A>) => void) {
        
        }        
    }
        
    export module Task {
        
        export class Running<T> {

            private promise: Promise<T>;
            private ctx: Context<T>;
            
            then(action: (r: T) => void) {
                return this.promise.then(action);
            }
            
            catch(action: (e: any) => void) {
                return this.promise.catch(action);
            }
                        
            discard() {
                this.ctx.discard();
            }
            
            constructor(p: (resolve: (v: T) => void, reject: (err: any) => void, setCtx: (ctx: Context<T>) => void) => void) {
                this.promise = new Promise<T>((res, rej) => p(res, rej, ctx => this.ctx = ctx));
            }
        }
                
        export type Type = 'Normal' | 'Background' | 'Silent' | 'Child';
        
        export function create<A>(name: string, type: Type, task: (ctx: Context<A>) => void) {
            return new Task(name, type, task);
        }
        
        export function resolve<A>(name: string, type: Type, value: A) {
            return create<A>(name, type, ctx => {
                ctx.resolve(value);
            })
        }
        
        export function reject<A>(name: string, type: Type, reason: any) {
            return create<A>(name, 'Normal', ctx => {
                ctx.reject(reason);
            })
        }
        
        export function fromComputation<A>(name: string, type: Type, computation: Core.Computation<A>): Task<A> {
            return create(name, type, ctx => {
                let comp = computation.run();
                comp.progress.subscribe(p => ctx.update(Utils.formatProgress(p), p.requestAbort));
                comp.result.then(r => ctx.resolve(r)).catch(e => ctx.reject(e));
            });                                        
        }
        
        export function sequencePromises<A>(promises: (() => Promise<A>)[], ignoreErrors = false): Promise<A[]> {
            
            return new Promise<A[]>((resolve, reject) => {                
                let ret: A[] = [];
                let next = (i: number) => {
                    if (i >= promises.length) {
                        resolve(ret);
                        return;
                    }                    
                    promises[i]().then(r => { ret.push(r); next(i + 1); }).catch((e) => {
                        if (ignoreErrors) {
                            next(i + 1);
                        } else {
                            reject(e);
                        }
                    });
                }                
                next(0);             
            });                        
        }
        
        export function sequence<A>(context: Bootstrap.Context, name: string, type: Type, tasks: (() => Task<A>)[], ignoreErrors = false): Task<A[]> {
                 
            return create(name, type, ctx => {                
                let ret: A[] = [];
                let next = (i: number) => {
                    if (i >= tasks.length) {
                        ctx.resolve(ret);
                        return;
                    }                    
                    tasks[i]().run(context).then(r => { ret.push(r); next(i + 1); }).catch((e) => {
                        if (ignoreErrors) {
                            next(i + 1);
                        } else {
                            ctx.reject(e);
                        }
                    });
                }                
                next(0);             
            });                        
        }
        
        export function guardedPromise<A>(context: Bootstrap.Context, promise: (resolve: (r: A) => void, reject: (err: any) => void) => void) {
            return new Promise<A>((resolve, reject) => {
               try {
                   promise(resolve, reject);
               } catch (e) {
                   context.logger.error(`Error (Generic): ` + e);
               }
            });
        }
        
        export function split(context: Bootstrap.Context, tasks: { stateUpdate: () => void, action: () => void }[]): Promise<void> {
            
            return guardedPromise<void>(context, (resolve, reject) => {
                
                let next = (i: number) => {
                    if (i >= tasks.length) {
                        resolve(void 0);
                        return;
                    }                    
                    
                    let t = tasks[i];
                    t.stateUpdate();
                    context.dispatcher.schedule(() => { 
                        t.action();
                        next(i + 1);
                    }, reject);
                }                
                next(0); 
            });
        }

        export function isPromise(t: any): t is Promise<any> {
            return t.then && t.catch;
        } 
        
        export class Context<A> {            
            
            private schedulingTime = 0;
            private scheduleId = 0;
            private abort: (() => void) | undefined = void 0;
            private discarded = false;
            
            discard() {
                try {
                    if (this.abort) {
                        this.abort();
                    }
                } catch (e) {
                    
                }
                this.discarded = true;
            }
            
            update(message: string, abort?: () => void) {                
                Event.Task.StateUpdated.dispatch(this.context, {
                    taskId: this.task.id,
                    type: this.task.type,
                    name: this.task.name,
                    message,
                    abort 
                });
                this.abort = abort;
            }
            
            schedule(action: () => void, timeout?: number) {
                let sId = this.scheduleId++;
                let pId = 'task' + this.task.id + '-' + sId;
                this.context.performance.start(pId);
                this.context.dispatcher.schedule(() => {
                    this.context.performance.end(pId);
                    this.schedulingTime += this.context.performance.time(pId);
                    action();
                }, e => { 
                    this.context.performance.end(pId);
                    this.reject(e);
                }, timeout);
                
            }
            
            private resolve_task(result: A) {                
                this.abort = void 0;
                if (this.discarded) {
                    this.reject('Discarded.');
                    return;
                }
                
                try {
                    this.context.performance.end('task' + this.task.id); 
                    if (this.task.reportTime) {
                        let time = this.context.performance.time('task' + this.task.id) - this.schedulingTime;
                        if (this.task.type !== 'Silent') this.context.logger.info(`${this.task.name} finished in ${LiteMol.Core.Utils.PerformanceMonitor.format(time)}.`)
                    }
                } finally {            
                    this._resolve(result);
                    Event.Task.Completed.dispatch(this.context, this.task.id);
                }                
            }
            
            private reject_task(err: any) {
                                
                this.abort = void 0;
                this.context.performance.end('task' + this.task.id);
                this.context.performance.formatTime('task' + this.task.id);
                                
                try {
                    if (!this.discarded) {                
                        if (this.task.type === 'Silent') {
                            if (err.warn)  this.context.logger.warning(`Warning (${this.task.name}): ${err.message}`);
                            else console.error(`Error (${this.task.name}): ${err}`, err);
                        } else if (this.task.type !== 'Child') {
                            if (err.warn) {
                                this.context.logger.warning(`Warning (${this.task.name}): ${err.message}`);
                            } else {
                                let e = '' + err;
                                if (e.indexOf('Aborted') >= 0) this.context.logger.info(`${this.task.name}: Aborted.`); 
                                else this.context.logger.error(`Error (${this.task.name}): ${err}`);
                            }
                        } else {
                            let e = '' + err;
                            if (!err.warn && e.indexOf('Aborted') < 0) console.log(err);
                        }
                    }
                } catch (e) {
                    console.log(e);
                } finally {
                    this._reject(err);
                    Event.Task.Completed.dispatch(this.context, this.task.id);
                }
            }
            
            resolve: (r: A) => void = this.resolve_task.bind(this);
            reject: (e: any) => void = this.reject_task.bind(this);
            
            constructor(public context: Bootstrap.Context, public task: Task<A>, private _resolve: (r: A) => void, private _reject: (err: any) => void ) {
                
            }
        }
                   
        export interface State {
            taskId: number, 
            type: Type, 
            name: string,
            message: string,
            abort?: () => void
        }
    }
}
    