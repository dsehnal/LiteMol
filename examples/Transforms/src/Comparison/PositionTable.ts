/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Comparison.Base {
    "use strict";

    import PositionTableSchema = Core.Structure.PositionTable;
    import LA = Core.Geometry.LinearAlgebra;

    export namespace PositionTable {        
        export function transformToCentroidCoordinates(table: PositionTableSchema) {
            const centroid = PositionTable.getCentroid(table);
            const atomsX = table.x;
            const atomsY = table.y;
            const atomsZ = table.z;
            for (let i = 0; i < table.count; i++) {
                atomsX[i] -= centroid[0];
                atomsY[i] -= centroid[1];
                atomsZ[i] -= centroid[2];
            }
        }

        export function getCentroid(positions: PositionTableSchema): LA.Vector3 {

            let xs = positions.x, ys = positions.y, zs = positions.z;
            let center = LA.Vector3.zero();

            for (let i = 0, _l = positions.count; i < _l; i++) {
                center[0] += xs[i];
                center[1] += ys[i];
                center[2] += zs[i];
            }

            LA.Vector3.scale(center, center, 1 / positions.count);
            return center;
        }
    }
}