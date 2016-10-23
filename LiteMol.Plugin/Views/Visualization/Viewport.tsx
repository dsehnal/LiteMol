/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Views.Visualization {
    "use strict";

    import Vis = LiteMol.Visualization;
    export class ViewportControls extends View<Bootstrap.Components.Visualization.Viewport, 
        { showSceneOptions?: boolean }, {}> {
        
        state = { showSceneOptions: false };
        
        render() {
            let state = this.controller.latestState;
            
            let options: any;
                        
            let layoutController = this.controller.context.layout; 
            let layoutState = layoutController.latestState;
            if (this.state.showSceneOptions) {             
                options = <div className='lm-viewport-controls-scene-options lm-control'>                    
                    <Controls.Toggle onChange={v => this.controller.setState({ enableFog: v })} value={state.enableFog!} label='Fog' />
                    <Controls.Slider label='FOV' min={30} max={90} onChange={v => this.controller.setState({ cameraFOV: v }) } value={state.cameraFOV!} />
                    <Controls.ToggleColorPicker color={state.clearColor!} label='Background' position='below' onChange={c => this.controller.setState({ clearColor: c }) } />
                </div>;
            }
            
            let controlsShown = !layoutState.hideControls;
            return <div className='lm-viewport-controls' onMouseLeave={() => this.setState({showSceneOptions: false})}>
                <div className='lm-viewport-controls-buttons'>
                    <Controls.Button 
                        style='link'
                        active={this.state.showSceneOptions}
                        customClass={'btn-link-toggle-' + (this.state.showSceneOptions ? 'on' : 'off')}
                        icon='settings' 
                        onClick={(e) => this.setState({ showSceneOptions: !this.state.showSceneOptions }) } title='Scene Options' />                      
                    <Controls.Button 
                        style='link' 
                        icon='screenshot' 
                        onClick={(e) => { window.open(this.controller.scene.scene.screenshotAsDataURL(), '_blank'); } } 
                        title='Screenshot' />                
                    <Controls.Button   onClick={() => { layoutController.update({ hideControls: controlsShown }); this.forceUpdate(); } }
                        icon='tools' title={controlsShown ? 'Hide Controls' : 'Show Controls'} active={controlsShown } 
                        customClass={'btn-link-toggle-' + (controlsShown  ? 'on' : 'off')}
                        style='link' />
                    <Controls.Button   onClick={() => layoutController.update({ isExpanded: !layoutState.isExpanded  }) }
                        icon='expand-layout' title={layoutState.isExpanded ? 'Collapse' : 'Expand'} active={layoutState.isExpanded } 
                        customClass={'btn-link-toggle-' + (layoutState.isExpanded  ? 'on' : 'off')}
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

        state =  { noWebGl: false, showLogo: true };
        
        componentDidMount() {
            if (!this.controller.init(this.refs['host-3d'] as HTMLElement)) {
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
                    <p>For a list of supported browsers, refer to <a href='https://caniuse.com/#feat=webgl' target='_blank'>https://caniuse.com/#feat=webgl</a>.</p>
                </div>
            </div>
        }
        
        private handleLogo() {
            let visualCount = 0;    
            this.subscribe(Bootstrap.Event.Tree.NodeAdded.getStream(this.controller.context), e => {
                if (Bootstrap.Entity.isClass(e.data, Bootstrap.Entity.VisualClass)) {
                    visualCount++;
                    this.setState({ showLogo: !visualCount });
                } 
            });
            
            this.subscribe(Bootstrap.Event.Tree.NodeRemoved.getStream(this.controller.context), e => {
                if (Bootstrap.Entity.isClass(e.data, Bootstrap.Entity.VisualClass)) {
                    visualCount--;
                    this.setState({ showLogo: !visualCount });
                } 
            });
        }
        
        render() {            
            if (this.state.noWebGl) return this.renderMissing();
            
            return <div className='lm-viewport'>
                <div ref='host-3d' className='lm-viewport-host3d' />
                {this.state.showLogo ? <Logo /> : void 0}
                <ViewportControls controller={this.controller} />
            </div>;
        }
    }
}