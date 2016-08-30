/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Utils {
    "use strict";

    /**
     * Efficient integer and float parsers.
     * 
     * For the purposes of parsing numbers from the mmCIF data representations,
     * up to 4 times faster than JS parseInt/parseFloat.
     */
    export class FastNumberParsers {
        static parseInt(str: string, start: number, end: number) {
            var ret = 0, neg = 1;
            if (str.charCodeAt(start) === 45 /* - */) { neg = -1; start++; }
            for (; start < end; start++) {
                let c = str.charCodeAt(start) - 48;
                if (c > 9 || c < 0) return (neg * ret) | 0;
                else ret = (10 * ret + c) | 0;
            }
            return neg * ret;
        }

        static parseScientific(main: number, str: string, start: number, end: number) {
            return main * Math.pow(10.0, FastNumberParsers.parseInt(str, start, end));
        }

        static parseFloat(str: string, start: number, end: number) {
            var neg = 1.0, ret = 0.0, point = 0.0, div = 1.0;

            if (str.charCodeAt(start) === 45) {
                neg = -1.0;
                ++start;
            }

            while (start < end) {
                let c = str.charCodeAt(start) - 48;
                if (c >= 0 && c < 10) {
                    ret = ret * 10 + c;
                    ++start;
                } else if (c === -2) { // .
                    ++start;
                    while (start < end) {
                        c = str.charCodeAt(start) - 48;
                        if (c >= 0 && c < 10) {
                            point = 10.0 * point + c;
                            div = 10.0 * div;
                            ++start;
                        } else if (c === 53 || c === 21) { // 'e'/'E'
                            return FastNumberParsers.parseScientific(neg * (ret + point / div), str, start + 1, end);
                        } else {
                            return neg * (ret + point / div);
                        }
                    }
                    return neg * (ret + point / div);
                } else if (c === 53 || c === 21) { // 'e'/'E'
                    return FastNumberParsers.parseScientific(neg * ret, str, start + 1, end);
                }
                else break;
            }
            return neg * ret;
        }
    }    

}