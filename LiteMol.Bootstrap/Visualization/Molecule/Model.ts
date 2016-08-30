/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Visualization.Molecule {
    "use strict";

    import Structure = Core.Structure;
    import Query = Structure.Query;
    import Vis = LiteMol.Visualization;
    import MolVis = LiteMol.Visualization.Molecule;
    
    function getTessalation(type: DetailType, count: number) {
        if (type === 'Automatic') {        
            if (count < 75000) return 3;
            if (count < 250000) return 2;
            if (count < 600000) return 1;
            return 0;
        } 
        let d = DetailTypes.indexOf(type) - 1;
        return Math.max(d, 0);
    }
    
    function createCartoonParams(tessalation: number, isAlphaTrace: boolean): MolVis.Cartoons.Parameters {
        return { 
            tessalation,
            drawingType: isAlphaTrace
                ? MolVis.Cartoons.CartoonsModelType.AlphaTrace
                : MolVis.Cartoons.CartoonsModelType.Default
        };
    }
    
    function makeRadiusFunc(model: Structure.MoleculeModel, parameters: BallsAndSticksParams) {
        if (!parameters.useVDW) {
            return function (r: number) {
                return function() { return r; }
            } (parameters.atomRadius);
        }
        
        let vdw = Utils.vdwRadiusFromElementSymbol(model);
        return function(s: number, vdw: (i: number) => number) {
            return function(i:number) {
                return s * vdw(i);
            } 
        } (parameters.vdwScaling, vdw);
    }
    
    function createBallsAndSticksParams(tessalation: number, model: Structure.MoleculeModel, parameters: BallsAndSticksParams) {        
        return <MolVis.BallsAndSticks.Parameters>{
            tessalation,
            bondRadius: parameters.bondRadius,
            hideBonds: false,
            atomRadius: makeRadiusFunc(model, parameters)            
        };
    }
    
    function createVDWBallsParams(tessalation: number, model: Structure.MoleculeModel) {        
        return <MolVis.BallsAndSticks.Parameters>{
            tessalation,
            bondRadius: 0,
            hideBonds: true,
            atomRadius: Utils.vdwRadiusFromElementSymbol(model)            
        };
    }
            
    function createModel(source: Entity.Molecule.Model | Entity.Molecule.Selection, style: Style<DetailParams>, theme: Vis.Theme): Core.Computation<Vis.Model> {
    
        let model = Utils.Molecule.findModel(source).props.model;
        let atomIndices = Entity.isMoleculeModel(source) ? source.props.model.atoms.indices : source.props.indices;
                    
        if (!atomIndices.length) return void 0;
        
        let tessalation = getTessalation(style.params.detail, atomIndices.length);
                
        switch (style.type) {
            case 'Cartoons': 
                return MolVis.Cartoons.Model.create(source, { model, atomIndices, theme, queryContext: Utils.Molecule.findQueryContext(source), params: createCartoonParams(tessalation, false) });
            case 'Calpha':
                return MolVis.Cartoons.Model.create(source, { model, atomIndices, theme, queryContext: Utils.Molecule.findQueryContext(source), params: createCartoonParams(tessalation, true) });
            case 'BallsAndSticks': 
                return Vis.Molecule.BallsAndSticks.Model.create(source, { model, atomIndices, theme, params: createBallsAndSticksParams(tessalation, model, style.params) });
            case 'VDWBalls':
                return Vis.Molecule.BallsAndSticks.Model.create(source, { model, atomIndices, theme, params: createVDWBallsParams(tessalation, model) });
            default:
                return void 0;
        }
    }
    
    function createStandardVisual(
        source: Source,
        transform: Tree.Transform<Entity.Molecule.Model | Entity.Molecule.Selection, Entity.Molecule.Visual, any>,
        style: Style<any>): Task<Entity.Molecule.Visual> {            
            
        return Task.create<Entity.Molecule.Visual>(`Visual (${source.props.label})`, style.computeOnBackground ? 'Silent' : 'Normal', ctx => {         
            
            let label = TypeDescriptions[style.type].label;
             
            ctx.update(`Creating ${label}...`);
            
            
            
            ctx.schedule(() => {  
                let theme = style.theme.template.provider(Utils.Molecule.findModel(source), Theme.getProps(style.theme));
                let mc = createModel(source, style, theme);    
                
                if (!mc) {
                    ctx.reject('Invalid input parameters.');  
                    return;
                } 
                
                let comp = mc.run();
                comp.progress.subscribe(p => ctx.update(label + ': ' +Utils.formatProgress(p), p.requestAbort));
                comp.result.then(model => {                                 
                    let visual = Entity.Molecule.Visual.create(transform, { label, model, style, isSelectable: !style.isNotSelectable });        
                    ctx.resolve(visual);
                }).catch(ctx.reject);
            }, 0);
        });
    }
    
    function createSurface(
        source: Source,
        transform: Tree.Transform<Entity.Molecule.Model | Entity.Molecule.Selection, Entity.Molecule.Visual, any>,
        style: Style<SurfaceParams>): Task<Entity.Molecule.Visual> {

        return Task.create<Entity.Molecule.Visual>(`Molecular Surface (${source.props.label})`, style.computeOnBackground ? 'Silent' : 'Normal', ctx => {
            let model = Utils.Molecule.findModel(source).props.model;
            let atomIndices = Entity.isMoleculeModel(source) ? source.props.model.atoms.indices : source.props.indices;
            let params = style.params;
            let label = TypeDescriptions[style.type].label;
                   
            let data = LiteMol.Core.Geometry.MolecularSurface.computeMolecularSurfaceAsync({
                positions: model.atoms,
                atomIndices,
                parameters:  {
                    atomRadius: Utils.vdwRadiusFromElementSymbol(model),
                    density: params.density,
                    probeRadius: params.probeRadius,
                    smoothingIterations: 2 * params.smoothing,
                    interactive: true
                }                
            }).run();
            
            data.progress.subscribe(p => ctx.update(label + ': ' + Utils.formatProgress(p), p.requestAbort));
            
            data.result.then(data => {    
                let theme = style.theme.template.provider(Utils.Molecule.findModel(source), Theme.getProps(style.theme));                
                ctx.update('Creating visual...');
                ctx.schedule(() => {               
                    let surface = LiteMol.Visualization.Surface.Model.create(source, { surface: data.surface, theme, parameters: { isWireframe: style.params.isWireframe } }).run();                    
                    surface.progress.subscribe(p => ctx.update(label + ': ' + Utils.formatProgress(p), p.requestAbort));
                    surface.result.then(model => {                                                            
                        let label = `Surface, ${Utils.round(params.probeRadius, 2)} \u212B probe`;                    
                        let visual = Entity.Molecule.Visual.create(transform, { label, model, style, isSelectable: !style.isNotSelectable });
                        ctx.resolve(visual);
                    }).catch(ctx.reject);
                }, 0);
            }).catch(ctx.reject);
        });
    }
    
    export function create(
        source: Source,
        transform: Tree.Transform<Entity.Molecule.Model | Entity.Molecule.Selection, Entity.Molecule.Visual, any>,
        style: Style<any>
    ): Task<Entity.Molecule.Visual> {            
       if (style.type === 'Surface') return createSurface(source, transform, style);
       return createStandardVisual(source, transform, style);
    }
        
}