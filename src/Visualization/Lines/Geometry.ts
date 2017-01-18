/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Lines {
    "use strict";


    export class Geometry extends GeometryBase {
        geometry: THREE.BufferGeometry = <any>void 0;
        center: THREE.Vector3 = new THREE.Vector3(0,0,0); 
        radius: number = 0; 
        
        dispose() {
            this.geometry.dispose();
        }

        static create(vertices: Float32Array, indices: Uint32Array): Geometry {
            let ret = new Geometry();

            let center = new THREE.Vector3(0, 0, 0);
            for (let i = 0, _b = vertices.length; i < _b; i += 3) {
                center.x += vertices[i];
                center.y += vertices[i + 1];
                center.z += vertices[i + 2];
            }
            center.multiplyScalar(1 / (vertices.length / 3));
            let radius = 0;
            for (let i = 0, _b = vertices.length; i < _b; i += 3) {
                let dx = center.x - vertices[i];
                let dy = center.y - vertices[i + 1];
                let dz = center.z - vertices[i + 2];
                let d = dx * dx + dy * dy + dz * dz;
                if (d > radius) radius = d;  
            }
            radius = Math.sqrt(radius);

            let geometry = new THREE.BufferGeometry();

            geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
            geometry.addAttribute('index', new THREE.BufferAttribute(indices, 1));

            ret.geometry = geometry;
            ret.center = center;
            ret.radius = radius;

            return ret;
        } 
        
        constructor() {
            super();
        }
    }
}