/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Plugin {
    "use strict";

    export interface TransformerInfo {
        transformer: Bootstrap.Tree.Transformer.Any,
        view: any,
        initiallyCollapsed?: boolean
    }

    export interface Instance {
        getTransformerInfo(transformer: Bootstrap.Tree.Transformer.Any): TransformerInfo,
        readonly context: Context,
        destroy(): void
    }
}