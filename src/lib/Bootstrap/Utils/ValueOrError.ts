/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Utils.Query {
    "use strict";

    export class ValueOrError<A> {
        
        bind<B>(f: (v: A) => ValueOrError<B>): ValueOrError<B> {
            if (this.isError) return <any>this;
            return f(this.value!);
        }
        
        constructor(public isError: boolean, public value?: A, public error?: any) {
            
        }
    }
    
    export module ValueOrError {
        export function error(err: any) {
            return new ValueOrError(true, void 0, err);
        } 
        
        export function value<A>(v: A) {
            return new ValueOrError(true, v);
        } 
    }
}