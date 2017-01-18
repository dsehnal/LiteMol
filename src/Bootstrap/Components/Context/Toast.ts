/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Components.Context {
    "use strict";

    export class Toast extends Component<{ entries: Immutable.Map<number, Toast.Entry> }> {

        private serialNumber = 0;
        private serialId = 0; 

        private findByKey(key: string): Toast.Entry | undefined {
            return this.latestState.entries.find(e => !!e && e.key === key)
        }

        private show(toast: Service.Toast) {
            let entries = this.latestState.entries;
            let e: Toast.Entry | undefined = void 0;
            let id = ++this.serialId;
            let serialNumber: number;  
            if (toast.key && (e = this.findByKey(toast.key))) {
                if (e.timeout !== void 0) clearTimeout(e.timeout);
                serialNumber = e.serialNumber;
                entries = entries.remove(e.id);
            } else {
                serialNumber = ++this.serialNumber;
            }

            e = {
                id,
                serialNumber,
                key: toast.key,
                title: toast.title,
                message: toast.message,
                timeout: this.timeout(id, toast.timeoutMs),
                hide: () => this.hideId(id)
            };

            entries = entries.set(id, e);

            this.setState({ entries });
        }

        private timeout(id: number, delay?: number) {
            if (delay === void 0) return void 0;

            if (delay < 0) delay = 500;
            return <number><any>setTimeout(() => {
                let e = this.latestState.entries.get(id);
                e.timeout = void 0;
                this.hide(e);
            }, delay);
        }

        private hideId(id: number) {
            this.hide(this.latestState.entries.get(id));
        }

        private hide(e: Toast.Entry | undefined) {
            if (!e) return;
            if (e.timeout !== void 0) clearTimeout(e.timeout);
            e.hide = <any>void 0;
            let entries = this.latestState.entries;
            entries = entries.delete(e.id);
            this.setState({ entries });
        }

        constructor(context: Context) {
            super(context, { entries: Immutable.Map<number, Toast.Entry>() });

            Command.Toast.Show.getStream(this.context).subscribe(e => this.show(e.data));
            Command.Toast.Hide.getStream(this.context).subscribe(e => this.hide(this.findByKey(e.data.key)));
        }
    }    

    export namespace Toast {
        export interface Entry {
            id: number,
            serialNumber: number,
            key?: string,
            title: string,
            message: string | { },
            hide: () => void,
            timeout?: number
        }
    }
}
