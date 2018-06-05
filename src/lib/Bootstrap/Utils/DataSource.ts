/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Utils {
    "use strict";

    export enum DataCompressionMethod {
        None,
        Gzip
    }

    export interface AjaxGetParams {
        url: string,
        type: Entity.Data.Type,
        title?: string,
        compression?: DataCompressionMethod
    }

    export function readStringFromFile(file: File) {
        return <Task<string>>readFromFileInternal(file, false);
    }

    export function readArrayBufferFromFile(file: File) {
        return <Task<ArrayBuffer>>readFromFileInternal(file, true);
    }

    export function readFromFile(file: File, type: Entity.Data.Type) {
        return <Task<ArrayBuffer | string>>readFromFileInternal(file, type === 'Binary');
    }

    export function ajaxGetString(url: string, title?: string) {
        return <Task<string>>ajaxGetInternal(title, url, false, false);
    }

    export function ajaxGetArrayBuffer(url: string, title?: string) {
        return <Task<ArrayBuffer>>ajaxGetInternal(title, url, true, false);
    }

    export function ajaxGet(params: AjaxGetParams) {
        return <Task<string | ArrayBuffer>>ajaxGetInternal(params.title, params.url, params.type === 'Binary', params.compression === DataCompressionMethod.Gzip);
    }


    function decompress(buffer: ArrayBuffer) {
        let gzip = new LiteMolZlib.Gunzip(new Uint8Array(buffer));
        return gzip.decompress();
    }

    type Context = Core.Computation.Context

    async function processFile(ctx: Context, asArrayBuffer: boolean, compressed: boolean, e: any) {
        let data = (e.target as FileReader).result;

        if (compressed) {
            await ctx.updateProgress('Decompressing...');

            let decompressed = decompress(data);
            if (asArrayBuffer) {
                return decompressed.buffer;
            } else {
                return Core.Formats.CIF.Binary.MessagePack.utf8Read(decompressed, 0, decompressed.length);
            }
        } else {
            return data;
        }
    }

    function readData(ctx: Context, action: string, data: XMLHttpRequest | FileReader, asArrayBuffer: boolean): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            data.onerror = (e: any) => {
                let error = (<FileReader>e.target).error;
                reject(error ? error : 'Failed.');
            };

            data.onabort = () => reject(Core.Computation.Aborted);

            data.onprogress = (e: ProgressEvent) => {
                if (e.lengthComputable) {
                    ctx.updateProgress(action, true, e.loaded, e.total);
                } else {
                    ctx.updateProgress(`${action} ${(e.loaded / 1024 / 1024).toFixed(2)} MB`, true);
                }
            }
            data.onload = (e: any) => resolve(e);
        });
    }

    function readFromFileInternal(file: File, asArrayBuffer: boolean): Task<string | ArrayBuffer> {
        return Task.fromComputation('Open File', 'Background', Core.computation<string | ArrayBuffer>(async ctx => {
            let reader = new FileReader();
            let isCompressed = /\.gz$/i.test(file.name);

            if (isCompressed || asArrayBuffer) reader.readAsArrayBuffer(file);
            else reader.readAsBinaryString(file);

            ctx.updateProgress('Opening file...', () => reader.abort());
            let e = await readData(ctx, 'Reading...', reader, asArrayBuffer);
            let result = processFile(ctx, asArrayBuffer, isCompressed, e);
            return result;
        }));
    }

    class RequestPool {
        private static pool: XMLHttpRequest[] = [];
        private static poolSize = 15;

        static get() {
            if (this.pool.length) {
                return this.pool.pop()!;
            }
            return new XMLHttpRequest();
        }

        static emptyFunc() { }

        static deposit(req: XMLHttpRequest) {
            if (this.pool.length < this.poolSize) {
                req.onabort = RequestPool.emptyFunc;
                req.onerror = RequestPool.emptyFunc;
                req.onload = RequestPool.emptyFunc;
                req.onprogress = RequestPool.emptyFunc;
                this.pool.push(req);
            }
        }
    }

    async function processAjax(ctx: Context, asArrayBuffer: boolean, decompressGzip: boolean, e: any) {
        let req = (e.target as XMLHttpRequest);
        if (req.status >= 200 && req.status < 400) {
            if (asArrayBuffer) {
                let buff = e.target.response;
                RequestPool.deposit(e.target);

                if (decompressGzip) {
                    await ctx.updateProgress('Decompressing...');
                    let gzip = new LiteMolZlib.Gunzip(new Uint8Array(buff));
                    let data = gzip.decompress();
                    return data.buffer;
                } else {
                    return buff;
                }
            }
            else {
                let text = e.target.responseText;
                RequestPool.deposit(e.target);
                return text;
            }
        } else {
            let status = req.statusText;
            RequestPool.deposit(e.target);
            throw status;
        }
    }

    function ajaxGetInternal(title: string | undefined, url: string, asArrayBuffer: boolean, decompressGzip: boolean): Task<string | ArrayBuffer> {

        return Task.fromComputation(title ? title : 'Download', 'Background', Core.computation(async ctx => {
            if (!asArrayBuffer && decompressGzip) {
                throw 'Decompress is only available when downloading binary data.';
            }

            let xhttp = RequestPool.get();

            xhttp.open('get', url, true);
            xhttp.responseType = asArrayBuffer ? "arraybuffer" : "text";
            xhttp.send();

            ctx.updateProgress('Waiting for server...', () => xhttp.abort());
            let e = await readData(ctx, 'Downloading...', xhttp, asArrayBuffer);
            let result = await processAjax(ctx, asArrayBuffer, decompressGzip, e)
            return result;
        }));
    }
}