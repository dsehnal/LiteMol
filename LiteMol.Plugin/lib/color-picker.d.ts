
declare namespace __LiteMolColorPicker {
    
    interface __LiteMolColorPickerRGB {
        a: number; r: number; g: number; b: number;
    }

    interface __LiteMolColorPickerHSV {
        a: number; h: number; s: number; v: number;
    }

    interface __LiteMolColorPickerHSL {
        a: number; h: number; s: number; l: number;
    }

    interface __LiteMolColorPickerChangeEvent {
        rgb: __LiteMolColorPickerRGB;
        hsv: __LiteMolColorPickerHSV;
        rsl: __LiteMolColorPickerHSL;
        hex: string;   
    }
    
    // class ColorPicker extends __LiteMolReact.Component<{
    //     color?: string | __LiteMolColorPickerRGB | __LiteMolColorPickerHSV | __LiteMolColorPickerHSL,
    //     onChange?: (e: __LiteMolColorPickerChangeEvent) => void,
    // }, {}> {
        
    // }
    
    class ChromePicker extends __LiteMolReact.Component<{
        color?: string | __LiteMolColorPickerRGB | __LiteMolColorPickerHSV | __LiteMolColorPickerHSL,
        onChange?: (e: __LiteMolColorPickerChangeEvent) => void,
        onChangeComplete?: (e: __LiteMolColorPickerChangeEvent) => void,
    }, {}> {
        
    }
    
    // class AlphaPicker extends __LiteMolReact.Component<{
    //     color?: string | __LiteMolColorPickerRGB | __LiteMolColorPickerHSV | __LiteMolColorPickerHSL,
    //     onChange?: (e: __LiteMolColorPickerChangeEvent) => void,
    // }, {}> {
        
    // }
}