/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Views.Transform.Data {
    "use strict";
    
    import Transformer = Bootstrap.Entity.Transformer
    
    export class Download extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Data.DownloadParams>> {        
        protected renderControls() {            
            let params = this.params;

            return <div>
                <Controls.OptionsGroup options={Bootstrap.Entity.Data.Types} caption={s => s} current={params.type} onChange={(o) => this.updateParams({ type: o, responseCompression: Bootstrap.Utils.DataCompressionMethod.None }) } label='Type' />
                { params.type === 'Binary' 
                    ? <Controls.OptionsGroup 
                        options={['None', 'Gzip']} 
                        caption={s => s} 
                        current={params.responseCompression === Bootstrap.Utils.DataCompressionMethod.Gzip ? 'Gzip' : 'None'} 
                        onChange={(o) => this.updateParams({ responseCompression: o === 'None' ? Bootstrap.Utils.DataCompressionMethod.None : Bootstrap.Utils.DataCompressionMethod.Gzip }) } 
                        label='Compression' 
                        title='Specify the compression of the data. Usually only appliable if you downloading "raw" files.' />
                    : void 0 }
                <Controls.TextBoxGroup value={params.url!} onChange={(v) => this.updateParams({ url: v })} label='URL' onEnter={e => this.applyEnter(e) } placeholder='Enter URL...' />
            </div>
        }        
    }
    
    export class OpenFile extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Transformer.Data.OpenFileParams>> {        
        protected renderControls() {            
            let params = this.params;            
            let state = this.controller.latestState;            
            return <div>
                <Controls.OptionsGroup options={Bootstrap.Entity.Data.Types} caption={s => s} current={params.type} onChange={(o) => this.updateParams({ type: o }) } label='Type' />
                <div className='lm-btn lm-btn-block lm-btn-action lm-loader-lm-btn-file' style={{marginTop: '1px'}}>
                     {params.file ? params.file.name : 'Select a file...'} <input disabled={state.isBusy} type='file' onChange={ evt => this.updateParams({ file: (evt.target as any).files[0] }) } multiple={false} />
                </div>
            </div>
        }        
    }
                
    export class WithIdField extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<{ id: string }>> {        
        protected renderControls() {            
            let params = this.params;
            return <div>
                <Controls.TextBoxGroup value={params.id} onChange={(v) => this.updateParams({ id: v })} label='Id' onEnter={e => this.applyEnter(e) } placeholder='Enter PDB id...' />
            </div>
        }        
    }
    
    export class WithUrlIdField extends Transform.ControllerBase<Bootstrap.Components.Transform.Controller<{ id: string }>> {        
        protected renderControls() {            
            let params = this.params;
            return <div>
                <Controls.TextBoxGroup value={params.id} onChange={(v) => this.updateParams({ id: v })} label='URL' onEnter={e => this.applyEnter(e) } placeholder='Enter URL...' />
            </div>
        }        
    } 
}