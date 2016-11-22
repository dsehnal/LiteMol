/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Interactivity {
    "use strict";

    export type Info = Info.Empty | Info.Selection

    export namespace Info {
        export const enum Kind { Empty, Selection }
        export interface Empty { kind: Kind.Empty }
        export interface Selection { kind: Kind.Selection, source: Entity.Any, elements: number[] }

        export const empty: Empty = { kind: Kind.Empty };
        export function selection(source: Entity.Any, elements: number[]): Selection {
            return { kind: Kind.Selection, source, elements };
        }     
    }
    
    export function isEmpty(info: Info): info is Info.Empty {
        return info.kind === Info.Kind.Empty;
    }

    export function isSelection(info: Info): info is Info.Selection {
        return info.kind === Info.Kind.Selection;
    }

    export function interactivityInfoEqual(a: Info, b: Info) {
        if (!a && !b) return true;
        if (!a || !b) return false;
        if (a.kind !== b.kind) return false;
        if (a.kind === Info.Kind.Empty) return true;
        if (a.source !== (b as Info.Selection).source) return false;
        
        let x = (a as Info.Selection).elements, y = (b as Info.Selection).elements;
        if (x.length !== y.length) return false;
        for (let i = 0, _l = x.length; i < _l; i++) {
            if (x[i] !== y[i]) return false;
        }
        return true;
    }    

    export function interactivitySelectionElementsEqual(a: Info.Selection, b: Info.Selection) {        
        let x = a.elements, y = b.elements;
        if (x.length !== y.length) return false;
        for (let i = 0, _l = x.length; i < _l; i++) {
            if (x[i] !== y[i]) return false;
        }
        return true;
    }    
}