/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Plugin {
    "use strict";

    export interface ITransformerInfo {
        transformer: Bootstrap.Tree.Transformer.Any,
        view: any,
        initiallyCollapsed?: boolean
    }

    export interface IInstance {
        getTransformerInfo(transformer: Bootstrap.Tree.Transformer.Any): ITransformerInfo;
    }
}