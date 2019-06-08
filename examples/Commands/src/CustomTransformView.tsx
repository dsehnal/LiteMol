/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Example {
 
    import React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
    
    import Controls = LiteMol.Plugin.Controls;
    import Transformer = Bootstrap.Entity.Transformer;
 
    // this defines a custom view for coordinate streaming and lets the user pick from two backing servers
    // check more examples of views in LiteMol.Plugin/View/Transform folder.
    //
    // this uses a default controller for transforms, you can write your own. How to do that, check LiteMol.Bootstrap/Components/Transform folder
    //
    // Transforms transform entities. On how to define custom entities, check LiteMol.Bootstrap/Entity/Types.ts where there are plenty of examples.
    export class CoordianteStreamingCustomView extends LiteMol.Plugin.Views.Transform.ControllerBase<
        Bootstrap.Components.Transform.Controller<Transformer.Molecule.CoordinateStreaming.InitStreamingParams>> { // you dont have to use these full type annotations, and just use "any" type instead, but then you will loose code completition.
        
        // this is for demonstration only, for dynamic options, store them in the transform params or in the underlying entity props.
        private servers = [
            { name: 'PDBe', url: 'https://wwwdev.ebi.ac.uk/pdbe/coordinates/' },
            { name: 'WebChem', url: 'https://cs.litemol.org/' }
        ]
                
        protected renderControls() {            
            let params = this.params;
            
            // this will only work if the "molecule.coordinateStreaming.defaultServer" setting is one of the servers, which now is.
            // normally you would not use hacks like this and store the list of available server for example in the params of the transforms
            // or in the underlying entity.
            let currentServer = this.servers.filter(s => s.url === params.server)[0];
            
            // to update the params, you can use "this.updateParams" or "this.autoUpdateParams". Auto update params will work only on "updateable transforms"
            // and will work similarly to how visuals are updated. If autoUpdateParams is not used, the user has to click "Update" buttom manually.                                    
            return <div>
                <Controls.OptionsGroup options={this.servers} caption={s => s.name} current={currentServer} onChange={(o) => this.updateParams({ server: o.url }) } label='Server' />
                <Controls.TextBoxGroup value={params.id!} onChange={(v) => this.updateParams({ id: v })} label='Id' onEnter={e => this.applyEnter(e)} placeholder='PDB id...' />
            </div>
        }        
    }
}