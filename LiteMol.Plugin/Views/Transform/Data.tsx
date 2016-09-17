/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Views.Transform.Data {
    "use strict";
    
    import Transformer = Bootstrap.Entity.Transformer
    
    export class Download extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Data.DownloadParams>, Transformer.Data.DownloadParams> {        
        protected renderControls() {            
            let params = this.params;
            return <div>
                <Controls.OptionsGroup options={Bootstrap.Entity.Data.Types} caption={s => s} current={params.type} onChange={(o) => this.updateParams({ type: o }) } label='Type' />
                <Controls.TextBoxGroup value={params.url} onChange={(v) => this.updateParams({ url: v })} label='URL' onEnter={e => this.applyEnter(e) } placeholder='Enter URL...' />
            </div>
        }        
    }
    
    export class OpenFile extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Data.OpenFileParams>, Transformer.Data.OpenFileParams> {        
        protected renderControls() {            
            let params = this.params;            
            let state = this.controller.latestState;            
            return <div>
                <Controls.OptionsGroup options={Bootstrap.Entity.Data.Types} caption={s => s} current={params.type} onChange={(o) => this.updateParams({ type: o }) } label='Type' />
                <div className='btn btn-block btn-action lm-loader-btn-file' style={{marginTop: '1px'}}>
                     {params.file ? params.file.name : 'Select a file...'} <input disabled={state.isBusy} type='file' onChange={ (evt: Event) => this.updateParams({ file: (evt.target as any).files[0] }) } multiple={false} />
                </div>
            </div>
        }        
    }
                
    export class WithIdField extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<{ id: string }>, { id: string }> {        
        protected renderControls() {            
            let params = this.params;
            return <div>
                <Controls.TextBoxGroup value={params.id} onChange={(v) => this.updateParams({ id: v })} label='Id' onEnter={e => this.applyEnter(e) } placeholder='Enter PDB id...' />
            </div>
        }        
    }
    
    export class WithUrlIdField extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<{ id: string }>, { id: string }> {        
        protected renderControls() {            
            let params = this.params;
            return <div>
                <Controls.TextBoxGroup value={params.id} onChange={(v) => this.updateParams({ id: v })} label='URL' onEnter={e => this.applyEnter(e) } placeholder='Enter URL...' />
            </div>
        }        
    } 
}