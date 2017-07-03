/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Primitive {
    "use strict";

    import LA = Core.Geometry.LinearAlgebra

    export function createSphereSurface(sphere: Shape.Sphere) {
        const { tessalation = 0 } = sphere;
        const geom = new THREE.IcosahedronGeometry(1.0, tessalation);
        const surf = GeometryHelper.toSurface(geom);
        geom.dispose();
        return surf;
    }

    export function createTubeSurface(tube: Shape.Tube) {
        const { a, b, slices = 12 } = tube;
        const geom = new THREE.TubeGeometry(
            new THREE.LineCurve3(new THREE.Vector3(a[0], a[1], a[2]), new THREE.Vector3(b[0], b[1], b[2])) as any,
            2, tube.radius, slices);
        const surf = GeometryHelper.toSurface(geom);
        geom.dispose();
        return surf;
    }

    const coneAxis = [0, 1, 0], coneTransformRotation = LA.Matrix4.zero(), coneTransformTranslation = LA.Matrix4.zero(), coneTransformTranslation1 = LA.Matrix4.zero();
    export function createCone(cone: Shape.Cone) {
        const { a, b, radius, slices = 12 } = cone;
        const height = LA.Vector3.distance(a, b);
        const geom = new THREE.CylinderGeometry(0, radius, height, slices, 1);
        const surf = GeometryHelper.toSurface(geom);
        geom.dispose();

        const dir = LA.Vector3.sub(b, b, a);

        LA.Vector3.makeRotation(coneTransformRotation, coneAxis, dir);
        LA.Matrix4.fromTranslation(coneTransformTranslation1, [0, height / 2, 0]);
        LA.Matrix4.fromTranslation(coneTransformTranslation, a);

        Core.Geometry.Surface.transformImmediate(surf, LA.Matrix4.mul3(coneTransformTranslation, coneTransformTranslation, coneTransformRotation, coneTransformTranslation1));
        Core.Geometry.Surface.computeNormalsImmediate(surf);

        return surf;
    }

    export function createArrow(arrow: Shape.Arrow): Shape[] {
        const { id, a, b, radius, slices = 12, coneHeight, coneRadius } = arrow;
        const len = LA.Vector3.distance(a, b);
        const t = len - coneHeight;
        const dir = LA.Vector3.normalize(b,LA.Vector3.sub(b, b, a));
        const pivot = [a[0] + t * dir[0], a[1] + t * dir[1], a[2] + t * dir[2]];

        return [
            { type: 'Cone', a: pivot, b, id, radius: coneRadius, slices },
            { type: 'Tube', a, b: pivot, id, radius, slices }
        ];
    }

    const dashSurface = (function() {
        const dash = GeometryHelper.toSurface(new THREE.BoxGeometry(1, 1, 1));
        for (let i = 0; i < dash.vertices.length; i += 3) {
            dash.vertices[i + 2] += 0.5;
        }
        return dash;
    })();
    export function createDashes(line: Shape.DashedLine) {        
        const { id, a, b, width, dashSize, spaceSize } = line;
        const length = LA.Vector3.distance(a, b);
        if (length === 0) return [];

        const delta = dashSize + (spaceSize !== void 0 ? spaceSize : dashSize);
        const dir = LA.Vector3.sub(LA.Vector3(), b, a);
        LA.Vector3.normalize(dir, dir);

        let scale = LA.Vector3.fromValues(width, width, dashSize);
        const up = LA.Vector3.fromValues(0, 0, 1);
        const rotation = LA.Vector3.makeRotation(LA.Matrix4(), up, dir);

        const surfaces: Visualization.Primitive.Shape.Surface[] = [];

        LA.Vector3.scale(dir, dir, delta);
        const axis = LA.Vector3.copy(LA.Vector3(), a);

        for (let t = 0; t < length; t += delta) {
            if (t + dashSize > length) scale = LA.Vector3.fromValues(width, width, length - t);
            surfaces.push({
                type: 'Surface',
                id,
                surface: dashSurface,
                rotation,
                scale,
                translation: LA.Vector3.clone(axis)
            });
            LA.Vector3.add(axis, axis, dir);
        }
        return surfaces;
    }
}