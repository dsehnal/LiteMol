/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Views {
    "use strict";
    
    import LayoutRegion = Bootstrap.Components.LayoutRegion;
    import LayoutTarget = Bootstrap.Components.LayoutTarget;

    export class Layout extends View<Bootstrap.Components.Layout, { }, { }> {
        componentDidMount() {
            this.subscribe(Bootstrap.Event.Common.ComponentsChanged.getStream(this.controller.context), () => this.forceUpdate());
        }
        
        private renderTarget(name: string, target: LayoutTarget) {
            
            let statics: any[] = [];
            let scrollable: any[] = [];
            
            for (let c of target.components) {
                if (c.isStatic) statics.push(<c.view key={c.key} controller={c.controller} />);
                else scrollable.push(<c.view key={c.key} controller={c.controller} />);
            }
            
            return <div key={`layout-target-${name}`} className={'lm-layout-region lm-layout-' + target.cssClass}>
                { statics.length ? <div className='lm-layout-static'>{statics}</div> : void 0 }
                { scrollable.length ? <div className='lm-layout-scrollable'>{scrollable}</div> : void 0 }
            </div>;
        }

        private updateTarget(name: string, regionType: Bootstrap.Components.LayoutRegion, layout: { regions: any[], layoutClass: string }) {            
            let state = this.controller.latestState;
            let regionStates = state.regionStates;            
            let region = this.controller.targets[regionType];  
            let show: boolean;

            if (state.hideControls) {
                show = regionStates !== void 0 && regionStates[regionType] === 'Sticky' && region.components.length > 0;
            } else if (regionStates && regionStates[regionType] === 'Hidden') {
                show = false;
            } else {
                show = region.components.length > 0;
            }

            if (show) {
                layout.regions.push(this.renderTarget(name, region));            
            } else {
                layout.layoutClass += ' lm-layout-hide-' + name;
            }
        }

        render() {
            let layoutClass = '';
            
            let state = this.controller.latestState;
            let layoutType: string;

            if (state.isExpanded) {
                layoutType = 'lm-layout-expanded';
            } else {
                layoutType = 'lm-layout-standard ';
                switch (state.collapsedControlsLayout) {
                    case Bootstrap.Components.CollapsedControlsLayout.Outside: layoutType += 'lm-layout-standard-outside'; break;
                    case Bootstrap.Components.CollapsedControlsLayout.Landscape: layoutType += 'lm-layout-standard-landscape'; break;
                    case Bootstrap.Components.CollapsedControlsLayout.Portrait: layoutType += 'lm-layout-standard-portrait'; break;
                    default: layoutType += 'lm-layout-standard-outside'; break;
                }
            }
            
            let targets = this.controller.targets;
            let regions = [this.renderTarget('main', targets[LayoutRegion.Main])];

            let layout = { regions, layoutClass };
            this.updateTarget('top', LayoutRegion.Top, layout);
            this.updateTarget('right', LayoutRegion.Right, layout);
            this.updateTarget('bottom', LayoutRegion.Bottom, layout);
            this.updateTarget('left', LayoutRegion.Left, layout);
            layoutClass = layout.layoutClass;
            
            let root = targets[LayoutRegion.Root].components.map(c => <c.view key={c.key} controller={c.controller} />);
      
            return <div className='lm-plugin'>
                <div className={'lm-plugin-content ' + layoutType}>
                    <div className={layoutClass}>
                        {regions}
                        {root}
                    </div>
                </div>
            </div>;
        }
    }
}