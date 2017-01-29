/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Interactivity {
    "use strict";
    
    export type HighlightEntry = string
    export type HighlightProvider = (info: Info) => string | undefined
        
    export class HighlightManager {
        
        providers: HighlightProvider[] = [];
        
        addProvider(provider: HighlightProvider) {
            this.providers.push(provider);
        }    
        
        removeProvider(provider: HighlightProvider) {
            this.providers = this.providers.filter(p => p !== provider);
            Event.Interactivity.Highlight.dispatch(this.context, []);
        }
        
        private empty: any[] = [];
        private getInfo(i: Info) {
            if (!i) return this.empty;
            let info: HighlightEntry[] = [];
            for (let p of this.providers) {
                let e = p.call(null, i);
                if (e) info.push(e);
            }
            return info;              
        }
                
        constructor(public context: Context) {
            Event.Visual.VisualHoverElement.getStream(context).subscribe(ev => Event.Interactivity.Highlight.dispatch(context, this.getInfo(ev.data)));
        }
    }
}