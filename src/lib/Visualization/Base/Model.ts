/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization {

    export abstract class GeometryBase implements IDisposable {
        abstract dispose(): void;

        constructor() {
        }
    }

    export abstract class Model {
        
        constructor() {
            
        }

        id: number = -1; // assigned by "manager"
        
        // base
        entity: any = void 0;
        
        // bounds
        centroid: THREE.Vector3 = new THREE.Vector3();
        radius: number = 0;
        
        // object
        object: THREE.Object3D = <any>void 0;
        theme: Theme = <any>void 0;
        disposeList: IDisposable[] = [];
        
        // picking
        pickObject: THREE.Object3D | undefined = void 0;                
        pickBufferAttributes: THREE.BufferAttribute[] = [];
        
        // state
        dirty = false;
        
        props: Model.Props = {};
        
        tag:any = void 0;
        
        
        updateVisibility(visible: boolean) {
            this.dirty = true;

            this.object.visible = visible;
            if (this.pickObject) {
                this.pickObject.visible = this.getPickObjectVisibility(visible);
            }
        }
        
        getVisibility() {
            return this.object.visible;
        }
        
        applyTheme(theme: Theme) {
            this.dirty = true;
            this.theme = theme;
            if (!theme.interactive) {
                if (this.pickObject) this.pickObject.visible = false;
            } else {
                if (this.pickObject) this.pickObject.visible = this.object.visible;
            }
            this.applyThemeInternal(theme);            
        }

        updateId(id: number, idWidth: number) {
            this.id = id;
            
            for (let attr of this.pickBufferAttributes) {
                let buffer = attr.array;               
                if (idWidth <= 8) {                               
                    for (let i = 0, _b = buffer.length; i < _b; i += 4) {
                        Selection.Picking.applySceneIdFast(this.id, i, buffer);
                    }
                } else {
                    for (let i = 0, _b = buffer.length; i < _b; i += 4) {
                        Selection.Picking.applySceneIdSlow(idWidth - 8, this.id, i, buffer);
                    }
                }
                attr.needsUpdate = true;
            }            
        }
                
        dispose() {
            for (var d of this.disposeList) {
                if (d) d.dispose();
            }
            
            this.disposeList = [];
        }
        
        highlight(isOn: boolean) {            
            let changed = this.highlightInternal(isOn);
            this.dirty = this.dirty || changed;
            return changed;
        }
        
        applySelection(indices: number[], action: Selection.Action): boolean {
            let changed = this.applySelectionInternal(indices, action); 
            this.dirty = this.dirty || changed; 
            return changed;
        } 

        getBoundingSphereOfSelection(indices: number[]): { radius: number, center: Core.Geometry.LinearAlgebra.Vector3 } | undefined {
            return undefined;
        }
        
        abstract highlightElement(pickId: number, highlight: boolean): boolean;                
        abstract getPickElements(pickId: number): number[];
        
        protected abstract applySelectionInternal(indices: number[], action: Selection.Action): boolean;
        protected abstract applyThemeInternal(theme: Theme): void;
        protected abstract highlightInternal(isOn: boolean): boolean;        
        protected getPickObjectVisibility(visible: boolean) {
            return visible && this.theme.interactive;
        }
    }
    
    export namespace Model {
        export interface Props {
        }
    }
}