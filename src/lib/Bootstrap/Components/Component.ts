/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Components {
    "use strict";
    
    export class Component<State> {

        private _state = new Rx.Subject<State>();
        private _latestState: State = <any>void 0;
        
        get dispatcher() {
            return this.context.dispatcher;
        }
                
        setState(...states: Partial<State>[]) {           
            let s = Utils.merge(this._latestState, ...states);
            if (s !== this._latestState) {
                this._latestState = s;
                this._state.onNext(s);
            }
        }
                
        get state() {
            return <Rx.Observable<State>>this._state;
        }

        get latestState() {
            return this._latestState;
        }

        constructor(public context: Context, initialState: State) {
            this._latestState = initialState;
        }
    }
    
    export interface ComponentInfo {
        key: string;
        controller: Bootstrap.Components.Component<any>;
        view: any;
        region: LayoutRegion;
        isStatic?: boolean;
    }
}