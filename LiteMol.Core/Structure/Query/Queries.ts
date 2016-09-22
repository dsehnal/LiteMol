/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
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
                
        declare var global: any;
        export function parse(query: string): Query {                
            if (typeof window === 'undefined') throw 'parse can only be called from a browser.';
                    
            (0, eval)(`with (LiteMol.Core.Structure.Query) { window.__LiteMol_query = ${query}; }`);
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
    
    export function atomsByElement(...elements: string[]) { return Builder.build(() => Compiler.compileAtoms(elements, m => m.atoms.elementSymbol)); }
    export function atomsByName(...names: string[]) { return Builder.build(() => Compiler.compileAtoms(names, m => m.atoms.name)); }
    export function atomsById(...ids: number[]) { return Builder.build(() => Compiler.compileAtoms(ids, m => m.atoms.id)); }  

    export function residues(...ids: ResidueIdSchema[]) { return Builder.build(() => Compiler.compileAtomRanges(false, ids, m => m.residues)); }
    export function chains(...ids: AsymIdSchema[]) { return Builder.build(() => Compiler.compileAtomRanges(false, ids, m => m.chains)); }
    export function entities(...ids: EntityIdSchema[]) { return Builder.build(() => Compiler.compileAtomRanges(false, ids, m => m.entities)); }
    export function notEntities(...ids: EntityIdSchema[]) { return Builder.build(() => Compiler.compileAtomRanges(true, ids, m => m.entities)); }
    export function everything() { return Builder.build(() => Compiler.compileEverything()); }

    export function entitiesFromIndices(indices: number[]) { return Builder.build(() => Compiler.compileFromIndices(false, indices, m => m.entities)); }
    export function chainsFromIndices(indices: number[]) { return Builder.build(() => Compiler.compileFromIndices(false, indices, m => m.chains)); }
    export function residuesFromIndices(indices: number[]) { return Builder.build(() => Compiler.compileFromIndices(false, indices, m => m.residues)); }
    export function atomsFromIndices(indices: number[]) { return Builder.build(() => Compiler.compileAtomIndices(indices)); }

    export function sequence(entityId: string, asymId: string, startId: ResidueIdSchema, endId: ResidueIdSchema) { return Builder.build(() => Compiler.compileSequence(entityId, asymId, startId, endId)); }
    export function hetGroups() { return Builder.build(() => Compiler.compileHetGroups()); }
    export function nonHetPolymer() { return Builder.build(() => Compiler.compileNonHetPolymer()); }
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
                    let atoms = ctx.structure.atoms.indices;
                    return new FragmentSeq(ctx, [new Fragment(ctx, atoms[0], atoms)]);
                }

                let indices = new Int32Array(ctx.atomCount);
                let offset = 0;

                for (let i of ctx.structure.atoms.indices) {
                    if (ctx.hasAtom(i)) indices[offset++] = i;
                }

                return new FragmentSeq(ctx, [Fragment.ofArray(ctx, indices[0], indices)]);
                
            };
        }

        export function compileAtoms(elements: string[] | number[], sel: (model: Structure.MoleculeModel) => string[] | number[]) {
            return (ctx: Context) => {

                let set = new Set<any>(elements),
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
            tableProvider: (molecule: Structure.MoleculeModel) => { atomStartIndex: number[]; atomEndIndex: number[] } & Structure.DataTable): Query {

            return (ctx: Context) => {
                let table = tableProvider(ctx.structure),
                    { atomStartIndex, atomEndIndex } = table,
                    fragments = new FragmentSeqBuilder(ctx),
                    include = false;

                if (complement) {
                    let exclude = new Set(indices);
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
            tableProvider: (molecule: Structure.MoleculeModel) => { atomStartIndex: number[]; atomEndIndex: number[] } & Structure.DataTable): Query {

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
        
        export function compileSequence(seqEntityId: string, seqAsymId: string, start: ResidueIdSchema, end: ResidueIdSchema): Query {
            
            return (ctx: Context) => {
                let residues = ctx.structure.residues,
                    chains = ctx.structure.chains,
                    { seqNumber, insCode, chainIndex, atomStartIndex, atomEndIndex } = residues,
                    { entityId, asymId, count, residueStartIndex, residueEndIndex } = chains,                                       
                    fragments = new FragmentSeqBuilder(ctx);
               
                let parent = ctx.structure.parent, 
                    { sourceChainIndex } = ctx.structure.chains,
                    parentAsymId = parent ? parent.chains.asymId : undefined,                    
                    isComputed = parent && sourceChainIndex;
                
                for (let cI = 0; cI < count; cI++) {                    
                    let aId = isComputed ? parentAsymId![sourceChainIndex![cI]] : asymId[cI];
                    if (entityId[cI] !== seqEntityId || aId !== seqAsymId) continue;
                    
                    let i = residueStartIndex[cI], last = residueEndIndex[cI], startIndex = -1, endIndex = -1;                    
                    for (; i < last; i++) {

                        if (seqNumber[i] >= start.seqNumber) {
                            startIndex = i;
                            break;
                        }
                    }

                    if (i === last) continue;
                    for (i = startIndex; i < last; i++) {                        
                        if (seqNumber[i] >= end.seqNumber) {
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
                let { atomStartIndex, atomEndIndex, isHet, entityIndex, count } = ctx.structure.residues,
                    entityType = ctx.structure.entities.entityType,
                    water = Structure.EntityType.Water,
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
                let { atomStartIndex, atomEndIndex, isHet, entityIndex, count } = ctx.structure.residues,
                    { entityType, count: entityCount, residueStartIndex: eRS, residueEndIndex: eRE } = ctx.structure.entities,
                    polymer = Structure.EntityType.Polymer,
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
                let atoms = ctx.structure.atoms,
                    xs = atoms.x, ys = atoms.y, zs = atoms.z,
                    count = atoms.count,
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

        ////function updateBox(f: Fragment,
        ////    arrays: { x: number[]; y: number[]; z: number[] },
        ////    deltas: { dx: number; dy: number; dz: number },
        ////    min: { x: number; y: number; z: number }, max: { x: number; y: number; z: number }) {

        ////    min.x = min.y = min.z = Number.MAX_VALUE;
        ////    max.x = max.y = max.z = -Number.MAX_VALUE;

        ////    for (let i of f.atomIndices) {
        ////        let x = arrays.x[i], y = arrays.y[i], z = arrays.z[i];

        ////        if (x > max.x) max.x = x;
        ////        if (y > max.y) max.y = y;
        ////        if (z > max.z) max.z = z;

        ////        if (x > min.x) min.x = x;
        ////        if (y > min.y) min.y = y;
        ////        if (z > min.z) min.z = z;
        ////    }
        ////    min.x -= deltas.dx;
        ////    min.y -= deltas.dy;
        ////    min.z -= deltas.dz;
        ////    max.x += deltas.dx;
        ////    max.y += deltas.dy;
        ////    max.z += deltas.dz;
        ////}

        ////export function compileExtendBox(what: Query, deltas: { dx: number; dy: number; dz: number }) {
        ////    return (ctx: Context) => {

        ////        let ret = new HashFragmentSeqBuilder(ctx);

        ////        let min = { x: 0.1, y: 0.1, z: 0.1 },
        ////            max = { x: 0.1, y: 0.1, z: 0.1 },
        ////            atoms = { x: ctx.structure.atoms.x, y: ctx.structure.atoms.y, z: ctx.structure.atoms.z },
        ////            xs = atoms.x, ys = atoms.y, zs = atoms.z,

        ////        for (let f of what(ctx).fragments) {

        ////            updateBox(f, atoms, deltas, min, max);
                    
        ////            let fragment: number[] = [];

        ////            for (let i of f.atomIndices) {
        ////                if (!ctx.hasAtom(i)) continue;

        ////                let x = xs[i], y = ys[i], z = zs[i];

        ////                if (x >= min.x && x <= max.x
        ////                    && y >= min.y && y <= max.y
        ////                    && z >= min.z && z <= max.z) {
        ////                    fragment[fragment.length] = i;
        ////                }
        ////            }

        ////            if (fragment.length > 0) {
        ////                //ret.add(Fragment.of)
        ////            }
        ////        }

        ////        return ret.getSeq();
        ////    };
        ////}
        
        export function compileInside(what: Source, where: Source): Query {
            
            let _what = Builder.toQuery(what);
            let _where = Builder.toQuery(where)
            return (ctx: Context) => {
                return new FragmentSeq(ctx, _what(Context.ofFragments(_where(ctx))).fragments);
            };
        }

        function narrowFragment(ctx: Context, f: Fragment, m: Context.Mask) {
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
                let map = Context.Mask.ofFragments(_where(ctx));
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
                let mask = Context.Mask.ofFragments(_what(ctx)),
                    count = 0, offset = 0;

                for (let i = 0, _b = ctx.structure.atoms.count; i < _b; i++) {
                    if (ctx.hasAtom(i) && !mask.has(i)) count++;
                }

                if (!count) return FragmentSeq.empty(ctx);

                let atoms = new Int32Array(count);
                for (let i = 0, _b = ctx.structure.atoms.count; i < _b; i++) {
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
                    indices = new Set<number>(),
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
                    atomNames = structure.atoms.name,
                    indices: number[] = [],
                    indexCount = 0;

                const allowedNames = new Set<string>(names);

                if (complement) {
                    for (let ei = 0; ei < structure.entities.count; ei++) {
                        if (structure.entities.entityType[ei] !== Structure.EntityType.Polymer) continue;

                        let start = structure.entities.atomStartIndex[ei], end = structure.entities.atomEndIndex[ei];
                        for (let i = start; i < end; i++) {
                            if (ctx.hasAtom(i) && !allowedNames.has(atomNames[i])) indices[indexCount++] = i;
                        }
                    }
                } else {
                    for (let ei = 0; ei < structure.entities.count; ei++) {
                        if (structure.entities.entityType[ei] !== Structure.EntityType.Polymer) continue;

                        let start = structure.entities.atomStartIndex[ei], end = structure.entities.atomEndIndex[ei];
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
                    tree = ctx.tree,
                    radiusCtx = Geometry.SubdivisionTree3D.createContextRadius(tree, radius, false),
                    buffer = radiusCtx.buffer, 
                    ret = new HashFragmentSeqBuilder(ctx),
                    x = ctx.structure.atoms.x, y = ctx.structure.atoms.y, z = ctx.structure.atoms.z,
                    residueIndex = ctx.structure.atoms.residueIndex,
                    atomStart = ctx.structure.residues.atomStartIndex, atomEnd = ctx.structure.residues.atomEndIndex, 
                    residues = new Set<number>(),
                    treeData = tree.data;
                
                for (let f of src.fragments) {

                    residues.clear();
                    for (let i of f.atomIndices) {
                        residues.add(residueIndex[i]);
                        radiusCtx.nearest(x[i], y[i], z[i], radius);

                        for (let j = 0, _l = buffer.count; j < _l; j++) {
                            residues.add(residueIndex[treeData[buffer.indices[j]]]);
                        }
                    }
                    
                    let atomCount = { count: 0, start: atomStart, end: atomEnd };
                    residues.forEach(function (this: typeof atomCount, r: number) { this.count += this.end[r] - this.start[r]; }, atomCount);

                    let indices = new Int32Array(atomCount.count),
                        atomIndices = { indices, offset: 0, start: atomStart, end: atomEnd };

                    residues.forEach(function (this: typeof atomIndices, r: number) {
                        for (let i = this.start[r], _l = this.end[r]; i < _l; i++) {
                            this.indices[this.offset++] = i;
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
                    residueIndex = ctx.structure.atoms.residueIndex,
                    atomStart = ctx.structure.residues.atomStartIndex, atomEnd = ctx.structure.residues.atomEndIndex,
                    residues = new Set<number>();

                for (let f of src.fragments) {

                    residues.clear();
                    for (let i of f.atomIndices) {
                        residues.add(residueIndex[i]);
                    }

                    let atomCount = { count: 0, start: atomStart, end: atomEnd };
                    residues.forEach(function (this: typeof atomCount, r: number) { this.count += this.end[r] - this.start[r]; }, atomCount);
                    
                    let indices = new Int32Array(atomCount.count),
                        atomIndices = { indices, offset: 0, start: atomStart, end: atomEnd };

                    residues.forEach(function (this: typeof atomIndices, r: number) {
                        for (let i = this.start[r], _l = this.end[r]; i < _l; i++) {
                            this.indices[this.offset++] = i;
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

    }

}