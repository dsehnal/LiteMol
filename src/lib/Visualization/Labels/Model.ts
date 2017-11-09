/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Labels {
    'use strict';

    export interface LabelsOptions {
        fontFamily: "sans-serif" | "monospace" | "serif",
        fontSize: number,
        fontStyle: "normal" | "italic",
        fontWeight: "normal" | "bold",
        useSDF: boolean,
        attachment: "bottom-left" | "bottom-center" | "bottom-right" 
            | "middle-left" | "middle-center" | "middle-right" 
            | "top-left" | "top-center" | "top-right",
        backgroundMargin: number
    }   

    export const DefaultLabelsOptions: LabelsOptions = {
        fontFamily: 'sans-serif',
        fontSize: 32,
        fontStyle: 'normal',
        fontWeight: 'normal',
        useSDF: true,
        attachment: 'middle-center',
        backgroundMargin: 1.0
    }

    export interface LabelsParams {
        positions: Core.Structure.PositionTable,
        sizes: number[],
        labels: string[], 
        options?: Partial<LabelsOptions>,
        theme: Theme
    }

    export class Model extends Visualization.Model {

        private geometry: THREE.BufferGeometry;
        private material: THREE.ShaderMaterial;
        private labels: string[];
        //private options: LabelsOptions;

        protected applySelectionInternal(indices: number[], action: Selection.Action): boolean { return false; }
        getPickElements(pickId: number): number[] { return [] };
        highlightElement(pickId: number, highlight: boolean): boolean { return false; }
        protected highlightInternal(isOn: boolean) { return false; }
        
        private applyColoring(theme: Theme) { 
            const color = (this.geometry.attributes as any).color.array;

            let o = 0, t: Color = { r: 0.1, g: 0.1, b: 0.1 };
            let i = 0;
            for (const l of this.labels) {
                let count = l.length * 4 + 4 /* background */;
                theme.setElementColor(i, t);
                for (let j = 0; j < count; j++) {
                    color[o++] = t.r;
                    color[o++] = t.g;
                    color[o++] = t.b;
                }
                i++;
            }
            (this.geometry.attributes as any).color.needsUpdate = true;            
        }

        protected applyThemeInternal(theme: Theme) {
            this.applyColoring(theme);

            const backgroundColor = theme.colors.get('Background') || Color.fromHexString('#333333');
            const backgroundOpacity = theme.variables.get('backgroundOpacity') !== void 0 ? theme.variables.get('backgroundOpacity') : 0.5;

            const outlineColor = theme.colors.get('Outline') || Color.fromHexString('#222222');
            const outlineWidth = theme.variables.get('outlineWidth') ? +theme.variables.get('outlineWidth') : 0.0;

            const sizeFactor = theme.variables.get('sizeFactor') ? +theme.variables.get('sizeFactor') : 1.0;
            
            const uniforms = this.material.uniforms;
            uniforms.xOffset.value = theme.variables.get('xOffset') || 0;
            uniforms.yOffset.value = theme.variables.get('yOffset') || 0;
            uniforms.zOffset.value = theme.variables.get('zOffset') || 0;
            uniforms.backgroundColor.value = new THREE.Vector3(backgroundColor.r, backgroundColor.g, backgroundColor.b);
            uniforms.backgroundOpacity.value = backgroundOpacity;
            uniforms.outlineColor.value = new THREE.Vector3(outlineColor.r, outlineColor.g, outlineColor.b);
            uniforms.outlineWidth.value = outlineWidth;
            uniforms.sizeFactor.value = sizeFactor;
            this.material.transparent = backgroundOpacity < 1.0,
            this.material.fog = !theme.disableFog;
            this.material.needsUpdate = true;
        }

        static create(entity: any, params: LabelsParams): Core.Computation<Model> {
            return Core.computation<Model>(async ctx => {  
                await ctx.updateProgress('Creating labels geometry...');
                const { geometry, texture/*, options*/ } = Geometry.create(params);

                await ctx.updateProgress('Creating labels model...');
                const model = new Model();
                
                //model.options = options;
                model.labels = params.labels;
                model.geometry = geometry;
                model.material = Material.create(texture);
                model.entity = entity;
                model.object = new THREE.Mesh(geometry, model.material);
                model.object.renderOrder = 1;
                geometry.computeBoundingSphere();
                model.centroid = geometry.boundingSphere.center;
                model.radius = geometry.boundingSphere.radius + 4;
                model.applyTheme(params.theme);

                model.disposeList = [ geometry, model.material ];

                return model;
            });
        }
    }
}