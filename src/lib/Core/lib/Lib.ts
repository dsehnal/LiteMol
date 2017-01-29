/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol {
    declare const __LiteMolPromise: typeof __Promise.Promise;
    export type Promise<T> = __Promise.Promise<T>;
    export const Promise: typeof __Promise.Promise = __LiteMolPromise;
}

namespace LiteMol.Core {
    "use strict";

    export import Rx = __LiteMolRx;
    export import Promise = LiteMol.Promise;

    export namespace Formats {
        export import CIF = CIFTools;
    }
}
