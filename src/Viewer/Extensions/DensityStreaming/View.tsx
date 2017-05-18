/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.DensityStreaming {
    'use strict';

    import React = LiteMol.Plugin.React // this is to enable the HTML-like syntax

    import Controls = LiteMol.Plugin.Controls 
    

    export class CreateView extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<SetupParams>> {

        protected renderControls() {            
            const params = this.params;                                   
            return <div>
                <Controls.OptionsGroup 
                    options={FieldSources} caption={s => s} 
                    current={params.source} onChange={(o) => this.updateParams({ source: o }) } label='Source' title='Determines how to obtain the data.' />
                <Controls.TextBoxGroup value={params.id} onChange={(v) => this.updateParams({ id: v })} label='Id' onEnter={e => this.applyEnter(e) } placeholder='Enter id...' />
                <Controls.TextBoxGroup value={params.server} onChange={(v) => this.updateParams({ server: v })} label='Server' onEnter={e => this.applyEnter(e) } placeholder='Enter server...' />
            </div>
        }        
    }   

    export const IsoInfo: {[F in FieldType]: { min: number, max: number, dataKey: DataType } } = {
        'EM': { min: -5, max: 5, dataKey: 'EM' },
        '2Fo-Fc': { min: 0, max: 2, dataKey: '2FO-FC' },
        'Fo-Fc(+ve)': { min: 0, max: 5, dataKey: 'FO-FC' },
        'Fo-Fc(-ve)': { min: -5, max: 0, dataKey: 'FO-FC' },
    }

    export class StreamingView extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.DensityVisual<CreateStreamingParams, FieldType>> {

        private updateIso(type: FieldType, v: number) {
            const isoValues = { ...this.params.isoValues, [type]: v };
            this.controller.autoUpdateParams({ isoValues });
        }

        private iso(type: FieldType) {
            const params = this.params;
            const isSigma = params.isoValueType === Bootstrap.Visualization.Density.IsoValueType.Sigma;
            const label = isSigma ? `${type} \u03C3` : type;
            const valuesIndex = params.header.channels.indexOf(IsoInfo[type].dataKey);
            const baseValuesInfo = params.header.sampling[0].valuesInfo[valuesIndex];
            const sampledValuesInfo = params.header.sampling[params.header.sampling.length - 1].valuesInfo[valuesIndex];
            const isoInfo = IsoInfo[type];
            const value = params.isoValues[type]!;

            const sigmaMin = (sampledValuesInfo.min - sampledValuesInfo.mean) / sampledValuesInfo.sigma;
            const sigmaMax = (sampledValuesInfo.max - sampledValuesInfo.mean) / sampledValuesInfo.sigma;

            let min, max;
            if (isSigma) {
                if (type === 'EM') {
                    min = Math.max((baseValuesInfo.min - baseValuesInfo.mean) / baseValuesInfo.sigma, sigmaMin);
                    max = Math.min((baseValuesInfo.max - baseValuesInfo.mean) / baseValuesInfo.sigma, sigmaMax);
                } else {
                    min = isoInfo.min;
                    max = isoInfo.max;
                }               
            } else {
                min = Math.max(baseValuesInfo.mean + sigmaMin * baseValuesInfo.sigma, baseValuesInfo.min);
                max = Math.min(baseValuesInfo.mean + sigmaMax * baseValuesInfo.sigma, baseValuesInfo.max);
            }

            return <Controls.Slider label={label} onChange={v => this.updateIso(type, v)} min={min} max={max} value={value} step={0.001} />;
        }

        private style(type: FieldType) {
            const showTypeOptions = this.getPersistentState('showTypeOptions-' + type, false);

            const theme = this.params[type]!.theme;
            const params = this.params[type]!.params;
            const color = theme.colors!.get('Uniform');
            
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

        private details() {
            const { availablePrecisions } = this.params.header; 
            if (availablePrecisions.length < 2) return void 0;
            const params = this.params;
            const detailLevel = params.detailLevel;
            const options = availablePrecisions.map(p => { 
                const d = `${Math.ceil(p.maxVoxels ** (1/3))}`;
                return `${d} \u00D7 ${d} \u00D7 ${d}`;
            })
            return <Controls.OptionsGroup  options={options}  caption={s => s}  current={options[detailLevel]}
                title='Determines the detail level of the surface.'
                onChange={o => this.autoUpdateParams({ detailLevel: options.indexOf(o) }) } label='Max Voxels' />
        }

        private updateValueType(toSigma: boolean) {
            const params = this.params; 
            const isSigma = params.isoValueType === Bootstrap.Visualization.Density.IsoValueType.Sigma;
            if (isSigma === toSigma) return;

            const newValues: { [F in FieldType]?: number } = {};            
            for (const k of Object.getOwnPropertyNames(params.isoValues)) {
                const valuesIndex = params.header.channels.indexOf(IsoInfo[k as FieldType].dataKey);
                const valuesInfo = params.header.sampling[0].valuesInfo[valuesIndex];
                const value = params.isoValues[k as FieldType]!;
                newValues[k as FieldType] = toSigma 
                    ? (value - valuesInfo.mean) / valuesInfo.sigma
                    : valuesInfo.mean + valuesInfo.sigma * value;
            }
            this.controller.autoUpdateParams({ 
                isoValueType: toSigma ? Bootstrap.Visualization.Density.IsoValueType.Sigma : Bootstrap.Visualization.Density.IsoValueType.Absolute,
                isoValues: newValues
            });
        }

        private displayType() {
            const showDisplayOptions = this.getPersistentState('showDisplayOptions', false);
            const params = this.params; 
            const isSigma = params.isoValueType === Bootstrap.Visualization.Density.IsoValueType.Sigma;

            const show = <Controls.OptionsGroup 
                    options={['Everything', 'Around Selection'] as CreateStreamingParams.DisplayTypeKind[]} 
                    caption={s => s} 
                    current={params.displayType}
                    onChange={o => this.autoUpdateParams({ displayType: o }) } 
                    label='Show' />;
            
            return <Controls.ExpandableGroup
                    select={show}
                    expander={<Controls.ControlGroupExpander isExpanded={showDisplayOptions} onChange={e => this.setPersistentState('showDisplayOptions', e) }  />}
                    options={[
                        this.details(),
                        <Controls.Toggle onChange={v => this.updateValueType(v)} value={isSigma} label='Relative (\u03C3)' title='Specify contour level as relative (\u03C3) or absolute value.' />
                    ]}
                    isExpanded={showDisplayOptions} />;
        }

        protected renderControls() {            
            const params = this.params;                                   
            return <div>
                { params.source === 'EM'
                    ? [this.style('EM')]
                    : [this.style('2Fo-Fc'), this.style('Fo-Fc(+ve)'), this.style('Fo-Fc(-ve)')] }
                { params.displayType === 'Everything'
                    ? void 0
                    : <Controls.Slider label='Radius' onChange={v => this.autoUpdateParams({ radius: v })} min={0} max={params.maxRadius} step={0.005} value={params.radius} /> }
                {this.displayType()}
            </div>
        }        
    }   
}