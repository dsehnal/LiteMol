/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization {

    export class MaterialsHelper {

        private static pickVertexShader = [
            "attribute vec4 pColor;",
            "varying vec4 pC;",
            "void main() {",
            "pC = pColor;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"].join('\n');
        private static pickFragmentShader = [
            "varying vec4 pC;",
            "void main() {",
            "gl_FragColor = pC;",
            "}"].join('\n');

        static getPickMaterial() {
            return new THREE.ShaderMaterial({
                attributes: { pColor: { type: 'v4', value: [] } },
                vertexShader: MaterialsHelper.pickVertexShader,
                fragmentShader: MaterialsHelper.pickFragmentShader,
                blending: THREE.NoBlending,
                shading: THREE.FlatShading,
                side: THREE.DoubleSide
            });
        }

        static getPickExcludeMaterial() {
            return new THREE.MeshBasicMaterial({ color: THREE.ColorKeywords.white, side: THREE.DoubleSide });
        }


        static shader = {

            uniforms: THREE.UniformsUtils.merge([

                THREE.UniformsLib["common"],
                THREE.UniformsLib["bump"],
                THREE.UniformsLib["normalmap"],
                THREE.UniformsLib["fog"],
                THREE.UniformsLib["lights"],
                THREE.UniformsLib["shadowmap"],

                {
                    "emissive": { type: "c", value: new THREE.Color(0x000000) },
                    "specular": { type: "c", value: new THREE.Color(0x111111) },
                    "shininess": { type: "f", value: 2 },
                    "wrapRGB": { type: "v3", value: new THREE.Vector3(1, 1, 1) },

                    "highlightColor": { type: "v3", value: new THREE.Vector3(1, 1, 0) },
                    "selectionColor": { type: "v3", value: new THREE.Vector3(1, 0, 0) },
                }

            ]),

            vertexShader: [

                "#define PHONG",

                "varying vec3 vViewPosition;",

                "#ifndef FLAT_SHADED",

                "	varying vec3 vNormal;",

                "#endif",

                THREE.ShaderChunk["common"],
                THREE.ShaderChunk["map_pars_vertex"],
                THREE.ShaderChunk["lightmap_pars_vertex"],
                THREE.ShaderChunk["envmap_pars_vertex"],
                THREE.ShaderChunk["lights_phong_pars_vertex"],
                THREE.ShaderChunk["color_pars_vertex"],
                THREE.ShaderChunk["morphtarget_pars_vertex"],
                THREE.ShaderChunk["skinning_pars_vertex"],
                THREE.ShaderChunk["shadowmap_pars_vertex"],
                THREE.ShaderChunk["logdepthbuf_pars_vertex"],

                "attribute float vState;",
                "varying float vS;",

                "void main() {",

                "   vS = vState;",
                THREE.ShaderChunk["map_vertex"],
                THREE.ShaderChunk["lightmap_vertex"],
                THREE.ShaderChunk["color_vertex"],

                THREE.ShaderChunk["morphnormal_vertex"],
                THREE.ShaderChunk["skinbase_vertex"],
                THREE.ShaderChunk["skinnormal_vertex"],
                THREE.ShaderChunk["defaultnormal_vertex"],

                "#ifndef FLAT_SHADED", // Normal computed with derivatives when FLAT_SHADED

                "	vNormal = normalize( transformedNormal );",

                "#endif",

                THREE.ShaderChunk["morphtarget_vertex"],
                THREE.ShaderChunk["skinning_vertex"],
                THREE.ShaderChunk["default_vertex"],
                THREE.ShaderChunk["logdepthbuf_vertex"],

                "	vViewPosition = -mvPosition.xyz;",

                THREE.ShaderChunk["worldpos_vertex"],
                THREE.ShaderChunk["envmap_vertex"],
                THREE.ShaderChunk["lights_phong_vertex"],
                THREE.ShaderChunk["shadowmap_vertex"],

                "}"

            ].join("\n"),

            fragmentShader: [

                "#define PHONG",

                "uniform vec3 diffuse;",
                "uniform vec3 emissive;",
                "uniform vec3 specular;",
                "uniform float shininess;",
                "uniform float opacity;",

                "uniform vec3 highlightColor;",
                "uniform vec3 selectionColor;",

                THREE.ShaderChunk["common"],
                THREE.ShaderChunk["color_pars_fragment"],
                THREE.ShaderChunk["map_pars_fragment"],
                THREE.ShaderChunk["alphamap_pars_fragment"],
                THREE.ShaderChunk["lightmap_pars_fragment"],
                THREE.ShaderChunk["envmap_pars_fragment"],
                THREE.ShaderChunk["fog_pars_fragment"],
                THREE.ShaderChunk["lights_phong_pars_fragment"],
                THREE.ShaderChunk["shadowmap_pars_fragment"],
                THREE.ShaderChunk["bumpmap_pars_fragment"],
                THREE.ShaderChunk["normalmap_pars_fragment"],
                THREE.ShaderChunk["specularmap_pars_fragment"],
                THREE.ShaderChunk["logdepthbuf_pars_fragment"],

                "varying float vS;",

                "void main() {",

                "	vec3 outgoingLight = vec3( 0.0 );",	// outgoing light does not have an alpha, the surface does
                "	vec4 diffuseColor;",// = vec4( vColor, opacity );",
                "   if (vS < 0.33) { diffuseColor = vec4( vColor, opacity ); }",
                "   else if (vS - floor(vS + 0.1) > 0.33) { diffuseColor = vec4(highlightColor, opacity); }",
                "	else { diffuseColor = vec4(selectionColor, opacity); }",
                
                THREE.ShaderChunk["logdepthbuf_fragment"],
                THREE.ShaderChunk["map_fragment"],                
                //THREE.ShaderChunk["color_fragment"], 
                THREE.ShaderChunk["alphamap_fragment"],
                THREE.ShaderChunk["alphatest_fragment"],
                THREE.ShaderChunk["specularmap_fragment"],

                THREE.ShaderChunk["lights_phong_fragment"],

                THREE.ShaderChunk["lightmap_fragment"],
                THREE.ShaderChunk["envmap_fragment"],
                THREE.ShaderChunk["shadowmap_fragment"],

                THREE.ShaderChunk["linear_to_gamma_fragment"],

                THREE.ShaderChunk["fog_fragment"],

                "#ifdef USE_FOG",
                "   if (diffuseColor.a > 0.99) { gl_FragColor = vec4( outgoingLight, diffuseColor.a ); }",
                "   else { gl_FragColor = vec4( outgoingLight, (1.0 - fogFactor) * diffuseColor.a ); }",                
                "#else",
                "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
                "#endif",
                "}"

            ].join("\n")

        };
        
        private static compareVectorAndColor(v: THREE.Vector3, c: Color) {
            return v.x === c.r && v.y === c.g && v.z === c.b;
        }
        
        static updateMaterial(material: THREE.ShaderMaterial | THREE.MeshPhongMaterial, theme: Theme, object: THREE.Object3D) {            
            let changed = false;
            if (MaterialsHelper.updateTransparencyAndFog(material, theme, object)) changed = true;
            if (material instanceof THREE.ShaderMaterial && MaterialsHelper.updateHighlightColor(material, theme)) changed = true;                                 
            if (changed) material.needsUpdate = true;            
        }
        
        private static updateHighlightColor(material: THREE.ShaderMaterial, theme: Theme): boolean {
            
            let changed = false;
            let color = (<any> material.uniforms).selectionColor.value as THREE.Vector3;      
            let selectionColor = Theme.getColor(theme, 'Selection', Theme.Default.SelectionColor);
            if (!MaterialsHelper.compareVectorAndColor(color, selectionColor)) {
                (<any>material.uniforms).selectionColor.value =  Color.toVector(selectionColor);
                changed = true;                
            }
            
            color = (<any> material.uniforms).highlightColor.value as THREE.Vector3;
            let highlightColor = Theme.getColor(theme, 'Highlight', Theme.Default.HighlightColor);
            if (!MaterialsHelper.compareVectorAndColor(color, highlightColor)) {
                (<any>material.uniforms).highlightColor.value = Color.toVector(highlightColor);
                changed = true;                
            }            
            return changed;            
        }

        private static updateTransparencyAndFog(material: THREE.Material, 
            theme: Theme, object: THREE.Object3D): boolean {
           
            let transparency = theme.transparency;    
                                   
            let opacity = +transparency.alpha!;            
            if (isNaN(opacity)) opacity = 1.0;
            let isTransparent = opacity <= 0.999;
            let writeDepth = !!transparency.writeDepth;
              
            if (!isTransparent) {
                opacity = 1.0;
                writeDepth = true;
            } 
            
            if (object) object.renderOrder = isTransparent ? 1 : 0;
            
            let changed = false;        
            if (material instanceof THREE.MeshPhongMaterial || material instanceof THREE.MeshBasicMaterial || material instanceof THREE.ShaderMaterial) {     
                
                if (material.transparent !== isTransparent) {
                    material.transparent = isTransparent;
                    changed = true;
                }
                
                if (material.depthWrite !== writeDepth) {                   
                    material.depthWrite = writeDepth;
                    changed = true;
                }
                
                if (material.opacity !== opacity) {
                    material.opacity = opacity;
                    changed = true;
                }

                if (material.fog !== !theme.disableFog) {
                    material.fog = !theme.disableFog;
                    changed = true;
                }
                
                if (material instanceof THREE.ShaderMaterial) {
                    if (material.uniforms.opacity) {
                        material.uniforms.opacity.value = opacity;
                    }
                }            
            }
            
            return changed;
        }        

        static getMeshMaterial(shading = THREE.SmoothShading, isWireframe = false) {
            let shader = MaterialsHelper.shader; 
            
            let ret = new THREE.ShaderMaterial({
                uniforms: THREE.UniformsUtils.clone(shader.uniforms),
                attributes: { "vState": { type: 'f', value: [] } },
                lights: true,
                fog: true,
                vertexShader: shader.vertexShader,
                fragmentShader: shader.fragmentShader,
                shading,
                side: THREE.DoubleSide,
                vertexColors: THREE.VertexColors,                
                blending: THREE.NormalBlending,
                wireframe: isWireframe,
                linewidth: 1
            });
            
            return ret;
        }

        static getPhongVertexColorMaterial() {            

            return new THREE.MeshPhongMaterial({ specular: 0xAAAAAA, /*ambient: 0xffffff, */shininess: 2, shading: THREE.SmoothShading, vertexColors: THREE.VertexColors, side: THREE.DoubleSide, metal: true });
        }

        static getDefaultHighlightMaterial() {
            return new THREE.MeshPhongMaterial({ color: 0xFFFFFF, specular: 0xAAAAAA,/* ambient: 0xffffff,*/ shininess: 2, shading: THREE.SmoothShading, side: THREE.DoubleSide, metal: true });
        }      

        static applyColorToBuffer(bufferAttribute: THREE.BufferAttribute, color: Color) {
            let buffer = bufferAttribute.array;

            for (let i = 0, __i = buffer.length; i < __i; i += 3) {
                buffer[i] = color.r;
                buffer[i + 1] = color.g;
                buffer[i + 2] = color.b;
            }

            bufferAttribute.needsUpdate = true;
        } 

        static applyColorToMap(map: Selection.VertexMap, bufferAttribute: THREE.BufferAttribute, getter: (i: number, c: Color) => void) {
            let buffer = bufferAttribute.array,
                color = { r: 0.45, g: 0.45, b: 0.45 },
                vertexRanges = map.vertexRanges;

            for (let elementIndex of map.elementIndices) {

                let elementOffset = map.elementMap.get(elementIndex)!;

                let rangeStart = map.elementRanges[2 * elementOffset],
                    rangeEnd = map.elementRanges[2 * elementOffset + 1];

                if (rangeStart === rangeEnd) continue;

                getter(elementIndex, color);

                for (let i = rangeStart; i < rangeEnd; i += 2) {

                    let vStart = vertexRanges[i], vEnd = vertexRanges[i + 1];

                    for (let j = vStart; j < vEnd; j++) {
                        buffer[j * 3] = color.r,
                        buffer[j * 3 + 1] = color.g,
                        buffer[j * 3 + 2] = color.b;
                    }
                }
            }

            bufferAttribute.needsUpdate = true;
        }
    }

}