/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Geometry {
    "use strict";
    
    export interface RawGeometry {
        vertices: Float32Array,
        vertexCount: number,
        indices: Uint32Array,
        indexCount: number,
        normals?: Float32Array
        elementSize: 2 | 3,
    }

    export function toBufferGeometry(raw: RawGeometry) {
        const geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(raw.vertices, 3));
        if (raw.normals) {
            geometry.addAttribute('normal', new THREE.BufferAttribute(raw.normals, 3));
        }
        geometry.addAttribute('index', new THREE.BufferAttribute(raw.indices, 1));
        return geometry;
    }

    export function addAttribute(geom: THREE.BufferGeometry, name: string, a: ArrayLike<number>, elementSize: number) {
        geom.addAttribute(name, new THREE.BufferAttribute(a, elementSize));
    }

    import CoreUtils = Core.Utils
    import ChunkedArray = CoreUtils.ChunkedArray
    import ArrayBuilder = CoreUtils.ArrayBuilder

    export type Builder = Builder.Static | Builder.Dynamic

    export namespace Builder {
        export interface Static {
            type: 'Static',
            vertices: ArrayBuilder<number>,
            indices: ArrayBuilder<number>,
            normals?: ArrayBuilder<number>,
            elementSize: 2 | 3
        } 

         export interface Dynamic {
            type: 'Dynamic',
            vertices: ChunkedArray<number>,
            indices: ChunkedArray<number>,
            normals?: ChunkedArray<number>,
            elementSize: 2 | 3
        }

        export function createStatic(vertexCount: number, indexCount: number, elementSize: 2 | 3 = 3): Static {
            return {
                type: 'Static',
                vertices: ArrayBuilder.create(s => new Float32Array(s), vertexCount, 3),
                indices: ArrayBuilder.create(s => new Uint32Array(s), indexCount, elementSize),
                normals: elementSize === 3 ? ArrayBuilder.create(s => new Float32Array(s), vertexCount, 3) : void 0,
                elementSize
            };
        }

        export function createDynamic(vertexChunkSize: number, indexChunkSize: number, elementSize: 2 | 3 = 3): Dynamic {
            return {
                type: 'Dynamic',
                vertices: ChunkedArray.create(s => new Float32Array(s), vertexChunkSize, 3),
                indices: ChunkedArray.create(s => new Uint32Array(s), indexChunkSize, elementSize),
                normals: elementSize === 3 ? ChunkedArray.create(s => new Float32Array(s), vertexChunkSize, 3) : void 0,
                elementSize
            };
        }

        import add2d = ChunkedArray.add2
        import add3d = ChunkedArray.add3
        import add2s = ArrayBuilder.add2
        import add3s = ArrayBuilder.add3

        import Geom = Core.Geometry
        import Vec3 = Geom.LinearAlgebra.Vector3
        import Mat4 = Geom.LinearAlgebra.Matrix4

        // function copy3(src: ArrayLike<number>, tar: ChunkedArray<number> | ArrayBuilder<number>, add: (a: ChunkedArray<number> | ArrayBuilder<number>, x: number, y: number, z: number) => void) {
        //     for (let i = 0, __i = src.length; i < __i; i += 3) {
        //         add(tar, src[i], src[i + 1], src[i + 2]);
        //     }
        // }

        function copy3o(offset: number, src: ArrayLike<number>, tar: ChunkedArray<number> | ArrayBuilder<number>, add: (a: ChunkedArray<number> | ArrayBuilder<number>, x: number, y: number, z: number) => void) {
            for (let i = 0, __i = src.length; i < __i; i += 3) {
                add(tar, src[i] + offset, src[i + 1] + offset, src[i + 2] + offset);
            }
        }

        const temp = Vec3.zero()
        function copy3t(t: Mat4, src: ArrayLike<number>, tar: ChunkedArray<number> | ArrayBuilder<number>, add: (a: ChunkedArray<number> | ArrayBuilder<number>, x: number, y: number, z: number) => void) {
            const v = temp;
            for (let i = 0, __i = src.length; i < __i; i += 3) {
                v[0] = src[i], v[1] = src[i + 1], v[2] = src[i + 2];
                Vec3.transformMat4(v, v, t);
                add(tar, v[0], v[1], v[2]);
            }
        }

        function copy2o(offset: number, src: ArrayLike<number>, tar: ChunkedArray<number> | ArrayBuilder<number>, add: (a: ChunkedArray<number> | ArrayBuilder<number>, x: number, y: number) => void) {
            for (let i = 0, __i = src.length; i < __i; i += 2) {
                add(tar, src[i] + offset, src[i + 1] + offset);
            }
        }

        function error(msg: string) {
            throw new Error(msg);
        }

        const scaleTransform = Mat4.zero(), translateTransform = Mat4.zero(), rotateTransform = Mat4.zero(), vTransform = Mat4.zero(), nTransform = Mat4.zero();
        const defaulScale = Vec3.fromValues(1, 1, 1), defaultTranslation = Vec3.zero();

        export function addRawTransformed(builder: Builder, geom: RawGeometry, 
            scale: number[] | undefined, translation: number[] | undefined, rotation: Mat4 | undefined) {

            Mat4.fromScaling(scaleTransform, scale || defaulScale);
            Mat4.fromTranslation(translateTransform, translation || defaultTranslation);
            if (rotation) Mat4.copy(rotateTransform, rotation);
            else Mat4.fromIdentity(rotateTransform);

            Mat4.mul3(vTransform, translateTransform, rotateTransform, scaleTransform);

            const offset = builder.vertices.elementCount;

            const addV = builder.type === 'Static' ? add3s : add3d;
            copy3t(vTransform, geom.vertices, builder.vertices, addV);

            if (builder.normals) {
                if (!geom.normals) error('geom is missing normals.');
                Mat4.mul(nTransform, rotateTransform, scaleTransform);
                copy3t(nTransform, geom.normals!, builder.normals!, addV);
            }

            if (builder.elementSize === 2) {
                copy2o(offset, geom.indices, builder.indices, builder.type === 'Static' ? add2s : add2d);
            } else {
                copy3o(offset, geom.indices, builder.indices, builder.type === 'Static' ? add3s : add3d);
            }
        }

        export function addVertex3s(builder: Static, x: number, y: number, z: number) {
            add3s(builder.vertices, x, y, z);
        }

        export function addNormal3s(builder: Static, x: number, y: number, z: number) {
            add3s(builder.normals!, x, y, z);
        }

        export function addIndex3s(builder: Static, i: number, j: number, k: number) {
            add3s(builder.indices, i, j, k);
        }

        export function addVertex3d(builder: Dynamic, x: number, y: number, z: number) {
            add3d(builder.vertices, x, y, z);
        }

        export function addNormal3d(builder: Dynamic, x: number, y: number, z: number) {
            add3d(builder.normals!, x, y, z);
        }

        export function addIndex3d(builder: Dynamic, i: number, j: number, k: number) {
            add3d(builder.indices, i, j, k);
        }

        let dashTemplate: Geometry.RawGeometry | undefined = void 0;
        export function getDashTemplate() {
            if (dashTemplate) return dashTemplate;
            dashTemplate = GeometryHelper.toRawGeometry(new THREE.BoxGeometry(1, 1, 1));
            for (let i = 0; i < dashTemplate.vertices.length; i += 3) {
                dashTemplate.vertices[i] += 0.5;
            }
            return dashTemplate;
        }

        const dashScale = Vec3.zero(), dashOffset = Vec3.zero(), dashDir = Vec3.zero(), dashUp = Vec3.fromValues(1, 0, 0), dashRotation = Mat4.zero();
        export function addDashedLine(builder: Builder, a: Vec3, b: Vec3, size: number, gap: number, r: number) {
            const dir = Vec3.sub(dashDir, b, a);
            const length = Vec3.magnitude(dir);

            const scale = Vec3.set(dashScale, size, r, r);
            const rotation = Vec3.makeRotation(dashRotation, dashUp, dir)!;
            const templ = getDashTemplate();
            
            const offset = dashOffset;
            Vec3.copy(offset, a);
            Vec3.normalize(dir, dir);
            const delta = size + gap;
            Vec3.scale(dir, dir, delta);
            for (let t = 0; t < length; t += delta) {
                if (t + size > length) scale[0] = length - t;
                addRawTransformed(builder, templ, scale, offset, rotation);
                Vec3.add(offset, offset, dir);
            }      
        }

        function compactS<T>(tar: ChunkedArray<number> | ArrayBuilder<number>) {
            return (tar as ArrayBuilder<number>).array as any as T;
        }

        function compactD<T>(tar: ChunkedArray<number> | ArrayBuilder<number>) {
            return ChunkedArray.compact(tar as ChunkedArray<number>) as any as T;
        }
        
        export function toBufferGeometry(builder: Builder) {
            const compact = builder.type === 'Static' ? compactS : compactD;
            return Geometry.toBufferGeometry({ 
                vertices: compact<Float32Array>(builder.vertices),
                vertexCount: builder.vertices.elementCount,
                normals: builder.normals && compact<Float32Array>(builder.normals),
                indices: compact<Uint32Array>(builder.indices),
                indexCount: builder.indices.elementCount,
                elementSize: builder.elementSize
            });
        }
    }
}