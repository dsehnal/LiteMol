/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Core.Utils {
    "use strict";

    namespace PerformanceHelper {

        declare var process: any;

        export var perfGetTime = (function () {
            if (typeof window !== 'undefined' && window.performance) {
                return function () { return window.performance.now(); }
            } else if (typeof process !== 'undefined' && process.hrtime !== 'undefined') {
                return function () {
                    let t = process.hrtime();
                    return t[0] * 1000 + t[1] / 1000000;
                };
            } else {
                return function () { return +new Date(); }
            }
        })();
    }

    export class PerformanceMonitor {

        private starts = Utils.FastMap.create<string, number>();
        private ends = Utils.FastMap.create<string, number>();

        static currentTime() {
            return PerformanceHelper.perfGetTime();
        }
                
        start(name: string) {
            this.starts.set(name, PerformanceHelper.perfGetTime());
        }

        end(name: string) {
            this.ends.set(name, PerformanceHelper.perfGetTime());
        }

        static format(t: number) {
            if (isNaN(t)) return 'n/a';

            let h = Math.floor(t / (60 * 60 * 1000)),
                m = Math.floor(t / (60 * 1000) % 60),
                s = Math.floor(t / 1000 % 60),
                ms = Math.floor(t % 1000).toString();

            while (ms.length < 3) ms = "0" + ms;

            if (h > 0) return `${h}h${m}m${s}.${ms}s`;
            if (m > 0) return `${m}m${s}.${ms}s`;
            if (s > 0) return `${s}.${ms}s`;
            return `${t.toFixed(0)}ms`;
        }
        
        formatTime(name: string) {
            return PerformanceMonitor.format(this.time(name));
        }

        formatTimeSum(...names: string[]) {
            return PerformanceMonitor.format(this.timeSum(...names));
        }

        // return the time in milliseconds and removes them from the cache.
        time(name: string): number {
            let start = this.starts.get(name)!, end = this.ends.get(name)!;

            this.starts.delete(name);
            this.ends.delete(name);

            return end - start;
        }

        timeSum(...names: string[]) {
            let t = 0;
            for (let m of names.map(n => this.ends.get(n)! - this.starts.get(n)!)) t += m;
            return t;
        }

    }
}