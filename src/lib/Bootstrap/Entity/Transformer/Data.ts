/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Entity.Transformer.Data {
    "use strict";

    export interface DownloadParams {
        id?: string;
        description?: string;
        type: string;
        url: string;
        title?: string;
        responseCompression?: Utils.DataCompressionMethod;
    }

    function getDataType(type?: string): Entity.Data.Type {
        if (type === void 0 || type === null) return 'String';
        if (type.toLowerCase() === 'binary') return 'Binary';
        return 'String';
    }

    function hasResponseCompression(responseCompression?: Utils.DataCompressionMethod) {
        let c = responseCompression === void 0 ? Utils.DataCompressionMethod.None : responseCompression;
        return c !== Utils.DataCompressionMethod.None;
    }
    export const Download = Tree.Transformer.create<Entity.Root, Entity.Data.String | Entity.Data.Binary, DownloadParams>({
        id: 'data-download',
        name: 'Download Data',
        description: 'Downloads a string or binary data from the given URL (if the host server supports cross domain requests).',
        from: [Entity.Root],
        to: [Entity.Data.String, Entity.Data.Binary],
        validateParams: p => !p.url || !p.url.trim().length ? ['Enter URL'] : !p.type ? ['Specify type'] : (p.type === 'String' && hasResponseCompression(p.responseCompression)) ? ['Decompression is only available for Binary data.'] : void 0,
        defaultParams: () => ({ id: '', description: '', type: 'String', url: '', responseCompression: Utils.DataCompressionMethod.None })
    }, (ctx, a, t) => {
        let params = t.params;

        return Task.create('Download', 'Silent', async () => {
            let data = await Utils.ajaxGet({ url: params.url!, type: getDataType(params.type), compression: params.responseCompression, title: params.title }).setReportTime(true).run(ctx);
            if (params.type === 'String') return Entity.Data.String.create(<any>t, { label: params.id ? params.id : params.url!, description: params.description, data: data as string });
            else return Entity.Data.Binary.create(<any>t, { label: params.id ? params.id : params.url!, description: params.description, data: data as ArrayBuffer });
        });
    });

    export interface OpenFileParams {
        description?: string;
        id?: string;
        file: File | undefined;
        type?: string;
    }

    export const OpenFile = Tree.Transformer.create<Entity.Root, Entity.Data.String | Entity.Data.Binary, OpenFileParams>({
        id: 'data-open-file',
        name: 'Open Data File',
        description: 'Read a string or binary data from the selected file.',
        from: [Entity.Root],
        to: [Entity.Data.String, Entity.Data.Binary],
        validateParams: p => !p.file ? ['Select a file'] : void 0,
        defaultParams: () => ({ type: 'String', file: void 0 })
    }, (ctx, a, t) => {
        return Task.create('Download', 'Silent', async taskCtx => {
            let params = t.params;
            let data = await Utils.readFromFile(params.file!, getDataType(params.type)).setReportTime(true).run(ctx);            
            if (params.type === 'String') return Entity.Data.String.create(<any>t, { label: params.id ? params.id : params.file!.name, description: params.description, data: data as string });
            else return Entity.Data.Binary.create(<any>t, { label: params.id ? params.id : params.file!.name, description: params.description, data: data as ArrayBuffer });
        });
    });

    export interface ParseCifParams { id?: string, description?: string }
    export const ParseCif = Tree.Transformer.create<Entity.Data.String, Entity.Data.CifDictionary, ParseCifParams>({
        id: 'data-parse-cif',
        name: 'CIF Dictionary',
        description: 'Parse CIF dictionary from a string.',
        from: [Entity.Data.String],
        to: [Entity.Data.CifDictionary],
        defaultParams: () => ({})
    }, (bigCtx, a, t) => {
        return Task.create<Entity.Data.CifDictionary>(`CIF Parse (${a.props.label})`, 'Normal', async ctx => {
            await ctx.updateProgress('Parsing...');
            let d = Core.Formats.CIF.Text.parse(a.props.data);
            if (d.isError) {
                throw d.toString();
            }
            return Entity.Data.CifDictionary.create(t, { label: t.params.id ? t.params.id : 'CIF Dictionary', description: t.params.description, dictionary: d.result! });
        }).setReportTime(true);
    });

    export interface ParseBinaryCifParams { id?: string, description?: string }
    export const ParseBinaryCif = Tree.Transformer.create<Entity.Data.Binary, Entity.Data.CifDictionary, ParseBinaryCifParams>({
        id: 'data-parse-binary-cif',
        name: 'CIF Dictionary',
        description: 'Parse CIF dictionary from BinaryCIF data.',
        from: [Entity.Data.Binary],
        to: [Entity.Data.CifDictionary],
        defaultParams: () => ({})
    }, (bigCtx, a, t) => {
        return Task.create<Entity.Data.CifDictionary>(`BinaryCIF Parse (${a.props.label})`, 'Normal', async ctx => {
            await ctx.updateProgress('Parsing...');
            let d = Core.Formats.CIF.Binary.parse(a.props.data);
            if (d.isError) {
                throw d.toString();
            }
            return Entity.Data.CifDictionary.create(t, { label: t.params.id ? t.params.id : 'CIF Dictionary', description: t.params.description, dictionary: d.result! });
        }).setReportTime(true);
    }
    );

    export interface ParseJsonParams { id?: string, description?: string }
    export const ParseJson = Tree.Transformer.create<Entity.Data.String, Entity.Data.Json, ParseJsonParams>({
        id: 'data-parse-json',
        name: 'JSON',
        description: 'Parse a string to JSON object.',
        from: [Entity.Data.String],
        to: [Entity.Data.Json],
        defaultParams: () => ({})
    }, (bigCtx, a, t) => {
        return Task.create<Entity.Data.Json>(`JSON Parse (${a.props.label})`, 'Normal', async ctx => {
            await ctx.updateProgress('Parsing...');            
            let data = JSON.parse(a.props.data);
            return Entity.Data.Json.create(t, { label: t.params.id ? t.params.id : 'JSON Data', description: t.params.description, data });
        }).setReportTime(true);
    });

    export interface FromDataParams { id?: string, description?: string, data: string | ArrayBuffer }
    export const FromData = Tree.Transformer.create<Entity.Root, Entity.Data.String | Entity.Data.Binary, FromDataParams>({
        id: 'data-from-data',
        name: 'From Data',
        description: 'Creates a data entity from string or binary data',
        from: [Entity.Root],
        to: [Entity.Data.String, Entity.Data.Binary],
        defaultParams: () => void 0
    }, (ctx, a, t) => {
        let data = t.params.data!;
        let e = data instanceof ArrayBuffer 
            ? Entity.Data.Binary.create(<any>t, { label: t.params.id ? t.params.id : "Binary Data", description: t.params.description, data }) 
            : Entity.Data.String.create(<any>t, { label: t.params.id ? t.params.id : "String Data", description: t.params.description, data });
        return Task.resolve<Entity.Data.String | Entity.Data.Binary>(`From Data`, 'Silent', e);
    });
}