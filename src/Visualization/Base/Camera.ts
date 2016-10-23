/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization {

    export enum CameraType {
        Perspective,
        Orthographic
    }
    
    export class Camera {

        private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
        private controls: CameraControls;
        
        fog = new THREE.Fog(0x0, 0, 500);
        
        focusPoint = new THREE.Vector3(0, 0, 0);
        focusRadius = 0;
        targetDistance = 0;
        nearPlaneDistance = 0;
        nearPlaneDelta = 0;
        
        fogEnabled = true;
        fogDelta = 0;
        
        static shouldInUpdateInclude(m: Model) {
            return !isNaN(m.centroid.x) && m.getVisibility();
        }
        
        static dist(a: Model, b: Model) {
            let dx = a.centroid.x - b.centroid.x;
        }
        
        private updateFocus(models: Model[]) {
            
            if (!models.length) return;
            
            let sorted = models
                .filter(m => Camera.shouldInUpdateInclude(m))
                .sort(function (a, b) { return b.radius - a.radius });
            
            if (!sorted.length) return;
                
            let pivots = [sorted[0]];
                        
            let t = new THREE.Vector3();
            for (let i = 1; i < sorted.length; i++) {
                let a = sorted[i];
                let include = true;
                for (let p of pivots) {
                    let d = t.subVectors(a.centroid, p.centroid).length();
                    if (d < p.radius) {
                        include = false;
                        break;
                    }
                }
                if (include) {
                    pivots.push(a);
                }
            }
            
            let center = this.focusPoint;
            center.x = 0;
            center.y = 0;
            center.z = 0;
            
            for (let p of pivots) {
                center.add(p.centroid);
            }
            
            center.multiplyScalar(1 / pivots.length);
            
            let radius = 0;
            for (let m of sorted) {
                radius = Math.max(radius, center.distanceTo(m.centroid) + m.radius);
            }
            
            this.focusRadius = radius;          
        }
        
        private focus() {
            this.controls.reset();
            let target = this.focusPoint;
            this.camera.position.set(target.x, target.y, target.z - 4 * this.focusRadius);
            this.camera.lookAt(target);
            this.controls.target.set(target.x, target.y, target.z);
            this.cameraUpdated();
        }

        reset() {          
            this.nearPlaneDelta = 0;  
            this.fogDelta = 0;
            this.updateFocus(this.scene.models.all);            
            this.focus();
        }

        snapshot() {
            return this.controls.getState();
        }

        restore(state: any) {
            this.controls.setState(state);
            this.scene.forceRender();
        }

        focusOnModel(...models: Model[]) {            
            this.updateFocus(models);
            
            this.nearPlaneDelta = 0;
            this.fogDelta = 0;
            this.controls.panAndMoveToDistance(this.focusPoint, this.focusRadius * 4);
        }

        focusOnPoint(center: { x: number; y: number; z: number }, radius: number) {            
            this.focusPoint.x = center.x;
            this.focusPoint.y = center.y;
            this.focusPoint.z = center.z;
            this.focusRadius = radius;
            
            this.nearPlaneDelta = 0;
            this.fogDelta = 0;
            this.controls.panAndMoveToDistance(this.focusPoint, radius * 4);            
        }

        move(target: { x: number; y: number; z: number }) {
            this.controls.panTo(target);
        }

        updateSize(w: number, h: number) {
            
            let camera = this.camera;
            if (camera instanceof THREE.PerspectiveCamera) {            
                camera.aspect = w / h;
            }
            this.camera.updateProjectionMatrix();
            //this.controls.handleResize();
        }

        get position() {
            return this.camera.position;
        }

        get object(): THREE.Camera {
            return this.camera;
        }

        private unbindCamera: any;
        dispose() {
            if (this.unbindCamera) {
                this.unbindCamera();
                this.unbindCamera = void 0;
            }
            if (this.controls) {
                this.controls.destroy();
                this.controls = <any>void 0;
            }
        }
        
        private handleMouseWheel(event: MouseWheelEvent) {
            //if (!this.options.enableFrontClip) return;
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            if (event.preventDefault) {
                event.preventDefault();
            }

            let delta = 0;

            if (event.wheelDelta) { // WebKit / Opera / Explorer 9
                delta = event.wheelDelta;
            } else if (event.detail) { // Firefox
                delta = - event.detail;
            }

            if (delta < -0.5) delta = -0.5;
            else if (delta > 0.5) delta = 0.5;
            
            let dist = this.computeNearDistance();
            let near = dist + this.nearPlaneDelta + delta;
            if (delta > 0 && near > this.targetDistance) delta = 0;
            if (delta < 0 && near < 0.01) delta = 0;
                                   
            this.nearPlaneDelta += delta;
            this.fogDelta += delta;
            this.cameraUpdated();
        }
        
        private computeNearDistance() {
            let dist = this.controls.target.distanceTo(this.camera.position);
            if (dist > this.focusRadius) return dist - this.focusRadius;
            return 0;
        }
        
        cameraUpdated() {            

            let options = this.scene.options;            
            this.fogEnabled = !!options.enableFog;
            let camera = this.camera;
            if (camera instanceof THREE.PerspectiveCamera) {
                camera.fov = options.cameraFOV as number;
            }

            this.targetDistance = this.controls.target.distanceTo(this.camera.position);
            let near = this.computeNearDistance() + this.nearPlaneDelta;
            this.camera.near = Math.max(0.01, Math.min(near, this.targetDistance - 0.5));
            
            if (options.enableFog) {
                // if (dist + this.focusRadius - this.fogDelta < 1) {
                //     this.fogDelta = dist + this.focusRadius - 1;
                // }
                //   let dist = 0;              
                // let fogNear = dist + this.focusRadius - this.fogDelta - this.camera.near;
                // let fogFar = dist + 2 * this.focusRadius - this.fogDelta - this.camera.near;
                
                let fogNear = this.targetDistance - this.camera.near + 1 * this.focusRadius - this.nearPlaneDelta;
                let fogFar = this.targetDistance - this.camera.near + 2 * this.focusRadius - this.nearPlaneDelta; 
                                            
                //console.log(fogNear, fogFar); 
                this.fog.near = Math.max(fogNear, 0.1);
                this.fog.far = Math.max(fogFar, 0.2);
            } else {
                this.fog.far = 1000001;
                this.fog.near = 1000000;
            }            
   
            this.camera.updateProjectionMatrix();
            
            this.scene.forceRender();
            for (let o of this.observers) o.call(null, this);  
        }
        
        createCamera() {
            if (this.scene.options.cameraType === CameraType.Perspective) {
                this.camera = new THREE.PerspectiveCamera(
                    this.scene.options.cameraFOV, 
                    this.scene.parentElement.clientWidth / this.scene.parentElement.clientHeight, 0.1, 1000000);
            } else {
                let sw = this.scene.parentElement.clientWidth, sh = this.scene.parentElement.clientHeight;
                let w = 100, h = sh / sw * w;
                this.camera = <any>new THREE.OrthographicCamera(0.5 * w / - 2, 0.5 * w / 2, h / 2, h / - 2, 0.1, 1000000);
            }
            if (this.controls) {
                this.controls.camera = this.camera;
                this.reset();
            }
        }

        private setup() {
            this.dispose();
            
            this.createCamera();
            this.controls = new CameraControls(this.camera, this.domElement, this.scene);
            let cc = this.scene.options.clearColor; 
            this.fog.color.setRGB(cc!.r, cc!.g, cc!.b);
            
            this.scene.scene.fog = this.fog;
             
            let wheelEvent = (e: MouseWheelEvent) => this.handleMouseWheel(e);
            var cameraUpdated = () => this.cameraUpdated();
            
            this.domElement.addEventListener('mousewheel', wheelEvent);
            this.domElement.addEventListener('DOMMouseScroll', wheelEvent); // firefox              
            this.controls.events.addEventListener('change', cameraUpdated);
            this.unbindCamera = () => {
                this.controls.events.removeEventListener('change', cameraUpdated);
                this.domElement.removeEventListener('mousewheel', wheelEvent);
                this.domElement.removeEventListener('DOMMouseScroll', wheelEvent);
                this.observers = [];
            }

            this.reset();
        }
        
        private observers: any[] = [];
        observe(callback: (c:Camera) => void) {
            this.observers.push(callback);
        }
        
        stopObserving(callback: (c:Camera) => void) {
            this.observers = this.observers.filter(o => o !== callback);
        }

        constructor(
            private scene: Scene,
            private domElement: HTMLElement) {
            this.setup();
        }
    }

}