/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Interactivity {
    "use strict";

    export interface Info {
        entity?: Entity.Any,
        visual?: Entity.Visual.Any,
        elements?: number[]
    }
    
    export function interactivityInfoEqual(a: Info, b: Info) {
        if (!a && !b) return true;
        if (!a || !b) return false;
        if (a.visual !== b.visual || a.entity !== b.entity) return false;
        if (!a.elements && !b.elements) return true;
        if (!a.elements || !b.elements || a.elements.length !== b.elements.length) return false;
        
        let x = a.elements, y = b.elements;
        for (let i = 0, _l = x.length; i < _l; i++) {
            if (x[i] !== y[i]) return false;
        }
        return true;
    }    
}