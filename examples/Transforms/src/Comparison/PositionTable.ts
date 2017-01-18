/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Comparison.Base {
    "use strict";

    import PositionTableSchema = Core.Structure.PositionTable;
    import ObjectVec3 = Core.Geometry.LinearAlgebra.ObjectVec3;

    export namespace PositionTable {        
        export function transformToCentroidCoordinates(table: PositionTableSchema) {
            const centroid = PositionTable.getCentroid(table);
            const atomsX = table.x;
            const atomsY = table.y;
            const atomsZ = table.z;
            for (let i = 0; i < table.count; i++) {
                atomsX[i] -= centroid.x;
                atomsY[i] -= centroid.y;
                atomsZ[i] -= centroid.z;
            }
        }

        export function getCentroid(positions: PositionTableSchema): ObjectVec3 {

            let xs = positions.x, ys = positions.y, zs = positions.z;
            let center = { x: 0, y: 0, z: 0 };

            for (let i = 0, _l = positions.count; i < _l; i++) {
                center.x += xs[i];
                center.y += ys[i];
                center.z += zs[i];
            }

            center.x /= positions.count;
            center.y /= positions.count;
            center.z /= positions.count;

            return center;
        }
    }
}