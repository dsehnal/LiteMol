/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Views.Transform.Density {
    "use strict";
    
    import Transformer = Bootstrap.Entity.Transformer
    
    const IsoValue = (props: { view: Transform.ControllerBase<any>, onChangeValue: (v: number)=> void, onChangeType: (v: Bootstrap.Visualization.Density.IsoValueType)=> void, min: number, max: number, value: number, isSigma: boolean }) => 
        <Controls.ExpandableGroup
            select={<Controls.Slider label={props.isSigma ? 'Iso Value (\u03C3)' : 'Iso Value'} onChange={props.onChangeValue} min={props.min} max={props.max} value={props.value} step={0.001}  />}
            expander={<Controls.ControlGroupExpander isExpanded={props.view.getPersistentState('showIsoValueType', false)} onChange={e => props.view.setPersistentState('showIsoValueType', e) }  />}
            options={[<Controls.Toggle onChange={v => props.onChangeType(v ? Bootstrap.Visualization.Density.IsoValueType.Sigma : Bootstrap.Visualization.Density.IsoValueType.Absolute) } value={props.isSigma} label='Relative (\u03C3)' />]}
            isExpanded={ props.view.getPersistentState('showIsoValueType', false) }
            /> 

    function isoValueAbsoluteToSigma(data: Core.Formats.Density.Data, value: number, min: number, max: number) {
        let ret = (value - data.valuesInfo.mean) / data.valuesInfo.sigma;
        if (ret > max) return max;
        if (ret < min) return min;
        return ret;
    }

    function isoValueSigmaToAbsolute(data: Core.Formats.Density.Data, value: number) {
        let ret = data.valuesInfo.mean + value * data.valuesInfo.sigma;
        if (ret > data.valuesInfo.max) return data.valuesInfo.max;
        if (ret < data.valuesInfo.min) return data.valuesInfo.min;
        return ret;
    }
    
    export class ParseData extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Density.ParseDataParams>> {        
        protected renderControls() {            
            let params = this.params;
            let round = Bootstrap.Utils.round;
            if (this.isUpdate) {
                let data = (this.controller.entity as Bootstrap.Entity.Density.Data).props.data;
                return <div>
                    <Controls.RowText label='Format' value={params.format!.name} />
                    <Controls.RowText label='Sigma' value={round(data.valuesInfo.sigma, 3)} />
                    <Controls.RowText label='Mean' value={round(data.valuesInfo.mean, 3)} />
                    <Controls.RowText label='Value Range' value={`[${round(data.valuesInfo.min, 3)}, ${round(data.valuesInfo.max, 3)}]`} />
                </div>;
            } 
                        
            return <div>
                <Controls.OptionsGroup options={LiteMol.Core.Formats.Density.SupportedFormats.All} caption={s => s.name} current={params.format}
                        onChange={(o) => this.updateParams({ format: o }) } label='Format' />
            </div>
        }        
    }
    
    export class CreateVisual extends Transform.ControllerBase<Bootstrap.Components.Transform.DensityVisual<Transformer.Density.CreateVisualParams, 'style'>> {        
        
        private surface() {           
            const data = Bootstrap.Tree.Node.findClosestNodeOfType(this.transformSourceEntity, [Bootstrap.Entity.Density.Data]) as Bootstrap.Entity.Density.Data;           
            const params = this.params.style.params as Bootstrap.Visualization.Density.Params;
            const isSigma = params.isoValueType !== Bootstrap.Visualization.Density.IsoValueType.Absolute;
            const values = data.props.data.valuesInfo;

            const min = isSigma 
                ? (values.min - values.mean) / values.sigma
                : values.min;
            
            const max = isSigma 
                ? (values.max - values.mean) / values.sigma
                : values.max;

            return <IsoValue 
                view={this}
                onChangeValue={v => this.controller.updateStyleParams({ isoValue: v  })}
                onChangeType={v => {
                    if (v === params.isoValueType) return;
                    if (v === Bootstrap.Visualization.Density.IsoValueType.Absolute) {
                        this.controller.updateStyleParams({ isoValue: isoValueSigmaToAbsolute(data.props.data, params.isoValue), isoValueType: v }); 
                    } else {
                        this.controller.updateStyleParams({ isoValue: isoValueAbsoluteToSigma(data.props.data, params.isoValue, -5, 5), isoValueType: v });
                    }
                }}
                min={min} max={max}  isSigma={isSigma} value={params.isoValue} />;
        }
        
        private colors() {                      
            let params = this.params.style!.params as Bootstrap.Visualization.Density.Params;             
            let theme = this.params.style!.theme!;
            
            let uc = theme.colors!.get('Uniform');
            let uniform = <Controls.ToggleColorPicker key={'Uniform'} label='Color' color={uc} onChange={c => this.controller.updateThemeColor('Uniform', c) } />
            
            let controls: JSX.Element[] = [];
                // theme.colors!
                //     .filter((c, n) => n !== 'Uniform')
                //     .map((c, n) => <Controls.ToggleColorPicker  key={n} label={n!} color={c!} onChange={c => this.controller.updateThemeColor(n!, c) } />).toArray();
                    
            controls.push(<TransparencyControl definition={theme.transparency!} onChange={d => this.controller.updateThemeTransparency(d) } />);
            //controls.push(<Controls.Slider label='Smoothing' onChange={v => this.controller.updateStyleParams({ smoothing: v  })}  min={0} max={10} step={1} value={visualParams.smoothing!} title='Number of laplacian smoothing itrations.' />);
            controls.push(<Controls.Toggle onChange={v => this.controller.updateStyleParams({ isWireframe: v }) } value={params.isWireframe!} label='Wireframe' />)
                    
            let showThemeOptions = this.getPersistentState('showThemeOptions', false);
            return <Controls.ExpandableGroup
                    select={uniform}
                    expander={<Controls.ControlGroupExpander isExpanded={showThemeOptions} onChange={e => this.setPersistentState('showThemeOptions', e) }  />}
                    options={controls}
                    isExpanded={showThemeOptions} />;
        }
        
        protected renderControls() {            
            return <div>
                {this.surface()}
                {this.colors()}                
            </div>
        }        
    }
    
    
    export class CreateVisualBehaviour extends Transform.ControllerBase<Bootstrap.Components.Transform.DensityVisual<Transformer.Density.CreateVisualBehaviourParams, 'style'>> {        
        
        private surface() {           
            let data = Bootstrap.Tree.Node.findClosestNodeOfType(this.transformSourceEntity, [Bootstrap.Entity.Density.Data]) as Bootstrap.Entity.Density.Data;
            let params = this.params as Transformer.Density.CreateVisualBehaviourParams;           
            let visualParams = params.style.params;
            let isSigma = visualParams.isoValueType !== Bootstrap.Visualization.Density.IsoValueType.Absolute;

            return <IsoValue 
                view={this}
                onChangeValue={v => this.controller.updateStyleParams({ isoValue: v  })}
                onChangeType={v => {
                    if (v === visualParams.isoValueType) return;
                    if (v === Bootstrap.Visualization.Density.IsoValueType.Absolute) {
                        this.controller.updateStyleParams({ isoValue: isoValueSigmaToAbsolute(data.props.data, visualParams.isoValue), isoValueType: v }); 
                    } else {
                        this.controller.updateStyleParams({ isoValue: isoValueAbsoluteToSigma(data.props.data, visualParams.isoValue, params.isoSigmaMin, params.isoSigmaMax), isoValueType: v });
                    }
                }}
                min={isSigma ? params.isoSigmaMin : data.props.data.valuesInfo.min} 
                max={isSigma ? params.isoSigmaMax : data.props.data.valuesInfo.max} 
                isSigma={isSigma}
                value={visualParams.isoValue} />; 
        }
        
        private colors() {          
            let params = this.params.style.params;                         
            let theme = this.params.style.theme;
            
            let uc = theme.colors!.get('Uniform');
            let uniform = <Controls.ToggleColorPicker key={'Uniform'} label='Color' color={uc} onChange={c => this.controller.updateThemeColor('Uniform', c) } />
            
            let controls = [];
                // theme.colors!
                //     .filter((c, n) => n !== 'Uniform')
                //     .map((c, n) => <Controls.ToggleColorPicker  key={n} label={n!} color={c!} onChange={c => this.controller.updateThemeColor(n!, c) } />).toArray();
                    
            controls.push(<TransparencyControl definition={theme.transparency!} onChange={d => this.controller.updateThemeTransparency(d) } />);
            //controls.push(<Controls.Slider label='Smoothing' onChange={v => this.controller.updateStyleParams({ smoothing: v  })}  min={0} max={10} step={1} value={visualParams.smoothing!} title='Number of laplacian smoothing itrations.' />);
            controls.push(<Controls.Toggle onChange={v => this.controller.updateStyleParams({ isWireframe: v }) } value={params.isWireframe!} label='Wireframe' />)
                    
            let showThemeOptions = this.getPersistentState('showThemeOptions', false);
            return <Controls.ExpandableGroup
                    select={uniform}
                    expander={<Controls.ControlGroupExpander isExpanded={showThemeOptions} onChange={e => this.setPersistentState('showThemeOptions', e) }  />}
                    options={controls}
                    isExpanded={showThemeOptions} />;
        }

        private show() {
            const selLabel = 'Around Selection';
            const allLabel = 'Everything';
            let params = this.params as Transformer.Density.CreateVisualBehaviourParams;

            return <Controls.OptionsGroup 
                options={[selLabel, allLabel]} 
                caption={s => s} 
                current={params.showFull ? allLabel : selLabel }
                onChange={(o) => this.autoUpdateParams({ showFull: o === allLabel }) } 
                label='Show' />   
        }
        
        protected renderControls() {            
            let params = this.params as Transformer.Density.CreateVisualBehaviourParams;
            
            return <div>
                {this.surface()}
                {this.colors()} 
                {this.show()}
                {!params.showFull 
                    ? <Controls.Slider label='Radius' onChange={v => this.autoUpdateParams({ radius: v })} 
                    min={params.minRadius !== void 0 ? params.minRadius : 0} max={params.maxRadius !== void 0 ? params.maxRadius : 10} step={0.005} value={params.radius} />
                    : void 0 }
            </div>
        }        
    }
    
}