/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Primitive {
    'use strict';

    import LA = Core.Geometry.LinearAlgebra
    import Surface = Core.Geometry.Surface

    export type Shape = Shape.Sphere | Shape.Tube | Shape.Surface //  | Shape.Arrow

    export namespace Shape {
        export type Sphere = { type: 'Sphere', center: LA.ObjectVec3, radius: number, id: number, tessalation?:number }
        export type Tube = { type: 'Tube', a: LA.ObjectVec3, b: LA.ObjectVec3, radius: number, id: number, tessalation?:number }
        //export type Arrow = { type: 'Arrow', a: LA.ObjectVec3, b: LA.ObjectVec3, radius: number, id: number, slices?: number, segments?:number }
        export type Surface = { type: 'Surface', surface: Core.Geometry.Surface, id: number }
    }

    function buildSurface(shapes: Shape[]): Core.Computation<Surface> {
        return Core.computation<Surface>(async ctx => {
            await ctx.updateProgress('Building surface...')
            
            const uniqueSpheres = Core.Utils.FastMap.create<number, Surface>();
            const shapeSurfaces: Surface[][] = [];

            for (const s of shapes) {
                switch (s.type) {
                    case 'Sphere': 
                        if (uniqueSpheres.has(s.tessalation || 0)) shapeSurfaces.push([uniqueSpheres.get(s.tessalation || 0)!]);
                        else {
                            const sphere = createSphereSurface(s);
                            uniqueSpheres.set(s.tessalation || 0, sphere);
                            shapeSurfaces.push([sphere]);
                        }
                        break;
                    case 'Tube': {
                        const tube = createTubeSurface(s);
                        shapeSurfaces.push([tube]);
                        break;
                    }
                    case 'Surface': {
                        shapeSurfaces.push([s.surface])
                        break;
                    }
                }
            }

            let size = { vertexCount: 0, triangleCount: 0 };
            for (const s of shapeSurfaces) {
                for (const g of s) {
                    size.vertexCount += g.vertexCount;
                    size.triangleCount += g.triangleCount;
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

            let shapeIndex = 0;
            for (const s of shapes) {
                let surfaces: Surface[] = shapeSurfaces[shapeIndex++];
                let startVOffset = (vOffset / 3) | 0;
                switch (s.type) { 
                    case 'Sphere': {
                        const surface = surfaces[0];
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
                    }
                    case 'Tube': {
                        const surface = surfaces[0]; 
                        vs = surface.vertices;
                        for (let i = 0, _b = vs.length; i < _b; i++) {
                            vertices[vOffset++] = vs[i];
                        }
                        break;
                    }
                    case 'Surface': {
                        const surface = surfaces[0]; 
                        Surface.computeNormalsImmediate(surface);
                        vs = surface.vertices;
                        for (let i = 0, _b = vs.length; i < _b; i++) {
                            vertices[vOffset++] = vs[i];
                        }
                        break;
                    }
                }

                for (const surface of surfaces) {
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