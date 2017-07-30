/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

/// <reference types='react' />
/// <reference types='react-dom' />

type RD = typeof ReactDOM
type R = typeof React
declare var __LiteMolReact: R
declare var __LiteMolReactDOM: RD
namespace LiteMol.Plugin {
    "use strict";
    
    export type React = R
    export const React: R = __LiteMolReact as any;
    //declare var __LiteMolReactDOM: typeof __LiteMolReact.__DOM;
    export type ReactDOM = RD
    export const ReactDOM: RD = __LiteMolReactDOM as any;
    
    export namespace Controls {
        //export const ColorPickerHelper: __LiteMolColorPicker.ColorPicker = <any>__LiteMolColorPicker.ColorPicker;
        //export const AlphaPickerHelper: __LiteMolColorPicker.AlphaPicker = <any>(__LiteMolColorPicker as any).AlphaPicker;
        
        //export const ChromePickerHelper: __LiteMolColorPicker.ChromePicker = <any>(__LiteMolColorPicker as any).ChromePicker;

        //const ChromePickerHelper: __LiteMolColorPicker.ChromePicker = <any>(__LiteMolColorPicker as any).ChromePicker;

        export declare class ChromePickerHelper extends __LiteMolColorPicker.ChromePicker { }
    }
    Controls.ChromePickerHelper = <any>(__LiteMolColorPicker as any).ChromePicker;

}