/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Controls {
    "use strict";

    export class OptionsBox extends React.Component<{
        options: any[] | Bootstrap.Immutable.List<any>, current: any, 
        caption: (o: any) => any,
        onChange: (o: any) => void,
        small?: boolean,
        title?: string
    }, {}> {
        current: any = void 0;

        private get(i: number) {
            let opts = this.props.options as any;

            if (typeof opts.get !== 'undefined') return opts.get(i);
            return opts[i];
        }

        render() {
            let cap = this.props.caption;
            let idx = this.props.options.indexOf(this.props.current);
            if (idx < 0) idx = 0;

            return <select title={this.props.title} value={idx.toString()} className='lm-form-control'
                onChange={e => {
                    this.current = this.get(+(e.target as HTMLSelectElement).value);
                    this.props.onChange(this.current);
                }}>
                {(this.props.options.map as any)((o: any, i: number) => {
                    return <option key={i} value={`` + i} /*selected={i === idx}*/>{cap(o)}</option>
                }) }
            </select>
        }
    }
    
    export function OptionsGroup(props: {
        options: any[] | Bootstrap.Immutable.List<any>, 
        current: any, 
        caption?: (o: any) => string | number,
        onChange: (o: any) => void,
        label: string,
        title?: string
    }) {
        const caption = props.caption ? props.caption : (o: any) => o;   
        return <div className='lm-control-row lm-options-group' title={props.title}>
            <span>{props.label}</span>
            <div>
                <Controls.OptionsBox options={props.options} caption={caption} current={props.current}
                    onChange={props.onChange} />
            </div>
        </div>;
    }
}