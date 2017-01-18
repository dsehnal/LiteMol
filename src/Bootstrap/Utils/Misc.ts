/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Utils {
    "use strict";
    
    function padTime(n: number) { return (n<10?'0':'')+n }
    export function formatTime(d: Date) {
        let h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
        return `${h}:${padTime(m)}:${padTime(s)}`;
    }
    
    export function round(n: number, d: number) {
        let f = Math.pow(10, d); 
        return Math.round(f * n) / f;
    }
            
    export function formatProgress(p: Core.Computation.Progress) {
        if (p.isIndeterminate) return p.message;
        let x = (100 * p.current / p.max).toFixed(2);
        return `${p.message} ${x}%`;
    }
    
    export function generateUUID() {
        var d = new Date().getTime();
        if(window.performance && typeof window.performance.now === "function"){
            d += performance.now();; //use high-precision timer if available
        }
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    }
    
}