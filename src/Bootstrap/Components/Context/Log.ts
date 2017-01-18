/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Components.Context {
    "use strict";

    export class Log extends Component<{ entries: Immutable.List<Service.Logger.Entry> }> {
        constructor(context: Context) {
            super(context, { entries: Immutable.List<Service.Logger.Entry>() });

            Event.Log.getStream(this.context)
                .subscribe(e => this.setState({ entries: this.latestState.entries.push(e.data) }))
        }
    }
}
