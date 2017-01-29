/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap {
    "use strict";
            
    import Computation = Core.Computation
    
    export class Task<A> {        
        private info: Task.Info;
        get id() { return this.info.id; }
        get reportTime() { return this.info.reportTime; } 

        run(context: Context) {
            return this.runWithContext(context).result;
        }
                                
        runWithContext(context: Context): Task.Running<A> {
            return new Task.Running(context, this.computation, this.info);
        }
        
        setReportTime(report: boolean) {
            this.info.reportTime = report;
            return this;
        }
                
        constructor(public name: string, public type: Task.Type, private computation: Computation<A>) {
            this.info = {
                id: serialTaskId++,
                name, 
                type,
                reportTime: false
            };
        }        
    }


    let serialTaskId = 0;        
    export module Task {        
        export let __DEBUG_MODE__ = false;

        export type Type = 'Normal' | 'Background' | 'Silent';
        
        export interface Info {
            id: number,
            type: Type,
            name: string,
            reportTime: boolean
        }

        export class Running<T> {
            private computationCtx: Computation.Context;
            
            result: Promise<T>;
                        
            tryAbort() {
                this.computationCtx.requestAbort();
            }

            private progressUpdated(progress: Computation.Progress) {                
                Event.Task.StateUpdated.dispatch(this.context, {
                    taskId: this.info.id,
                    type: this.info.type,
                    name: this.info.name,
                    message: Utils.formatProgress(progress),
                    abort: progress.requestAbort
                });
            }            
            
            private resolved() {                   
                try {
                    this.context.performance.end('task' + this.info.id); 
                    if (this.info.reportTime) {
                        let time = this.context.performance.time('task' + this.info.id);
                        if (this.info.type !== 'Silent') this.context.logger.info(`${this.info.name} finished in ${LiteMol.Core.Utils.PerformanceMonitor.format(time)}.`)
                    }
                } finally {            
                    Event.Task.Completed.dispatch(this.context, this.info.id);
                }                
            }
            
            private rejected(err: any) {                                
                this.context.performance.end('task' + this.info.id);
                this.context.performance.formatTime('task' + this.info.id);

                if (__DEBUG_MODE__) {
                    console.error(err);
                }
                                
                try {
                    if (this.info.type === 'Silent') {
                        if (err.warn)  this.context.logger.warning(`Warning (${this.info.name}): ${err.message}`);
                        else console.error(`Error (${this.info.name})`, err);
                    } else {
                        if (err.warn) {
                            this.context.logger.warning(`Warning (${this.info.name}): ${err.message}`);
                        } else {
                            let e = '' + err;
                            if (e.indexOf('Aborted') >= 0) this.context.logger.info(`${this.info.name}: Aborted.`); 
                            else this.context.logger.error(`Error (${this.info.name}): ${err}`);
                        }
                    }                       
                } catch (e) {
                    console.error(e);
                } finally {
                    Event.Task.Completed.dispatch(this.context, this.info.id);
                }
            }

            private run() {
                this.computationCtx = Computation.createContext();
                this.computationCtx.progress.subscribe(p => this.progressUpdated(p));
                Event.Task.Started.dispatch(this.context, this.info);        
                this.context.performance.start('task' + this.info.id); 

                this.result = this.computation.run(this.computationCtx);
                this.result.then(() => this.resolved()).catch(e => this.rejected(e));
            }
            
            constructor(private context: Bootstrap.Context, private computation: Computation<T>, private info: Info) {
                this.run();
            }
        }
                   
        export interface State {
            taskId: number, 
            type: Type, 
            name: string,
            message: string,
            abort?: () => void
        }
        
        export function create<A>(name: string, type: Type, computation: (ctx: Computation.Context) => Promise<A>) {
            return new Task<A>(name, type, Core.computation<A>(computation));
        }
        
        export function resolve<A>(name: string, type: Type, value: A) {
            return new Task<A>(name, type, Computation.resolve(value));
        }
        
        export function reject<A>(name: string, type: Type, reason: any) {
            return new Task<A>(name, type, Computation.reject(reason));
        }
        
        export function fromComputation<A>(name: string, type: Type, computation: Core.Computation<A>): Task<A> {
            return new Task<A>(name, type, computation);                                        
        }
        
        export function isPromise(t: any): t is Promise<any> {
            return t.then && t.catch;
        } 
    }
}
    