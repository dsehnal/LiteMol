/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Structure.Query.Algebraic {

    export type Predicate = (ctx: Context, i: number) => boolean;
    export type Selector = (ctx: Context, i: number) => any;

    /**
     * Predicates
     */
    function unaryP(f: (a: boolean) => boolean): (a: Predicate) => Predicate { return (a) => (ctx, i) => f(a(ctx, i)); }
    function binaryP(f: (a: boolean, b: boolean) => boolean): (a: Predicate, b: Predicate) => Predicate { return (a, b) => (ctx, i) => f(a(ctx, i), b(ctx, i)); }

    export const not = unaryP(a => !a);
    export const and = binaryP((a, b) => a && b);
    export const or = binaryP((a, b) => a || b);

    const backboneAtoms = Utils.FastSet.ofArray(["N", "CA", "C", "O", "P", "OP1", "OP2", "O3'", "O5'", "C3'", "C5'", "C4"]);    
    export const backbone: Predicate = (ctx, i) => entityType(ctx, i) === 'polymer' && backboneAtoms.has(atomName(ctx, i));    
    export const sidechain: Predicate = (ctx, i) => entityType(ctx, i) === 'polymer' && !backboneAtoms.has(atomName(ctx, i));

    /**
     * Relations
     */
    function binaryR(f: (a: any, b: any) => boolean): (a: Selector, b: Selector) => Predicate { return (a, b) => (ctx, i) => f(a(ctx, i), b(ctx, i)); }

    export const equal = binaryR((a, b) => a === b);
    export const notEqual = binaryR((a, b) => a !== b);
    export const greater = binaryR((a, b) => a > b);
    export const lesser = binaryR((a, b) => a < b);
    export const greaterEqual = binaryR((a, b) => a >= b);
    export const lesserEqual = binaryR((a, b) => a <= b);
    export function inRange(s: Selector, a: number, b: number): Predicate { return (ctx, i) => { let v = s(ctx, i); return v >= a && v <= b; }; }

    /**
     * Selectors
     */
    export function value(v: any): Selector { return () => v; }

    function atomProp<T extends Utils.DataTable<any>>(index: (t: AtomTable) => number[], table: (m: Molecule.Model) => T, value: (t: T) => any[]): Selector { return (ctx, i) => { let s = ctx.structure; return value(table(s))[index(s.data.atoms)[i]] }; }

    export const residueSeqNumber = atomProp(m => m.residueIndex, m => m.data.residues, t => t.seqNumber);
    export const residueName = atomProp(m => m.residueIndex, m => m.data.residues, t => t.name);
    export const elementSymbol = atomProp(m => m.indices, m => m.data.atoms, t => t.elementSymbol);
    export const atomName = atomProp(m => m.indices, m => m.data.atoms, t => t.name);
    export const entityType = atomProp(m => m.entityIndex, m => m.data.entities, t => t.type);
    
    /**
     * Query
     */    
    export function query(p: Predicate): Builder {
        return Builder.build(() => (ctx) => {
            let result: number[] = [];
            for (let i = 0, _b = ctx.structure.data.atoms.count; i < _b; i++) {
                if (ctx.hasAtom(i) && p(ctx, i)) result[result.length] = i;
            }
            if (!result.length) return FragmentSeq.empty(ctx);
            return new FragmentSeq(ctx, [Fragment.ofArray(ctx, result[0], new Int32Array(result))]);
        });
    }
}