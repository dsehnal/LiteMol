/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Example.Channels {
    (function() {
        let plugin = Plugin.create({
            target: '#plugin',
            viewportBackground: '#333',
            layoutState: {
                hideControls: true,
                isExpanded: false,
                collapsedControlsLayout: Bootstrap.Components.CollapsedControlsLayout.Landscape
            },
            customSpecification: PluginSpec
        });
        UI.render(State.AppState(plugin), document.getElementById('ui') !);
    })();
}
