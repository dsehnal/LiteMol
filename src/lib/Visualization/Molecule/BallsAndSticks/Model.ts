/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Molecule.BallsAndSticks {
    "use strict";
    
    export interface Parameters {
        tessalation?: number;
        atomRadius?: (i: number) => number;
        hideBonds?: boolean;
        hideHydrogens?: boolean;
        bondRadius?: number;
        customMaxBondLengths?: { get(e: string): number | undefined, has(e: string): boolean };
    }
    
    export const DefaultBallsAndSticksModelParameters: Parameters = {
        tessalation: 3,
        atomRadius: () => 0.4,
        hideBonds: false,
        hideHydrogens: false,
        bondRadius: 0.15,
        customMaxBondLengths: void 0
    }

    export class Model extends Visualization.Model {

        //private molecule: Core.Structure.Molecule.Model;
        private material: THREE.ShaderMaterial;
        private bondsMaterial: THREE.MeshPhongMaterial;
        private pickMaterial: THREE.Material;

        ballsAndSticks: BallsAndSticksGeometry;
        
        protected applySelectionInternal(indices: number[], action: Selection.Action): boolean {
            let buffer = this.ballsAndSticks.vertexStateBuffer,
                array = <any>buffer.array as Float32Array,
                map = this.ballsAndSticks.atomVertexMap,
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

        getPickElements(pickId: number): number[] {
            return [pickId];
        }

        highlightElement(pickId: number, highlight: boolean): boolean {
            return this.applySelection([pickId], highlight ? Selection.Action.Highlight : Selection.Action.RemoveHighlight);
        }
        
        protected highlightInternal(isOn: boolean) {
            return Selection.applyActionToBuffer(this.ballsAndSticks.vertexStateBuffer, isOn ? Selection.Action.Highlight : Selection.Action.RemoveHighlight);
        }
                
        applyThemeInternal(theme: Theme) {
            let map = this.ballsAndSticks.atomVertexMap;
            MaterialsHelper.applyColorToMap(map, (<any>this.ballsAndSticks.atomsGeometry.attributes).color, (i, c) => this.theme.setElementColor(i, c));

            //map = this.ballsAndSticks.bondVertexMap;
            let bondColor = Theme.getColor(theme, 'Bond', Colors.DefaultBondColor);
            MaterialsHelper.applyColorToBuffer((<any>this.ballsAndSticks.bondsGeometry.attributes).color, bondColor);
                        
            MaterialsHelper.updateMaterial(this.material, theme, this.object);
            MaterialsHelper.updateMaterial(this.bondsMaterial, theme, this.object);
        }

        private createObjects(): { main: THREE.Object3D; pick: THREE.Object3D } {
            let main = new THREE.Object3D();
            main.add(new THREE.Mesh(this.ballsAndSticks.atomsGeometry, this.material));
            main.add(new THREE.Mesh(this.ballsAndSticks.bondsGeometry, this.bondsMaterial));

            let pick = new THREE.Mesh(this.ballsAndSticks.pickGeometry, this.pickMaterial);
                                    
            return {
                main: main,
                pick: pick
            };
        }
                
        static create(entity: any, {
            model,
            atomIndices,
            theme,
            params,
            props
        } : {
            model: Core.Structure.Molecule.Model,
            atomIndices: number[],
            theme: Theme,
            params: Parameters,
            props?: Model.Props            
        }): Core.Computation<Model> {
            return Core.computation<Model>(async ctx => {                
                let geom = await buildGeometry(model, params, atomIndices, ctx);
                let ret = new Model();
                
                //ret.molecule = model;
                ret.ballsAndSticks = geom;
                ret.material = MaterialsHelper.getMeshMaterial();
                ret.bondsMaterial = new THREE.MeshPhongMaterial({ specular: 0xAAAAAA, shininess: 1, shading: THREE.SmoothShading, side: THREE.FrontSide, vertexColors: THREE.VertexColors });
                ret.pickMaterial = MaterialsHelper.getPickMaterial();

                ret.entity = entity;
                ret.ballsAndSticks.atomsGeometry.computeBoundingSphere();
                ret.centroid = ret.ballsAndSticks.atomsGeometry.boundingSphere.center;
                ret.radius = ret.ballsAndSticks.atomsGeometry.boundingSphere.radius;
                if (props) ret.props = props;
                
                let obj = ret.createObjects();
                ret.object = obj.main;
                
                ret.applyTheme(theme);

                ret.disposeList.push(ret.ballsAndSticks, ret.material, ret.bondsMaterial, ret.pickMaterial);
                
                ret.pickObject = obj.pick;
                ret.pickBufferAttributes = [(<any>ret.ballsAndSticks.pickGeometry.attributes).pColor];

                return ret;
            });
        }
    }
}