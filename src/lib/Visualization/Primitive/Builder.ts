/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Primitive {
    'use strict';

    import LA = Core.Geometry.LinearAlgebra
    import Surface = Core.Geometry.Surface

    export type ShapeType = 'Sphere' | 'Surface'
    export type Shape = 
          { type: 'Sphere', center: LA.ObjectVec3, radius: number, id: number, tessalation?:number }
        | { type: 'Surface', surface: Surface, id: number }

    function buildSurface(shapes: Shape[]): Core.Computation<Surface> {
        return Core.computation<Surface>(async ctx => {
            await ctx.updateProgress('Building surface...')
            let uniqueSpheres = Core.Utils.FastMap.create<number, Surface>();
            for (let s of shapes) {
                if (s.type !== 'Sphere' || uniqueSpheres.has(s.tessalation || 0)) continue;
                uniqueSpheres.set(s.tessalation || 0, createSphereSurface({ x: 0, y: 0, z: 0}, 1, s.tessalation || 0));
            }

            let size = { vertexCount: 0, triangleCount: 0 };
            for (let s of shapes) {
                switch (s.type) { 
                    case 'Sphere':
                        let sphere = uniqueSpheres.get(s.tessalation || 0)!;
                        size.vertexCount += sphere.vertexCount;
                        size.triangleCount += sphere.triangleCount;
                        break;
                    case 'Surface':
                        size.vertexCount += s.surface.vertexCount;
                        size.triangleCount += s.surface.triangleCount;
                        break;
                }
            }

            let vertices = new Float32Array(size.vertexCount * 3);
            let normals = new Float32Array(size.vertexCount * 3);
            let triangles = new Uint32Array(size.triangleCount * 3);
            let annotation = new Int32Array(size.vertexCount);

            let vOffset = 0, nOffset = 0, tOffset = 0, aOffset = 0;

            let v = new THREE.Vector3();
            let transform = new THREE.Matrix4();
            let vs: Float32Array;

            for (let s of shapes) {
                let surface: Surface | undefined = void 0;
                let startVOffset = (vOffset / 3) | 0;
                switch (s.type) { 
                    case 'Sphere':
                        surface = uniqueSpheres.get(s.tessalation || 0)!;
                        vs = surface.vertices;
                        for (let i = 0, _b = surface.vertexCount * 3; i < _b; i += 3) {
                            v.x = vs[i], v.y = vs[i + 1], v.z = vs[i + 2];
                            v.applyMatrix4(transform.makeScale(s.radius, s.radius, s.radius));
                            v.applyMatrix4(transform.makeTranslation(s.center.x, s.center.y, s.center.z));
                            vertices[vOffset++] = v.x;
                            vertices[vOffset++] = v.y;
                            vertices[vOffset++] = v.z;
                        }
                        break;
                    case 'Surface': 
                        surface = s.surface; 
                        Surface.computeNormalsImmediate(surface);
                        vs = surface.vertices;
                        for (let i = 0, _b = vs.length; i < _b; i++) {
                            vertices[vOffset++] = vs[i];
                        }
                        break;
                }

                vs = surface!.normals!;
                for (let i = 0, _b = vs.length; i < _b; i++) {
                    normals[nOffset++] = vs[i];
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
            return buildSurface(this.shapes);
        }

        static create() {
            return new Builder();
        }
    }

}