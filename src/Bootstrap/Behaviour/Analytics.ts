/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Behaviour {
    "use strict";
    
    function trackTransform<A extends Tree.Node.Any, B extends Tree.Node.Any, P>(ctx: Context, name: string, transformer: Tree.Transformer<A, B, P>, a: A, transform: Tree.Transform.Any, selector: (p: P, a?: Entity.Any) => string | undefined, gaId: string) {
        if (transform.transformer !== transformer) return;
        
        try {
            let ga = (window as any)[gaId];
            let p = selector(transform.params, a);
            if (ga && typeof p !== 'undefined') {
                ga('send', 'event', name, p, ctx.id);
                //console.log('send', name, p, ctx.id);
            }
        } catch (e) {
            //console.log('error', e);
        }
    }  
    
    function selectedMoleculeCreateFromData(p: Entity.Transformer.Molecule.CreateFromDataParams, a: Entity.Any) { return p.format!.name; }    
    function selectDownload(p: Entity.Transformer.Data.DownloadParams) { return p.url; }
    function selectQuery(p: Entity.Transformer.Molecule.CreateSelectionParams) { return p.queryString; }
    function selectAssembly(p: Entity.Transformer.Molecule.CreateAssemblyParams, a: Entity.Any) {
        if (Tree.Node.isHidden(a)) return void 0;
        let m = Utils.Molecule.findModel(a);
        if (!m) return void 0; 
        return m.props.model.id + ' $(name)$ ' + p.name;         
    }
    
    function selectCrystalSymmetry(p: Entity.Transformer.Molecule.CreateSymmetryMatesParams, a: Entity.Any) {
        if (Tree.Node.isHidden(a)) return void 0;
        let m = Utils.Molecule.findModel(a);
        if (!m) return void 0; 
        return m.props.model.id + ' $(type)$ ' + p.type + ' $(radius)$ ' + p.radius;         
    }
    
    function selectStreaming(p: Entity.Transformer.Molecule.CoordinateStreaming.CreateStreamingBehaviourParams, a: Entity.Any) {
        let m = Utils.Molecule.findModel(a);
        if (!m) return void 0; 
        return m.props.model.id + ' $(server)$ ' + p.server;
    }
        
    function selectVisual(p: Entity.Transformer.Molecule.CreateVisualParams, a: Entity.Any) {
        if (Tree.Node.isHidden(a)) return void 0;
        return p.style!.type;         
    }

    function selectDensity(p: Entity.Transformer.Density.ParseDataParams) { return '$(format)$ ' + p.format; }

    function selectSelection(p: Entity.Transformer.Molecule.CreateSelectionParams, a: Entity.Any) {
        return p.queryString;         
    }
    
    
    export function GoogleAnalytics(id: string, key: string = 'default') {
        
        return (context: Context) => {
            
            let gaId = `ga-${context.id}-${key}`;
            try {
                (function(i:any,s:any,o:any,g:any,r:any,a?:any,m?:any){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*(+new Date());a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','https://www.google-analytics.com/analytics.js',gaId);
                (window as any)[gaId]('create', id, 'auto');                
                setTimeout(() => {
                    try {
                        let ga = (window as any)[gaId];
                        if (ga) ga('send', 'event', 'Loaded', 'contextId', context.id);
                    } catch (e) { }
                }, 1000);
            } catch (e) {
            }
            
            Event.Tree.TransformerApply.getStream(context).subscribe(e => {                
                trackTransform(context, 'Download', Entity.Transformer.Data.Download, e.data.a, e.data.t, selectDownload, gaId);
                trackTransform(context, 'Create Molecule From Data', Entity.Transformer.Molecule.CreateFromData, e.data.a, e.data.t, selectedMoleculeCreateFromData, gaId);
                trackTransform(context, 'Create Model Selecion', Entity.Transformer.Molecule.CreateSelection, e.data.a, e.data.t, selectQuery, gaId);
                trackTransform(context, 'Create Assembly', Entity.Transformer.Molecule.CreateAssembly, e.data.a, e.data.t, selectAssembly, gaId);
                trackTransform(context, 'Create Symmetry', Entity.Transformer.Molecule.CreateSymmetryMates, e.data.a, e.data.t, selectCrystalSymmetry, gaId);
                trackTransform(context, 'Create Visual', Entity.Transformer.Molecule.CreateVisual, e.data.a, e.data.t, selectVisual, gaId);
                trackTransform(context, 'Coordinate Streaming', Entity.Transformer.Molecule.CoordinateStreaming.CreateBehaviour, e.data.a, e.data.t, selectStreaming, gaId);
                trackTransform(context, 'Parse Density', Entity.Transformer.Density.ParseData, e.data.a, e.data.t, selectDensity, gaId);
                trackTransform(context, 'Create Model Selection', Entity.Transformer.Molecule.CreateSelection, e.data.a, e.data.t, selectSelection, gaId);
            });            
        };
    }
}