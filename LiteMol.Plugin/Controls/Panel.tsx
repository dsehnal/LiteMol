/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Controls {
    "use strict";

    export class Panel extends React.Component<{
        header: any,
        title?: string,
        className?: string,
        badge?: any,
        isExpanded: boolean,
        onExpand: (e: boolean) => void,
        description: string
    }, {}> {
                
        private header() {
            
            let exp = this.props.isExpanded;
            let title = this.props.title ? this.props.title : this.props.header;
            let icon = exp ? 'collapse' : 'expand';
            
            let desc = <div className='lm-panel-description' onClick={() => this.props.onExpand.call(null, !this.props.isExpanded) }>
                    <span className='icon icon-info' />
                    <div className='lm-panel-description-content'>
                        <span className='icon icon-info' />
                        {this.props.description}
                    </div>                    
                </div>
            
            return <div className='lm-panel-header'>
                {desc} 
                <div className='lm-panel-expander-wrapper'>
                    <Controls.Button title={title} onClick={() => this.props.onExpand.call(null, !this.props.isExpanded) } icon={icon} 
                        customClass='lm-panel-expander' style='link'>
                        {this.props.badge} 
                        {this.props.header}
                    </Controls.Button>
                </div>              
            </div>            
        } 

        render() {         
            let cls = 'lm-panel' + (this.props.className ? ' ' + this.props.className : '') + (this.props.isExpanded ? ' lm-panel-expanded' : ' lm-panel-collapsed');
            return <div className={cls}>
                {this.header()}
                <div className='lm-panel-body' style={{ display: this.props.isExpanded ? 'block' : 'none' }}>
                    {this.props.children}
                </div>
            </div>
        }
    }
    
    export const ExpandableGroup = (props: { select: any, options: any[], expander: any, isExpanded: boolean }) => 
        <div className='lm-control-group'>
            {props.select}
            {props.options.length > 0 ? props.expander : void 0 }
            {props.options.length > 0 ? <div style={{ display: props.isExpanded ? 'block' : 'none' }}  className='lm-control-subgroup'>{props.options}</div> : void 0 }
        </div>
}