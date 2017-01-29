/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Service {
    "use strict";
            

    export class Dispatcher {
        LOG_DISPATCH_STREAM = false;
        
        private lanes: Rx.Subject<Event<any>>[] = [];        
        constructor() {
            for (let i = 0; i <= Dispatcher.Lane.Task; i++) {
                this.lanes.push(new Rx.Subject<Event<any>>());
            }
        }
        
        dispatch<T>(event: Event<T>) {
            if (this.LOG_DISPATCH_STREAM) console.log(event.type.name, Dispatcher.Lane[event.type.lane], event.data);
            this.lanes[event.type.lane].onNext(event);
        }

        schedule(action: () => void, onError?: (e: string) => void, timeout = 1000 / 31) {
            return setTimeout(() => {
                if (onError) {
                    try {
                        action.call(null)
                    } catch (e) {
                        onError.call(null, '' + e);
                    }
                } else {
                    action.call(null);
                }
            }, timeout);
        }
        
        getStream<T>(type: Event.Type<T>): Event.Stream<T> {
            return this.lanes[type.lane].filter(e => e.type === type);
        }
        
        finished() {
            this.lanes.forEach(l => l.onCompleted());
        }
    }
    
    export module Dispatcher {        
        export enum Lane {
            Slow = 0, 
            Fast = 1,
            Log = 2,
            Busy = 3,
            Transformer = 4,
            Task = 5
        }
    }
    
}