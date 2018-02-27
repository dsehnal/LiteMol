/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Molecule.Cartoons.Geometry {
    export class Data extends GeometryBase {
        geometry: THREE.BufferGeometry = <any>void 0;
        pickGeometry: THREE.BufferGeometry = <any>void 0;

        gapsGeometry: THREE.BufferGeometry | undefined = void 0;
        directionConesGeometry: THREE.BufferGeometry | undefined = void 0;

        vertexMap: Selection.VertexMap = <any>void 0;
        vertexStateBuffer: THREE.BufferAttribute = <any>void 0;
        
        dispose() {
            this.geometry.dispose();
            this.pickGeometry.dispose();
            if (this.gapsGeometry) {
                this.gapsGeometry.dispose();
            }
            if (this.directionConesGeometry) {
                this.directionConesGeometry.dispose();
            }
        }
    }
    
    export interface CreateParameters {
        radialSegmentCount: number, 
        tessalation: number,
        showDirectionCones: boolean
    }

    export interface Context {
        computation: Core.Computation.Context,
        
        model: Core.Structure.Molecule.Model,
        atomIndices: number[],
        linearSegments: number,
        parameters: CreateParameters,
        isTrace: boolean,
                
        params: CartoonsGeometryParams,
        
        state: CartoonsGeometryState,
        units: CartoonAsymUnit[],
        
        strandTemplate: { vertex: number[]; normal: number[]; index: number[]; geometry: THREE.BufferGeometry },
        strandArrays: { startIndex: number[]; endIndex: number[]; x: number[]; y: number[]; z: number[]; name: string[] },
        
        builder: Builder,
                
        geom: Data        
    }

    export async function create(
        model: Core.Structure.Molecule.Model,
        atomIndices: number[],
        linearSegments: number,
        parameters: CreateParameters,
        isTrace: boolean,
        computation: Core.Computation.Context): Promise<Data> {
        
        let params = <CartoonsGeometryParams>Core.Utils.extend({}, parameters, CartoonsGeometryParams.Default);
        let ctx: Context = {
            computation,
            model,
            atomIndices,
            linearSegments,
            parameters,
            isTrace,
            
            params,
            state: new CartoonsGeometryState(params, model.data.residues.count),
            units: <any>void 0,
            
            strandArrays: {
                startIndex: model.data.residues.atomStartIndex,
                endIndex: model.data.residues.atomEndIndex,
                x: model.positions.x, y: model.positions.y, z: model.positions.z,
                name: model.data.atoms.name
            },
            strandTemplate: <any>void 0,
            
            builder: new Builder(),
            
            geom: new Data()
        };
        
        await ctx.computation.updateProgress('Building units...');
    
        ctx.units = CartoonAsymUnit.buildUnits(ctx.model, ctx.atomIndices, ctx.linearSegments);

        await buildUnitsAsync(ctx);

        if (ctx.strandTemplate) ctx.strandTemplate.geometry.dispose();
        ctx.geom.vertexMap = ctx.state.vertexMap.getMap();
        await ctx.computation.updateProgress('Creating geometry...');
        createGeometry(ctx);                
        let ret = ctx.geom;
        // help the GC
        for (let k of Object.keys(ctx)) {
            if (!Object.prototype.hasOwnProperty.call(ctx, k)) continue;
            (ctx as any)[k] = void 0;
        }                    
        return ret;          
    }
}