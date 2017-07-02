/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Structure.Query {
            
    export interface Builder {
        compile(): Query;
        
        complement(): Builder;
        ambientResidues(radius: number): Builder;
        wholeResidues(): Builder;
        union(): Builder;
        inside(where: Source): Builder;
        intersectWith(where: Source): Builder;
        flatten(selector: (f: Fragment) => FragmentSeq): Builder;
        except(toRemove: Source): Builder;
    }
    
    export namespace Builder {
                
        export const BuilderPrototype: any = { };   
        export function registerModifier(name: string, f: Function) {
            BuilderPrototype[name] = function (this: any, ...args: any[]) { return f.call(void 0, this, ...args) };
        }        
        
        export function build(compile: () => Query): Builder {
            return Object.create(BuilderPrototype, { compile: { writable: false, configurable: false, value: compile } }); 
        }
        
        function isBuilder(e: any): e is Builder {
            return !!e.compile;
        }        
                
        export function parse(query: string): Query {                
            if (typeof window === 'undefined') throw 'parse can only be called from a browser.';
                    
            (function() {} (), eval)(`with (LiteMol.Core.Structure.Query) { window.__LiteMol_query = ${query}; }`);
            let q: Builder = (window as any).__LiteMol_query;
            (window as any).__LiteMol_query = void 0;
            return (q as any).compile();
        }   
                
        export function toQuery(q: Source): Query {            
            let ret: Query;
            if (isBuilder(q)) ret = (q as any).compile();
            else if (typeof q === 'string' || q instanceof String) ret = parse(q as string);
            else ret = q;            
            return ret;
        }        
    }
    
    
    export interface EntityIdSchema { entityId?: string; type?: string }
    export interface AsymIdSchema extends EntityIdSchema { asymId?: string; authAsymId?: string; }
    export interface ResidueIdSchema extends AsymIdSchema { name?: string; seqNumber?: number; authName?: string; authSeqNumber?: number; insCode?: string | null; }
    
    export function allAtoms() { return Builder.build(() => Compiler.compileAllAtoms()); }
    export function atomsByElement(...elements: string[]) { return Builder.build(() => Compiler.compileAtoms(elements, m => m.data.atoms.elementSymbol)); }
    export function atomsByName(...names: string[]) { return Builder.build(() => Compiler.compileAtoms(names, m => m.data.atoms.name)); }
    export function atomsById(...ids: number[]) { return Builder.build(() => Compiler.compileAtoms(ids, m => m.data.atoms.id)); }  

    export function residues(...ids: ResidueIdSchema[]) { return Builder.build(() => Compiler.compileAtomRanges(false, ids, m => m.data.residues)); }
    export function chains(...ids: AsymIdSchema[]) { return Builder.build(() => Compiler.compileAtomRanges(false, ids, m => m.data.chains)); }
    export function entities(...ids: EntityIdSchema[]) { return Builder.build(() => Compiler.compileAtomRanges(false, ids, m => m.data.entities)); }
    export function notEntities(...ids: EntityIdSchema[]) { return Builder.build(() => Compiler.compileAtomRanges(true, ids, m => m.data.entities)); }
    export function everything() { return Builder.build(() => Compiler.compileEverything()); }

    export function entitiesFromIndices(indices: number[]) { return Builder.build(() => Compiler.compileFromIndices(false, indices, m => m.data.entities)); }
    export function chainsFromIndices(indices: number[]) { return Builder.build(() => Compiler.compileFromIndices(false, indices, m => m.data.chains)); }
    export function residuesFromIndices(indices: number[]) { return Builder.build(() => Compiler.compileFromIndices(false, indices, m => m.data.residues)); }
    export function atomsFromIndices(indices: number[]) { return Builder.build(() => Compiler.compileAtomIndices(indices)); }

    export function sequence(entityId: string, asymId: string | AsymIdSchema, startId: ResidueIdSchema, endId: ResidueIdSchema) { return Builder.build(() => Compiler.compileSequence(entityId, asymId, startId, endId)); }
    export function hetGroups() { return Builder.build(() => Compiler.compileHetGroups()); }
    export function nonHetPolymer() { return Builder.build(() => Compiler.compileNonHetPolymer()); }
    export function polymerTrace(...atomNames: string[]) { return Builder.build(() => Compiler.compilePolymerNames(atomNames, false)); }
    export function cartoons() { return or(Builder.build(() => Compiler.compilePolymerNames(["CA", "O", "O5'", "C3'", "N3"], false)), hetGroups(), entities({ type: 'water' })); }
    export function backbone() { return Builder.build(() => Compiler.compilePolymerNames(["N", "CA", "C", "O", "P", "OP1", "OP2", "O3'", "O5'", "C3'", "C5'", "C4"], false)); }
    export function sidechain() { return Builder.build(() => Compiler.compilePolymerNames(["N", "CA", "C", "O", "P", "OP1", "OP2", "O3'", "O5'", "C3'", "C5'", "C4"], true)); }

    export function atomsInBox(min: { x: number; y: number; z: number }, max: { x: number; y: number; z: number }) { return Builder.build(() => Compiler.compileAtomsInBox(min, max)); }

    export function or(...elements: Source[]) { return Builder.build(() => Compiler.compileOr(elements)); }

    Builder.registerModifier('complement', complement);    
    export function complement(q: Source) { return Builder.build(() => Compiler.compileComplement(q)); }
    
    Builder.registerModifier('ambientResidues', ambientResidues);    
    export function ambientResidues(q: Source, radius: number) { return Builder.build(() => Compiler.compileAmbientResidues(q, radius)); }
    
    Builder.registerModifier('wholeResidues', wholeResidues);  
    export function wholeResidues(q: Source) { return Builder.build(() => Compiler.compileWholeResidues(q)); }
    
    Builder.registerModifier('union', union);    
    export function union(q: Source) { return Builder.build(() => Compiler.compileUnion(q)); }
    
    Builder.registerModifier('inside', inside);    
    export function inside(q: Source, where: Source) { return Builder.build(() => Compiler.compileInside(q, where)); }

    Builder.registerModifier('intersectWith', intersectWith);    
    export function intersectWith(what: Source, where: Source) { return Builder.build(() => Compiler.compileIntersectWith(what, where)); }

    Builder.registerModifier('flatten', flatten);    
    export function flatten(what: Source, selector: (f: Fragment) => FragmentSeq) { return Builder.build(() => Compiler.compileFlatten(what, selector)); }

    Builder.registerModifier('except', except);    
    export function except(what: Source, toRemove: Source) { return Builder.build(() => Compiler.compileExcept(what, toRemove)); }

    /**
     * Shortcuts
     */
    export function residuesByName(...names: string[]) { return residues(...names.map(n => ({ name: n }))); }
    export function residuesById(...ids: number[]) { return residues(...ids.map(id => ({ authSeqNumber: id }))); }
    export function chainsById(...ids: string[]) { return chains(...ids.map(id => ({ authAsymId: id }))); }
    
    /**
     * Query compilation wrapper.
     */
    export namespace Compiler {

        class OptimizedId {

            columns: { value: any; array: any[] }[];

            isSatisfied(i: number) {
                for (let c of this.columns) {
                    if (c.value !== c.array[i]) return false;
                }
                return true;
            }

            constructor(id: any, arrays: any) {
                this.columns = [];
                for (let key of Object.keys(id)) {
                    if (id[key] !== void 0 && !!arrays[key]) {
                        this.columns.push({ value: id[key], array: arrays[key] });
                    }
                }
            }
        }

        export function compileEverything() {
            return (ctx: Context) => {


                if (ctx.isComplete) {
                    let atoms = ctx.structure.data.atoms.indices;
                    return new FragmentSeq(ctx, [new Fragment(ctx, atoms[0], atoms)]);
                }

                let indices = new Int32Array(ctx.atomCount);
                let offset = 0;

                for (let i of ctx.structure.data.atoms.indices) {
                    if (ctx.hasAtom(i)) indices[offset++] = i;
                }

                return new FragmentSeq(ctx, [Fragment.ofArray(ctx, indices[0], indices)]);
                
            };
        }

        export function compileAllAtoms() {
            return (ctx: Context) => {
                const fragments = new FragmentSeqBuilder(ctx);
                
                for (let i = 0, _b = ctx.structure.data.atoms.count; i < _b; i++) {
                    if (ctx.hasAtom(i)) fragments.add(Fragment.ofIndex(ctx, i));
                }

                return fragments.getSeq();
            };
        } 

        export function compileAtoms(elements: string[] | number[], sel: (model: Structure.Molecule.Model) => string[] | number[]) {
            return (ctx: Context) => {

                let set = Utils.FastSet.ofArray<string | number>(elements),
                    data = sel(ctx.structure),
                    fragments = new FragmentSeqBuilder(ctx);

                for (let i = 0, _b = data.length; i < _b; i++) {
                    if (ctx.hasAtom(i) && set.has(data[i])) fragments.add(Fragment.ofIndex(ctx, i));
                }

                return fragments.getSeq();
            };
        } 

        export function compileAtomIndices(indices: number[]) {
            return (ctx: Context) => {
                
                let count = 0;
                for (let aI of indices) {
                    if (ctx.hasAtom(aI)) count++;
                }
                
                if (!count) return FragmentSeq.empty(ctx);
                if (count === indices.length) return new FragmentSeq(ctx, [Fragment.ofArray(ctx, indices[0], indices)]);
                
                let offset = 0;
                let f = new Int32Array(count);
                for (let aI of indices) {
                    if (ctx.hasAtom(aI)) f[offset++] = aI;
                }
                return new FragmentSeq(ctx, [Fragment.ofArray(ctx, f[0], f)]);
            };
        }

        export function compileFromIndices(
            complement: boolean, indices: number[],
            tableProvider: (molecule: Structure.Molecule.Model) => { atomStartIndex: number[]; atomEndIndex: number[] } & Utils.DataTable<any>): Query {

            return (ctx: Context) => {
                let table = tableProvider(ctx.structure),
                    { atomStartIndex, atomEndIndex } = table,
                    fragments = new FragmentSeqBuilder(ctx);

                if (complement) {
                    let exclude = Utils.FastSet.ofArray(indices);
                    let count = table.count;
                    for (let i = 0; i < count; i++) {
                        if (exclude.has(i)) continue;
                        if (!ctx.hasRange(atomStartIndex[i], atomEndIndex[i])) continue;
                        fragments.add(Fragment.ofIndexRange(ctx, atomStartIndex[i], atomEndIndex[i]));
                    }
                } else {
                    for (let i of indices) {
                        if (!ctx.hasRange(atomStartIndex[i], atomEndIndex[i])) continue;
                        fragments.add(Fragment.ofIndexRange(ctx, atomStartIndex[i], atomEndIndex[i]));
                    }
                }

                return fragments.getSeq();
            };
        }
        
        export function compileAtomRanges(
            complement: boolean, ids: ResidueIdSchema[],
            tableProvider: (molecule: Structure.Molecule.Model) => { atomStartIndex: number[]; atomEndIndex: number[] } & Utils.DataTable<any>): Query {

            return (ctx: Context) => {
                let table = tableProvider(ctx.structure),
                    atomIndexStart = table.atomStartIndex, atomIndexEnd = table.atomEndIndex,
                    fragments = new FragmentSeqBuilder(ctx),
                    count = table.count, include = false;

                let optimized = ids.map(id => new OptimizedId(id, table));
                let isEmptyIds = optimized.length === 0;
                

                for (let i = 0; i < count; i++) {
                    if (!ctx.hasRange(atomIndexStart[i], atomIndexEnd[i])) continue;

                    include = isEmptyIds;
                    for (let id of optimized) {
                        if (id.isSatisfied(i)) {
                            include = true;
                            break;
                        }
                    }

                    if (complement) include = !include;

                    if (include) {
                        fragments.add(Fragment.ofIndexRange(ctx, atomIndexStart[i], atomIndexEnd[i]));
                    }
                }

                return fragments.getSeq();
            };
        }
        
        export function compileSequence(seqEntityId: string, seqAsymId: string | AsymIdSchema, start: ResidueIdSchema, end: ResidueIdSchema): Query {
            
            return (ctx: Context) => {
                let { residues, chains } = ctx.structure.data,
                    { seqNumber, atomStartIndex, atomEndIndex } = residues,
                    { entityId, count, residueStartIndex, residueEndIndex } = chains,                                       
                    fragments = new FragmentSeqBuilder(ctx);
               
                let parent = ctx.structure.parent, 
                    { sourceChainIndex } = chains,                    
                    isComputed = parent && sourceChainIndex;

                let targetAsymId: AsymIdSchema = typeof seqAsymId === 'string' ? { asymId: seqAsymId } : seqAsymId;
                let optTargetAsymId = new OptimizedId(targetAsymId, isComputed ? parent!.data.chains : chains);

                //optAsymId.isSatisfied();
                
                for (let cI = 0; cI < count; cI++) {
                    if (entityId[cI] !== seqEntityId 
                        || !optTargetAsymId.isSatisfied(isComputed ? sourceChainIndex[cI] : cI)) {
                        continue;
                    }

                    let i = residueStartIndex[cI], last = residueEndIndex[cI], startIndex = -1, endIndex = -1;                    
                    for (; i < last; i++) {

                        if (seqNumber[i] >= start.seqNumber!) {
                            startIndex = i;
                            break;
                        }
                    }

                    if (i === last) continue;
                    for (i = startIndex; i < last; i++) {                        
                        if (seqNumber[i] >= end.seqNumber!) {
                            break;
                        }
                    }

                    endIndex = i;

                    if (ctx.hasRange(atomStartIndex[startIndex], atomEndIndex[endIndex])) {
                        fragments.add(Fragment.ofIndexRange(ctx, atomStartIndex[startIndex], atomEndIndex[endIndex]))
                    }
                }
                
                return fragments.getSeq();
            };
        }
        
        export function compileHetGroups(): Query {
            return (ctx: Context) => {
                let { atomStartIndex, atomEndIndex, isHet, entityIndex, count } = ctx.structure.data.residues,
                    entityType = ctx.structure.data.entities.type,
                    water = 'water',
                    fragments = new FragmentSeqBuilder(ctx);
                
                for (let i = 0; i < count; i++) {
                    if (!ctx.hasRange(atomStartIndex[i], atomEndIndex[i])) continue;
                    if (entityType[entityIndex[i]] === water) continue;                    
                    if (isHet[i]) {
                        fragments.add(Fragment.ofIndexRange(ctx, atomStartIndex[i], atomEndIndex[i]));
                    }
                }
                return fragments.getSeq();
            };
        }
                
        export function compileNonHetPolymer(): Query {
            return (ctx: Context) => {
                let { atomStartIndex, atomEndIndex } = ctx.structure.data.residues,
                    { type: entityType, count: entityCount, residueStartIndex: eRS, residueEndIndex: eRE } = ctx.structure.data.entities,
                    polymer = 'polymer',
                    size = 0; 
                
                for (let eI = 0; eI < entityCount; eI++) {
                    if (entityType[eI] !== polymer) continue;
                    
                    for (let rI = eRS[eI], _bR = eRE[eI]; rI < _bR; rI++) {
                        for (let aI = atomStartIndex[rI], _bA = atomEndIndex[rI]; aI < _bA; aI++) {
                            if (ctx.hasAtom(aI)) size++;
                        }   
                    }
                }
                
                if (!size) return FragmentSeq.empty(ctx);
                
                let f = new Int32Array(size), offset = 0;
                
                for (let eI = 0; eI < entityCount; eI++) {
                    if (entityType[eI] !== polymer) continue;
                    
                    for (let rI = eRS[eI], _bR = eRE[eI]; rI < _bR; rI++) {
                        for (let aI = atomStartIndex[rI], _bA = atomEndIndex[rI]; aI < _bA; aI++) {
                            if (ctx.hasAtom(aI)) f[offset++] = aI;
                        }   
                    }
                }
                return new FragmentSeq(ctx, [Fragment.ofArray(ctx, f[0], f)]);
            };
        }

        export function compileAtomsInBox(min: { x: number; y: number; z: number }, max: { x: number; y: number; z: number }): Query {
            return (ctx: Context) => {
                let positions = ctx.structure.positions,
                    xs = positions.x, ys = positions.y, zs = positions.z,
                    count = positions.count,
                    fragment: number[] = [];
                
                for (let i = 0; i < count; i++) {
                    if (!ctx.hasAtom(i)) continue;

                    let x = xs[i], y = ys[i], z = zs[i];

                    if (x >= min.x && x <= max.x
                        && y >= min.y && y <= max.y
                        && z >= min.z && z <= max.z) {
                        fragment[fragment.length] = i;
                    }
                }

                if (!fragment.length) return FragmentSeq.empty(ctx);

                return new FragmentSeq(ctx, [new Fragment(ctx, fragment[0], fragment)]);
            };
        }

        export function compileInside(what: Source, where: Source): Query {            
            let _what = Builder.toQuery(what);
            let _where = Builder.toQuery(where)
            return (ctx: Context) => {
                return new FragmentSeq(ctx, _what(Context.ofFragments(_where(ctx))).fragments);
            };
        }

        function narrowFragment(ctx: Context, f: Fragment, m: Utils.Mask) {
            let count = 0;
            for (let i of f.atomIndices) {
                if (m.has(i)) count++;
            }
            if (!count) return void 0;
            let ret = new Int32Array(count);
            let offset = 0;
            for (let i of f.atomIndices) {
                if (m.has(i)) ret[offset++] = i;
            }
            return Fragment.ofArray(ctx, ret[0], ret);
        }

        export function compileIntersectWith(what: Source, where: Source): Query {
            
            let _what = Builder.toQuery(what);
            let _where = Builder.toQuery(where)
            return (ctx: Context) => {
                let fs = _what(ctx);
                let map = Utils.Mask.ofFragments(_where(ctx));
                let ret = new FragmentSeqBuilder(ctx);

                for (let f of fs.fragments) {
                    let n = narrowFragment(ctx, f, map);
                    if (n) ret.add(n);
                }

                return ret.getSeq();
            };
        }

        export function compileFilter(what: Source, filter: (f: Fragment) => boolean): Query {
            let _what = Builder.toQuery(what);
            return (ctx: Context) => {
                let src = _what(ctx).fragments,
                    result = new FragmentSeqBuilder(ctx),
                    f: Fragment;

                for (let i = 0; i < src.length; i++) {
                    f = src[i];
                    if (filter(f)) result.add(f);
                }

                return result.getSeq();
            };
        }

        export function compileComplement(what: Source): Query {
            let _what = Builder.toQuery(what);
            return (ctx: Context) => {
                let mask = Utils.Mask.ofFragments(_what(ctx)),
                    count = 0, offset = 0;

                for (let i = 0, _b = ctx.structure.data.atoms.count; i < _b; i++) {
                    if (ctx.hasAtom(i) && !mask.has(i)) count++;
                }

                if (!count) return FragmentSeq.empty(ctx);

                let atoms = new Int32Array(count);
                for (let i = 0, _b = ctx.structure.data.atoms.count; i < _b; i++) {
                    if (ctx.hasAtom(i) && !mask.has(i)) atoms[offset++] = i;
                }

                return new FragmentSeq(ctx, [Fragment.ofArray(ctx, atoms[0], atoms)]);
            };
        }

        export function compileOr(queries: Source[]) {
            
            let _qs = queries.map(q => Builder.toQuery(q));
            return (ctx: Context) => {
                let fragments = new HashFragmentSeqBuilder(ctx);

                for (let q of _qs) {
                    let r = q(ctx);
                    for (let f of r.fragments) {
                        fragments.add(f);
                    }
                }

                return fragments.getSeq();
            };
        }

        export function compileUnion(what: Source): Query {
            let _what = Builder.toQuery(what);
            return (ctx: Context) => {
                let src = _what(ctx).fragments,
                    indices = Utils.FastSet.create<number>(),
                    j = 0, atoms: number[];

                for (let i = 0; i < src.length; i++) {
                    atoms = src[i].atomIndices;
                    for (j = 0; j < atoms.length; j++) indices.add(atoms[j]);
                }

                if (indices.size === 0) return FragmentSeq.empty(ctx);
                return new FragmentSeq(ctx, [Fragment.ofSet(ctx, indices)]);
            };
        }

        export function compilePolymerNames(names: string[], complement: boolean): Query {

            return (ctx: Context) => {

                let structure = ctx.structure,
                    entities = structure.data.entities,
                    atomNames = structure.data.atoms.name,
                    indices: number[] = [],
                    indexCount = 0;

                const allowedNames = Utils.FastSet.ofArray(names);

                if (complement) {
                    for (let ei = 0; ei < structure.data.entities.count; ei++) {
                        if (entities.type[ei] !== 'polymer') continue;

                        let start = entities.atomStartIndex[ei], end = entities.atomEndIndex[ei];
                        for (let i = start; i < end; i++) {
                            if (ctx.hasAtom(i) && !allowedNames.has(atomNames[i])) indices[indexCount++] = i;
                        }
                    }
                } else {
                    for (let ei = 0; ei < entities.count; ei++) {
                        if (entities.type[ei] !== 'polymer') continue;

                        let start = entities.atomStartIndex[ei], end = entities.atomEndIndex[ei];
                        for (let i = start; i < end; i++) {
                            if (ctx.hasAtom(i) && allowedNames.has(atomNames[i])) indices[indexCount++] = i;
                        }
                    }
                }
                                
                if (!indices.length) return FragmentSeq.empty(ctx);

                return new FragmentSeq(ctx, [Fragment.ofArray(ctx, indices[0], new Int32Array(indices))]);
            };
        }

        export function compileAmbientResidues(where: Source, radius: number) {
            let _where = Builder.toQuery(where);
            return (ctx: Context) => {

                let src = _where(ctx),
                    nearest = ctx.lookup3d(),
                    ret = new HashFragmentSeqBuilder(ctx),
                    { x, y, z } = ctx.structure.positions,
                    residueIndex = ctx.structure.data.atoms.residueIndex,
                    atomStart = ctx.structure.data.residues.atomStartIndex, atomEnd = ctx.structure.data.residues.atomEndIndex;
                
                for (let f of src.fragments) {
                    let residues = Utils.FastSet.create<number>();
                    for (let i of f.atomIndices) {
                        residues.add(residueIndex[i]);
                        
                        const { elements, count } = nearest(x[i], y[i], z[i], radius);

                        for (let j = 0; j < count; j++) {
                            residues.add(residueIndex[elements[j]]);
                        }
                    }
                    
                    let atomCount = { count: 0, start: atomStart, end: atomEnd };
                    residues.forEach((r, ctx) => { ctx!.count += ctx!.end[r] - ctx!.start[r]; }, atomCount);

                    let indices = new Int32Array(atomCount.count),
                        atomIndices = { indices, offset: 0, start: atomStart, end: atomEnd };

                    residues.forEach((r, ctx) => {
                        for (let i = ctx!.start[r], _l = ctx!.end[r]; i < _l; i++) {
                            ctx!.indices[ctx!.offset++] = i;
                        }
                    }, atomIndices);
                    Array.prototype.sort.call(indices, function (a: number, b: number) { return a - b; });

                    ret.add(Fragment.ofArray(ctx, indices[0], indices));                   
                }
                
                return ret.getSeq();
            };

        }

        export function compileWholeResidues(where: Source) {
            let _where = Builder.toQuery(where);
            return (ctx: Context) => {
                let src = _where(ctx),
                    ret = new HashFragmentSeqBuilder(ctx),
                    residueIndex = ctx.structure.data.atoms.residueIndex,
                    atomStart = ctx.structure.data.residues.atomStartIndex, atomEnd = ctx.structure.data.residues.atomEndIndex;

                for (let f of src.fragments) {
                    let residues = Utils.FastSet.create<number>();

                    for (let i of f.atomIndices) {
                        residues.add(residueIndex[i]);
                    }

                    let atomCount = { count: 0, start: atomStart, end: atomEnd };
                    residues.forEach((r, ctx) => { ctx!.count += ctx!.end[r] - ctx!.start[r]; }, atomCount);
                    
                    let indices = new Int32Array(atomCount.count),
                        atomIndices = { indices, offset: 0, start: atomStart, end: atomEnd };

                    residues.forEach((r, ctx) => {
                        for (let i = ctx!.start[r], _l = ctx!.end[r]; i < _l; i++) {
                            ctx!.indices[ctx!.offset++] = i;
                        }
                    }, atomIndices);
                    Array.prototype.sort.call(indices, function (a: number, b: number) { return a - b; });

                    ret.add(Fragment.ofArray(ctx, indices[0], indices));
                }

                return ret.getSeq();
            };
        }

        export function compileFlatten(what: Source, selector: (f: Fragment) => FragmentSeq) {
            let _what = Builder.toQuery(what);
            return (ctx: Context) => {
                let fs = _what(ctx);
                let ret = new HashFragmentSeqBuilder(ctx);
                for (let f of fs.fragments) {
                    let xs = selector(f);
                    for (let x of xs.fragments) {
                        ret.add(x);
                    }
                }
                return ret.getSeq();
            }            
        }

        export function compileExcept(what: Source, toRemove: Source) {
            const _what = Builder.toQuery(what);
            const _toRemove = Builder.toQuery(toRemove);
            return (ctx: Context) => {
                const fs = _what(ctx);
                const mask = Utils.Mask.ofFragments(_toRemove(ctx));
                const ret = new HashFragmentSeqBuilder(ctx);
                for (let f of fs.fragments) {
                    let size = 0;
                    for (const i of f.atomIndices) {
                        if (!mask.has(i)) size++;
                    }
                    if (!size) continue;
                    const indices = new Int32Array(size);
                    let offset = 0;
                    for (const i of f.atomIndices) {
                        if (!mask.has(i)) indices[offset++] = i;
                    }
                    ret.add(Fragment.ofArray(ctx, indices[0], indices));
                }
                return ret.getSeq();
            }            
        }

    }

}