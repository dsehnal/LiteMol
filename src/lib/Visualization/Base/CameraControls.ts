/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization {

   export const enum CameraControlsState { NONE = -1, ROTATE =  0, ZOOM = 2, PAN = 1, TOUCH_ROTATE = 3, TOUCH_ZOOM_PAN = 4 };

    // ported and modified from threejs Trackball Controls
   export class CameraControls {
    
        constructor(public camera: THREE.Camera, private domElement: HTMLElement, private scene: Scene) {
            this.init();
        } 
        
        enabled = true;
        //private screen = { left: 0, top: 0, width: 0, height: 0 };
        rotateSpeed = 6;
        zoomSpeed = 6;
        panSpeed = 1.0;
        noRotate = false;
        noZoom = false;
        noPan = false;
        noRoll = true;
        staticMoving = true;
        dynamicDampingFactor = 0.2;
        minDistance = 1.5;
        maxDistance = 100000;
        keys = [65 /*A*/, 16 /*S*/, 17 /*D*/];
        
        target = new THREE.Vector3();
        // internals
        private EPS = 0.000001;
        private lastPosition = new THREE.Vector3();
        private _state = CameraControlsState.NONE;
        private _keyDownState = CameraControlsState.NONE;
        private _prevState = CameraControlsState.NONE;
        private _eye = new THREE.Vector3();
        private _rotateStart = new THREE.Vector3();
        private _rotateEnd = new THREE.Vector3();
        private _zoomStart = new THREE.Vector2();
        private _zoomEnd = new THREE.Vector2();
        private _touchZoomDistanceStart = 0;
        private _touchZoomDistanceEnd = 0;
        private _panStart = new THREE.Vector2();
        private _panEnd = new THREE.Vector2();
        
        // for reset
        private target0 = this.target.clone();
        private position0 = this.camera.position.clone();
        private up0 = this.camera.up.clone();
        
        // events
        private changeEvent = { type: 'change', target: <any>void 0 };
        private startEvent = { type: 'start', target: <any>void 0 };
        private endEvent = { type: 'end', target: <any>void 0 };
        
        events: THREE.EventDispatcher = new THREE.EventDispatcher();
        
                
        private _mouseOnScreen = new THREE.Vector2();
        private getMouseOnScreen() {            
            this.scene.mouseInfo.setExactPosition();
            let rs = this.scene.renderState, pos = this.scene.mouseInfo.exactPosition;
            this._mouseOnScreen.set(pos.x / rs.width, pos.y / rs.height);
            return this._mouseOnScreen;
        } 
        
        private _mouseOnBallProjection = new THREE.Vector3();
        private _objectUp = new THREE.Vector3();
        private _mouseOnBall = new THREE.Vector3();
                
        private getMouseProjectionOnBall() {
            
            this.scene.mouseInfo.setExactPosition();
                        
            let rs = this.scene.renderState, pos = this.scene.mouseInfo.exactPosition;
            let cX = 0.5 * rs.width,
                cY = 0.5 * rs.height,
                u = (pos.x - cX) / (rs.width * .5),
                v = -(pos.y - cY) / (rs.height * .5);
            
            this._mouseOnBall.set(u, v, 0.0);
            
            let length = this._mouseOnBall.length();
            if (this.noRoll) {
                if (length < Math.SQRT1_2) {
                    this._mouseOnBall.z = Math.sqrt(1.0 - length * length);
                } else {
                    this._mouseOnBall.z = .5 / length;
                }
            } else if (length > 1.0) {
                this._mouseOnBall.normalize();
            } else {
                this._mouseOnBall.z = Math.sqrt(1.0 - length * length);
            }
            this._eye.copy(this.camera.position).sub(this.target);
            this._mouseOnBallProjection.copy(this.camera.up).setLength(this._mouseOnBall.y)
            this._mouseOnBallProjection.add(this._objectUp.copy(this.camera.up).cross(this._eye).setLength(this._mouseOnBall.x));
            this._mouseOnBallProjection.add(this._eye.setLength(this._mouseOnBall.z));
            return this._mouseOnBallProjection;
        }
        
        private _rotationAxis = new THREE.Vector3();
        private _rotationQuaternion = new THREE.Quaternion();
        
        private rotateCamera() {
            var angle = Math.acos(this._rotateStart.dot(this._rotateEnd) / this._rotateStart.length() / this._rotateEnd.length());
            if (angle) {
                this._rotationAxis.crossVectors(this._rotateStart, this._rotateEnd).normalize();
                angle *= this.rotateSpeed;
                this._rotationQuaternion.setFromAxisAngle(this._rotationAxis, -angle);
                this._eye.applyQuaternion(this._rotationQuaternion);
                this.camera.up.applyQuaternion(this._rotationQuaternion);
                this._rotateEnd.applyQuaternion(this._rotationQuaternion);
                if (this.staticMoving) {
                    this._rotateStart.copy(this._rotateEnd);
                } else {
                    this._rotationQuaternion.setFromAxisAngle(this._rotationAxis, angle * (this.dynamicDampingFactor - 1.0));
                    this._rotateStart.applyQuaternion(this._rotationQuaternion);
                }
            }
        }
        
        private zoomCamera() {
            if (this._state === CameraControlsState.TOUCH_ZOOM_PAN) {
                var factor = this._touchZoomDistanceStart / this._touchZoomDistanceEnd;
                this._touchZoomDistanceStart = this._touchZoomDistanceEnd;
                this._eye.multiplyScalar(factor);
            } else {
                var factor = 1.0 - (this._zoomEnd.y - this._zoomStart.y) * this.zoomSpeed;
                if (factor !== 1.0 && factor > 0.0) {
                    this._eye.multiplyScalar(factor);
                    if (this.staticMoving) {
                        this._zoomStart.copy(this._zoomEnd);
                    } else {
                        this._zoomStart.y += (this._zoomEnd.y - this._zoomStart.y) * this.dynamicDampingFactor;
                    }
                }
            }
        };
                
        private _panMouseChange = new THREE.Vector2();
        private _panObjectUp = new THREE.Vector3();
        private _panPan = new THREE.Vector3();
        
        private panCamera() {           
            this._panMouseChange.copy(this._panEnd).sub(this._panStart);
            if (this._panMouseChange.lengthSq()) {
                this._panMouseChange.multiplyScalar(this._eye.length() * this.panSpeed);
                this._panPan.copy(this._eye).cross(this.camera.up).setLength(this._panMouseChange.x);
                this._panPan.add(this._panObjectUp.copy(this.camera.up).setLength(this._panMouseChange.y));
                this.camera.position.add(this._panPan);
                this.target.add(this._panPan);
                if (this.staticMoving) {
                    this._panStart.copy(this._panEnd);
                } else {
                    this._panStart.add(this._panMouseChange.subVectors(this._panEnd, this._panStart).multiplyScalar(this.dynamicDampingFactor));
                }
            }
        }
            
        private _panToDelta = new THREE.Vector3();
        private _panToVector = new THREE.Vector3();
        panTo({x, y, z}: { x: number; y: number; z: number }) {            
            this._panToVector.set(x, y, z)
            this._panToDelta.subVectors(this._panToVector, this.target);
            this.camera.position.add(this._panToDelta);
            this.camera.lookAt(this._panToVector);
            this.target.copy(this._panToVector);
            this._eye.subVectors(this.camera.position, this.target);
            this.lastPosition.copy(this.camera.position);
            
            if (this._panToDelta.lengthSq() > this.EPS) {
                this.events.dispatchEvent(this.changeEvent);
            }
        }
        
        panAndMoveToDistance({x, y, z}: { x: number; y: number; z: number }, distance: number) {            
            this._panToVector.set(x, y, z);            
            this._panToDelta.subVectors(this._panToVector, this.target);            
            this.camera.position.add(this._panToDelta);
            this.camera.lookAt(this._panToVector);
            this.target.copy(this._panToVector);            
            this._eye.subVectors(this.camera.position, this.target);   
                     
            this._eye.setLength(distance);            
            this.camera.position.addVectors(this.target, this._eye);
            
            this.checkDistances();                          
            this.lastPosition.copy(this.camera.position);
            
            this.events.dispatchEvent(this.changeEvent);
        }
        
        private checkDistances() {
            if (!this.noZoom || !this.noPan) {
                if (this._eye.lengthSq() > this.maxDistance * this.maxDistance) {
                    this.camera.position.addVectors(this.target, this._eye.setLength(this.maxDistance));
                }
                if (this._eye.lengthSq() < this.minDistance * this.minDistance) {
                    this.camera.position.addVectors(this.target, this._eye.setLength(this.minDistance));
                }
            }
        }
        
        update() {
            this._eye.subVectors(this.camera.position, this.target);
            if (!this.noRotate) {
                this.rotateCamera();
            }
            if (!this.noZoom) {
                this.zoomCamera();
            }
            if (!this.noPan) {
                this.panCamera();
            }
            this.camera.position.addVectors(this.target, this._eye);
            this.checkDistances();
            this.camera.lookAt(this.target);
            if (this.lastPosition.distanceToSquared(this.camera.position) > this.EPS) {
                this.events.dispatchEvent(this.changeEvent);
                this.lastPosition.copy(this.camera.position);
            }
        }
        
        reset() {
            this._state = CameraControlsState.NONE;
            this._prevState = CameraControlsState.NONE;
            this.target.copy(this.target0);
            this.camera.position.copy(this.position0);
            this.camera.up.copy(this.up0);
            this._eye.subVectors(this.camera.position, this.target);
            this.camera.lookAt(this.target);
            this.events.dispatchEvent(this.changeEvent);
            this.lastPosition.copy(this.camera.position);
        }

        getState() {
            return {
                state: this._state,
                prevState: this._prevState,
                target: this.target.clone(),
                objPos: this.camera.position.clone(),
                objUp: this.camera.up.clone(),
                eye: this._eye.clone(),
                lastPosition: this.lastPosition.clone()
            }
        }

        setState(state: any) {
            this._state = state.state;
            this._prevState = state.prevState;
            this.target.copy(state.target);
            this.camera.position.copy(state.objPos);
            this.camera.up.copy(state.objUp);
            this._eye.copy(state.eye);
            this.camera.lookAt(this.target);
            this.events.dispatchEvent(this.changeEvent);
            this.lastPosition.copy(state.lastPosition);
        }
        
        private keydown(event: KeyboardEvent) {
            if (this.enabled === false) return;
            window.removeEventListener('keydown', this.eventHandlers.keydown, false);
            window.addEventListener('keyup', this.eventHandlers.keyup, false);
            this._prevState = this._state;
            if (this._state !== CameraControlsState.NONE) {
                return;
            } else if (event.keyCode === this.keys[CameraControlsState.ROTATE] && !this.noRotate) {
                this._state = CameraControlsState.ROTATE;
            } else if (event.keyCode === this.keys[CameraControlsState.ZOOM] && !this.noZoom) {
                this._state = CameraControlsState.ZOOM;
            } else if (event.keyCode === this.keys[CameraControlsState.PAN] && !this.noPan) {
                this._state = CameraControlsState.PAN;
            }

            this._keyDownState = this._state;
        }
        
        private keyup(event: KeyboardEvent) {
            if (this.enabled === false) return;
            this._state = this._prevState;
            this._keyDownState = CameraControlsState.NONE;
            window.removeEventListener('keyup', this.eventHandlers.keyup, false);
            window.addEventListener('keydown', this.eventHandlers.keydown, false);
        }
        
        private mousedown(event: MouseEvent) {
            if (this.enabled === false) return;
            event.preventDefault();
            //event.stopPropagation();

            this.scene.mouseInfo.updatePosition(event.clientX, event.clientY);
            if (this._keyDownState !== CameraControlsState.NONE) {
                this._state = this._keyDownState;
            }

            if (this._state === CameraControlsState.NONE) {
                this._state = event.button;
            }
            if (this._state === CameraControlsState.ROTATE && !this.noRotate) {
                this._rotateStart.copy(this.getMouseProjectionOnBall());
                this._rotateEnd.copy(this._rotateStart);
            } else if (this._state === CameraControlsState.ZOOM && !this.noZoom) {
                this._zoomStart.copy(this.getMouseOnScreen());
                this._zoomEnd.copy(this._zoomStart);
            } else if (this._state === CameraControlsState.PAN && !this.noPan) {
                this._panStart.copy(this.getMouseOnScreen());
                this._panEnd.copy(this._panStart)
            }
            window.addEventListener('mousemove', this.eventHandlers.mousemove, false);
            window.addEventListener('mouseup', this.eventHandlers.mouseup, false);
            this.events.dispatchEvent(this.startEvent);
        }
        
        mousemove(event: MouseEvent) {
            if (this.enabled === false) return;
            event.preventDefault();
            this.scene.mouseInfo.updatePosition(event.clientX, event.clientY);
            //event.stopPropagation();
            if (this._state === CameraControlsState.ROTATE && !this.noRotate) {
                this._rotateEnd.copy(this.getMouseProjectionOnBall());
            } else if (this._state === CameraControlsState.ZOOM && !this.noZoom) {
                this._zoomEnd.copy(this.getMouseOnScreen());
            } else if (this._state === CameraControlsState.PAN && !this.noPan) {
                this._panEnd.copy(this.getMouseOnScreen());
            }
            this.update();
        }
        
        mouseup(event: MouseEvent) {
            if (this.enabled === false) return;
            event.preventDefault();
            //event.stopPropagation();
            this._state = CameraControlsState.NONE;
            window.removeEventListener('mousemove', this.eventHandlers.mousemove, false);
            window.removeEventListener('mouseup', this.eventHandlers.mouseup, false);
            this.events.dispatchEvent(this.endEvent);
        }
                
        private touchstart(event: TouchEvent) {
            //console.log("trouch start");
            if (this.enabled === false) return;
            switch (event.touches.length) {
                case 1:
                    this._state = CameraControlsState.TOUCH_ROTATE;
                    this.scene.mouseInfo.updatePosition(event.touches[0].clientX, event.touches[0].clientY);
                    this._rotateStart.copy(this.getMouseProjectionOnBall(/*event.touches[0].clientX, event.touches[0].clientY*/));
                    this._rotateEnd.copy(this._rotateStart);
                    break;
                case 2:
                    this._state = CameraControlsState.TOUCH_ZOOM_PAN;
                    var dx = event.touches[0].clientX - event.touches[1].clientX;
                    var dy = event.touches[0].clientY - event.touches[1].clientY;
                    this._touchZoomDistanceEnd = this._touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);
                    var x = (event.touches[0].clientX + event.touches[1].clientX) / 2;
                    var y = (event.touches[0].clientY + event.touches[1].clientY) / 2;
                    this.scene.mouseInfo.updatePosition(x, y);
                    this._panStart.copy(this.getMouseOnScreen(/*x, y*/));
                    this._panEnd.copy(this._panStart);
                    break;
                default:
                    this._state = CameraControlsState.NONE;
            }
            this.events.dispatchEvent(this.startEvent);
        }
        
        private touchmove(event: TouchEvent) {
            if (this.enabled === false) return;
            event.preventDefault();
            event.stopPropagation();
            switch (event.touches.length) {
                case 1:
                    this.scene.mouseInfo.updatePosition(event.touches[0].clientX, event.touches[0].clientY);
                    this._rotateEnd.copy(this.getMouseProjectionOnBall(/*event.touches[0].clientX, event.touches[0].clientY*/));
                    this.update();
                    break;
                case 2:
                    var dx = event.touches[0].clientX - event.touches[1].clientX;
                    var dy = event.touches[0].clientY - event.touches[1].clientY;
                    this._touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);
                    var x = (event.touches[0].clientX + event.touches[1].clientX) / 2;
                    var y = (event.touches[0].clientY + event.touches[1].clientY) / 2;
                    this.scene.mouseInfo.updatePosition(x, y);
                    this._panEnd.copy(this.getMouseOnScreen(/*x, y*/));
                    this.update();
                    break;
                default:
                    this._state = CameraControlsState.NONE;
            }
        }
        
        private touchend(event: TouchEvent) {
            if (this.enabled === false) return;
            let touches = event.touches;
            if (!touches.length) {
                touches = event.changedTouches;
            }
            
            switch (touches.length) {
                case 1:
                    this.scene.mouseInfo.updatePosition(touches[0].clientX, touches[0].clientY);
                    this._rotateEnd.copy(this.getMouseProjectionOnBall(/*event.touches[0].clientX, event.touches[0].clientY*/));
                    this._rotateStart.copy(this._rotateEnd);
                    break;
                case 2:
                    this._touchZoomDistanceStart = this._touchZoomDistanceEnd = 0;
                    var x = (touches[0].clientX + touches[1].clientX) / 2;
                    var y = (touches[0].clientY + touches[1].clientY) / 2;
                    this.scene.mouseInfo.updatePosition(x, y);
                    this._panEnd.copy(this.getMouseOnScreen(/*x, y*/));
                    this._panStart.copy(this._panEnd);
                    break;
            }
            this._state = CameraControlsState.NONE;
            this.events.dispatchEvent(this.endEvent);
        }

        private preventContextMenu(event: Event) { event.preventDefault(); }

        
        private eventHandlers = {
            'keydown': (event: KeyboardEvent) => this.keydown(event),
            'keyup': (event: KeyboardEvent) => this.keyup(event),
            
            'mousedown': (event: MouseEvent) => this.mousedown(event),
            'mouseup': (event: MouseEvent) => this.mouseup(event),
            'mousemove': (event: MouseEvent) => this.mousemove(event),
            
            'touchstart': (event: TouchEvent) => this.touchstart(event),
            'touchmove': (event: TouchEvent) => this.touchmove(event),
            'touchend': (event: TouchEvent) => this.touchend(event)
        }

        private init() {
            this.domElement.addEventListener('contextmenu', this.preventContextMenu, false);
            this.domElement.addEventListener('mousedown', this.eventHandlers.mousedown, false);
            //this.domElement.addEventListener('mousewheel', mousewheel, false);
            //this.domElement.addEventListener('DOMMouseScroll', mousewheel, false); // firefox

            this.domElement.addEventListener('touchstart', this.eventHandlers.touchstart, false);
            this.domElement.addEventListener('touchend', this.eventHandlers.touchend, false);
            this.domElement.addEventListener('touchmove', this.eventHandlers.touchmove, false);
            window.addEventListener('keydown', this.eventHandlers.keydown, false);
            // window.addEventListener('keyup', keyup, false);
            //this.handleResize();
            // force an update at start
            this.update();
        }

        destroy() {
            this.domElement.removeEventListener('contextmenu', this.preventContextMenu, false);
            this.domElement.removeEventListener('mousedown', this.eventHandlers.mousedown, false);
            //scope.domElement.removeEventListener('mousewheel', onMouseWheel, false);
            //scope.domElement.removeEventListener('DOMMouseScroll', onMouseWheel, false); // firefox
            //scope.domElement.removeEventListener('keydown', keydown, false);
            window.removeEventListener('keydown', this.eventHandlers.keydown, false);
            //scope.domElement.removeEventListener('keyup', keyup, false);

            this.domElement.removeEventListener('touchstart', this.eventHandlers.touchstart, false);
            this.domElement.removeEventListener('touchend', this.eventHandlers.touchend, false);
            this.domElement.removeEventListener('touchmove', this.eventHandlers.touchmove, false);

            this.camera = <any>void 0;
            this.domElement = <any>void 0;
        };
    }
}