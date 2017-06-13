/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin {
    "use strict";
    
    export import React = __LiteMolReact;
    //declare var __LiteMolReactDOM: typeof __LiteMolReact.__DOM;
    export const ReactDOM = __LiteMolReactDOM;
    
    export namespace Controls {
        //export const ColorPickerHelper: __LiteMolColorPicker.ColorPicker = <any>__LiteMolColorPicker.ColorPicker;
        //export const AlphaPickerHelper: __LiteMolColorPicker.AlphaPicker = <any>(__LiteMolColorPicker as any).AlphaPicker;
        
        //export const ChromePickerHelper: __LiteMolColorPicker.ChromePicker = <any>(__LiteMolColorPicker as any).ChromePicker;

        //const ChromePickerHelper: __LiteMolColorPicker.ChromePicker = <any>(__LiteMolColorPicker as any).ChromePicker;

        export declare class ChromePickerHelper extends __LiteMolColorPicker.ChromePicker { }
    }
    Controls.ChromePickerHelper = <any>(__LiteMolColorPicker as any).ChromePicker;

}