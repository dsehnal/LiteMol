/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Views {
    "use strict";
    
    import LayoutRegion = Bootstrap.Components.LayoutRegion;
    import LayoutTarget = Bootstrap.Components.LayoutTarget;

    export class Layout extends View<Bootstrap.Components.Layout, { }, { }> {
        
        private renderTarget(target: LayoutTarget) {
            
            let statics: any[] = [];
            let scrollable: any[] = [];
            
            for (let c of target.components) {
                if (c.isStatic) statics.push(<c.view controller={c.controller} />);
                else scrollable.push(<c.view controller={c.controller} />);
            }
            
            return <div className={'lm-layout-region lm-layout-' + target.cssClass}>
                { statics.length ? <div className='lm-layout-static'>{statics}</div> : void 0 }
                { scrollable.length ? <div className='lm-layout-scrollable'>{scrollable}</div> : void 0 }
            </div>;
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
            let regions = [this.renderTarget(targets[LayoutRegion.Main])];

            let hiddenRegions = state.hiddenRegions || [];
            
            let region = targets[LayoutRegion.Top];                        
            if (state.hideControls || !region.components.length || hiddenRegions.indexOf(LayoutRegion.Top) >= 0) layoutClass += ' lm-layout-hide-top';
            else regions.push(this.renderTarget(region));
            
            region = targets[LayoutRegion.Right];
            if (state.hideControls || !region.components.length || hiddenRegions.indexOf(LayoutRegion.Right) >= 0) layoutClass += ' lm-layout-hide-right';
            else regions.push(this.renderTarget(region));
            
            region = targets[LayoutRegion.Bottom];
            if (state.hideControls || !region.components.length || hiddenRegions.indexOf(LayoutRegion.Bottom) >= 0) layoutClass += ' lm-layout-hide-bottom';
            else regions.push(this.renderTarget(region));
                        
            region = targets[LayoutRegion.Left];
            if (state.hideControls || !region.components.length || hiddenRegions.indexOf(LayoutRegion.Left) >= 0) layoutClass += ' lm-layout-hide-left';
            else regions.push(this.renderTarget(region));
            
            let root = targets[LayoutRegion.Root]
                .components.map(c => <c.view controller={c.controller} />);
      
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