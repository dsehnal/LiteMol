/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Visualization.Molecule {
    "use strict";

    import Structure = Core.Structure;
    import Vis = LiteMol.Visualization;
    import MolVis = LiteMol.Visualization.Molecule;
    
    function getTessalation(type: DetailType, count: number) {
        if (type === 'Automatic') {        
            if (count < 250) return 5;
            if (count < 1000) return 4;
            if (count < 75000) return 3;
            if (count < 250000) return 2;
            if (count < 600000) return 1;
            return 0;
        } 
        let d = DetailTypes.indexOf(type) - 1;
        return Math.max(d, 0);
    }

    function getSurfaceDensity(params: SurfaceParams, count: number) {
        if (!!params.automaticDensity) {        
            if (count < 1000) return 1.2;
            if (count < 2500000) {                
                // scale from 1000 to 2.5m so that f(1000)=1.2, f(100k)=0.75, f(2.5m) = 0.1
                const a = -0.18610, b = 0.025298, c = 1.3608;
                return a * Math.pow(count / 1000, 1 / 3) + b * Math.sqrt(count / 1000) + c;
            }
            return 0.1;
        } 
        if (params.density !== void 0) return +params.density;
        return 1.0;
    }
    
    function createCartoonParams(tessalation: number, isAlphaTrace: boolean): MolVis.Cartoons.Parameters {
        return { 
            tessalation,
            drawingType: isAlphaTrace
                ? MolVis.Cartoons.CartoonsModelType.AlphaTrace
                : MolVis.Cartoons.CartoonsModelType.Default
        };
    }
    
    function makeRadiusFunc(model: Structure.Molecule.Model, parameters: BallsAndSticksParams) {
        if (!parameters.useVDW) {
            return function (r: number) {
                return function() { return r; }
            } (parameters.atomRadius!);
        }
        
        let vdw = Utils.vdwRadiusFromElementSymbol(model);
        return function(s: number, vdw: (i: number) => number) {
            return function(i:number) {
                return s * vdw(i);
            } 
        } (parameters.vdwScaling!, vdw);
    }
    
    function createBallsAndSticksParams(tessalation: number, model: Structure.Molecule.Model, parameters: BallsAndSticksParams) {        
        return <MolVis.BallsAndSticks.Parameters>{
            tessalation,
            bondRadius: parameters.bondRadius,
            hideBonds: false,
            atomRadius: makeRadiusFunc(model, parameters)            
        };
    }
    
    function createVDWBallsParams(tessalation: number, model: Structure.Molecule.Model) {        
        return <MolVis.BallsAndSticks.Parameters>{
            tessalation,
            bondRadius: 0,
            hideBonds: true,
            atomRadius: Utils.vdwRadiusFromElementSymbol(model)            
        };
    }
            
    function createModel(source: Entity.Molecule.Model | Entity.Molecule.Selection, style: Style<DetailParams>, theme: Vis.Theme): Core.Computation<Vis.Model> | undefined {
    
        let model = Utils.Molecule.findModel(source)!.props.model;
        let atomIndices = Entity.isMoleculeModel(source) ? source.props.model.data.atoms.indices : source.props.indices;
                    
        if (!atomIndices.length) return void 0;
        
        let tessalation = getTessalation(style.params.detail, atomIndices.length);
                
        switch (style.type) {
            case 'Cartoons': 
                return MolVis.Cartoons.Model.create(source, { model, atomIndices, theme, queryContext: Utils.Molecule.findQueryContext(source), params: createCartoonParams(tessalation, false) });
            case 'Calpha':
                return MolVis.Cartoons.Model.create(source, { model, atomIndices, theme, queryContext: Utils.Molecule.findQueryContext(source), params: createCartoonParams(tessalation, true) });
            case 'BallsAndSticks': 
                return Vis.Molecule.BallsAndSticks.Model.create(source, { model, atomIndices, theme, params: createBallsAndSticksParams(tessalation, model, style.params as BallsAndSticksParams) });
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
            
        return Task.create<Entity.Molecule.Visual>(`Visual (${source.props.label})`, Visualization.Style.getTaskType(style), async ctx => {                     
            let label = TypeDescriptions[style.type!].label;             
            await ctx.updateProgress(`Creating ${label}...`);           
            
            let theme = style.theme!.template!.provider(Utils.Molecule.findModel(source)!, Theme.getProps(style.theme!));
            let mc = createModel(source, style, theme);    
            
            if (!mc) {
                throw 'Invalid input parameters.';  
            } 
            
            let model = await mc.run(ctx);
            return Entity.Molecule.Visual.create(transform, { label, model, style, isSelectable: !style.isNotSelectable });        
        });
    }
    
    function createSurface(
        source: Source,
        transform: Tree.Transform<Entity.Molecule.Model | Entity.Molecule.Selection, Entity.Molecule.Visual, any>,
        style: Style<SurfaceParams>): Task<Entity.Molecule.Visual> {

        return Task.create<Entity.Molecule.Visual>(`Molecular Surface (${source.props.label})`, Visualization.Style.getTaskType(style), async ctx => {
            let model = Utils.Molecule.findModel(source)!.props.model;
            let atomIndices = Entity.isMoleculeModel(source) ? source.props.model.data.atoms.indices : source.props.indices;
            let params = style.params!;
                   
            let data = await LiteMol.Core.Geometry.MolecularSurface.computeMolecularSurfaceAsync({
                positions: model.positions,
                atomIndices,
                parameters:  {
                    atomRadius: Utils.vdwRadiusFromElementSymbol(model),
                    density: getSurfaceDensity(params, atomIndices.length),
                    probeRadius: params.probeRadius,
                    smoothingIterations: params.smoothing,
                    interactive: true
                }                
            }).run(ctx);
            
            let theme = style.theme!.template!.provider(Utils.Molecule.findModel(source)!, Theme.getProps(style.theme!));                
            await ctx.updateProgress('Creating visual...');
            let surfaceModel = await LiteMol.Visualization.Surface.Model.create(source, { surface: data.surface, theme, parameters: { isWireframe: style.params!.isWireframe } }).run(ctx);                    
            let eLabel = `Surface, ${Utils.round(params.probeRadius!, 2)} \u212B probe`;                    
            return Entity.Molecule.Visual.create(transform, { label: eLabel, model: surfaceModel, style, isSelectable: !style.isNotSelectable });
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