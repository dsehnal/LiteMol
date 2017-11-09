/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization {    
    
    export interface SceneOptions {
        alpha?: boolean,
        clearColor?: { r: number; g: number; b: number },
        cameraFOV?: number,
        cameraSpeed?: number,
        cameraType?: CameraType,
        enableFog?: boolean,
        enableFrontClip?: boolean
    }
    
    export const DefaultSceneOptions:SceneOptions = {
        alpha: false,
        clearColor: { r: 0, g: 0, b: 0 },
        cameraSpeed: 6,
        cameraFOV: 30,
        cameraType: CameraType.Perspective,
        enableFog: true
    }

    export class MouseInfo {
        private position: { x: number; y: number } = { x: 0.0, y: 0.0 };
        private lastPosition: { x: number; y: number } = { x: 0.0, y: 0.0 };
        private isDirty = true;
        private rect = { left: 0, top: 0, right: 0, bottom: 0 };

        exactPosition: { x: number; y: number } = { x: 0, y: 0 };

        constructor(private renderState: RenderState, private domElement: Element) {

        }
        
        updateRect() {
            let rect = this.domElement.getBoundingClientRect();
            this.rect.bottom = rect.bottom;
            this.rect.top = rect.top;
            this.rect.left = rect.left;
            this.rect.right = rect.right;
        }
        
        updatePosition(clientX: number, clientY: number) {

            if (this.position.x === clientX && this.position.y === clientY) {
                return;
            }
            this.isDirty = true;
            this.position.x = clientX;
            this.position.y = clientY;
        }        

        update(): boolean {
            if (this.lastPosition.x === this.position.x
                && this.lastPosition.y === this.position.y) {
                return false;
            }

            this.lastPosition.x = this.position.x;
            this.lastPosition.y = this.position.y;
            return true;
        }

        isInside: boolean = false;
        isButtonDown: boolean = false;
        
        setExactPosition() {
            if (!this.isDirty) {
                return;
            }
            
            let x = Math.round((this.position.x - this.rect.left) / (this.rect.right - this.rect.left) * this.renderState.width) | 0;
            let y = Math.round((this.position.y - this.rect.top) / (this.rect.bottom - this.rect.top) * this.renderState.height) | 0;

            this.exactPosition.x = x;
            this.exactPosition.y = y;      
            this.isDirty = false;      
        }      
    }

    export interface ILighting {
        setup(scene: THREE.Scene): void;
        update(cameraPosition: THREE.Vector3): void;
    }

    export class DefaultLighting implements ILighting {
        private lights: THREE.PointLight[] = [];

        setup(scene: THREE.Scene) {

            let pointLight = new THREE.PointLight(0xAAAAAA, 0.75);
            scene.add(pointLight);

            this.lights = [pointLight];

            let ambient = new THREE.AmbientLight(0x999999);
            scene.add(ambient);

        }

        update(cameraPosition: THREE.Vector3) {
            for (let l of this.lights) l.position.copy(cameraPosition);
        }

        constructor() {
        }
    }

    export class RenderState {        
        width = 0.0;
        height = 0.0;
        resizing = false;

        rendered: boolean = false;
        lastRenderTime: number = 0.0;
        pickDelta: number = 0.0;     
        
        animationFrame: number = 0;  
    }

    export class Scene {                
        private static hoverEvent = 'hover';
        private static selectEvent = 'select';
        
        private renderer: THREE.WebGLRenderer;
        renderState = new RenderState();

        scene: THREE.Scene;
        pickScene: THREE.Scene;
        
        private pickTarget: THREE.WebGLRenderTarget;

        mouseInfo: MouseInfo;
        private pickInfo: Selection.Pick = new Selection.Pick();
        //private selectInfo: Selection.Info | null = null;
        
        private unbindEvents: Array<() => void> = [];

        private lighting: ILighting;

        parentElement: HTMLElement;
        options: SceneOptions;
        camera: Camera;
        
        models = new ModelStore(this);
        
        events: THREE.EventDispatcher = new THREE.EventDispatcher();

        private initialResizeTimeout: number | undefined = void 0;

        
        updateOptions(options: SceneOptions) {
            
            options = Core.Utils.extend({}, options, this.options);
            let updateCamera = options.cameraType !== this.options.cameraType;
            
            let cc = options.clearColor; 
            this.renderer.setClearColor(new THREE.Color(cc!.r, cc!.g, cc!.b));
            this.renderer.setClearAlpha(options.alpha ? 0.0 : 1.0);            
            this.camera.fog.color.setRGB(cc!.r, cc!.g, cc!.b);
            if (this.camera.controls) {
                this.camera.controls.rotateSpeed = options.cameraSpeed!;
                this.camera.controls.zoomSpeed = options.cameraSpeed!;
            }
            
            this.options = options;
            if (updateCamera) this.camera.createCamera();
            this.camera.cameraUpdated();
            this.forceRender(); 
        }
        
        constructor(element: HTMLElement, options: SceneOptions = {}) {
            options = Core.Utils.extend({}, options, DefaultSceneOptions);
            this.options = options;
            this.parentElement = element;

            this.scene = new THREE.Scene();
            this.pickScene = new THREE.Scene();
            

            this.pickTarget = new THREE.WebGLRenderTarget(1, 1, { format: THREE.RGBAFormat, minFilter: THREE.LinearFilter });
            this.pickTarget.generateMipmaps = false;
            

            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: options.alpha, preserveDrawingBuffer: true });
            this.renderer.setPixelRatio(window.devicePixelRatio || 1);
            this.renderer.setClearColor(new THREE.Color(options.clearColor!.r, options.clearColor!.g, options.clearColor!.b));
            this.renderer.autoClear = true;
            this.renderer.sortObjects = false;

            this.mouseInfo = new MouseInfo(this.renderState, this.renderer.domElement);

            // if (!this.options.lighting) this.options.lighting = new DefaultLighting();
            // this.options.lighting.setup(this.scene);
            
            this.lighting = new DefaultLighting();
            this.lighting.setup(this.scene);

            this.parentElement.appendChild(this.renderer.domElement);

            let delayedResizeHandler = Core.Utils.debounce(() => this.handleResize(), 150),
                resizeHandler = () => {
                    this.renderState.resizing = true;
                    delayedResizeHandler();
                };

            window.addEventListener('resize', resizeHandler);
            document.addEventListener('resize', resizeHandler);
            this.parentElement.addEventListener('resize', resizeHandler);
            this.unbindEvents.push(() => window.removeEventListener('resize', resizeHandler));
            this.unbindEvents.push(() => document.removeEventListener('resize', resizeHandler));
            this.unbindEvents.push(() => this.parentElement.removeEventListener('resize', resizeHandler));

            this.setupMouse();
            
            this.camera = new Camera(this, this.renderer.domElement);
            this.handleResize();

            this.renderer.clear();
            this.needsRender();
            this.renderState.animationFrame = requestAnimationFrame(this.renderFunc);
            
            // sometimes, the renderer DOM element does not initially have the correct size. 
            // This will hopefully fix the issue in most cases.
            this.initialResizeTimeout = setTimeout(() => { 
                this.initialResizeTimeout = void 0; 
                this.handleResize();
            }, 1000);
        }

        private setupMouse() {
            let handleMove = (e: PointerEvent) => {
                if (!this.mouseInfo.isInside) {
                    this.mouseInfo.updateRect();
                }
                this.mouseInfo.updatePosition(e.clientX, e.clientY);
                this.mouseInfo.isInside = true;
            };

            let element = this.renderer.domElement;

            element.addEventListener('mousemove', handleMove);
            this.unbindEvents.push(() => element.removeEventListener('mousemove', handleMove));
            
            let handleLeave = (e: PointerEvent) => {
                this.mouseInfo.isInside = false;
                this.clearHighlights();
            };
            element.addEventListener('mouseleave', handleLeave);
            this.unbindEvents.push(() => element.removeEventListener('mouseleave', handleLeave));

            let handleDown = (e: PointerEvent) => {
                if (this.mouseInfo.isInside) {
                    this.mouseInfo.updateRect();
                    this.handleSelectStart(e.clientX, e.clientY);
                } else {
                    //this.selectInfo = null;
                }
                this.mouseInfo.isButtonDown = true;
                this.clearHighlights();
            };
            element.addEventListener('mousedown', handleDown);
            this.unbindEvents.push(() => element.removeEventListener('mousedown', handleDown));

            let handleUp = (e: PointerEvent) => {
                this.mouseInfo.isButtonDown = false;
                this.needsRender();
                this.handleSelectEnd(e.clientX, e.clientY);                
                this.clearHighlights(true);   
            };
            window.addEventListener('mouseup', handleUp);
            this.unbindEvents.push(() => window.removeEventListener('mouseup', handleUp));

            //let handleTouchStart = (e: TouchEvent) => {
            //    this.handleSelectStart(e.touches[0].clientX, e.touches[0].clientY);
            //};
            //this.parentElement.addEventListener('touchstart', handleTouchStart, false);
            //this.unbindEvents.push(() => this.parentElement.removeEventListener('touchstart', handleTouchStart, false));

            let handleRectUpdate = (e: PointerEvent) => {
                this.mouseInfo.updateRect();                
            };

            window.addEventListener('mousewheel', handleRectUpdate);
            window.addEventListener('DOMMouseScroll', handleRectUpdate); // firefox
            this.unbindEvents.push(() => window.removeEventListener('mousewheel', handleRectUpdate));
            this.unbindEvents.push(() => window.removeEventListener('DOMMouseScroll', handleRectUpdate));

            element.addEventListener('touchstart', handleRectUpdate, false);
            this.unbindEvents.push(() => element.removeEventListener('touchstart', handleRectUpdate, false));

            let handleTouchEnd = (e: TouchEvent) => {
               let touches = e.touches;
               if (!touches.length) {
                    touches = e.changedTouches;
               }                
               if (touches.length === 1) {
                    this.handleSelectEnd(touches[0].clientX, touches[0].clientY);
               }
               setTimeout(this.clearHighlightsCall, 1000 / 15);               
            };
            element.addEventListener('touchend', handleTouchEnd, false);
            this.unbindEvents.push(() => element.removeEventListener('touchend', handleTouchEnd, false));
            
            try {
                element.addEventListener('touchcancel', handleTouchEnd, false);
                this.unbindEvents.push(() => element.removeEventListener('touchcancel', handleTouchEnd, false));
            } catch (e) {
                
            }
        }
        
        private clearHighlightsCall = () => this.clearHighlights(true);

        private handleSelectStart(x: number, y: number) {
            this.pickInfo.selectStart(x, y);
            //this.selectInfo = this.pickInfo.getPickInfo();
        }

        private handleSelectEnd(x: number, y: number) {
            if (this.pickInfo.selectEnd(x, y)) {
                let info = this.handlePick(true);
                this.dispatchSelectEvent(info);
            }
           // this.selectInfo = null;
        }

        private handleResize() {
            let w = this.parentElement.clientWidth, h = this.parentElement.clientHeight;
            
            this.camera.updateSize(w, h);
            if (this.renderState.height === h && this.renderState.width === w) {
                this.renderState.resizing = false;
                return;
            }

            
            this.renderState.width = w;
            this.renderState.height = h;
            
            this.renderer.setSize(w, h);

            this.pickTarget = new THREE.WebGLRenderTarget(w, h, { format: THREE.RGBAFormat, minFilter: THREE.LinearFilter });
            this.pickTarget.generateMipmaps = false;

            this.renderState.resizing = false;
            this.mouseInfo.updateRect();
            this.needsRender();
        }
        
        private needsRender() {
            this.renderState.rendered = false;
        }

        private checkDirty() {
            let dirty = false;
            
            for (let m of this.models.all) {
                dirty = dirty || m.dirty;
                m.dirty = false;
            }
            return dirty;
        }

        private renderFunc = (time: number) => this.render(time);
        private render(time: number) {
            if (this.renderState.resizing) {
                this.renderState.animationFrame = requestAnimationFrame(this.renderFunc);
                return;
            }

            let delta = time - this.renderState.lastRenderTime;
            this.renderState.pickDelta += delta;
            this.renderState.lastRenderTime = time;
            
            if (this.renderState.pickDelta > 33.3333333 /* 30 fps */) {
                this.renderState.pickDelta = this.renderState.pickDelta % 33.3333333;
                this.handlePick(false);
            }

            let dirty = this.checkDirty();
            if (dirty) this.renderState.rendered = false;

            if (!this.renderState.rendered) {
                this.lighting.update(this.camera.position);
                
                this.renderer.sortObjects = true;
                this.renderer.render(this.scene, this.camera.object);
                this.renderer.sortObjects = false;
                this.renderState.rendered = true;

                if (!this.mouseInfo.isButtonDown) {
                    this.renderer.setClearAlpha(1.0);
                    this.renderer.render(this.pickScene, this.camera.object, this.pickTarget);
                    this.renderer.setClearAlpha(this.options.alpha ? 0.0 : 1.0);
                }
            }
            this.renderState.animationFrame = requestAnimationFrame(this.renderFunc);
        }

        private pickBuffer = new Uint8Array(4);
        
        private dispatchHoverEvent() {
            this.events.dispatchEvent(<any>{ type: Scene.hoverEvent, target: null, data: this.pickInfo.getPickInfo() });
        }

        private dispatchSelectEvent(info: Selection.Info | undefined) {
            if (info) {
                this.events.dispatchEvent(<any>{ type: Scene.selectEvent, target: null, data: info });
            }
        }

        private clearHighlights(update: boolean = true) {
            let info = this.pickInfo, model = this.models.getBySceneId(info.currentPickId), changed = false;
            if (model) {
                changed = model.highlightElement(info.currentPickElementId, false);                
            }
            if (changed && update) this.needsRender();
            if (this.pickInfo.reset()) {
                this.dispatchHoverEvent();
            }
            return changed;
        }
        
        private handlePick(isSelect: boolean): Selection.Info | undefined {

            if (!isSelect && (!this.mouseInfo.update() || this.mouseInfo.isButtonDown) || this.renderState.resizing) { return; }
            if (!this.mouseInfo.isInside) { return void 0; }
            
            this.mouseInfo.setExactPosition();
            let position = this.mouseInfo.exactPosition;

            let cY = this.pickTarget.height - position.y;
            if (this.pickTarget.width < position.x - 1 || position.x < 0.01 ||
                this.pickTarget.height < cY - 1 || cY < 0.01) {
                return void 0;
            }
            this.renderer.readRenderTargetPixels(this.pickTarget, position.x | 0, cY | 0, 1, 1, this.pickBuffer);

            let id = Selection.Picking.getSceneId(this.models.idWidth, this.pickBuffer),
                pickId = Selection.Picking.getElementId(this.models.idWidth, this.pickBuffer),
                info = this.pickInfo;
                
            if (isSelect) {
                if (id === 255) return void 0;
                let model = this.models.getBySceneId(id);
                if (!model) return void 0;
                return { model, elements: model.getPickElements(pickId) };
            } else { 
                if (id === info.currentPickId && pickId === info.currentPickElementId) return void 0;

                let changed = this.clearHighlights(false),
                    model = this.models.getBySceneId(id);

                if (id === 255 || !model) {
                    if (changed) this.needsRender();
                    return void 0;
                }
                                            
                info.currentPickId = id;
                info.currentPickElementId = pickId;
                if (model.highlightElement(pickId, true) || changed) {
                    this.needsRender();
                    info.current = { model, elements: model.getPickElements(pickId) };
                    this.dispatchHoverEvent();
                }
                return void 0;
            }
        }

        resized() {
            this.handleResize();
        }

        forceRender() {
            this.needsRender();
        }
     
        clear() {
            this.models.clear();
        }

        downloadScreenshot() {
            const uri = this.renderer.domElement.toDataURL('image/png');
            const a = document.createElement('a');
            if ('download' in a) {
                a.style.visibility = 'hidden';
                a.href = uri;
                a.target = '_blank';
                a.download = 'litemol_screenshot.png';
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                window.open(uri, '_blank');
            }
        }

        destroy() {
            //clearInterval(this.updateSizeInterval);
            
            this.clear();
            
            for (let e of this.unbindEvents) {
                try {
                    e();
                } catch (_ex) { }
            }            
            
            if (this.initialResizeTimeout !== void 0) {
                clearTimeout(this.initialResizeTimeout);
                this.initialResizeTimeout = void 0;
            }

            this.unbindEvents = [];
            cancelAnimationFrame(this.renderState.animationFrame);
            this.scene = <any>null;
            this.pickScene = <any>null;
            this.camera.dispose();
            this.camera = <any>null;
            if (this.renderer && (<any>this.renderer).dispose) (<any>this.renderer).dispose();
            this.renderer = <any>null;
            this.pickTarget.dispose();
            this.pickTarget = <any>null;
            while (this.parentElement.lastChild) this.parentElement.removeChild(this.parentElement.lastChild);
        }
    }
}