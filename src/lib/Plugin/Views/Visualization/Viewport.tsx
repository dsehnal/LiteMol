/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Views.Visualization {
    "use strict";

    export class ViewportControls extends View<Bootstrap.Components.Visualization.Viewport, { showSceneOptions?: boolean, showHelp?: boolean }, {}> {        
        state = { showSceneOptions: false, showHelp: false };

        private help() {
            return <div className='lm-viewport-controls-scene-options lm-control'>
                <Controls.HelpBox title='Rotate' content={<div><div>Left button</div><div>One finger touch</div></div>} />
                <Controls.HelpBox title='Zoom' content={<div><div>Right button</div><div>Pinch</div></div>} />
                <Controls.HelpBox title='Move' content={<div><div>Middle button</div><div>Two finger touch</div></div>} />
                <Controls.HelpBox title='Slab' content={<div><div>Mouse wheel</div><div>Three finger touch</div></div>} />
            </div>
        }
        
        render() {
            let state = this.controller.latestState;
            
            let options: any;
                        
            let layoutController = this.controller.context.layout; 
            let layoutState = layoutController.latestState;
            if (this.state.showSceneOptions) {             
                options = <div className='lm-viewport-controls-scene-options lm-control'>                    
                    <Controls.Toggle onChange={v => this.controller.setState({ enableFog: v })} value={state.enableFog!} label='Fog' />
                    <Controls.Slider label='FOV' min={30} max={90} onChange={v => this.controller.setState({ cameraFOV: v }) } value={state.cameraFOV!} />
                    <Controls.Slider label='Camera Speed' min={1} max={10} step={0.01} onChange={v => this.controller.setState({ cameraSpeed: v }) } value={state.cameraSpeed!} />
                    <Controls.ToggleColorPicker color={state.clearColor!} label='Background' position='below' onChange={c => this.controller.setState({ clearColor: c }) } />
                </div>;
            } else if (this.state.showHelp) {
                options = this.help();
            }
            
            let controlsShown = !layoutState.hideControls;
            return <div className='lm-viewport-controls' onMouseLeave={() => this.setState({ showSceneOptions: false, showHelp: false })}>
                <div className='lm-viewport-controls-buttons'>
                    <Controls.Button 
                        style='link'
                        active={this.state.showHelp}
                        customClass={'lm-btn-link-toggle-' + (this.state.showHelp ? 'on' : 'off')}
                        icon='help-circle' 
                        onClick={(e) => this.setState({ showHelp: !this.state.showHelp, showSceneOptions: false }) } title='Controls Help' />     
                    <Controls.Button 
                        style='link'
                        active={this.state.showSceneOptions}
                        customClass={'lm-btn-link-toggle-' + (this.state.showSceneOptions ? 'on' : 'off')}
                        icon='settings' 
                        onClick={(e) => this.setState({ showSceneOptions: !this.state.showSceneOptions, showHelp: false }) } title='Scene Options' />                      
                    <Controls.Button 
                        style='link' 
                        icon='screenshot' 
                        onClick={(e) => this.controller.scene.scene.downloadScreenshot()}
                        title='Screenshot' />                
                    <Controls.Button   onClick={() => { layoutController.update({ hideControls: controlsShown }); this.forceUpdate(); } }
                        icon='tools' title={controlsShown ? 'Hide Controls' : 'Show Controls'} active={controlsShown } 
                        customClass={'lm-btn-link-toggle-' + (controlsShown  ? 'on' : 'off')}
                        style='link' />
                    <Controls.Button   onClick={() => layoutController.update({ isExpanded: !layoutState.isExpanded  }) }
                        icon='expand-layout' title={layoutState.isExpanded ? 'Collapse' : 'Expand'} active={layoutState.isExpanded } 
                        customClass={'lm-btn-link-toggle-' + (layoutState.isExpanded  ? 'on' : 'off')}
                        style='link' />
                    <Controls.Button 
                        style='link' 
                        icon='reset-scene' 
                        onClick={(e) => Bootstrap.Command.Visual.ResetScene.dispatch(this.controller.context, void 0) } 
                        title='Reset scene' />
                </div>
                {options}
            </div>;    
        }
    } 
        
    export class HighlightInfo extends View<Bootstrap.Components.Visualization.HighlightInfo, {}, {}> {                
        render() {
            let state = this.controller.latestState;
            let info = state.info!;
            if (!info.length) {
                return <div className='lm-empty-control' />;
            }
            let html = { __html: info.join(', ') } 
            return <div className='lm-highlight-info'>
                <div dangerouslySetInnerHTML={html} />
            </div>;
        }
    }
    
    export const Logo = () => 
        <div className='lm-logo'>
            <div>
                <div>
                    <div />
                    <div className='lm-logo-image' />
                </div>
            </div>
        </div>
    

    export class Viewport extends View<Bootstrap.Components.Visualization.Viewport, {}, { noWebGl?: boolean, showLogo?: boolean }> {
        private host3d: HTMLDivElement | undefined = void 0;
        private defaultBg = { r: 0, g: 0, b: 0 }
        state =  { noWebGl: false, showLogo: true };
        
        componentDidMount() {
            if (!this.host3d || !this.controller.init(this.host3d)) {
                this.setState({ noWebGl: true });
            }
            this.handleLogo();
        }

        componentWillUnmount() {
            super.componentWillUnmount();
            this.controller.destroy();
        }
                
        renderMissing() {
            return <div className='lm-no-webgl'>
                <div>
                    <p><b>WebGL does not seem to be available.</b></p>
                    <p>This can be caused by an outdated browser, graphics card driver issue, or bad weather. Sometimes, just restarting the browser helps.</p>
                    <p>For a list of supported browsers, refer to <a href='http://caniuse.com/#feat=webgl' target='_blank'>http://caniuse.com/#feat=webgl</a>.</p>
                </div>
            </div>
        }
        
        private handleLogo() {
            this.subscribe(Bootstrap.Event.Tree.NodeAdded.getStream(this.controller.context), e => {
                if (Bootstrap.Entity.isClass(e.data, Bootstrap.Entity.VisualClass)) {
                    setTimeout(() => this.setState({ showLogo: this.getShowLogo() }), 0);
                } 
            });
            
            this.subscribe(Bootstrap.Event.Tree.NodeRemoved.getStream(this.controller.context), e => {
                if (Bootstrap.Entity.isClass(e.data, Bootstrap.Entity.VisualClass)) {
                    setTimeout(() => this.setState({ showLogo: this.getShowLogo() }), 0);
                } 
            });
        }

        private getShowLogo() {
            try {
                return this.controller.context.viewport.scene.models.isEmpty(); 
            } catch(e) {
                return true;
            }
        }
        
        render() {            
            if (this.state.noWebGl) return this.renderMissing();
            
            const color = this.controller.latestState.clearColor! || this.defaultBg;
            return <div className='lm-viewport' style={{ backgroundColor: `rgb(${255 * color.r}, ${255 * color.g}, ${255 * color.b})` }}>
                <div ref={host => this.host3d = host!} className='lm-viewport-host3d' />
                {this.state.showLogo ? <Logo /> : void 0}
                <ViewportControls controller={this.controller} />
            </div>;
        }
    }
}