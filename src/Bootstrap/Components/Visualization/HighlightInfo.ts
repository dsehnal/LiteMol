/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Components.Visualization {
    "use strict";

    export interface HighlightInfoState { info?: Interactivity.HighlightEntry[] }
    export class HighlightInfo extends Component<HighlightInfoState> {
        constructor(context: Context) {
            super(context, <HighlightInfoState>{ info: [] });            
            Event.Interactivity.Highlight.getStream(this.context).subscribe(e => this.setState({ info: e.data }));
        }
    }
}