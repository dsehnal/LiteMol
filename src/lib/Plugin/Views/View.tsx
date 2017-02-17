/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Views {
    "use strict";
    
    const shallowEqual = Bootstrap.Utils.shallowEqual;   
    export abstract class PureView<State, Props, ViewState> extends React.Component<{
        state: State
        onChange: (s: State) => void
    } & Props, ViewState> {
        
        protected update(s: State) {
            let ns = Bootstrap.Utils.merge<State>(this.props.state as any /* long live type system */, s);
            if (ns !== this.props.state as any) this.props.onChange(ns);
        }
        
        shouldComponentUpdate(nextProps: any, nextState: any) {
            return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
        }
    }
    
    export abstract class Component<Props> extends React.Component<{ context: Bootstrap.Context } & Props, {}> {
        
        // shouldComponentUpdate(nextProps: any, nextState: any) {
        //     return !shallowEqual(this.props, nextProps);
        // }
        
        private subs:Bootstrap.Rx.IDisposable[] = [];
        protected subscribe<T>(stream: Bootstrap.Rx.Observable<T>, obs: (n: T) => void) {
            let sub = stream.subscribe(obs);
            this.subs.push(sub);
            return sub;
        } 
        
        protected unsubscribe(sub: Bootstrap.Rx.IDisposable) {
            let idx = this.subs.indexOf(sub);
            for (let i = idx; i < this.subs.length - 1; i++) {
                this.subs[i] = this.subs[i + 1];                
            }
            sub.dispose();
            this.subs.pop();
        }
        
        componentWillUnmount() {
            for (let s of this.subs) s.dispose();
            this.subs = [];
        }        
    }
    
    export abstract class ObserverView<P, S> extends React.Component<P, S> {
        private subs:Bootstrap.Rx.IDisposable[] = [];
                
        protected subscribe<T>(stream: Bootstrap.Rx.Observable<T>, obs: (n: T) => void) {
            let sub = stream.subscribe(obs);
            this.subs.push(sub);
            return sub;
        } 
        
        protected unsubscribe(sub: Bootstrap.Rx.IDisposable) {
            let idx = this.subs.indexOf(sub);
            for (let i = idx; i < this.subs.length - 1; i++) {
                this.subs[i] = this.subs[i + 1];                
            }
            sub.dispose();
            this.subs.pop();
        }
        
        componentWillUnmount() {
            for (let s of this.subs) s.dispose();
            this.subs = [];
        }
    }

    export abstract class View<Controller extends Bootstrap.Components.Component<any>, State, CustomProps> 
        extends ObserverView<{ controller: Controller } & CustomProps, State> {
        
        public get controller(): Controller {
            return this.props.controller as any;
        }
                                
        componentWillMount() {
            this.subscribe(this.controller.state, (s) => {
                this.forceUpdate()
            });    
        }        
    }
}