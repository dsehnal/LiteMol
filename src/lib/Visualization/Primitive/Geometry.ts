/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Primitive {
    "use strict";

    export function createSphereSurface(sphere: Shape.Sphere) {
        const { tessalation = 0 } = sphere;
        const geom = new THREE.IcosahedronGeometry(1.0, tessalation);
        const surf = GeometryHelper.toSurface(geom);
        geom.dispose();
        return surf;
    }

    export function createTubeSurface(tube: Shape.Tube) {
        const { a, b, tessalation = 4 } = tube;
        const geom = new THREE.TubeGeometry(
            new THREE.LineCurve3(new THREE.Vector3(a.x, a.y, a.z), new THREE.Vector3(b.x, b.y, b.z)) as any,
            2, tube.radius, tessalation);
        const surf = GeometryHelper.toSurface(geom);
        geom.dispose();
        return surf;
    }
}