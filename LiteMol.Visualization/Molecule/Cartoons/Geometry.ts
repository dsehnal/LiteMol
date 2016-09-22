/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Molecule.Cartoons.Geometry {
    
    
    

    export class Data extends GeometryBase {

        geometry: THREE.BufferGeometry = <any>void 0;
        pickGeometry: THREE.BufferGeometry = <any>void 0;

        vertexMap: Selection.VertexMap = <any>void 0;
        vertexStateBuffer: THREE.BufferAttribute = <any>void 0;
        
        dispose() {
            this.geometry.dispose();
            this.pickGeometry.dispose();
        }

    }
    
    export interface Context {
        computation: Core.Computation.Context<Model>,
        
        model: Core.Structure.MoleculeModel,
        atomIndices: number[],
        linearSegments: number,
        parameters: any,
        isTrace: boolean,
                
        params: CartoonsGeometryParams,
        
        state: CartoonsGeometryState,
        units: CartoonAsymUnit[],
        
        strandTemplate: { vertex: number[]; normal: number[]; index: number[]; geometry: THREE.BufferGeometry },
        strandArrays: { startIndex: number[]; endIndex: number[]; x: number[]; y: number[]; z: number[]; name: string[] },
        
        builder: Builder,
                
        geom: Data        
    }

    export function create(
        model: Core.Structure.MoleculeModel,
        atomIndices: number[],
        linearSegments: number,
        parameters: any,
        isTrace: boolean,
        computation: Core.Computation.Context<Model>,
        done: (g: Data) => void) {
        
        let params = <CartoonsGeometryParams>Core.Utils.extend({}, parameters, CartoonsGeometryParams.Default);
        let ctx: Context = {
            computation,
            model,
            atomIndices,
            linearSegments,
            parameters,
            isTrace,
            
            params,
            state: new CartoonsGeometryState(params, model.residues.count),
            units: <any>void 0,
            
            strandArrays: <any>void 0,
            strandTemplate: <any>void 0,
            
            builder: new Builder(),
            
            geom: new Data()
        };
        
        ctx.computation.update('Building units...');
        
        ctx.computation.schedule(() => {
            
            ctx.units = CartoonAsymUnit.buildUnits(ctx.model, ctx.atomIndices, ctx.linearSegments);
            buildUnitsChunk(0, ctx, () => {
                if (ctx.strandTemplate) ctx.strandTemplate.geometry.dispose();
                ctx.geom.vertexMap = ctx.state.vertexMap.getMap();
                createGeometry(ctx);                
                let ret = ctx.geom;
                for (let k of Object.keys(ctx)) {
                    if (!Object.prototype.hasOwnProperty.call(ctx, k)) continue;
                    (ctx as any)[k] = void 0;
                }                    
                done(ret);          
            });
        });
    }
}