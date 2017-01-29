/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Service {
    "use strict";

    export interface Toast {
        title: string,
        message: string | {} /* to represent arbitrary UI component. */,
        /**
         * Only one message with a given key can be shown.
         */
        key?: string,
        /**
         * Specify a timeout for the message in milliseconds.
         */
        timeoutMs?: number            
    } 
}