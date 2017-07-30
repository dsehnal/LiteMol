/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol {
    declare const __LiteMolPromise: PromiseConstructor;
    //export type Promise<T> = GlobalPromise<T>;// __Promise.Promise<T>;
    export const Promise: PromiseConstructor = __LiteMolPromise;    
}

namespace LiteMol.Core {
    "use strict";
    
    export import Rx = __LiteMolRx;
    export import Promise = LiteMol.Promise;

    export namespace Formats {
        export import CIF = LiteMolCIFTools;
    }
}
