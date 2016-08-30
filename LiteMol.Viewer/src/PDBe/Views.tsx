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
}