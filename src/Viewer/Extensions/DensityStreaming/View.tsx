/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.DensityStreaming {
    'use strict';

    import React = LiteMol.Plugin.React // this is to enable the HTML-like syntax

    import Controls = LiteMol.Plugin.Controls 
    

    export class CreateView extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<CreateParams>> {

        protected renderControls() {            
            let params = this.params;                                   
            return <div>
                <Controls.OptionsGroup 
                    options={FieldSources} caption={s => s} 
                    current={params.source} onChange={(o) => this.updateParams({ source: o }) } label='Source' title='Determines how to obtain the data.' />
                <Controls.TextBoxGroup value={params.id} onChange={(v) => this.updateParams({ id: v })} label='Id' onEnter={e => this.applyEnter(e) } placeholder='Enter id...' />
                <Controls.TextBoxGroup value={params.server} onChange={(v) => this.updateParams({ server: v })} label='Server' onEnter={e => this.applyEnter(e) } placeholder='Enter server...' />
            </div>
        }        
    }   

    const IsoInfo: {[F in FieldType]: { min: number, max: number, dataKey: DataType } } = {
        'EMD': { min: -5, max: 5, dataKey: 'EM' },
        '2Fo-Fc': { min: 0, max: 2, dataKey: '2FO-FC' },
        'Fo-Fc(+ve)': { min: 0, max: 5, dataKey: 'FO-FC' },
        'Fo-Fc(-ve)': { min: -5, max: 0, dataKey: 'FO-FC' },
    }

    export class StreamingView extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.DensityVisual<CreateStreamingParams, FieldType>> {

        private iso(type: FieldType) {
            let params = this.params[type]!.params;
            let isSigma = params.isoValueType === Bootstrap.Visualization.Density.IsoValueType.Sigma
            let label = isSigma ? `${type} \u03C3` : type;

            let info = this.params.info.data[IsoInfo[type].dataKey]!;

            return <Controls.Slider label={label} onChange={v => this.controller.updateStyleParams({ isoValue: v  }, type)}
                min={isSigma ? IsoInfo[type].min : info.min} max={isSigma ? IsoInfo[type].max : info.max}
                value={params.isoValue} step={0.001}  />
        }

        private style(type: FieldType) {
            let showTypeOptions = this.getPersistentState('showTypeOptions-' + type, false);

            let theme = this.params[type]!.theme;
            let params = this.params[type]!.params;
            let color = theme.colors!.get('Uniform');
            
            return <Controls.ExpandableGroup
                    select={this.iso(type)}
                    expander={<Controls.ControlGroupExpander isExpanded={showTypeOptions} onChange={e => this.setPersistentState('showTypeOptions-' + type, e) }  />}
                    colorStripe={color}
                    options={[
                        <Controls.ToggleColorPicker key={'Uniform'} label='Color' color={color} onChange={c => this.controller.updateThemeColor('Uniform', c, type) } />,
                        <Plugin.Views.Transform.TransparencyControl definition={theme.transparency!} onChange={d => this.controller.updateThemeTransparency(d, type) } />,
                        <Controls.Toggle onChange={v => this.controller.updateStyleParams({ isWireframe: v }, type) } value={params.isWireframe!} label='Wireframe' />
                    ]}
                    isExpanded={showTypeOptions} />;
        }

        protected renderControls() {            
            let params = this.params;                                   
            return <div>
                {
                    params.source === 'EMD'
                    ? [this.style('EMD')]
                    : [this.style('2Fo-Fc'), this.style('Fo-Fc(+ve)'), this.style('Fo-Fc(-ve)')]
                }
                <Controls.Slider label='Radius' onChange={v => this.autoUpdateParams({ radius: v })} 
                    min={params.minRadius !== void 0 ? params.minRadius : 0} max={params.maxRadius !== void 0 ? params.maxRadius : 10} step={0.005} value={params.radius} />
            </div>
        }        
    }   
}