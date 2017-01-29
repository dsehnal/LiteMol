/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap {
    "use strict";
    
    export interface Event<T> {
        type: Event.Type<T>;
        data: T;        
    }
    
    export namespace Event { 
        export type Stream<T> = Rx.Observable<Event<T>>;
        
        import Lane = Service.Dispatcher.Lane
        
        export type Any = Event<any>
        export type AnyType = Type<any>
        
        export interface Type<T> {
            name: string,
            lane: Lane,
            dispatch(context: Context, data: T): void;
            getStream(context: Context): Stream<T>;
        }
        
        const EventPrototype = {
            dispatch<T>(this: any, context: Context, data: T) { context.dispatcher.dispatch({ type: this, data }) },
            getStream(this: any, context: Context) { return context.dispatcher.getStream(this); }
        }
                                          
        export function create<T>(name: string, lane: Service.Dispatcher.Lane): Type<T> {
            return Object.create(EventPrototype, {
                name: { writable: false, configurable: false, value: name },
                lane: { writable: false, configurable: false, value: lane }
            });
        }        
    }
}