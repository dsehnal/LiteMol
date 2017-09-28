/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Surface {
    "use strict";

    export interface Parameters {        
        isWireframe?: boolean,
        mapPickElements?: (pickId: number) => (number[] | undefined),
    }
    
    export const DefaultSurfaceModelParameters: Parameters = {
        isWireframe: false,
        mapPickElements: void 0
    };

    export class Model extends Visualization.Model {

        private surface: Core.Geometry.Surface;
        private geometry: Geometry;
        private material: THREE.ShaderMaterial;
        private pickMaterial: THREE.Material;
        private _mapPickElements: ((pickId: number) => number[] | undefined) | undefined = void 0;
                                
        protected applySelectionInternal(indices: number[], action: Selection.Action): boolean {           
            let buffer = this.geometry.vertexStateBuffer,
                array = <any>buffer.array as Float32Array,
                map = this.geometry.elementToVertexMap,
                vertexRanges = map.vertexRanges,
                changed = false;
                
            for (let index of indices) {
                if (!map.elementMap.has(index)) continue;

                let indexOffset = map.elementMap.get(index)!,
                    rangeStart = map.elementRanges[2 * indexOffset],
                    rangeEnd = map.elementRanges[2 * indexOffset + 1];

                if (rangeStart === rangeEnd) continue;                
                for (let i = rangeStart; i < rangeEnd; i += 2) {
                    let vStart = vertexRanges[i], vEnd = vertexRanges[i + 1];
                    changed = Selection.applyActionToRange(array, vStart, vEnd, action) || changed;
                }
            }
            if (!changed) return false;
            buffer.needsUpdate = true;
            return true;
        }

        highlightElement(pickId: number, highlight: boolean): boolean {
            if (this.surface.annotation) {
                return this.applySelection([pickId - 1], highlight ? Selection.Action.Highlight : Selection.Action.RemoveHighlight);
            } else {
                return this.highlightInternal(highlight);
            }
        }
                
        protected highlightInternal(isOn: boolean) {
            return Selection.applyActionToBuffer(this.geometry.vertexStateBuffer, isOn ? Selection.Action.Highlight : Selection.Action.RemoveHighlight);
        }

        getPickElements(pickId: number): number[] {
            if (!pickId) return [0];
            if (this._mapPickElements) {
                return this._mapPickElements(pickId - 1) || [];
            }
            return [pickId - 1];
        }

        getBoundingSphereOfSelection(indices: number[]): { radius: number, center: Core.Geometry.LinearAlgebra.Vector3 } | undefined {
            if (!this.geometry.vertexToElementMap) return { radius: this.radius, center: Core.Geometry.LinearAlgebra.Vector3.fromObj(this.centroid) };

            let vs = <number[]>(<any>this.geometry.geometry.attributes).position.array;
            let center = new THREE.Vector3(), count = 0;

            let map = this.geometry.elementToVertexMap,
                vertexRanges = map.vertexRanges;

            for (let index of indices) {
                if (!map.elementMap.has(index)) continue;
                let indexOffset = map.elementMap.get(index)!,
                    rangeStart = map.elementRanges[2 * indexOffset],
                    rangeEnd = map.elementRanges[2 * indexOffset + 1];
                if (rangeStart === rangeEnd) continue;                
                for (let i = rangeStart; i < rangeEnd; i += 2) {
                    let vStart = vertexRanges[i], vEnd = vertexRanges[i + 1];
                    for (let j = vStart; j < vEnd; j++) {
                        center.x += vs[3 * j];
                        center.y += vs[3 * j + 1];
                        center.z += vs[3 * j + 2];
                        count++;
                    }
                }
            }

            if (!count) return void 0;

            center.x = center.x / count;
            center.y = center.y / count;
            center.z = center.z / count;

            let t = new THREE.Vector3();
            let radius = 0; 
            for (let index of indices) {
                if (!map.elementMap.has(index)) continue;
                let indexOffset = map.elementMap.get(index)!,
                    rangeStart = map.elementRanges[2 * indexOffset],
                    rangeEnd = map.elementRanges[2 * indexOffset + 1];
                if (rangeStart === rangeEnd) continue;                
                for (let i = rangeStart; i < rangeEnd; i += 2) {
                    let vStart = vertexRanges[i], vEnd = vertexRanges[i + 1];
                    for (let j = vStart; j < vEnd; j++) {
                        t.x = vs[3 * j];
                        t.y = vs[3 * j + 1];
                        t.z = vs[3 * j + 2];
                        radius = Math.max(radius, t.distanceToSquared(center));
                    }
                }
            }
            radius = Math.sqrt(radius);

            return {
                radius,
                center: Core.Geometry.LinearAlgebra.Vector3.fromObj(center) 
            };
        }
        
        applyThemeInternal(theme: Theme) {            
            let color = { r: 0, g: 0, b: 0 };            
            MaterialsHelper.updateMaterial(this.material, theme, this.object);
            
            let colors = <number[]>(<any>this.geometry.geometry.attributes).color.array,
                ids = this.geometry.vertexToElementMap;
            
            if (ids) {
                for (let i = 0, _b = (colors.length / 3) | 0; i < _b; i++) {
                    
                    let id = ids[i];
                    if (id < 0) {
                        color.r = 0; color.g = 0; color.b = 0;
                    } else {
                        theme.setElementColor(id, color);
                    }
                    
                    colors[3 * i] = color.r;
                    colors[3 * i + 1] = color.g;
                    colors[3 * i + 2] = color.b;
                }
            } else {
                theme.setElementColor(0, color);
                
                for (let i = 0, _b = (colors.length / 3) | 0; i < _b; i++) {
                    colors[3 * i] = color.r;
                    colors[3 * i + 1] = color.g;
                    colors[3 * i + 2] = color.b;
                }
            }
            
            if (this.pickObject) this.pickObject.visible = this.getPickObjectVisibility(this.object.visible);
            
            this.geometry.geometry.getAttribute('color').needsUpdate = true;
        }

        protected getPickObjectVisibility(visible: boolean) {
            if (Theme.isTransparent(this.theme) || !this.theme.interactive) {
                return false;
            } else {
                return visible;
            }
        }

        private createObjects(): { main: THREE.Object3D; pick: THREE.Object3D | undefined } {

            let mesh = new THREE.Mesh(this.geometry.geometry, this.material);
                        
            let pickObj: THREE.Object3D | undefined = void 0;
            if (this.geometry.pickGeometry) {

                pickObj = new THREE.Object3D();

                let pick = new THREE.Mesh(this.geometry.pickGeometry, this.pickMaterial);
                pickObj.add(pick);

                pick = new THREE.Mesh(this.geometry.pickPlatesGeometry, this.pickMaterial);
                pickObj.add(pick);
            }
            
            return {
                main: mesh,
                pick: pickObj
            };
        }
        

        static create(entity: any, {
            surface,
            theme,
            parameters = DefaultSurfaceModelParameters,
            props
        }: {
            surface: Core.Geometry.Surface,
            theme: Theme,
            parameters?: Parameters,
            props?: Model.Props   
        }): Core.Computation<Model> {
            return Core.computation<Model>(async ctx => {
                let geometry = await buildGeometry(surface, ctx, !!parameters.isWireframe);
                let ret = new Model();

                ret._mapPickElements = parameters.mapPickElements;
                ret.surface = surface;
                ret.material =  MaterialsHelper.getMeshMaterial(THREE.FlatShading, !!parameters.isWireframe);//new THREE.MeshPhongMaterial({ specular: 0xAAAAAA, /*ambient: 0xffffff, */shininess: 1, shading: THREE.FlatShading, side: THREE.DoubleSide, vertexColors: THREE.VertexColors });
                ret.geometry = geometry;
                ret.pickMaterial = MaterialsHelper.getPickMaterial();
                                
                ret.entity = entity;
                const center = surface.boundingSphere!.center;
                ret.centroid = new THREE.Vector3(center[0], center[1], center[2]);
                ret.radius = surface.boundingSphere!.radius;
                
                if (props) ret.props = props;
                        
                ret.disposeList.push(ret.geometry, ret.material, ret.pickMaterial);

                let obj = ret.createObjects();
                ret.object = obj.main;
                ret.pickObject = obj.pick;

                ret.applyTheme(theme);
                
                ret.pickBufferAttributes = [(<any>ret.geometry.pickGeometry.attributes).pColor, (<any>ret.geometry.pickPlatesGeometry.attributes).pColor];                    
                return ret;
            });
        }
    }
}