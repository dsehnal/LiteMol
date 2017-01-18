/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Lines {
    "use strict";

    export class Model extends Visualization.Model {

        private geometry: Geometry;
        private material: THREE.MeshBasicMaterial;
                                
        protected applySelectionInternal(indices: number[], action: Selection.Action): boolean {           
            return false;
        }

        highlightElement(pickId: number, highlight: boolean): boolean {
            return this.applySelection([pickId], highlight ? Selection.Action.Highlight : Selection.Action.RemoveHighlight);
        }
                
        protected highlightInternal(isOn: boolean) {
            return false;
        }

        getPickElements(pickId: number): number[] {
            return [pickId];
        }
        
        applyThemeInternal(theme: Theme) {            
            let color =  theme.colors.get('Uniform')!;
            this.material.color = new THREE.Color(color.r, color.g, color.b);
            this.material.needsUpdate = true;          
        }

        protected getPickObjectVisibility(visible: boolean) {
            return false;
        }

        private createObjects(): { main: THREE.Object3D; pick: THREE.Object3D | undefined } {            
            return {
                main: new THREE.Mesh(this.geometry.geometry, this.material),
                pick: void 0 
            };
        }
        

        static create(entity: any, {
            geometry,
            theme,
            props
        }: {
            geometry: Geometry,
            theme: Theme,
            props?: Model.Props   
        }): Core.Computation<Model> {
            return Core.computation(async ctx => {
                let ret = new Model();

                ret.material = new THREE.MeshBasicMaterial({ wireframe: true });
                ret.geometry = geometry;
                ret.entity = entity;
                ret.centroid = geometry.center;
                ret.radius = geometry.radius;

                if (props) ret.props = props;
                            
                ret.disposeList.push(ret.geometry, ret.material);

                let obj = ret.createObjects();
                ret.object = obj.main;
                ret.pickObject = void 0;

                ret.applyTheme(theme);
                
                ret.pickBufferAttributes = [];                    
                return ret;
            });
        }
    }
}