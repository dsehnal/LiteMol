/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization {    
    
    
    export class ModelStore {        
        private availableIds: number[] = [];
        private list: Model[] = [];
        private map = Core.Utils.FastMap.create<number, Model>();
        private maxId = 1;
        private _idWidth = 8;
        
        get idWidth() {
            return this._idWidth;
        }
        
        get all() {
            return this.list;
        }
        
        get count() {
            return this.map.size;
        }
        
        getBySceneId(id: number) {
            return this.map.get(id);
        }
        
        add(model: Model, resetCamera: boolean = true) {
            let id: number = -1;
            
            if (this.availableIds.length) {
                id = this.availableIds.pop()!;
            } else {
                id = this.maxId++;
            }
            
            this.map.set(id, model);
            this.list.push(model);
            model.updateId(id, 8);

            if (model.object) {
                this.scene.scene.add(model.object);
            }
            if (model.pickObject) this.scene.pickScene.add(model.pickObject);

            if (resetCamera) {
                this.scene.camera.reset();
            } else {
                this.scene.forceRender();
            }
        }
        
        private dispose(model: Model) {
            if (model.object) {
                this.scene.scene.remove(model.object);
            }
            if (model.pickObject) this.scene.pickScene.remove(model.pickObject);
            model.dispose();
        }

        removeAndDispose(model: Model) {
            if (!this.map.get(model.id)) return;
            
            this.availableIds.push(model.id);
            this.dispose(model);
            
            this.map.delete(model.id);
            let idx = this.list.indexOf(model);
            this.list[idx] = this.list[this.list.length - 1];
            this.list.pop();
            
            if (model.id === this.maxId) this.maxId--;            
            model.id = -1;
            
            this.scene.forceRender();
        }
        
        clear() {
            for (let m of this.list) {                
                this.dispose(m);
            }
            this.list = [];
            this.maxId = 0;
            this.availableIds = [];
            this.map.clear();
            this.scene.forceRender();
        }
        
        constructor(public scene: Scene) {
            
        }
    } 
}