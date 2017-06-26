/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Utils {
    "use strict";
    
    export interface GeometryBuilder {
        vertices: Float32Array,
        normals: Float32Array,
        indices: Uint32Array,
        annotation: Int32Array | undefined,

        vertexOffset: number,
        indexOffset: number
    }

    export namespace GeometryBuilder {
        import Geom = Core.Geometry
        import Vec3 = Geom.LinearAlgebra.Vector3
        import Mat4 = Geom.LinearAlgebra.Matrix4

        export function create(vertexCount: number, triangleCount: number, includeAnnotation: boolean): GeometryBuilder {            
            return {
                vertices: new Float32Array(vertexCount * 3),
                normals: new Float32Array(vertexCount * 3),
                indices: new Uint32Array(triangleCount * 3),
                annotation: includeAnnotation ? new Int32Array(vertexCount * 3) : void 0,
                vertexOffset: 0,
                indexOffset: 0
            }
        }

        const tempVector = Vec3.zero();
        function copyTransformed(builder: GeometryBuilder, surface: Geom.Surface, vertTransform: Mat4, normalTransform: Mat4, constAnnotation: number | undefined) {
            const { vertices, normals, indices, vertexOffset, indexOffset, annotation } = builder;
            const { vertices: vs, normals: ns, triangleIndices: ts, annotation: ans, vertexCount } = surface;
            const v = tempVector;

            let vOffset = vertexOffset;
            let nOffset = vertexOffset;
            let iOffset = indexOffset;

            for (let i = 0, _b = vs.length; i < _b; i += 3) {
                v[0] = vs[i], v[1] = vs[i + 1], v[2] = vs[i + 2];
                Vec3.transformMat4(v, v, vertTransform);
                vertices[vOffset++] = v[0];
                vertices[vOffset++] = v[1];
                vertices[vOffset++] = v[2];

                v[0] = ns![i], v[1] = ns![i + 1], v[2] = ns![i + 2];
                Vec3.transformMat4(v, v, normalTransform);
                Vec3.normalize(v, v);
                normals[nOffset++] = v[0];
                normals[nOffset++] = v[1];
                normals[nOffset++] = v[2];
            }

            for (let i = 0, _b = ts.length; i < _b; i++) {
                indices[iOffset++] = ts[i];
            }

            if (ans && annotation) {
                let aOffset = vertexOffset;
                for (let i = 0, _b = ts.length; i < _b; i++) {
                    annotation[aOffset++] = ans[i];
                }
            } else if (constAnnotation !== void 0 && annotation) {
                let aOffset = vertexOffset;
                for (let i = 0, _b = vertexCount; i < _b; i ++) {
                    annotation[aOffset++] = constAnnotation;
                }
            }

            builder.vertexOffset = vOffset;
            builder.indexOffset = iOffset;
        }

        const scaleTransform = Mat4.zero(), translateTransform = Mat4.zero(), rotateTransform = Mat4.zero(), vTransform = Mat4.zero(), nTransform = Mat4.zero();
        const defaulScale = [1, 1, 1], defaultTranslation = [0, 0, 0];
        export function add(
            builder: GeometryBuilder, surface: Geom.Surface, 
            scale: number[] | undefined, translation: number[] | undefined, rotation: Mat4 | undefined, 
            annotation: number | undefined) {

            Mat4.fromScaling(scaleTransform, scale || defaulScale);
            Mat4.fromTranslation(translateTransform, translation || defaultTranslation);
            if (rotation) Mat4.copy(rotateTransform, rotation);
            else Mat4.fromIdentity(rotateTransform);

            Mat4.mul3(vTransform, translateTransform, rotateTransform, scaleTransform);
            Mat4.mul(nTransform, rotateTransform, scaleTransform);

            copyTransformed(builder, surface, vTransform, nTransform, annotation);
        }
    }
}