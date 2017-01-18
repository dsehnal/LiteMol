/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.PDBe.Views {
    
    import React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
    
    import Controls = LiteMol.Plugin.Controls;
    
    export class CreateSequenceAnnotationView extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<SequenceAnnotation.CreateSingleProps>> {
        
        protected renderControls() {            
            let params = this.params;                                                           
            return <div>
                <Controls.ToggleColorPicker label='Color' color={params.color!} onChange={c => this.controller.autoUpdateParams({ color: c }) } position='below' />
            </div>
        }        
    }

    export class DownloadBinaryCIFFromCoordinateServerView extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Data.DownloadBinaryCIFFromCoordinateServerParams>> {
        
        protected renderControls() {            
            let params = this.params;                                                           
            return <div>
                <Controls.TextBoxGroup value={params.id!} onChange={(v) => this.updateParams({ id: v })} label='Id' onEnter={e => this.applyEnter(e) } placeholder='Enter pdb id...' />
                <Controls.OptionsGroup options={['Cartoon', 'Full']} caption={s => s} current={params.type} onChange={(o) => this.updateParams({ type: o }) } label='Type' title='Determines whether to send all atoms or just atoms that are needed for the Cartoon representation.' />
                <Controls.Toggle onChange={(v:boolean) => this.updateParams({ lowPrecisionCoords: v })} value={params.lowPrecisionCoords!} label='Low Precicion' title='If on, sends coordinates with 1 digit precision instead of 3. This saves up to 50% of data that need to be sent.' />
                <Controls.TextBoxGroup value={params.serverUrl!} onChange={(v) => this.updateParams({ serverUrl: v })} label='Server' title='The base URL of the CoordinateServer.' onEnter={e => this.applyEnter(e) } placeholder='Enter server URL...' />
            </div>
        }        
    }

    export class DownloadDensityView extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Data.DownloadDensityParams>> {

        private getId() {
            let id = this.params.id;
            if (!id) return '';
            if (typeof id === 'string') return id;
            return (id as any)[this.params.sourceId!];
        }

        private updateId(newId: string) {
            let params = this.params;
            let id = params.id;
            if (!id || typeof id === 'string') id = { [params.sourceId!]: newId };
            else id = Bootstrap.Utils.merge(id, { [params.sourceId!]: newId });
            this.updateParams({ id }); 
        }
        
        protected renderControls() {            
            let params = this.params;                                   
            return <div>
                <Controls.OptionsGroup 
                    options={Data.DensitySources} caption={s => (Data.DensitySourceLabels as any)[s]} 
                    current={params.sourceId} onChange={(o) => this.updateParams({ sourceId: o }) } label='Source' title='Determines where to obtain the data.' />
                <Controls.TextBoxGroup value={this.getId()} onChange={(v) => this.updateId(v)} label='Id' onEnter={e => this.applyEnter(e) } placeholder='Enter id...' />
            </div>
        }        
    }
}