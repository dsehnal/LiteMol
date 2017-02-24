/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Visualization.Utils {
    "use strict";
    
    export class Palette {


        static getRandomColor(amountOfGrey = 0.0): Visualization.Color
        {
            let counter = 0;
            while (true) {
                counter++;
                let c = Palette.randomMix({ r: 166 / 255, g: 0, b: 100 / 255 }, { r: 1, g: 1, b: 0 }, { r: 0, g: 100 / 255, b: 1 }, amountOfGrey);
                let d = Math.abs(Palette.previous.r - c.r) + Math.abs(Palette.previous.g - c.g) + Math.abs(Palette.previous.b - c.b);
                if (d > 100 || counter === 10) { Palette.previous = c; return c; }
            }
        }

        static randomMix(color1: Visualization.Color, color2: Visualization.Color, color3: Visualization.Color, greyControl: number): Visualization.Color
        {
            let randomIndex = Math.floor(Math.random() * 3) | 0;
            let mixRatio1 = (randomIndex === 0) ? Math.random() * greyControl : Math.random();

            let mixRatio2 = (randomIndex === 1) ? Math.random() * greyControl : Math.random();

            let mixRatio3 = (randomIndex === 2) ? Math.random() * greyControl : Math.random();

            let sum = mixRatio1 + mixRatio2 + mixRatio3;

            mixRatio1 /= sum;
            mixRatio2 /= sum;
            mixRatio3 /= sum;

            return {
                r: (mixRatio1 * color1.r + mixRatio2 * color2.r + mixRatio3 * color3.r),
                g: (mixRatio1 * color1.g + mixRatio2 * color2.g + mixRatio3 * color3.g),
                b: (mixRatio1 * color1.b + mixRatio2 * color2.b + mixRatio3 * color3.b)
            };
        }

        private static previous = Palette.randomMix({ r: 0.75, g: 0, b: 0.25 }, { r: 1, g: 0.5, b: 0 }, { r: 0, g: 0.35, b: 1 }, 0.5);
        
        /**
         * 
         * @example
         *   let min = Palette.getRandomColor(0.3);
         *   let max = Palette.getRandomColor(0.3);
         *   let color = Palette.interpolate(0.1, min, 0.6, max, 0.354);
         */
        static interpolate(min: number, minColor: Visualization.Color, max: number, maxColor: Visualization.Color, value: number, target?: Visualization.Color) {
            let ret = target !== void 0 ? target : { r: 0.1, g: 0.1, b: 0.1 };

            let t = (value - min) / (max - min);
            ret.r = minColor.r + (maxColor.r - minColor.r) * t;
            ret.g = minColor.g + (maxColor.g - minColor.g) * t;
            ret.b = minColor.b + (maxColor.b - minColor.b) * t;

            return ret;
        }
    }
}