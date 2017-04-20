/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Controls {
    "use strict";

    export interface ColorPickerProps {
        color: LiteMol.Visualization.Color,
        onChange: (c: LiteMol.Visualization.Color) => void
    }

    const shallowEqual = Bootstrap.Utils.shallowEqual;
    export class ColorPicker extends React.Component<ColorPickerProps, { }> {
     
        shouldComponentUpdate(nextProps: ColorPickerProps, nextState: {}, nextContext: any) {
            return !shallowEqual(this.props, nextProps);
        }
        
        render() {            
            let {r = 1, g = 1, b = 1} = this.props.color;
            let color = { a: 1, r: 255 * r, g: 255 * g, b: 255 * b };
                
            let onChange = (e: any) => this.props.onChange({ r: e.rgb.r / 255, g: e.rgb.g / 255, b: e.rgb.b / 255 });
            
            //let type = this.props.type ? this.props.type : 'chrome';
            let picker = <Controls.ChromePickerHelper color={color} onChangeComplete={onChange} />
            
            //  type === 'slider'
            //     ? <Controls.ColorPickerHelper color={color} onChange={onChange} />
            //     : <Controls.ChromePickerHelper color={color} onChange={onChange} />;
             
            return <div className='lm-color-picker'> 
                {picker}
            </div>
        }   
    }
    
    export class ToggleColorPicker extends React.Component<ColorPickerProps & { label: string, position?: 'above' | 'below' }, { 
        isExpanded?: boolean
    }> {

        state = { isExpanded: false };

        render() {        
            let picker = this.state.isExpanded ? <ColorPicker {...this.props as any} /> : void 0;
            let clr = this.props.color;
            let pos = this.props.position ? this.props.position : 'above';
             //onMouseLeave={() => this.setState({isExpanded: false}) }>
            return <div className={'lm-control-row lm-toggle-color-picker lm-toggle-color-picker-' + pos} onMouseLeave={() => this.setState({isExpanded: false}) }>   
                <span>{this.props.label}</span>
                <div>
                    <Button onClick={() => {this.setState({ isExpanded: !this.state.isExpanded }) }  }
                        asBlock={true} customStyle={{ 
                            backgroundColor: `rgb(${(255 * clr.r) | 0}, ${(255 * clr.g) | 0}, ${(255 * clr.b) | 0})`, 
                            color: `rgb(${(255 * (1- clr.r))|0},${(255 * (1- clr.g))|0},${(255 * (1- clr.b))|0})`,
                        }}>                        
                    </Button>
                </div>
                {picker}
            </div>
        }   
    }
}