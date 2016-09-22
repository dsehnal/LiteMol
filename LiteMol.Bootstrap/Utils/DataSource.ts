/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Utils {
    "use strict";

    export function readStringFromFile(file: File) {
        return <Task<string>>readFromFileInternal(file, false);
    }

    export function readArrayBufferFromFile(file: File) {
        return <Task<ArrayBuffer>>readFromFileInternal(file, true);
    }
    
    export function readFromFile(file: File, type: Entity.Data.Type) {
        return <Task<ArrayBuffer | string>>readFromFileInternal(file, type === 'Binary');
    }
        
    export function ajaxGetString(url: string) {
        return <Task<string>>ajaxGetInternal(url, false);
    }

    export function ajaxGetArrayBuffer(url: string) {
        return <Task<ArrayBuffer>>ajaxGetInternal(url, true);
    }
    
    export function ajaxGet(url: string, type: Entity.Data.Type) {
        return <Task<string | ArrayBuffer>>ajaxGetInternal(url, type === 'Binary');
    }

    const __chars = function () {

        let data: string[] = [];
        for (let i = 0; i < 256; i++) data[i] = String.fromCharCode(i);
        return data;

    } ();

    function decompress(buffer: ArrayBuffer) {
        let gzip = new LiteMolZlib.Gunzip(new Uint8Array(buffer));
        return gzip.decompress();
    }

    function toString(data: Uint8Array) {
        let chars = __chars;

        let str: string[] = [], chunk: string[] = [], chunkSize = 512;

        for (let o = 0, _l = data.length; o < _l; o += chunkSize) {
            let k = 0;
            for (let i = o, _i = Math.min(o + chunkSize, _l); i < _i; i++) {
                chunk[k++] = chars[data[i]]
            }
            if (k < chunkSize) {
                str[str.length] = chunk.splice(0, k).join('');
            } else {
                str[str.length] = chunk.join('');
            }
        }
        return str.join('');
    }

    type Context = Core.Computation.Context<string | ArrayBuffer>;

    function processFile(ctx: Context, asArrayBuffer: boolean, compressed: boolean, e: any)  {
        try {
            let data = (e.target as FileReader).result;

            if (compressed) {
                ctx.update('Decompressing...');
                ctx.schedule(() => {
                    let decompressed = decompress(data);
                    if (asArrayBuffer) {
                        ctx.resolve(decompressed.buffer);
                    } else {
                        ctx.resolve(toString(decompressed));
                    }
                }, 1000 / 30);
            } else {
                ctx.resolve(data);
            }
        } catch (e) {
            ctx.reject(e);
        }
    }

    function handleProgress(ctx: Context, action: string, data: XMLHttpRequest | FileReader, asArrayBuffer: boolean, onLoad: (e: any) => void) {
        ctx.update(action);                
        data.onerror = e => {
            let error = (<FileReader>e.target).error;
            ctx.reject(error ? error : 'Failed.');
        };
        data.onabort = () => ctx.abort();
        
        let abort = () => data.abort();
        data.onprogress = e => {
            if (e.lengthComputable) {
                ctx.update(action, abort, e.loaded, e.total);
            } else {
                ctx.update(`${action} ${(e.loaded / 1024 / 1024).toFixed(2)} MB`, abort);
            }
        }        
        data.onload = onLoad;
    }

    function readFromFileInternal(file: File, asArrayBuffer: boolean): Task<string | ArrayBuffer> {
        return Task.fromComputation('Open File', 'Background', Core.Computation.create(ctx => {            
            let reader = new FileReader();            
            let isCompressed = /\.gz$/i.test(file.name);   
                     
            handleProgress(ctx, 'Reading...', reader, asArrayBuffer, (e: any) => processFile(ctx, asArrayBuffer, isCompressed, e));   
                     
            if (isCompressed || asArrayBuffer) reader.readAsArrayBuffer(file);
            else reader.readAsBinaryString(file);
        }));
    }
    
    class RequestPool {
        private static pool: XMLHttpRequest[] = [];
        private static poolSize = 15;

        static get() {
            if (this.pool.length) return this.pool.pop()!;
            return new XMLHttpRequest();
        }

        static emptyFunc() { } 

        static deposit(req: XMLHttpRequest) {
            if (this.pool.length < this.poolSize) {
                req.onabort = RequestPool.emptyFunc;
                req.onerror = RequestPool.emptyFunc;
                req.onload = RequestPool.emptyFunc;
                req.onprogress = RequestPool.emptyFunc;
                this.pool.push();
            }
        }
    }
    
    function processAjax(ctx: Context, asArrayBuffer: boolean, e: any) {
        let req = (e.target as XMLHttpRequest);
        if (req.status >= 200 && req.status < 400) {
            if (asArrayBuffer) ctx.resolve(e.target.response);
            else ctx.resolve(e.target.responseText);
        } else {        
            ctx.reject(req.statusText);            
        }
        RequestPool.deposit(e.target);
    }
    
    function ajaxGetInternal(url: string, asArrayBuffer: boolean): Task<string | ArrayBuffer>  {
        
        return Task.fromComputation('Download', 'Background', Core.Computation.create(ctx => {
                        
            let xhttp = RequestPool.get();
            ctx.update('Waiting for server...', () => xhttp.abort());
                   
            handleProgress(ctx, 'Downloading...', xhttp, asArrayBuffer, (e: any) => processAjax(ctx, asArrayBuffer, e));
                       
            xhttp.open('get', url, true);
            xhttp.responseType = asArrayBuffer ? "arraybuffer" : "text";
            xhttp.send();
        }));
    } 
}