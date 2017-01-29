/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Primitive {
    "use strict";

    import LA = Core.Geometry.LinearAlgebra

    export function createSphereSurface(center: Core.Geometry.LinearAlgebra.ObjectVec3, radius: number, tessalation: number) {
        let geom = new THREE.IcosahedronGeometry(radius, tessalation);
        let surface = GeometryHelper.toSurface(geom);
        if (center.x !== 0 || center.y !== 0 || center.z !== 0) {
            Core.Geometry.Surface.transformImmediate(surface, LA.Matrix4.fromTranslation(LA.Matrix4.empty(), [center.x, center.y, center.z]));
        }
        return surface;
    }
}