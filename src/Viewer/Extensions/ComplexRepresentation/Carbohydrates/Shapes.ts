/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.ComplexReprensetation.Carbohydrates.Shapes {
    import THREE = LiteMol.Visualization.THREE
    import LA = LiteMol.Core.Geometry.LinearAlgebra
    import Geom = LiteMol.Core.Geometry
    import Vis = LiteMol.Visualization
    import Model = Core.Structure.Molecule.Model
    import Mat4 = LA.Matrix4
    import Vec3 = LA.Vector3
    
    const sqSide = 0.806; //Math.cos(Math.PI / 4);
    export const Sphere = toSurface(new THREE.IcosahedronGeometry(1.0, 2));
    export const Cube = toSurface(new THREE.BoxGeometry(2 * sqSide, 2 * sqSide, 2 * sqSide));
    export const Diamond = toSurface(new THREE.OctahedronGeometry(1.3, 0));
    export const Cone = toSurface(new THREE.CylinderGeometry(0, 1, 1.6, 32, 1), [0, 0.5, 0]);
    export const ConeLeft = toSurface(new THREE.CylinderGeometry(0, 1, 1.6, 16, 1, false, 0, Math.PI), [0, 0.5, 0]);
    export const ConeRight = toSurface(new THREE.CylinderGeometry(0, 1, 1.6, 16, 1, false, 0, -Math.PI), [0, 0.5, 0]);
    export const Star = toSurface(star());
    export const FlatRectangle = toSurface(new THREE.BoxGeometry(sqSide, sqSide, 2 * sqSide));
    export const FlatDiamond = toSurface(polygon(4, 0.66));
    export const FlatPentagon = toSurface(polygon(5, 0.66));
    export const FlatHexagon = toSurface(polygon(6, 0.66), void 0, [0.75, 1, 1]);

    function toSurface(g: THREE.Geometry, translation?: number[], scale?: number[]) {
        g.computeVertexNormals();
        const geom = Vis.GeometryHelper.toSurface(g);
        g.dispose();
        if (scale) {
            const t = Mat4.fromScaling(Mat4.zero(), scale);
            Geom.Surface.transformImmediate(geom, t);
        }
        if (translation) {
            const t = Mat4.fromTranslation(Mat4.zero(), translation);
            Geom.Surface.transformImmediate(geom, t);
        }
        return geom;
    }

    function star() {
        const pts = [], numPts = 5;
        for (let i = 0; i < numPts * 2; i++) {
            const l = i % 2 == 1 ? 0.2 : 0.85;
            const a = i / numPts * Math.PI;
            pts.push(new THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l));
        }
        return new THREE.ExtrudeGeometry(new THREE.Shape(pts), { amount: 0, steps: 2, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.15, bevelSegments: 12 });
    }

    function polygon(numPts: number, height: number) {
        const pts = [];
        for (let i = 0; i < numPts; i++) {
            const a = 2 * i / numPts * Math.PI;
            pts.push(new THREE.Vector2(Math.cos(a), Math.sin(a)));
        }
        const shape = new THREE.Shape(pts);
        const extrudePath = new THREE.LineCurve3(new THREE.Vector3(0, 0, -height / 2), new THREE.Vector3(0, 0, height / 2)) 
        return new THREE.ExtrudeGeometry(shape, { amout: height / 2, steps: 2, bevelEnabled: false, extrudePath })
    }

    export function stripe(s: Geom.Surface): Geom.Surface[] {
        const lower = Math.ceil(s.triangleCount / 2), upper = Math.floor(s.triangleCount / 2);
        const lowIndices = new Uint32Array(lower * 3), upIndices = new Uint32Array(upper * 3);
        let li = 0, ui = 0;

        for (let i = 0; i < s.triangleIndices.length; i += 6) {
            lowIndices[li++] = s.triangleIndices[i];
            lowIndices[li++] = s.triangleIndices[i + 1];
            lowIndices[li++] = s.triangleIndices[i + 2];
        }
        for (let i = 3; i < s.triangleIndices.length; i += 6) {
            upIndices[ui++] = s.triangleIndices[i];
            upIndices[ui++] = s.triangleIndices[i + 1];
            upIndices[ui++] = s.triangleIndices[i + 2];
        }

        return [
            { ...s, triangleCount: lower, triangleIndices: lowIndices, boundingSphere: void 0 },
            { ...s, triangleCount: upper, triangleIndices: upIndices, boundingSphere: void 0 }
        ];
    }

    export function split(s: Geom.Surface): Geom.Surface[] {
        const lower = Math.ceil(s.triangleCount / 2), upper = Math.floor(s.triangleCount / 2);
        const lowIndices = new Uint32Array(lower * 3), upIndices = new Uint32Array(upper * 3);
        let li = 0, ui = 0;

        const div = lower * 3;
        for (let i = 0; i < div; i += 3) {
            lowIndices[li++] = s.triangleIndices[i];
            lowIndices[li++] = s.triangleIndices[i + 1];
            lowIndices[li++] = s.triangleIndices[i + 2];
        }
        for (let i = div; i < s.triangleIndices.length; i += 3) {
            upIndices[ui++] = s.triangleIndices[i];
            upIndices[ui++] = s.triangleIndices[i + 1];
            upIndices[ui++] = s.triangleIndices[i + 2];
        }

        return [
            { ...s, triangleCount: lower, triangleIndices: lowIndices, boundingSphere: void 0 },
            { ...s, triangleCount: upper, triangleIndices: upIndices, boundingSphere: void 0 }
        ];
    }

    const signMatrix = Mat4();
    Mat4.setValue(signMatrix, 3, 3, 1);
    function sign(a: Vec3, b: Vec3, c: Vec3) {
        for (let i = 0; i < 3; i++) {
             Mat4.setValue(signMatrix, i, 0, a[i]);
             Mat4.setValue(signMatrix, i, 1, b[i]);
             Mat4.setValue(signMatrix, i, 2, c[i]);
        }
        return Mat4.determinant(signMatrix) < 0 ? -1 : 1;
    }

    function ringPlane(model: Model, { ringAtoms, ringCenter }: Entry) {
        const { x, y, z } = model.positions;
        // determine the ring plane from C2, C4, O
        const o = ringAtoms[ringAtoms.length - 1], c2 = ringAtoms[1], c4 = ringAtoms[3];
        const dU = Vec3.sub(Vec3(), Vec3(x[c2], y[c2], z[c2]), Vec3(x[o], y[o], z[o])); // C2 - O
        const dV = Vec3.sub(Vec3(), Vec3(x[c4], y[c4], z[c4]), Vec3(x[o], y[o], z[o])); // C4 - O
        const ringNormal = Vec3.cross(Vec3(), dU, dV);
        const c1 = ringAtoms[0];
        const towardsC1 = Vec3.sub(Vec3(), Vec3(x[c1], y[c1], z[c1]), ringCenter);
        return { ringNormal, towardsC1 };
    }

    const majorRotationTemp = Mat4();
    function getRotation(majorAxis: Vec3, minorAxis: Vec3, entry: Entry) {
        const { representation: { axisUp: upVector, axisSide: sideVector } } = entry;
        const majorRotation = Vec3.makeRotation(majorRotationTemp, upVector, majorAxis);
        const side = Vec3.transformMat4(Vec3(), sideVector, majorRotation);
        const angle = sign(side, minorAxis, majorAxis) * Vec3.angle(side, minorAxis);
        const minorRotation = Math.abs(angle) > 0.001
            ? Mat4.fromRotation(Mat4(), angle, majorAxis)
            : Mat4.fromIdentity(Mat4());
        return Mat4.mul(minorRotation, minorRotation, majorRotation)!;
    }

    function alignedNormal(dU: Vec3, dV: Vec3, s: number) {
        const n = Vec3.cross(Vec3(), dU, dV);
        if (s * n[2] < 0) Vec3.scale(n, n, -1);
        Vec3.normalize(n, n);
        return n;
    }

    function findRotation(ringNormal: Vec3, towardsC1: Vec3, entry: Entry, type: Params['type']) {
        // if (type === 'Icons') {
        //     return getRotation(ringNormal, towardsC1, entry);
        // }

        const { links, terminalLinks } = entry;
        const linkCount = links.length, terminalLinkCount = terminalLinks.length;

        let majorAxis/*, minorAxis*/;

        if (linkCount > 1 && terminalLinkCount > 0) {
            majorAxis = Vec3();
            //minorAxis = towardsC1;
            for (const l of terminalLinks) {
                const dir = Vec3.sub(Vec3(), l.centerB, l.centerA);
                Vec3.normalize(dir, dir);
                Vec3.add(majorAxis, majorAxis, dir);
            }
            Vec3.normalize(majorAxis, majorAxis);
        } else if (linkCount === 1)  {
            majorAxis = Vec3.sub(Vec3(), links[0].centerA, links[0].centerB);
            //minorAxis = Vec3.cross(Vec3(), majorAxis, towardsC1);
        } else if (linkCount === 2) {
            const dU = Vec3.sub(Vec3(), links[0].centerA, links[0].centerB);
            const dV = Vec3.sub(Vec3(), links[1].centerA, links[1].centerB);
            Vec3.normalize(dU, dU);
            Vec3.normalize(dV, dV);
            majorAxis = Vec3.add(Vec3(), dU, dV);
            //minorAxis = Vec3.cross(dU, dU, dV);
            //if (ringNormal[2] * minorAxis[2] < 0) Vec3.scale(minorAxis, minorAxis, -1);
        } else if (linkCount === 3) {
            const dA = Vec3.sub(Vec3(), links[0].centerA, links[0].centerB);
            const dB = Vec3.sub(Vec3(), links[1].centerA, links[1].centerB);
            const dC = Vec3.sub(Vec3(), links[2].centerA, links[2].centerB);
            const n1 = alignedNormal(dA, dB, ringNormal[2]);
            const n2 = alignedNormal(dA, dC, ringNormal[2]);
            const n3 = alignedNormal(dB, dC, ringNormal[2]);
            const a1 = Vec3.angle(n1, dC);
            const a2 = Vec3.angle(n2, dB);
            const a3 = Vec3.angle(n3, dA);
            let max = a1; majorAxis = n1;/*minorAxis = dA;*/
            if (a2 > max) { max = a2; majorAxis = n2;/* minorAxis = dB;*/ }
            if (a3 > max) { max = a3; majorAxis = n3; /*minorAxis = dC;*/ }
        } else {
            majorAxis = ringNormal;
            //minorAxis = towardsC1;
        }
        return getRotation(majorAxis, towardsC1, entry);
    }
    
    export function makeTransform(model: Model, entry: Entry, radiusFactor: number, type: Params['type']) {
        const { ringCenter, ringRadius } = entry;

        const { ringNormal, towardsC1 } = ringPlane(model, entry); 
        const rotation = findRotation(ringNormal, towardsC1, entry, type);
        const radius = radiusFactor * ringRadius;
        
        return { scale: [radius, radius, radius], rotation, translation: ringCenter };
    }
}