/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Interactivity {
    "use strict";

    export type Info = Info.Empty | Info.Selection

    export namespace Info {
        export const enum __Kind { Empty, Selection }
        export interface Empty { kind: __Kind.Empty }
        export interface Selection { kind: __Kind.Selection, source: Entity.Any, elements: number[] }

        export const empty: Empty = { kind: __Kind.Empty };
        export function selection(source: Entity.Any, elements: number[]): Selection {
            return { kind: __Kind.Selection, source, elements };
        }     
    }
    
    export function isEmpty(info: Info): info is Info.Empty {
        if (info.kind === Info.__Kind.Empty || !info.source.tree) return true;
        if (info.source.type.info.typeClass === Entity.VisualClass && info.source.type === Entity.Molecule.Visual) {
            let modelOrSelection = Utils.Molecule.findModelOrSelection(info.source);
            if (modelOrSelection) {
                if (!info.elements || !info.elements.length) {
                    return true;
                }
            }
        }
        return false;
    }

    export function isSelection(info: Info): info is Info.Selection {
        return info.kind === Info.__Kind.Selection && !!info.source.tree;
    }

    export function interactivityInfoEqual(a: Info, b: Info) {
        if (!a && !b) return true;
        if (!a || !b) return false;
        if (a.kind !== b.kind) return false;
        if (a.kind === Info.__Kind.Empty) return true;
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