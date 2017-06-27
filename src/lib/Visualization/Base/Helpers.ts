/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization {

    
    export function checkWebGL() {
        var canvas = document.createElement('canvas');

        try {
            var ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!ctx;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    export interface IDisposable {
        dispose(): void;
    }

    export class GeometryHelper {

        static setPickBase(objectId: number, objectIdWidth: number, elementId: number, color: { r: number; g: number; b: number }) {
            var width = 24,
                value = objectId << (width - objectIdWidth) | elementId,
                r = (value >> 16) & 0xFF, g = (value >> 8) & 0xFF, b = value & 0xFF;
            
            color.r = r / 255.0;
            color.g = g / 255.0;
            color.b = b / 255.0;
        }

        static setPickColor(objectId: number, objectIdWidth: number, elementId: number, buffer: Float32Array, offset: number) {
            var width = 24,
                value = objectId << (width - objectIdWidth) | elementId,
                r = (value >> 16) & 0xFF, g = (value >> 8) & 0xFF, b = value & 0xFF;

            buffer[offset] = r / 255.0;
            buffer[offset + 1] = g / 255.0;
            buffer[offset + 2] = b / 255.0;
        }

        static toSurface(source: THREE.Geometry) {
            let bufferSize = source.vertices.length * 3,
                vertexBuffer = new Float32Array(bufferSize),
                normalBuffer = new Float32Array(bufferSize),
                indexBuffer = new Uint32Array(source.faces.length * 3),
                normals = Array(source.vertices.length);
            
            for (let i = 0; i < source.faces.length; i++) {
                let f = source.faces[i];

                normals[f.a] = f.vertexNormals[0];
                normals[f.b] = f.vertexNormals[1];
                normals[f.c] = f.vertexNormals[2];

                indexBuffer[3 * i] = f.a;
                indexBuffer[3 * i + 1] = f.b;
                indexBuffer[3 * i + 2] = f.c;
            }

            for (let i = 0; i < source.vertices.length; i++) {
                let v = source.vertices[i];

                vertexBuffer[3 * i] = v.x;
                vertexBuffer[3 * i + 1] = v.y;
                vertexBuffer[3 * i + 2] = v.z;

                var n = normals[i];
                normalBuffer[3 * i] = n.x;
                normalBuffer[3 * i + 1] = n.y;
                normalBuffer[3 * i + 2] = n.z;
            }

            return <Core.Geometry.Surface>{
                vertices: vertexBuffer,
                vertexCount: source.vertices.length,
                triangleIndices: indexBuffer,
                triangleCount: source.faces.length,
                normals: normalBuffer 
            };
        }

        static toRawGeometry(source: THREE.Geometry): Geometry.RawGeometry {
            const { vertices, vertexCount, triangleIndices: indices, triangleCount: indexCount, normals } = GeometryHelper.toSurface(source);
            return {
                vertices,
                vertexCount,
                indices,
                indexCount,
                normals,
                elementSize: 3
            };
        }
        
        static getIndexedBufferGeometry(source: THREE.Geometry) {
            let bufferSize = source.vertices.length * 3,
                vertexBuffer = new Float32Array(bufferSize),
                normalBuffer = new Float32Array(bufferSize),
                indexBuffer = new Uint32Array(source.faces.length * 3),
                normals = Array(source.vertices.length);
            for (let i = 0; i < source.faces.length; i++) {
                let f = source.faces[i];

                normals[f.a] = f.vertexNormals[0];
                normals[f.b] = f.vertexNormals[1];
                normals[f.c] = f.vertexNormals[2];

                indexBuffer[3 * i] = f.a;
                indexBuffer[3 * i + 1] = f.b;
                indexBuffer[3 * i + 2] = f.c;
            }

            for (let i = 0; i < source.vertices.length; i++) {
                let v = source.vertices[i];

                vertexBuffer[3 * i] = v.x;
                vertexBuffer[3 * i + 1] = v.y;
                vertexBuffer[3 * i + 2] = v.z;

                var n = normals[i];
                normalBuffer[3 * i] = n.x;
                normalBuffer[3 * i + 1] = n.y;
                normalBuffer[3 * i + 2] = n.z;
            }

            var geom = new THREE.BufferGeometry();
            geom.addAttribute('position', new THREE.BufferAttribute(vertexBuffer, 3));
            geom.addAttribute('normal', new THREE.BufferAttribute(normalBuffer, 3));
            geom.addAttribute('index', new THREE.BufferAttribute(indexBuffer, 1));
            return geom;
        }

    }

}