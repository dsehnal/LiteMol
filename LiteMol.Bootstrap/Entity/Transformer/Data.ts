/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Entity.Transformer.Data {
    "use strict";
         
    export interface DownloadParams {
        id?: string;
        description?: string;
        type?: Entity.Data.Type;
        url?: string; 
    }
        
    export const Download = Tree.Transformer.create<Entity.Root, Entity.Data.String | Entity.Data.Binary, DownloadParams>({
        id: 'data-download',
        name: 'Download Data',
        description: 'Downloads a string or binary data from the given URL (if the host server supports cross domain requests).',
        from: [Entity.Root],
        to: [Entity.Data.String, Entity.Data.Binary],
        validateParams: p => !p.url || !p.url.trim().length ? ['Enter URL'] : !p.type ? ['Specify type'] : void 0,  
        defaultParams: () => ({ id: '', description: '', type: 'String', url: '' })
    }, (ctx, a, t) => {        
        let params = t.params;
        return Utils.ajaxGet(params.url, params.type).setReportTime(true)
            .map<Entity.Data.String | Entity.Data.Binary>('ToEntity', 'Child', data => {                 
                if (params.type === 'String') return Entity.Data.String.create(<any>t, { label: params.id ? params.id : params.url, description: params.description, data: data as string });
                else return Entity.Data.Binary.create(<any>t, { label: params.id ? params.id : params.url, description: params.description, data: data as ArrayBuffer });                
            });
    }); 
    
    
    export interface OpenFileParams {
        description?: string;
        id?: string;
        file?: File; 
        type?: Entity.Data.Type;
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
        let params = t.params;
        return Utils.readFromFile(params.file, params.type).setReportTime(true)
            .map<Entity.Data.String | Entity.Data.Binary>('ToEntity', 'Child', data => {                 
                if (params.type === 'String') return Entity.Data.String.create(<any>t, { label: params.id ? params.id : params.file.name, description: params.description, data: data as string });
                else return Entity.Data.Binary.create(<any>t, { label: params.id ? params.id : params.file.name, description: params.description, data: data as ArrayBuffer });                
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
        }, (ctx, a, t) => { 
            return Task.create<Entity.Data.CifDictionary>(`CIF Parse (${a.props.label})`, 'Normal', ctx => {
                ctx.update('Parsing...');
                ctx.schedule(() => {
                    let d = Core.Formats.CIF.Text.parse(a.props.data);
                    if (d.error) {
                        ctx.reject(d.error.toString());
                        return;
                    }
                    ctx.resolve(Entity.Data.CifDictionary.create(t, { label: t.params.id ? t.params.id : 'CIF Dictionary', description: t.params.description, dictionary: d.result }));
                });
            }).setReportTime(true);
        }       
    );   

    export interface ParseBinaryCifParams { id?: string, description?: string }
    export const ParseBinaryCif = Tree.Transformer.create<Entity.Data.Binary, Entity.Data.CifDictionary, ParseBinaryCifParams>({
            id: 'data-parse-binary-cif',
            name: 'CIF Dictionary',
            description: 'Parse CIF dictionary from BinaryCIF data.',
            from: [Entity.Data.Binary],
            to: [Entity.Data.CifDictionary],
            defaultParams: () => ({})
        }, (ctx, a, t) => { 
            return Task.create<Entity.Data.CifDictionary>(`BinaryCIF Parse (${a.props.label})`, 'Normal', ctx => {
                ctx.update('Parsing...');
                ctx.schedule(() => {
                    let d = Core.Formats.CIF.Binary.parse(a.props.data);
                    if (d.error) {
                        ctx.reject(d.error.toString());
                        return;
                    }
                    ctx.resolve(Entity.Data.CifDictionary.create(t, { label: t.params.id ? t.params.id : 'CIF Dictionary', description: t.params.description, dictionary: d.result }));
                });
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
        }, (ctx, a, t) => { 
            return Task.create<Entity.Data.Json>(`JSON Parse (${a.props.label})`, 'Normal', ctx => {
                ctx.update('Parsing...');
                ctx.schedule(() => {
                    let data = JSON.parse(a.props.data);                    
                    ctx.resolve(Entity.Data.Json.create(t, { label: t.params.id ? t.params.id : 'JSON Data', description: t.params.description, data }));
                });
            }).setReportTime(true);
        }       
    );  
}