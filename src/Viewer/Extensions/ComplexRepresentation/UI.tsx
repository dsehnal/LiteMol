/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.ComplexReprensetation.Carbohydrates.UI {
    'use strict';

    import React = LiteMol.Plugin.React // this is to enable the HTML-like syntax
    
    import Controls = LiteMol.Plugin.Controls 


    export class CreateVisual extends LiteMol.Plugin.Views.Transform.ControllerBase<Bootstrap.Components.Transform.Controller<Params>> {

        private updateVisual(newParams: Partial<FullParams | IconsParams>) {
            const p = this.params;
            const type = newParams.type || p.type
            this.autoUpdateParams({ ...(type === 'Full' ? DefaultFullParams : DefaultIconsParams), ...p, ...(newParams as any) });
        }

        renderControls() {
            const params = this.params;
            return <div>
                <Controls.Toggle onChange={v => this.updateVisual({ type: (v ? 'Full' : 'Icons') as any }) } value={params.type === 'Full' } label='Links' />                    
                { params.type === 'Full' 
                    ? <Controls.OptionsGroup options={FullSizes} caption={s => s} current={params.fullSize} onChange={(fullSize) => this.updateVisual({ fullSize }) } label='Size' />
                    : <Controls.Slider label='Scale' onChange={scale => this.updateVisual({ iconScale: scale })} min={0.5} max={1.1} step={0.01} value={params.iconScale} /> }
                { params.type === 'Full' ? <Controls.ToggleColorPicker label='Link Color' color={params.linkColor} onChange={linkColor => this.updateVisual({ linkColor }) } /> : void 0 }
                { params.type === 'Full' ? <Controls.Toggle onChange={showTerminalLinks => this.updateVisual({ showTerminalLinks }) } value={params.showTerminalLinks} label='Terminal Links' title='Show/hide link to non-carbohydrate residues' /> : void 0 }
                { params.type === 'Full' ? <Controls.Toggle onChange={showTerminalAtoms => this.updateVisual({ showTerminalAtoms }) } value={params.showTerminalAtoms} label='Terminal Pegs' title='Show/hide terminal residues as spheres' /> : void 0 }
            </div>;
        }
    }
}