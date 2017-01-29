/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Utils.Molecule {
    "use strict";
    
    import Structure = LiteMol.Core.Structure;
    import Geometry = LiteMol.Core.Geometry;
    
    const __model = [Entity.Molecule.Model];
    export function findModel(entity: Entity.Any): Entity.Molecule.Model | undefined  {
        return Tree.Node.findClosestNodeOfType(entity, __model) as Entity.Molecule.Model; 
    }

    const __modelOrSelection = [Entity.Molecule.Model, Entity.Molecule.Selection];
    export function findModelOrSelection(entity: Entity.Any): Entity.Molecule.Model | Entity.Molecule.Selection | undefined  {
        return Tree.Node.findClosestNodeOfType(entity, __modelOrSelection) as (Entity.Molecule.Model | Entity.Molecule.Selection | undefined); 
    }
    
    const __molecule = [Entity.Molecule.Molecule];
    export function findMolecule(entity: Entity.Any): Entity.Molecule.Molecule | undefined  {
        return Tree.Node.findClosestNodeOfType(entity, __molecule) as Entity.Molecule.Molecule; 
    }
 
    export function findQueryContext(entity: Entity.Any) {        
        let source = Tree.Node.findClosestNodeOfType(entity, __modelOrSelection) as (Entity.Molecule.Model | Entity.Molecule.Selection)
        
        if (Entity.isMoleculeModel(source)) {
            return source.props.model.queryContext;
        } else {
            let cache = source.tree!.context.entityCache;
            let ctx = cache.get<Core.Structure.Query.Context>(source, Entity.Cache.Keys.QueryContext);
            if (ctx) return ctx;            
            ctx = Core.Structure.Query.Context.ofAtomIndices(findModel(source)!.props.model, source.props.indices);
            return cache.set(source, Entity.Cache.Keys.QueryContext, ctx);
        }
    }
    
    export function getDistance(mA: Structure.Molecule.Model, 
        startAtomIndexA: number, endAtomIndexA: number,
        mB: Structure.Molecule.Model,
        startAtomIndexB: number, endAtomIndexB: number
    ) {
        let {x,y,z} = mA.positions;
        let {x:bX,y:bY,z:bZ} = mB.positions;
        let d = Number.POSITIVE_INFINITY;
        
        for (let i = startAtomIndexA; i < endAtomIndexA; i++) {
            for (let j = startAtomIndexB; j < endAtomIndexB; j++) {
                let dx = x[i] - bX[j], dy = y[i] - bY[j], dz = z[i] - bZ[j];
                d = Math.min(d, dx * dx + dy * dy + dz * dz);
            }
        }
        
        return Math.sqrt(d);        
    }
    
    
    export function getDistanceSet(mA: Structure.Molecule.Model, 
        setA: number[],
        mB: Structure.Molecule.Model,
        setB: number[]
    ) {
        let {x,y,z} = mA.positions;
        let {x:bX,y:bY,z:bZ} = mB.positions;
        let d = Number.POSITIVE_INFINITY;
        
        for (let i of setA) {
            for (let j of setB) {
                let dx = x[i] - bX[j], dy = y[i] - bY[j], dz = z[i] - bZ[j];
                d = Math.min(d, dx * dx + dy * dy + dz * dz);
            }
        }
        
        return Math.sqrt(d);        
    }
    
    export function getModelAndIndicesFromQuery(m: Entity.Any, query: Core.Structure.Query.Source): { model: Entity.Molecule.Model, indices: number[], queryContext: Core.Structure.Query.Context } | undefined {
        let model = findModel(m);
        if (!model) {
            console.warn('Could not find a model for query selection.');
            return void 0;
        }
        
        let queryContext = findQueryContext(m);
        try {
            let q = Core.Structure.Query.Builder.toQuery(query);
            return { model, indices: q(queryContext).unionAtomIndices(), queryContext };
        } catch (e) {
            console.error('Query Execution', e);
            return void 0;
        }
    }
    
    export function getResidueIndices(m: Core.Structure.Molecule.Model, atom: number) {
        let rI = m.data.atoms.residueIndex;
        let idx: number[] = [];
        for (let i = m.data.residues.atomStartIndex[rI[atom]], _b = m.data.residues.atomEndIndex[rI[atom]]; i < _b; i++) {
            idx.push(i);
        }
        return idx;  
    }
    
    export function getBox(molecule: Core.Structure.Molecule.Model, atomIndices: number[], delta: number) {
        let { x, y, z } = molecule.positions,
            min = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE], max = [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];

        for (let i of atomIndices) {
            min[0] = Math.min(x[i], min[0]);
            min[1] = Math.min(y[i], min[1]);
            min[2] = Math.min(z[i], min[2]);
            max[0] = Math.max(x[i], max[0]);
            max[1] = Math.max(y[i], max[1]);
            max[2] = Math.max(z[i], max[2]);
        }


        min[0] = min[0] - delta;
        min[1] = min[1] - delta;
        min[2] = min[2] - delta;

        max[0] = max[0] + delta;
        max[1] = max[1] + delta;
        max[2] = max[2] + delta;

        return {
            bottomLeft: min,
            topRight: max
        };
    }
    
    
    export class CentroidHelper {
        center = {x:0, y:0, z:0};
        radiusSquared = 0;
        count = 0;
        
        private x: number[];
        private y: number[];
        private z: number[];
        
        addAtom(i: number) {
            this.count++;
            this.center.x += this.x[i];
            this.center.y += this.y[i];
            this.center.z += this.z[i];
        }
        
        finishedAdding() {
            this.center.x /= this.count;
            this.center.y /= this.count;
            this.center.z /= this.count;
        }
        
        radiusVisit(i: number) {
            let dx = this.center.x - this.x[i], dy = this.center.y - this.y[i], dz = this.center.z - this.z[i];
            this.radiusSquared = Math.max(this.radiusSquared, dx * dx + dy * dy + dz * dz);
        }
        
        constructor(model: LiteMol.Core.Structure.Molecule.Model) {
            this.x = model.positions.x;
            this.y = model.positions.y;
            this.z = model.positions.z;
        }
    }
        
    export function getCentroidAndRadius(m: Structure.Molecule.Model, indices: number[], into: Geometry.LinearAlgebra.ObjectVec3) {
        into.x = 0;
        into.y = 0;
        into.z = 0;
        let {x,y,z} = m.positions;
        for (let i of indices) {
            into.x += x[i];
            into.y += y[i];
            into.z += z[i];
        }   
        let c = indices.length;     
        into.x /= c;
        into.y /= c;
        into.z /= c;
        let radius = 0;
        for (let i of indices) {
            let dx = into.x - x[i], dy = into.y - y[i], dz = into.z - z[i];
            radius = Math.max(radius, dx * dx + dy * dy + dz * dz);
        }   
        return Math.sqrt(radius);
    }
    
}