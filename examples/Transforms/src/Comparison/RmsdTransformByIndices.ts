/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Comparison.Structure {

    import Structure = LiteMol.Core.Structure;

    export interface RmsdTransformByIndicesResult {
        transforms: Base.RmsdTransformResult[];
        averageRmsd: number;
    }
    
    export interface RmsdTransformByIndicesEntry { 
        model: Structure.Molecule.Model; 
        atomIndices: number[] 
    };
    
    function makePositionTable(model: Structure.Molecule.Model, indices: number[]) {
        let table = Core.Utils.DataTable.builder<Core.Structure.Position>(indices.length);
        let x = table.addColumn('x', s => new Float64Array(s));
        let y = table.addColumn('y', s => new Float64Array(s));
        let z = table.addColumn('z', s => new Float64Array(s));

        let xs = model.positions.x, ys = model.positions.y, zs = model.positions.z;
        
        let i = 0;

        for (let aI of indices) {
            x[i] = xs[aI];
            y[i] = ys[aI];
            z[i] = zs[aI];
            i++;
        }

        return table.seal();
    }

    export function superimposeByIndices(data: RmsdTransformByIndicesEntry[]): RmsdTransformByIndicesResult {
        let transforms: Base.RmsdTransformResult[] = [];
        let averageRmsd = 0;

        for (let i = 1; i < data.length; i++) {
            let t = Base.findMinimalRmsdTransform({ 
                a: makePositionTable(data[0].model, data[0].atomIndices),
                b: makePositionTable(data[i].model, data[i].atomIndices)  
            });
            transforms.push(t);
            averageRmsd += t.rmsd;
        }

        averageRmsd /= Math.max(transforms.length, 1);

        return { transforms, averageRmsd };
    }
}