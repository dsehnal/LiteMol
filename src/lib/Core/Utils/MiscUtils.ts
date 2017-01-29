/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Utils {
    "use strict";

    export import FastNumberParsers = Core.Formats.CIF.Utils.FastNumberParsers
        
    export function extend<S, T, U>(object: S, source: T, guard?: U): S & T & U {
        let v: any;

        let s = <any>source;
        let o = <any>object;
        let g = <any>guard;
        for (let k of Object.keys(source)) {
            v = s[k];
            if (v !== void 0) o[k] = v;
            else if (guard) o[k] = g[k];
        }

        if (guard) {
            for (let k of Object.keys(guard)) {
                v = o[k];
                if (v === void 0) o[k] = g[k];
            }
        }

        return <any>object;
    };
    
    export function debounce<T>(func: () => T, wait: number) : () => T {
        let args: any,
            maxTimeoutId: any,
            result: any,
            stamp: any,
            thisArg: any,
            timeoutId: any,
            trailingCall: any,
            lastCalled = 0,
            maxWait = 0,
            trailing = true,
            leading = false;
        
        wait = Math.max(0, wait) || 0;        
        let delayed = function () {
            let remaining = wait - (performance.now() - stamp);
            if (remaining <= 0) {
                if (maxTimeoutId) {
                    clearTimeout(maxTimeoutId);
                }
                let isCalled = trailingCall;
                maxTimeoutId = timeoutId = trailingCall = void 0;
                if (isCalled) {
                    lastCalled = performance.now();
                    result = func.apply(thisArg, args);
                    if (!timeoutId && !maxTimeoutId) {
                        args = thisArg = null;
                    }
                }
            } else {
                timeoutId = setTimeout(delayed, remaining);
            }
        };

        let maxDelayed = function () {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            maxTimeoutId = timeoutId = trailingCall = void 0;
            if (trailing || (maxWait !== wait)) {
                lastCalled = performance.now();
                result = func.apply(thisArg, args);
                if (!timeoutId && !maxTimeoutId) {
                    args = thisArg = null;
                }
            }
        };

        return function (this: any) {
            args = arguments;
            stamp = performance.now();
            thisArg = this;
            trailingCall = trailing && (timeoutId || !leading);

            let isCalled = false;
            let leadingCall = false;

            if (maxWait === 0) {
                leadingCall = leading && !timeoutId;
            } else {
                if (!maxTimeoutId && !leading) {
                    lastCalled = stamp;
                }
                let remaining = maxWait - (stamp - lastCalled),
                    isCalled = remaining <= 0;

                if (isCalled) {
                    if (maxTimeoutId) {
                        maxTimeoutId = clearTimeout(maxTimeoutId);
                    }
                    lastCalled = stamp;
                    result = func.apply(thisArg, args);
                }
                else if (!maxTimeoutId) {
                    maxTimeoutId = setTimeout(maxDelayed, remaining);
                }
            }
            if (isCalled && timeoutId) {
                timeoutId = clearTimeout(timeoutId);
            }
            else if (!timeoutId && wait !== maxWait) {
                timeoutId = setTimeout(delayed, wait);
            }
            if (leadingCall) {
                isCalled = true;
                result = func.apply(thisArg, args);
            }
            if (isCalled && !timeoutId && !maxTimeoutId) {
                args = thisArg = null;
            }
            return result;
        };
    }
}