/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Entity.Transformer.Density {
    "use strict";
  
    export interface ParseDataParams {
        id?: string,
        format?: LiteMol.Core.Formats.FormatInfo,
        normalize?: boolean
    } 
    export const ParseData = Tree.Transformer.create<Entity.Data.String | Entity.Data.Binary, Entity.Density.Data, ParseDataParams>({
            id: 'density-parse-binary',
            name: 'Density Data',
            description: 'Parse density from binary data.',
            from: [Entity.Data.String, Entity.Data.Binary],
            to: [Entity.Density.Data],
            isUpdatable: true,
            defaultParams: () => ({ format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, normalize: false })
        }, (ctx, a, t) => { 
            return Task.fromComputation(`Parse Density (${a.props.label})`, 'Normal', t.params.format.parse(a.props.data))
                .setReportTime(true) 
                .bind(`Create Density (${a.props.label})`, 'Silent', data => {
                    if (data.error) {
                        return Task.reject(`Create Density (${a.props.label})`, 'Background', data.error.toString());
                    }               
                    if (t.params.normalize) {
                         data.result.normalize();
                    }
                    let e = Entity.Density.Data.create(t, { label: t.params.id ? t.params.id : 'Density Data', data: data.result, description: t.params.normalize ? 'Normalized' : '' });
                    return Task.resolve(`Create Density (${a.props.label})`, 'Background', e);
                }); 
        }, (ctx, b, t) => {            
            if (b.props.data.isNormalized === t.params.normalize) return Task.resolve('Density', 'Background', Tree.Node.Null);
            
            return Task.create<Entity.Density.Data>('Update Density', 'Normal', ctx => {
                ctx.update('Updating...');
                ctx.schedule(() => {
                    let data = b.props.data;
                    if (data.isNormalized) data.denormalize();
                    else data.normalize();
                    ctx.resolve(Entity.Density.Data.create(t, { label: t.params.id ? t.params.id : 'Density Data', data, description: t.params.normalize ? 'Normalized' : '' }));
                });
            });          
        }      
    );   
    
    export interface CreateVisualParams {
        style?: Visualization.Density.Style
    } 
    
    export const CreateVisual = Tree.Transformer.create<Entity.Density.Data, Entity.Density.Visual, CreateVisualParams>({
            id: 'density-create-visual',
            name: 'Surface',
            description: 'Create a surface from the density data.',
            from: [Entity.Density.Data],
            to: [Entity.Density.Visual],
            isUpdatable: true,
            defaultParams: () => ({ style: Visualization.Density.Default.Style }),
            validateParams: p => !p.style ? ['Specify Style'] : void 0,
            customController: (ctx, t, e) => new Components.Transform.DensityVisual(ctx, t, e),
        }, (ctx, a, t) => {      
            let params = t.params;
            return Visualization.Density.create(a, t, params.style).setReportTime(!t.params.style.computeOnBackground);
        }, (ctx, b, t) => {
            
            let oldParams = b.transform.params as CreateVisualParams;            
            if (oldParams.style.type !== t.params.style.type || !Utils.deepEqual(oldParams.style.params, t.params.style.params)) return void 0;
            
            let parent = Tree.Node.findClosestNodeOfType(b, [Entity.Density.Data]);            
            if (!parent) return void 0;
            
            let model = b.props.model;
            if (!model) return void 0;            
            
            let ti = t.params.style.theme;
            let theme = ti.template.provider(parent, Visualization.Theme.getProps(ti));
            
            model.applyTheme(theme);
            b.props.style.theme = ti;
            //Entity.forceUpdate(b);
            Entity.nodeUpdated(b);
            return Task.resolve(t.transformer.info.name, 'Background', Tree.Node.Null); 
        }       
    );     
    
    
    export interface CreateVisualBehaviourParams {
        id?: string,
        isoSigmaMin?: number;
        isoSigmaMax?: number;
        radius?: number,
        style?: Visualization.Density.Style
    } 
    
    export const CreateVisualBehaviour = Tree.Transformer.create<Entity.Density.Data, Entity.Density.InteractiveSurface, CreateVisualBehaviourParams>({
            id: 'density-create-visual-behaviour',
            name: 'Interactive Surface',
            description: 'Create a surface from the density data when a residue or atom is selected.',
            from: [Entity.Density.Data],
            to: [Entity.Density.InteractiveSurface],
            isUpdatable: true,
            defaultParams: ctx => ({ style: Visualization.Density.Default.Style, radius: ctx.settings.get('density.defaultVisualBehaviourRadius') || 0, isoSigmaMin: -5, isoSigmaMax: 5 }),
            customController: (ctx, t, e) => new Components.Transform.DensityVisual(ctx, t, e),
        }, (ctx, a, t) => {      
            let params = t.params;
            let b = new Bootstrap.Behaviour.Density.ShowElectronDensityAroundSelection(ctx, {
                style: params.style,
                radius: params.radius
            })
            return Task.resolve('Behaviour', 'Background', Entity.Density.InteractiveSurface.create(t, { label: `${t.params.id ? t.params.id : 'Interactive'}, ${Utils.round(t.params.style.params.isoSigma, 2)} \u03C3`, behaviour: b }));
        }
    );
}