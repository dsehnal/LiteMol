/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Components {
    "use strict";
    
    export enum LayoutRegion {
        Main     = 0,
        Top      = 1,
        Right    = 2,
        Bottom   = 3,
        Left     = 4,
        Root     = 5
    }

    export class LayoutTarget {
        components: ComponentInfo[] = [];
        constructor(public cssClass: string) {
        }
    }

    export function makeEmptyTargets() {
        let ret: LayoutTarget[] = [];
        for (let i = 0; i <= LayoutRegion.Root; i++) {
            ret.push(new LayoutTarget(LayoutRegion[i].toLowerCase()));
        }
        return ret;
    }

    export interface LayoutState {
        isExpanded?: boolean;
        hideControls?: boolean;

        hiddenComponentKeys?: Immutable.Set<string>;
    }

    interface RootState { 
        top: string, 
        bottom: string, 
        left: string, 
        right: string, 

        width: string;
        height: string;
        maxWidth: string;
        maxHeight: string;
        margin: string;
        marginLeft: string;
        marginRight: string;
        marginTop: string;
        marginBottom: string;

        scrollTop: number,
        scrollLeft: number, 
        position: string, 
        overflow: string, 
        viewports: HTMLElement[], 
        zindex: string 
    } 

    export class Layout extends Component<LayoutState> {

        update(state: LayoutState) {
            let prevExpanded = !!this.latestState.isExpanded;
            this.setState(state);
            if (typeof state.isExpanded === "boolean" && state.isExpanded !== prevExpanded) this.handleExpand();
            
            this.dispatcher.schedule(() => Bootstrap.Event.Common.LayoutChanged.dispatch(this.context, {}));            
        }
        
        private rootState: RootState = void 0;
        private expandedViewport: HTMLMetaElement;

        private getScrollElement() {
            if ((document as any).scrollingElement) return (document as any).scrollingElement;
            if (document.documentElement) return document.documentElement;
            return document.body;
        }
        
        private handleExpand() {
            
            try {
                let body = document.getElementsByTagName('body')[0];
                let head = document.getElementsByTagName('head')[0]; 
                
                if (!body || !head) return;
                
                if (this.latestState.isExpanded) {
                    
                    let children = head.children;
                    let hasExp = false;
                    let viewports: HTMLElement[] = [];
                    for (let i = 0; i < children.length; i++) {
                        if (children[i] === this.expandedViewport) {
                            hasExp = true;
                        } else if (((children[i] as any).name || '').toLowerCase() === 'viewport') {
                            viewports.push(children[i] as any);                        
                        }
                    }
                    
                    for (let v of viewports) {
                        head.removeChild(v);
                    }
                    
                    if (!hasExp) head.appendChild(this.expandedViewport);


                    let s = body.style;

                    let doc = this.getScrollElement();
                    let scrollLeft = doc.scrollLeft;
                    let scrollTop = doc.scrollTop;

                    this.rootState = {
                        top: s.top, bottom: s.bottom, right: s.right, left: s.left, scrollTop, scrollLeft, position: s.position, overflow: s.overflow, viewports, zindex: this.root.style.zIndex,
                        width: s.width, height: s.height,
                        maxWidth: s.maxWidth, maxHeight: s.maxHeight,
                        margin: s.margin, marginLeft: s.marginLeft, marginRight: s.marginRight, marginTop: s.marginTop, marginBottom: s.marginBottom
                    };               
                    
                    s.overflow = 'hidden';                
                    s.position = 'fixed';
                    s.top = "0";
                    s.bottom = "0";
                    s.right = "0";
                    s.left = "0";

                    s.width = "100%";
                    s.height = "100%";
                    s.maxWidth = "100%";
                    s.maxHeight = "100%";
                    s.margin = "0";
                    s.marginLeft = "0";
                    s.marginRight = "0";
                    s.marginTop = "0";
                    s.marginBottom = "0";

                    this.root.style.zIndex = "100000";
                } else {
                    //root.style.overflow = rootOverflow;
                    let children = head.children;
                    for (let i = 0; i < children.length; i++) {
                        if (children[i] === this.expandedViewport) {
                            head.removeChild(this.expandedViewport);
                            break;
                        }
                    }
                    
                    if (this.rootState) {
                        let s = body.style, t = this.rootState;                    
                        for (let v of t.viewports) {
                            head.appendChild(v);
                        }                    
                        s.top = t.top;
                        s.bottom = t.bottom;
                        s.left = t.left;
                        s.right = t.right;
                        
                        s.width = t.width;
                        s.height = t.height;
                        s.maxWidth = t.maxWidth;
                        s.maxHeight = t.maxHeight;
                        s.margin = t.margin;
                        s.marginLeft = t.marginLeft;
                        s.marginRight = t.marginRight;
                        s.marginTop = t.marginTop;
                        s.marginBottom = t.marginBottom;

                        s.position = t.position;
                        s.overflow = t.overflow;
                        let doc = this.getScrollElement();
                        doc.scrollTop = t.scrollTop;
                        doc.scrollLeft = t.scrollLeft;
                        this.rootState = void 0;
                        this.root.style.zIndex = t.zindex;
                    }
                }
            } catch (e) {
                this.context.logger.error('Layout change error, you might have to reload the page.');
                console.log('Layout change error, you might have to reload the page.', e);
            }
        }

        constructor(context: Context, public targets: LayoutTarget[], private root: HTMLElement) {
            super(context, {
                isExpanded: false,
                hiddenComponentKeys: Bootstrap.Immutable.Set<string>()
            });
            
            Command.Layout.SetState.getStream(this.context).subscribe(e => this.update(e.data));
            
            // <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
            this.expandedViewport = document.createElement('meta');
            this.expandedViewport.name = 'viewport';
            this.expandedViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
        }
    }
}