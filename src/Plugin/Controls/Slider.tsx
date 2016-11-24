/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Controls {
    "use strict";

    export class Slider extends React.Component<{
        label: any,
        min: number,
        max: number,
        value: number,
        step?: number,
        title?: string,
        onChange: (v: number) => void 
    }, { value: string }> {
        
        state = { value: '0' }

        private firedValue = NaN;
        
        componentWillMount() {
            this.setState({ value: '' + this.props.value });
        }
        
        componentWillReceiveProps(nextProps: any) {
            this.setState({ value: '' + nextProps.value });
        }
        
        componentDidMount() {
            // chrome hack
            let s = (this.refs['slider'] as HTMLInputElement);
            if (s.value !== this.state.value) s.value = this.state.value;
        }
                                        
        private updateValue(s: string) {
            let v = +s;
            if (v < this.props.min) { v = this.props.min; s = '' + v; }
            else if (v > this.props.max) { v = this.props.max; s = '' + v; }            
            this.setState({ value: s })
        }
        
        private fire() {
            let v = +this.state.value;
            if (isNaN(v)) { v = this.props.value; }
            if (v !== this.props.value) {
                if (this.firedValue !== v) {
                    this.firedValue = v;
                    this.props.onChange.call(null, v);
                }
            }
        }
                        
        render() {      
            let step = this.props.step;
            if (step === void 0) step = 1;                        
            return <div className='lm-control-row lm-slider' title={this.props.title}>
                <span>{this.props.label}</span>
                <div>
                    <div>
                        <div>
                            <form noValidate={true}>
                            <input type='range' min={this.props.min} max={this.props.max} value={this.state.value} ref='slider'
                                step={step}
                                onInput={(e: React.FormEvent) => {
                                    let s = (e.target as HTMLInputElement).value;
                                    this.setState({ value: s });
                                }}                                
                                onSelect={e => { this.fire(); (e.target as HTMLInputElement).blur() } }
                                onBlur={() => this.fire()}
                                onTouchEnd={() => this.fire()}
                            />
                            </form>
                        </div>
                    </div>
                    <div>
                        <TextBox value={this.state.value}  onChange={v => this.updateValue(v)} onBlur={() => this.fire()} onKeyPress={e => {
                            if (isEnter(e)) this.fire();
                        } } />
                    </div>
                </div>
            </div>;
        }
    }
}