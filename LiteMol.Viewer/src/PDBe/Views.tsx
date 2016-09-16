/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.PDBe.Views {
    
    import React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
    
    import Controls = LiteMol.Plugin.Controls;
    import Transformer = Bootstrap.Entity.Transformer; 
    
    export class CreateSequenceAnnotationView extends LiteMol.Plugin.Views.Transform.ControllerBase<
        Bootstrap.Components.Transform.Controller<SequenceAnnotation.CreateSingleProps>,  
        SequenceAnnotation.CreateSingleProps> {
        
        protected renderControls() {            
            let params = this.params;                                                           
            return <div>
                <Controls.ToggleColorPicker label='Color' color={params.color} onChange={c => this.controller.autoUpdateParams({ color: c }) } position='below' />
            </div>
        }        
    }

    export class DownloadBinaryCIFFromCoordinateServerView extends LiteMol.Plugin.Views.Transform.ControllerBase<
        Bootstrap.Components.Transform.Controller<Data.DownloadBinaryCIFFromCoordinateServerParams>,  
        Data.DownloadBinaryCIFFromCoordinateServerParams> {
        
        protected renderControls() {            
            let params = this.params;                                                           
            return <div>
                <Controls.OptionsGroup options={['Cartoon', 'Full']} caption={s => s} current={params.type} onChange={(o) => this.updateParams({ type: o }) } label='Type' />
                <Controls.TextBoxGroup value={params.id} onChange={(v) => this.updateParams({ id: v })} label='Id' onEnter={e => this.applyEnter(e) } placeholder='Enter pdb id...' />
                <Controls.TextBoxGroup value={params.serverUrl} onChange={(v) => this.updateParams({ serverUrl: v })} label='Coord. Server' onEnter={e => this.applyEnter(e) } placeholder='Enter server URL...' />
            </div>
        }        
    }
}