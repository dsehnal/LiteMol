/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Primitive {
    'use strict';

    import LA = Core.Geometry.LinearAlgebra
    import Surface = Core.Geometry.Surface

    export type Shape = Shape.Sphere | Shape.Tube | Shape.Surface | Shape.DashedLine | Shape.Cone | Shape.Arrow

    export namespace Shape {
        export type Sphere = { type: 'Sphere', center: LA.Vector3, radius: number, id: number, tessalation?:number }
        export type Tube = { type: 'Tube', a: LA.Vector3, b: LA.Vector3, radius: number, id: number, slices?:number }
        export type DashedLine = { type: 'DashedLine', a: LA.Vector3, b: LA.Vector3, width: number, dashSize: number, spaceSize?: number, id: number }
        export type Arrow = { type: 'Arrow', a: LA.Vector3, b: LA.Vector3, radius: number, id: number, coneRadius: number, coneHeight: number, slices?: number }
        export type Cone = { type: 'Cone', a: LA.Vector3, b: LA.Vector3, radius: number, id: number, slices?: number }
        export type Surface = { type: 'Surface', surface: Core.Geometry.Surface, id: number, scale?: number[], translation?: number[], rotation?: LA.Matrix4 }
    }

    function buildSurface(shapes: Shape[]): Core.Computation<Surface> {
        return Core.computation<Surface>(async ctx => {
            await ctx.updateProgress('Building surface...')
            
            const uniqueSpheres = Core.Utils.FastMap.create<number, Surface>();
            const shapeSurfaces: Surface[] = [];

            for (const s of shapes) {
                switch (s.type) {
                    case 'Sphere': 
                        if (uniqueSpheres.has(s.tessalation || 0)) shapeSurfaces.push(uniqueSpheres.get(s.tessalation || 0)!);
                        else {
                            const sphere = createSphereSurface(s);
                            uniqueSpheres.set(s.tessalation || 0, sphere);
                            shapeSurfaces.push(sphere);
                        }
                        break;
                    case 'Tube': {
                        const tube = createTubeSurface(s);
                        shapeSurfaces.push(tube);
                        break;
                    }
                    case 'Cone': {
                        shapeSurfaces.push(createCone(s));
                        break;
                    }
                    case 'Surface': {
                        shapeSurfaces.push(s.surface)
                        break;
                    }
                }
            }

            let size = { vertexCount: 0, triangleCount: 0 };
            for (const s of shapeSurfaces) {
                size.vertexCount += s.vertexCount;
                size.triangleCount += s.triangleCount;
            }

            let vertices = new Float32Array(size.vertexCount * 3);
            let normals = new Float32Array(size.vertexCount * 3);
            let triangles = new Uint32Array(size.triangleCount * 3);
            let annotation = new Int32Array(size.vertexCount);

            let vOffset = 0, nOffset = 0, tOffset = 0, aOffset = 0;

            let v = LA.Vector3.zero();
            let scaleTransform = LA.Matrix4.zero(), translateTransform = LA.Matrix4.zero(), rotateTransform = LA.Matrix4.zero(), transform = LA.Matrix4.zero();
            let vs: Float32Array;

            let shapeIndex = 0;
            for (const s of shapes) {
                const surface = shapeSurfaces[shapeIndex++];
                let startVOffset = (vOffset / 3) | 0;
                switch (s.type) { 
                    case 'Sphere': {
                        vs = surface.vertices;
                        LA.Matrix4.fromScaling(scaleTransform, [s.radius, s.radius, s.radius]);
                        LA.Matrix4.fromTranslation(translateTransform, s.center);
                        LA.Matrix4.mul(transform, translateTransform, scaleTransform);
                        for (let i = 0, _b = surface.vertexCount * 3; i < _b; i += 3) {
                            v[0] = vs[i], v[1] = vs[i + 1], v[2] = vs[i + 2];
                            LA.Vector3.transformMat4(v, v, transform);
                            vertices[vOffset++] = v[0];
                            vertices[vOffset++] = v[1];
                            vertices[vOffset++] = v[2];
                        }
                        const ns = surface!.normals!;
                        for (let i = 0, _b = ns.length; i < _b; i++) {
                            normals[nOffset++] = ns[i];
                        }
                        break;
                    }
                    case 'Tube': 
                    case 'Cone': {
                        vs = surface.vertices;
                        for (let i = 0, _b = vs.length; i < _b; i++) {
                            vertices[vOffset++] = vs[i];
                        }
                        const ns = surface!.normals!;
                        for (let i = 0, _b = ns.length; i < _b; i++) {
                            normals[nOffset++] = ns[i];
                        }
                        break;
                    }
                    case 'Surface': {
                        if (!surface.normals) Surface.computeNormalsImmediate(surface);
                        vs = surface.vertices;
                        if (s.rotation || s.scale || s.translation) {

                            LA.Matrix4.fromScaling(scaleTransform, s.scale || [1, 1, 1]);
                            LA.Matrix4.fromTranslation(translateTransform, s.translation || [0, 0, 0]);
                            if (s.rotation) LA.Matrix4.copy(rotateTransform, s.rotation);
                            else LA.Matrix4.fromIdentity(rotateTransform);

                            LA.Matrix4.mul3(transform, translateTransform, rotateTransform, scaleTransform);

                            for (let i = 0, _b = vs.length; i < _b; i += 3) {
                                v[0] = vs[i], v[1] = vs[i + 1], v[2] = vs[i + 2];
                                LA.Vector3.transformMat4(v, v, transform);
                                vertices[vOffset++] = v[0];
                                vertices[vOffset++] = v[1];
                                vertices[vOffset++] = v[2];
                            }

                            LA.Matrix4.mul(transform, rotateTransform, scaleTransform);
                            const ns = surface!.normals!;
                            for (let i = 0, _b = ns.length; i < _b; i += 3) {
                                v[0] = ns[i], v[1] = ns[i + 1], v[2] = ns[i + 2];
                                LA.Vector3.transformMat4(v, v, transform);
                                LA.Vector3.normalize(v, v);
                                normals[nOffset++] = v[0];
                                normals[nOffset++] = v[1];
                                normals[nOffset++] = v[2];
                            }
                        } else {
                            for (let i = 0, _b = vs.length; i < _b; i++) {
                                vertices[vOffset++] = vs[i];
                            }
                            const ns = surface!.normals!;
                            for (let i = 0, _b = ns.length; i < _b; i++) {
                                normals[nOffset++] = ns[i];
                            }
                        }
                        break;
                    }
                }

                let ts = surface!.triangleIndices!;
                for (let i = 0, _b = ts.length; i < _b; i++) {
                    triangles[tOffset++] = startVOffset + ts[i];
                }

                for (let i = 0, _b = surface!.vertexCount; i < _b; i++) {
                    annotation[aOffset++] = s.id;
                }
            }
            
            let ret = <Core.Geometry.Surface>{
                vertices,
                vertexCount: size.vertexCount,
                triangleIndices: triangles,
                triangleCount: size.triangleCount,
                normals,
                annotation: <any>annotation 
            };

            return ret;
        });
    }        

    export class Builder {
        private shapes: Shape[] = [];

        add(shape: Shape) {
            this.shapes.push(shape);
            return this;
        }

        buildSurface(): Core.Computation<Surface> {
            let normalize = false;
            for (const s of this.shapes) { 
                if (s.type === 'DashedLine' || s.type === 'Arrow') {
                    normalize = true;
                    break;
                }
            }

            if (normalize) {
                const normalized = [];
                for (const s of this.shapes) { 
                    if (s.type === 'DashedLine') {
                        for (const d of createDashes(s)) {
                            normalized[normalized.length] = d;
                        }
                    } else if (s.type === 'Arrow') {
                        for (const a of createArrow(s)) {
                            normalized[normalized.length] = a;
                        }
                    } else {
                        normalized[normalized.length] = s;
                    }
                }
                return buildSurface(normalized);
            }
            return buildSurface(this.shapes);
        }

        static create() {
            return new Builder();
        }
    }

}