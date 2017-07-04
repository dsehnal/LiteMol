/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.ParticleColoring.UI {
    'use strict';

    import React = LiteMol.Plugin.React // this is to enable the HTML-like syntax
    
    import Controls = LiteMol.Plugin.Controls 

    export class Apply extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Params>> {

        private rainbow() {
            const grad = `linear-gradient(to left,${Bootstrap.Visualization.Molecule.RainbowPalette.map(c => `rgb(${255 * c.r},${255 * c.g},${255*c.b})`).join(',')})`;
            return <div style={{ background: grad, height: '8px', marginTop: '1px' }}>
            </div>
        }

        renderControls() {
            const params = this.params;
            if (!this.isUpdate) return <div />;
            
            let max = (this.controller.entity as Coloring).props.info.max;
            let min = (this.controller.entity as Coloring).props.info.min;
            return <div>
                {this.rainbow()}
                <Controls.Slider label='Low Radius' onChange={min => this.autoUpdateParams({ min })} min={min} max={max} step={0.1} value={Math.max(params.min, min)} />                    
                <Controls.Slider label='High Radius' onChange={max => this.autoUpdateParams({ max })} min={params.min} max={max} step={0.1} value={Math.min(params.max, max)} />
                {/*<Controls.Slider label='Steps' onChange={steps => this.autoUpdateParams({ steps })} min={8} max={100} step={1} value={params.steps} />*/}
                <Controls.Slider label='Opacity' onChange={opacity => this.autoUpdateParams({ opacity })} min={0} max={1} step={0.01} value={params.opacity} />
            </div>;
        }
    }
}