/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Viewer.DensityStreaming {
    'use strict';

    import React = LiteMol.Plugin.React // this is to enable the HTML-like syntax

    import Controls = LiteMol.Plugin.Controls 
    

    export class CreateView extends LiteMol.Plugin.Views.Transform.ControllerBase<
        Bootstrap.Components.Transform.Controller<CreateParams>, CreateParams> {

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

    export class StreamingView extends LiteMol.Plugin.Views.Transform.ControllerBase<
        Bootstrap.Components.Transform.Controller<CreateStreamingParams>, CreateStreamingParams> {

        protected renderControls() {            
            let params = this.params;                                   
            return <div>
                hi
            </div>
        }        
    }   
}