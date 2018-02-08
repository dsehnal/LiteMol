/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization {

    export enum CameraType {
        Perspective,
        Orthographic
    }

    import LA = Core.Geometry.LinearAlgebra

    export class SlabControls {

        //private width: number;
        private height: number;

        private touchSlabOn = false;
        private touchStartPosition = { x: 0, y: 0 };
        private touchPosition = { x: 0, y: 0 };
        private radius: number = 0;
        private slabWheelRate = 1 / 15;
        private _planeDelta = new LiteMol.Core.Rx.Subject<number>();
        private subs: (() => void)[] = [];

        private enableWheel = false;
        private mouseMoveDelta = 0;
        private lastMousePosition: LA.Vector3 | undefined = void 0;

        readonly planeDelta: LiteMol.Core.Rx.IObservable<number> = this._planeDelta;

        updateSize(w: number, h: number) {/* this.width = w;*/ this.height = h; }
        updateRadius(r: number) { this.radius = r; }

        destroy() {
            for (let s of this.subs) s();
            this.subs = [];
            this._planeDelta.onCompleted();
        }

        private handleMouseWheel(event: MouseWheelEvent) {
            if (!this.enableWheel) return;

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
            //if (delta < -0.5) delta = -0.5;
            //else if (delta > 0.5) delta = 0.5;

            let sign = delta < 0 ? 1 : -1;
            delta = this.radius * this.slabWheelRate * sign;
            
            this._planeDelta.onNext(delta);
        }

        private touchstart(event: TouchEvent) {
            switch (event.touches.length) {
                case 3: {
                    this.touchStartPosition.x = 0;
                    this.touchStartPosition.y = 0;
                    for (let i = 0; i < 3; i++) {
                        this.touchStartPosition.x += event.touches[i].clientX / 3;
                        this.touchStartPosition.y += event.touches[i].clientY / 3;
                    }
                    this.touchSlabOn = true;
                    break;
                }
                default: this.touchSlabOn = false; break;
            }
        }

        private touchend(event: TouchEvent) {
            this.touchSlabOn = false;
        }

        private touchmove(event: TouchEvent) {
            if (!this.touchSlabOn) return;

            this.touchPosition.x = 0;
            this.touchPosition.y = 0;
            for (let i = 0; i < 3; i++) {
                this.touchPosition.x += event.touches[i].clientX / 3;
                this.touchPosition.y += event.touches[i].clientY / 3;
            }

            let delta = -5 * this.radius * (this.touchPosition.y - this.touchStartPosition.y) / this.height;
            this.touchStartPosition.x = this.touchPosition.x;
            this.touchStartPosition.y = this.touchPosition.y;
            this._planeDelta.onNext(delta);
        }

        private mousemove(e: MouseEvent) {
            if (!this.lastMousePosition) {
                this.lastMousePosition = [e.clientX, e.clientY, 0];
                return;
            }
            const pos = [e.clientX, e.clientY, 0];
            this.mouseMoveDelta += LA.Vector3.distance(pos, this.lastMousePosition);
            this.lastMousePosition = pos;
            if (this.mouseMoveDelta > 15) this.enableWheel = true;
        }

        private mouseOut() {
            this.mouseMoveDelta = 0;
            this.lastMousePosition = void 0;
            this.enableWheel = false;
        }

        constructor(element: HTMLElement) {
            const events = {
                wheel: (e: MouseWheelEvent) => this.handleMouseWheel(e),
                touchStart: (e: TouchEvent) => this.touchstart(e),
                touchEnd: (e: TouchEvent) => this.touchend(e),
                touchMove: (e: TouchEvent) => this.touchmove(e),
                mouseMove: (e: MouseEvent) => this.mousemove(e),
                mouseOut: () => this.mouseOut()
            };

            element.addEventListener('mousewheel', events.wheel);
            element.addEventListener('DOMMouseScroll', events.wheel); // firefox   
            element.addEventListener('mousemove', events.mouseMove);
            element.addEventListener('mouseout', events.mouseOut);

            element.addEventListener('touchstart', events.touchStart, false);
            element.addEventListener('touchend', events.touchEnd, false);
            element.addEventListener('touchmove', events.touchMove, false);

            this.subs.push(() => element.removeEventListener('mousewheel', events.wheel));
            this.subs.push(() => element.removeEventListener('mousemove', events.mouseMove));
            this.subs.push(() => element.removeEventListener('mouseout', events.mouseOut));
            this.subs.push(() => element.removeEventListener('DOMMouseScroll', events.wheel));
            this.subs.push(() => element.removeEventListener('touchstart', events.touchStart, false));
            this.subs.push(() => element.removeEventListener('touchend', events.touchEnd, false));
            this.subs.push(() => element.removeEventListener('touchmove', events.touchMove, false));  
        }
    }
    
    export class Camera {

        private camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
        controls: CameraControls;
        private slabControls: SlabControls;

        
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
            this.slabControls.updateRadius(this.focusRadius);      
        }
        
        private focus() {
            this.controls.reset();
            let target = this.focusPoint;
            this.camera.position.set(target.x, target.y, target.z + 4 * this.focusRadius);
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
            this.focusRadius = Math.max(radius, 1);
            this.slabControls.updateRadius(this.focusRadius);
            
            this.nearPlaneDelta = 0;
            this.fogDelta = 0;
            this.controls.panAndMoveToDistance(this.focusPoint, this.focusRadius * 4);            
        }

        move(target: { x: number; y: number; z: number }) {
            this.controls.panTo(target);
        }

        updateSize(w: number, h: number) {
            
            let camera = this.camera;
            if (camera instanceof THREE.PerspectiveCamera) {            
                camera.aspect = w / h;
            }
            this.slabControls.updateSize(w, h);
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
            if (this.slabControls) {
                this.slabControls.destroy();
                this.slabControls = <any>void 0;
            }
            if (this.unbindCamera) {
                this.unbindCamera();
                this.unbindCamera = void 0;
            }
            if (this.controls) {
                this.controls.destroy();
                this.controls = <any>void 0;
            }
        }
        
        private planeDeltaUpdate(delta: number) {
            let dist = this.computeNearDistance();
            let near = dist + this.nearPlaneDelta + delta;
            if (delta > 0 && near > this.targetDistance) delta = 0;
            if (delta < 0 && near < 0.01) delta = 0;
                                   
            this.nearPlaneDelta += delta;
            this.fogDelta += delta;
            this.cameraUpdated();
        }
        
        computeNearDistance() {
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
             
            let cameraUpdated = () => this.cameraUpdated();

            this.slabControls = new SlabControls(this.domElement);
            let deltaUpdate = this.slabControls.planeDelta.subscribe(delta => this.planeDeltaUpdate(delta));
            
            this.controls.events.addEventListener('change', cameraUpdated);
            this.unbindCamera = () => {
                this.controls.events.removeEventListener('change', cameraUpdated);
                deltaUpdate.dispose();
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