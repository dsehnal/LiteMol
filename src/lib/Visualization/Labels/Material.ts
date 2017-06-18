/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Labels.Material {
    'use strict';

    export function create(texture: THREE.Texture) {
        const uniforms = THREE.UniformsUtils.merge([
                THREE.UniformsLib["common"],
                THREE.UniformsLib["fog"],
                {
                    "fontTexture": { type: "t", value: texture },
                    "xOffset": { type: "f", value: 0 },
                    "yOffset": { type: "f", value: 0 },
                    "zOffset": { type: "f", value: 0 },
                    "sizeFactor": { type: "f", value: 1.0 },
                    "outlineWidth": { type: "f", value: 0.0 },
                    "outlineColor": { type: "v3", value: new THREE.Vector3(0, 0, 0) },
                    "backgroundColor": { type: "v3", value: new THREE.Vector3(0, 0, 0) },
                    "backgroundOpacity": { type: "f", value: 0.5 },
                }
            ]);
        uniforms.fontTexture.value = texture;

        const ret = new THREE.ShaderMaterial({
            uniforms,
            attributes: { 
              "mapping": { type: 'v2', value: null }, 
              "inputTexCoord": { type: 'v2', value: null }, 
              "inputSize": { type: 'f', value: null }  
            },
            lights: false,
            fog: true,
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER,
            shading: THREE.NoShading,
            side: THREE.DoubleSide,
            vertexColors: THREE.VertexColors,                
            blending: THREE.NormalBlending,
            transparent: false,
            wireframe: false,
            linewidth: 1
        });

        return ret;
    }
}