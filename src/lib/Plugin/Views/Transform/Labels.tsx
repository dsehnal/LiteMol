/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Views.Transform.Labels {
    "use strict";

    export function optionsControls(controller: Bootstrap.Components.Transform.MoleculeLabels) {
        const style = controller.latestState.params.style;
        const colors = style.theme.colors!
            .map((c, n) => <Controls.ToggleColorPicker  key={n} label={n === 'Uniform' ? 'Font' : n!} color={c!} onChange={c => controller.updateThemeColor(n!, c) } />).toArray();
        
        return [
            <Controls.Slider label='Size' onChange={v => controller.updateThemeVariable('sizeFactor', v)} 
                     min={0.1} max={10} step={0.1} value={ (style.theme.variables && style.theme.variables.get('sizeFactor')) || 1.0 } title='Font size.' />,
            <Controls.Slider label='Outline' onChange={v => controller.updateThemeVariable('outlineWidth', v)} 
                     min={0.0} max={0.3} step={0.001} value={ (style.theme.variables && style.theme.variables.get('outlineWidth')) || 0.0 } title='Font outline.' />,
            <Controls.Slider label='Offset' onChange={v => controller.updateThemeVariable('zOffset', v)} 
                     min={0.0} max={5.0} step={0.1} value={ (style.theme.variables && style.theme.variables.get('zOffset')) || 0.0 } title='Label offset.' />,
            <Controls.Slider label='Bg. Opacity' onChange={v => controller.updateThemeVariable('backgroundOpacity', v)} 
                     min={0.0} max={1.0} step={0.01} value={ (style.theme.variables && style.theme.variables.get('backgroundOpacity')) || 0.0 } title='Background opacity.' />,
            ...colors
        ];
    }
}