/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Molecule.Cartoons {
    "use strict";

    export enum CartoonsModelType { Default, AlphaTrace };

    export interface Parameters {        
        tessalation?: number,
        drawingType?: CartoonsModelType,
        showDirectionCones?: boolean
    }
    
    export const DefaultCartoonsModelParameters: Parameters = {
        tessalation: 3,
        drawingType: CartoonsModelType.Default,
        showDirectionCones: true
    } 
  
    export class Model extends Visualization.Model {
        
        private model: Core.Structure.Molecule.Model;
        private material: THREE.ShaderMaterial;
        private gapMaterial: THREE.MeshPhongMaterial;
        private directionConeMaterial: THREE.MeshPhongMaterial;
        private pickMaterial: THREE.Material;
        private queryContext: Core.Structure.Query.Context;

        private cartoons: Geometry.Data;
                        
        protected applySelectionInternal(indices: number[], action: Selection.Action): boolean {
                        
            let buffer = this.cartoons.vertexStateBuffer,
                array = <any>buffer.array as Float32Array,
                map = this.cartoons.vertexMap,
                vertexRanges = map.vertexRanges,
                changed = false,
                residueIndex = this.model.data.atoms.residueIndex;

            for (let a = 0, _a = indices.length; a < _a; a++) {
                
                let index = residueIndex[indices[a]];
                a++;
                while (residueIndex[indices[a]] === index) { a++ }
                a--;               
                
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
        
        getPickElements(pickId: number): number[] {
            
            let { atomStartIndex, atomEndIndex } = this.model.data.residues;
            let elements: number[] = [];
            
            for (let i = atomStartIndex[pickId], _b = atomEndIndex[pickId]; i < _b; i++) {
                if (this.queryContext.hasAtom(i)) elements.push(i);
            }
            
            return elements;
        }
        
        highlightElement(pickId: number, highlight: boolean): boolean {
            return this.applySelection([this.model.data.residues.atomStartIndex[pickId]], highlight ? Selection.Action.Highlight : Selection.Action.RemoveHighlight);
        }
        
        protected highlightInternal(isOn: boolean) {
            return Selection.applyActionToBuffer(this.cartoons.vertexStateBuffer, isOn ? Selection.Action.Highlight : Selection.Action.RemoveHighlight);
        }
        
        private applyColoring(theme: Theme) {            
            let {atomStartIndex, atomEndIndex} = this.model.data.residues;
            
            let color = { r: 0.1, g: 0.1, b: 0.1 };
            let avgColor = { r: 0.1, g: 0.1, b: 0.1 };
            
            let map = this.cartoons.vertexMap;
            let bufferAttribute: THREE.BufferAttribute = (<any>this.cartoons.geometry.attributes).color;
            let buffer = bufferAttribute.array;     
            let vertexRanges = map.vertexRanges       
            
            for (let rI = 0, _bRi = this.model.data.residues.count; rI < _bRi; rI++) {
                avgColor.r = 0; avgColor.g = 0; avgColor.b = 0;                
                let count = 0;
                
                for (let aI = atomStartIndex[rI], _bAi = atomEndIndex[rI]; aI < _bAi; aI++) {
                    if (!this.queryContext.hasAtom(aI)) continue;
                    theme.setElementColor(aI, color);
                    avgColor.r += color.r; avgColor.g += color.g; avgColor.b += color.b;
                    count++;
                }
                
                if (!count) continue;
                color.r = avgColor.r / count; color.g = avgColor.g / count; color.b = avgColor.b / count;
                
                let elementOffset = map.elementMap.get(rI)!;

                let rangeStart = map.elementRanges[2 * elementOffset],
                    rangeEnd = map.elementRanges[2 * elementOffset + 1];

                if (rangeStart === rangeEnd) continue;

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

            // const gapColor = Theme.getColor(theme, 'Gap', Colors.DefaultBondColor);
            // const gc = this.gapMaterial.color;
            // if (gapColor.r !== gc.r || gapColor.g !== gc.g || gapColor.b !== gc.b) {
            //     this.gapMaterial.color = new THREE.Color(gapColor.r, gapColor.g, gapColor.b);
            //     this.gapMaterial.needsUpdate = true;
            // }

            // const dcColor = Theme.getColor(theme, 'DirectionCone', Colors.DefaultCartoonDirectionConeColor);
            // const dc = this.gapMaterial.color;
            // if (dcColor.r !== dc.r || dcColor.g !== dc.g || dcColor.b !== dc.b) {
            //     this.directionConeMaterial.color = new THREE.Color(dcColor.r, dcColor.g, dcColor.b);
            //     this.directionConeMaterial.needsUpdate = true;
            // }
        }
        
        protected applyThemeInternal(theme: Theme) {
            this.applyColoring(theme);
            MaterialsHelper.updateMaterial(this.material, theme, this.object);
            MaterialsHelper.updateMaterial(this.gapMaterial, theme, this.object);
            MaterialsHelper.updateMaterial(this.directionConeMaterial, theme, this.object);
        }

        private createObjects(): { main: THREE.Object3D; pick: THREE.Object3D } {
            const main = new THREE.Object3D();
            main.add(new THREE.Mesh(this.cartoons.geometry, this.material))
            if (this.cartoons.gapsGeometry) {
                main.add(new THREE.Mesh(this.cartoons.gapsGeometry, this.gapMaterial));
            }
            if (this.cartoons.directionConesGeometry) {
                main.add(new THREE.Mesh(this.cartoons.directionConesGeometry, this.directionConeMaterial));
            }
            return {
                main: main.children.length > 1 ? main : main.children[0],
                pick: new THREE.Mesh(this.cartoons.pickGeometry, this.pickMaterial)
            };
        }
        
        static create(entity: any, {
            model,
            queryContext,
            atomIndices,
            theme,
            params,
            props
        }: {
            model: Core.Structure.Molecule.Model;
            queryContext: Core.Structure.Query.Context,
            atomIndices: number[];
            theme: Theme;
            params: Parameters;
            props?: Model.Props   
        }): Core.Computation<Model> {
                
            return Core.computation<Model>(async ctx => {  
                let linearSegments = 0, radialSements = 0;
                
                await ctx.updateProgress('Computing cartoons...');
                
                params = Core.Utils.extend({}, params, DefaultCartoonsModelParameters);                
                switch (params.tessalation) {
                    case 0: linearSegments = 2; radialSements = 2; break;
                    case 1: linearSegments = 4; radialSements = 3; break;
                    case 2: linearSegments = 6; radialSements = 5; break;
                    case 3: linearSegments = 10; radialSements = 8; break;
                    case 4: linearSegments = 12; radialSements = 10; break;
                    case 5: linearSegments = 16; radialSements = 14; break;
                    default: linearSegments = 18; radialSements = 16; break;
                }
                
                
                let cartoons = await Geometry.create(model, atomIndices, linearSegments, {
                    radialSegmentCount: radialSements,
                    tessalation: +params.tessalation!,
                    showDirectionCones: !!params.showDirectionCones
                }, params.drawingType === CartoonsModelType.AlphaTrace, ctx)
                                                                
                let ret = new Model();
                ret.cartoons = cartoons;
                ret.queryContext = queryContext;   
                ret.material = MaterialsHelper.getMeshMaterial();
                ret.gapMaterial = new THREE.MeshPhongMaterial({ color: 0x777777, shading: THREE.FlatShading });
                ret.directionConeMaterial = new THREE.MeshPhongMaterial({ color: 0x999999, shading: THREE.FlatShading });
                ret.pickMaterial = MaterialsHelper.getPickMaterial();     
                if (props) ret.props = props;
        
                ret.entity = entity;
                ret.cartoons.geometry.computeBoundingSphere();
                ret.centroid = ret.cartoons.geometry.boundingSphere.center;
                ret.radius = ret.cartoons.geometry.boundingSphere.radius;

                let obj = ret.createObjects();           
                ret.object = obj.main;
                ret.pickObject = obj.pick;
                ret.pickBufferAttributes = [(<any>ret.cartoons.pickGeometry.attributes).pColor];
                
                ret.model = model;
                ret.applyTheme(theme);

                ret.disposeList.push(ret.cartoons, ret.material, ret.pickMaterial, ret.gapMaterial, ret.directionConeMaterial);
                
                return ret;
            });
        }
    }
}