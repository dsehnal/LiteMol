/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.RNALoops {
    
    import React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
    
    import Controls = LiteMol.Plugin.Controls;
    
    export class CreateLoopAnnotationView extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<DownloadAndCreateProps>> {
        
        protected renderControls() {            
            const params = this.params;                                                           
            return <div>
                <Controls.TextBoxGroup value={params.server} onChange={(v) => this.updateParams({ server: v })} label='Server' title='The base URL of the annotation API.' onEnter={e => this.applyEnter(e) } placeholder='Enter server URL...' />
            </div>
        }        
    }
}