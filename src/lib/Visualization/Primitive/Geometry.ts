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
        const axis = LA.Vector3.cross(LA.Vector3.zero(), coneAxis, dir);
        const angle = LA.Vector3.angle(coneAxis, dir);
        LA.Matrix4.fromRotation(coneTransformRotation, angle, axis);
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

    const unitCube = GeometryHelper.toSurface(new THREE.BoxGeometry(1, 1, 1));
    export function createDashes(line: Shape.DashedLine) {
        const { id, a, b, width, dashSize } = line;
        const dist = LA.Vector3.distance(a, b);
        const dir = LA.Vector3.sub(LA.Vector3.zero(), b, a);
        LA.Vector3.normalize(dir, dir);
        const numDashes = Math.ceil(dist / dashSize);
        const delta = dist / (numDashes - 1);
        const scale = [width, width, delta];
        const up = [0, 0, 1];
        const axis = LA.Vector3.cross(LA.Vector3.zero(), up, dir);
        const angle = LA.Vector3.angle(up, dir);
        const rotation = LA.Matrix4.fromRotation(LA.Matrix4.zero(), angle, axis)!;

        const surfaces: Visualization.Primitive.Shape.Surface[] = [];
        for (let i = 0; i < numDashes; i += 2) {
            const translation = [a[0] + dir[0] * delta * i, a[1] + dir[1] * delta * i, a[2] + dir[2] * delta * i];
            surfaces.push({
                type: 'Surface',
                id,
                surface: unitCube,
                rotation,
                scale,
                translation
            });
        }
        return surfaces;
    }
}