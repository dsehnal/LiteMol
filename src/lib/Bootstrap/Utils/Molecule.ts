/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Utils.Molecule {
    "use strict";
    
    import Structure = LiteMol.Core.Structure;
    import Geometry = LiteMol.Core.Geometry;
    import LA = Geometry.LinearAlgebra
    
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
        
    export function getCentroidAndRadius(m: Structure.Molecule.Model, indices: number[], into: LA.Vector3) {        
        LA.Vector3.set(into, 0, 0, 0);
        let {x,y,z} = m.positions;
        
        if (indices.length === 0) return 0;
        if (indices.length === 1) {
            LA.Vector3.set(into, x[indices[0]], y[indices[0]], z[indices[0]]);
            return 0;
        }
        
        for (let i of indices) {
            into[0] += x[i];
            into[1] += y[i];
            into[2] += z[i];
        }   
        let c = indices.length;     
        into[0] /= c;
        into[1] /= c;
        into[2] /= c;
        let radius = 0;
        for (let i of indices) {
            let dx = into[0] - x[i], dy = into[1] - y[i], dz = into[2] - z[i];
            radius = Math.max(radius, dx * dx + dy * dy + dz * dz);
        }   
        return Math.sqrt(radius);
    }

    export interface Labels3DOptions {
        kind: 'Residue-Name' | 'Residue-Full-Id' | 'Atom-Name' | 'Atom-Element',
        labelsOptions: LiteMol.Visualization.Labels.LabelsOptions
    }

    export const Labels3DKinds: Labels3DOptions['kind'][] = [ 'Residue-Name', 'Residue-Full-Id', 'Atom-Name', 'Atom-Element' ]

    export const Labels3DKindLabels: { [kind: string]: string } = {
        'Residue-Name': 'Residue Name',
        'Residue-Full-Id': 'Residue Full Id',
        'Atom-Name': 'Atom Name',
        'Atom-Element': 'Atom Element'
    }

    function labelProvider(options: Labels3DOptions, model: Core.Structure.Molecule.Model) {
        const { residueIndex, chainIndex, name, elementSymbol } = model.data.atoms;
        const { name: residueName, seqNumber } = model.data.residues;
        const { authAsymId } = model.data.chains;
        switch (options.kind) {
            case 'Residue-Name': return (i: number) => residueName[residueIndex[i]];
            case 'Residue-Full-Id': return (i: number) => {
                const r = residueIndex[i], c = chainIndex[i];
                return `${residueName[r]} ${authAsymId[c]} ${seqNumber[r]}`;
            };
            case 'Atom-Name': return (i: number) => name[i];
            case 'Atom-Element': return (i: number) => elementSymbol[i];
            default: return (i: number) => `${i}`;
        }
    }

    export function create3DLabelsParams(entity: Entity.Any, options: Labels3DOptions, theme: LiteMol.Visualization.Theme): LiteMol.Visualization.Labels.LabelsParams {
        const ctx = findQueryContext(entity);
        const query = options.kind.indexOf('Residue') >= 0 ? Core.Structure.Query.residues() : Core.Structure.Query.allAtoms();
        const fs = query.compile()(ctx);
        const label = labelProvider(options, ctx.structure);


        const positions = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Positions, fs.length);
        const { x, y, z } = positions;
        const labels: string[] = [];
        const sizes = new Float32Array(fs.length) as any as number[];
        const center = LA.Vector3.zero();

        let i = 0;
        for (const f of fs.fragments) {
            const l = label(f.atomIndices[0]);
            getCentroidAndRadius(ctx.structure, f.atomIndices, center);
            x[i] = center[0]; y[i] = center[1]; z[i] = center[2];
            labels[labels.length] = l;
            sizes[i] = 1.0;
            i++;
        }

        return {
            labels,
            options: options.labelsOptions,
            positions,
            sizes,
            theme
        };
    }    
}