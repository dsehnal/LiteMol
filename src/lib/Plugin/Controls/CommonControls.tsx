/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Controls {
    "use strict";

    export type ButtonSize = 'xs' | 'sm' | 'normal' | 'lg'

    export type ButtonStyle = 'link' | 'remove' | 'default'
    
    const shallowEqual = Bootstrap.Utils.shallowEqual;   
    export abstract class Pure<Props> extends React.Component<Props, {}> {        
        shouldComponentUpdate(nextProps: any, nextState: any) {
            return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
        }
    }

    export class Button extends Pure<{
        onClick: (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => void,
        size?: ButtonSize,
        style?: ButtonStyle,
        active?: boolean,
        activeStyle?: ButtonStyle,
        icon?: string,
        activeIcon?: string,
        disabled?: boolean,
        disabledStyle?: ButtonStyle,
        asBlock?: boolean,
        title?: string,
        customClass?: string,
        customStyle?: any
    }> {


        render() {

            let props = this.props;

            let className = 'lm-btn';
            if (props.size && props.size !== 'normal') className += ' lm-btn-' + props.size;
            if (props.asBlock) className += ' lm-btn-block';

            if (props.disabled) className += ' lm-btn-' + (props.disabledStyle || props.style || 'default');
            else if (props.active) className += ' lm-btn-' + (props.activeStyle || props.style || 'default');
            else className += ' lm-btn-' + (props.style || 'default');

            if (props.customClass) className += ' ' + props.customClass;

            let icon: any = void 0;
            
            if (props.icon) {
                if (props.active && props.activeIcon) icon = <span className={ `lm-icon lm-icon-${props.activeIcon}` }></span>
                else icon = <span className={ `lm-icon lm-icon-${props.icon}` }></span>
            }
            //onTouchEnd={(e) => { (e.target as HTMLElement).blur() } }

            return <button
                title={props.title}
                className={className}
                style={props.customStyle}
                disabled={props.disabled}
                onClick={(e) => { props.onClick.call(null, e); (e.target as HTMLElement).blur() } }
                 >
                {icon}{props.children}
            </button>
        }
    }
    
    export const TextBox = (props: {
        onChange: (v: string) => void,
        value?: string,
        defaultValue?: string,
        onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void,
        onBlur?: (e: React.FormEvent<HTMLInputElement>) => void,
        placeholder?: string
    }) => <input type='text' className='lm-form-control' placeholder={props.placeholder} value={props.value} defaultValue={props.defaultValue}
            onBlur={e => { if (props.onBlur) props.onBlur.call(null, e) } }
            onChange={e => props.onChange.call(null, (e.target as HTMLInputElement).value)} onKeyPress={props.onKeyPress} />;
    
    export function isEnter(e: React.KeyboardEvent<HTMLInputElement>) {
        if ((e.keyCode === 13 || e.charCode === 13)) {
            return true;
        }
        return false;
    }        
            
    export function TextBoxGroup(props: {
        value: string,
        onChange: (v: string) => void,
        placeholder?:string,
        label: string,        
        onEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void
        title?: string
    }) {
        return <div className='lm-control-row lm-options-group' title={props.title}>
            <span>{props.label}</span>
            <div>
                <TextBox placeholder={props.placeholder} onChange={props.onChange} value={props.value} onKeyPress={(e) => {
                    if (isEnter(e) && props.onEnter) props.onEnter.call(null, e)  
                } }  />
            </div>
        </div>;
    }
    
    export const CommitButton = (props: {
        action: () => void,
        isOn: boolean,
        on: string,
        off?: string,
        title?: string
    }) => <div style={{ marginTop: '1px' }}><button onClick={e => { props.action(); (e.target as HTMLElement).blur(); }}
            className={'lm-btn lm-btn-block lm-btn-commit lm-btn-commit-' + (props.isOn ? 'on' : 'off')}
            disabled={!props.isOn} title={props.title}>
            <span className={ `lm-icon lm-icon-${props.isOn ? 'ok' : 'cross'}` }></span>
            {props.isOn ? <b>{props.on}</b> : (props.off ? props.off : props.on) }
        </button></div> ;
    
    
    // <Controls.Button onClick={() => props.action() }
    //         style={props.isOn ? 'success' : 'default' } asBlock={true} disabled={!props.isOn} icon={props.isOn ? 'ok' : 'cross'} 
    //             customClass='lm-commit-button'>
    //             {props.isOn ? props.on : (props.off ? props.off : props.on) }
    //         </Controls.Button>  
    
    export const Toggle = (props: {
        onChange: (v: boolean) => void,
        value: boolean,
        label: string,
        title?: string
    }) => <div className='lm-control-row lm-toggle-button' title={props.title}> 
            <span>{props.label}</span>
            <div>
                <button onClick={e => { props.onChange.call(null, !props.value); (e.target as HTMLElement).blur(); }}>
                        <span className={ `lm-icon lm-icon-${props.value ? 'ok' : 'off'}` }></span> {props.value ? 'On' : 'Off'}
                </button>
            </div>
        </div>
        
    export const ControlGroupExpander = (props: { onChange: (e: boolean) => void, isExpanded: boolean }) =>        
            <Controls.Button style='link' title={`${props.isExpanded ? 'Less' : 'More'} options`} onClick={() => props.onChange.call(null, !props.isExpanded) } 
                                icon={props.isExpanded ? 'minus' : 'plus'} customClass='lm-conrol-group-expander' />
                                
                                
    export const RowText = (props: {
        value: any,
        label: string,
        title?: string
    }) => <div className='lm-control-row lm-row-text' title={props.title}> 
            <span>{props.label}</span>
            <div>
                {props.value}
            </div>
        </div>

    export const HelpBox = (props: {
        title: string,
        content: JSX.Element | string
    }) => <div className='lm-help-row'>
            <span>{props.title}</span>
            <div>{props.content}</div>
        </div>
}
