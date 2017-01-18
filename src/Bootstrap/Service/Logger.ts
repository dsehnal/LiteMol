/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Service {
    "use strict";
        
    export class Logger {
    
        private log(e: Logger.Entry) {
            Event.Log.dispatch(this.context, e);
        }

        message(m: string) {
            this.log({ type: Logger.EntryType.Message, timestamp: new Date(), message: m });
        }

        error(m: string) {
            this.log({ type: Logger.EntryType.Error, timestamp: new Date(), message: m });
        }

        warning(m: string) {
            this.log({ type: Logger.EntryType.Warning, timestamp: new Date(), message: m });
        }
        
        info(m: string) {
            this.log({ type: Logger.EntryType.Info, timestamp: new Date(), message: m });
        }
        
        constructor(private context: Context) {
            
        }
    }
    
    export module Logger {
        export enum EntryType {
            Message,
            Error,
            Warning,
            Info
        }

        export interface Entry {
            type: EntryType;
            timestamp: Date;
            message: any
        }  
    }
}