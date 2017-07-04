/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization {

    export interface Color { r: number; g: number; b: number }
    
    export namespace Color {
        export function copy(from: Color, to: Color) {
            to.r = from.r;
            to.g = from.g;
            to.b = from.b;
        }
        
        export function clone({r,g,b}: Color): Color {
            return {r,g,b};
        }
        
        export function toVector(color: Color) {
            return new THREE.Vector3(color.r, color.g, color.b);
        }
        
        export function fromVector(v: { x: number, y: number, z: number }): Color {
            return { r: v.x, g: v.y, b: v.z };
        }
        
        export function fromRgb(r: number, g: number, b: number): Color {
            return { r: r / 255, g: g / 255, b: b / 255 };
        }
                
        function hue2rgb(p: number, q: number, t: number){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        export function fromHsl(h: number, s: number, l: number): Color {
            //http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion            
            let r: number, g: number, b: number;
            if(s == 0){
                r = g = b = l; // achromatic
            }else{
                let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                let p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            return { r, g, b };
        }
        
        export function fromHsv(h: number, s: number, v: number): Color {
            //http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/          
            let rgb:number[], i: number, data:number[] = [];
            if (s === 0) {
                rgb = [v,v,v];
            } else {
                h = h / 60;
                i = Math.floor(h);
                data = [v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i)))];
                switch(i) {
                case 0:
                    rgb = [v, data[2], data[0]];
                    break;
                case 1:
                    rgb = [data[1], v, data[0]];
                    break;
                case 2:
                    rgb = [data[0], v, data[2]];
                    break;
                case 3:
                    rgb = [data[0], data[1], v];
                    break;
                case 4:
                    rgb = [data[2], data[0], v];
                    break;
                default:
                    rgb = [v, data[0], data[1]];
                    break;
                }
            }
            return { r: rgb[0], g: rgb[1], b: rgb[2] };
        }
        
        export function random() {
            return Utils.Palette.getRandomColor();
        }
        
        // #rrggbb
        export function fromHex(v: number): Color {
            return { r: ((v >> 16) & 0xFF) / 255.0, g: ((v >> 8) & 0xFF) / 255.0, b: (v & 0xFF) / 255.0 }
        }      

        /**
         * Parse color in formats #rgb and #rrggbb
         */
        export function fromHexString(s: string): Color {
            if (s[0] !== '#') return fromHex(0);
            if (s.length === 4) { // #rgb
                return fromHexString(`#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`);
            } else if (s.length === 7) { // #rrggbb
                return fromHex(parseInt(s.substr(1), 16));
            }

            return fromHex(0);
        }

        export function interpolate(a: Color, b: Color, t: number, target: Color) {
            target.r = a.r + (b.r - a.r) * t;
            target.g = a.g + (b.g - a.g) * t;
            target.b = a.b + (b.b - a.b) * t;
        } 

        export function isColor(c: any): c is Color {
            return c.r !== void 0 && c.g !== void 0 && c.b !== void 0;
        }
        
    }
    
    export interface Theme {
        colors: Theme.ColorMap,
        variables: Theme.VariableMap,
        transparency: Theme.Transparency,
        interactive: boolean,
        disableFog: boolean,
        isSticky: boolean,
        setElementColor(index: number, target: Color): void
    }
    
    export namespace Theme {
        
        export interface Props {
            colors?: ColorMap,
            variables?: VariableMap,
            transparency?: Theme.Transparency,
            interactive?: boolean,
            disableFog?: boolean,
            isSticky?: boolean
        }
                
        export interface Transparency { alpha?: number; writeDepth?: boolean }

        export interface ColorMap { get(key: any): Color | undefined, forEach(f: (value: Color, key: any) => void): void }
        export interface VariableMap { get(key: any): any | undefined, forEach(f: (value: any, key: any) => void): void }
        
        export namespace Default {
            export const HighlightColor: Color = { r: 1.0, g: 1.0, b: 0 }; 
            export const SelectionColor: Color = { r: 171 / 255, g: 71 / 255, b: 183 / 255 }; //{ r: 1.0, g: 0.0, b: 0.0 };
            export const UniformColor: Color = { r: 68 / 255, g: 130 / 255, b: 255 };
            
            export const Transparency: Transparency = { alpha: 1.0, writeDepth: false }
        }
        
        export interface ElementMapping {
            getProperty(index: number): any;
            setColor(property: any, c: Color): void;
        } 
        
        export function isTransparent(theme: Theme) {
            let opacity = +theme.transparency.alpha!;            
            if (isNaN(opacity)) opacity = 1.0;
            return opacity <= 0.999;
        }
        
        export function getColor(theme: Theme, name: string, fallback: Color) {
            let c = theme.colors.get(name);
            if (!c) return fallback;
            return c;
        }
        
        export function createUniform(props: Props = {}): Theme {            
            let { colors, variables = Core.Utils.FastMap.create<string, any>(), transparency = Default.Transparency, interactive = true, disableFog = false, isSticky = false } = props;
            
            let finalColors = Core.Utils.FastMap.create<any, Color>();
            if (colors) {
                colors.forEach((c, n) => finalColors.set(n, c));
            }

            let uniform = finalColors.get('Uniform');
            if (!uniform) {
                finalColors.set('Uniform', Default.UniformColor);
                uniform = Default.UniformColor;
            }
            
            return {
                colors: finalColors,
                variables,
                transparency,
                interactive,
                disableFog,
                isSticky,
                setElementColor(index: number, target: Color) {
                    Color.copy(uniform!, target);
                }
            }
        }
        
        export function createMapping(mapping: ElementMapping, props: Props = {}): Theme {
            let { colors = Core.Utils.FastMap.create<string, Color>(), variables = Core.Utils.FastMap.create<string, any>(), transparency = Default.Transparency, interactive = true, disableFog = false, isSticky = false } = props;
                        
            return {
                colors,
                variables,
                transparency: transparency ? transparency : Default.Transparency,
                interactive,
                disableFog,
                isSticky,
                setElementColor(index: number, target: Color) {
                    mapping.setColor(mapping.getProperty(index), target);
                }
            }
        }
        
        export function createColorMapMapping(getProperty: (index: number) => any, map: ColorMap, fallbackColor:Color): ElementMapping {
            let mapper = new ColorMapMapper(map, fallbackColor);
            return {
                getProperty,
                setColor: (i, c) => mapper.setColor(i, c)
            };
        }
                
        export function createPalleteMapping(getProperty: (index: number) => any, pallete: Color[]): ElementMapping {        
            let mapper = new PaletteMapper(pallete);
            return {
                getProperty,
                setColor: (i, c) => mapper.setColor(i, c)
            };
        }

        export function createPalleteIndexMapping(getProperty: (index: number) => number, pallete: Color[]): ElementMapping {        
            let mapper = new PaletteIndexMapper(pallete);
            return {
                getProperty,
                setColor: (i, c) => mapper.setColor(i, c)
            };
        }

        class PaletteIndexMapper {            
            setColor(i: number, target: Color) {
                const color = this.pallete[i];
                Color.copy(color, target);
            }
            
            constructor(private pallete: Color[]) {                
            }
            
        }
        
        class PaletteMapper {
            
            private colorIndex = 0;
            private colorMap = Core.Utils.FastMap.create<any, Color>();   
            
            setColor(p: string | number, target: Color) {
                var color = this.colorMap.get(p);
                if (!color) {
                    this.colorIndex = ((this.colorIndex + 1) % this.pallete.length) | 0;
                    color = this.pallete[this.colorIndex]; 
                    this.colorMap.set(p, color);
                }    
                Color.copy(color, target);
            }
            
            constructor(private pallete: Color[]) {                
            }
            
        }
        
        class ColorMapMapper {
                        
            setColor(p: any, target: Color) {
                var color = this.map.get(p);
                if (!color) { color = this.fallbackColor; }    
                Color.copy(color, target);
            }
            
            constructor(private map: ColorMap, private fallbackColor: Color) {                
            }
            
        }
    }    
}