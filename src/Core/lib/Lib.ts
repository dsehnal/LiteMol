/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core {
    "use strict";

    export import Rx = __LiteMolRx;

    export namespace Formats {
        export import CIF = CIFTools;
    }
}

namespace LiteMol {
    declare var __LiteMolPromise: typeof __Promise.Promise;
    export type Promise<T> = __Promise.Promise<T>;
    export const Promise: typeof __Promise.Promise = __LiteMolPromise;
}