/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core {
    "use strict";
          
    export function computation<A>(c: (ctx: Computation.Context) => Promise<A>) {
        return new Computation(c);
    }

    export class Computation<A> {       
        run(ctx?: Computation.Context) {
            return this.runWithContext(ctx).result;
        }

        runWithContext(ctx?: Computation.Context): Computation.Running<A>  {     
            let context = ctx ? ctx as ContextImpl : new ContextImpl();    
            
            return {
                progress: context.progressStream,
                result: new Promise<A>(async (resolve, reject) => {
                    try {
                        context.started();
                        let result = await this.computation(context);
                        resolve(result);
                    } catch (e) {
                        if (Computation.PRINT_CONSOLE_ERROR) console.error(e);
                        reject(e);
                    } finally {
                        context.finished();
                    }
                })
            };
        }
                
        constructor(private computation: (ctx: Computation.Context) => Promise<A>) {
            
        }
    }
    
    export module Computation {          
        export let PRINT_CONSOLE_ERROR = false;

        export function resolve<A>(a: A) {
            return computation<A>(() => Promise.resolve(a));
        }

        export function reject<A>(reason: any) {
            return computation<A>(() => Promise.reject(reason));
        }

        export function createContext(): Computation.Context {
            return new ContextImpl();
        }

        export const Aborted = 'Aborted';
        export const UpdateProgressDelta = 100;
                
        export interface Progress {
            message: string;
            isIndeterminate: boolean;
            current: number;
            max: number;
            requestAbort?: () => void;
        }

        export interface Context {
            progress: Rx.Observable<Progress>,
            requestAbort(): void,
            
            /**
             * Checks if the computation was aborted. If so, throws.
             * Otherwise, updates the progress.
             */
            updateProgress(msg: string, abort?: boolean | (() => void), current?: number, max?: number): Promise<void>
        }

        export interface Running<A> {
            progress: Rx.Observable<Progress>,
            result: Promise<A>
        }
    }
                    
    class ContextImpl implements Computation.Context {            
        private _abortRequested = false;
        get isAbortRequested() {
            return this._abortRequested;
        }

        private checkAborted() {
            if (this._abortRequested) throw Computation.Aborted;
        }
                    
        private _abortRequester = () => { this._abortRequested = true };

        requestAbort() {
            try {
                if (this._abortRequester) {
                    this._abortRequester.call(null);
                }
            } catch (e) { }
        }

        private progressTick = new Rx.Subject<Computation.Progress>();
        private _progress: Computation.Progress = { message: 'Working...', current: 0, max: 0, isIndeterminate: true, requestAbort: void 0 };
        progressStream = new Rx.BehaviorSubject<Computation.Progress>(this._progress);

        get progress() { return this.progressTick; }
        
        updateProgress(msg: string, abort: boolean | (() => void), current = NaN, max = NaN): Promise<void> {         
            this.checkAborted();

            this._progress.message = msg;
            if (typeof abort === 'boolean') {
                this._progress.requestAbort = abort ? this._abortRequester : void 0;
            } else {
                if (abort) this._abortRequester = abort;
                this._progress.requestAbort = abort ? this._abortRequester : void 0;
            }
            
            if (isNaN(current)) {
                this._progress.isIndeterminate = true; 
            } else {
                this._progress.isIndeterminate = false;         
                this._progress.current = current;
                this._progress.max = max; 
            }            
            
            this.progressTick.onNext(this._progress);

            return Scheduler.immediatePromise();
            //return new Promise<void>(res => setTimeout(res, 0));
        }

        private startEndCounter = 0;

        started() {
            this.startEndCounter++;
        }

        finished() {
            this.startEndCounter--;
            if (this.startEndCounter <= 0) {
                this.progressTick.onCompleted();
                this.progressStream.onCompleted();
            }

            if (this.startEndCounter < 0) {
                throw 'Bug in code somewhere, Computation.resolve/reject called too many times.'
            }
        }
        
        constructor() {            
            this.progressTick.throttle(1000 / 15).subscribe(p => {
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
}