/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Visualization.Density {
    "use strict";

    import Vis = LiteMol.Visualization;
    import MolVis = LiteMol.Visualization.Molecule;
    import Geom = LiteMol.Core.Geometry;
    
    function getOffsets(data: Core.Formats.Density.Data, min: number[], max: number[], toFrac: LiteMol.Visualization.THREE.Matrix4) {
        let dx = max[0] - min[0], dy = max[1] - min[1], dz = max[2] - min[2];

        let corners = [
            min,
            [min[0] + dx, min[1], min[2]],
            [min[0], min[1] + dy, min[2]],
            [min[0], min[1], min[2] + dz],
            [min[0] + dx, min[1] + dy, min[2]],
            [min[0] + dx, min[1], min[2] + dz],
            [min[0], min[1] + dy, min[2] + dz],
            [min[0] + dx, min[1] + dy, min[2] + dz]
        ];

        let bottomLeft = data.dataDimensions.slice(0), topRight = [0, 0, 0];
        
        for (let v of corners) {
            let f = new LiteMol.Visualization.THREE.Vector3().fromArray(v).applyMatrix4(toFrac),
                af = [f.x, f.y, f.z];
            
            for (let i = 0; i < 3; i++) {
                bottomLeft[i] = Math.max(0, Math.min(bottomLeft[i], Math.floor(af[i]) | 0));
                topRight[i] = Math.min(data.dataDimensions[i], Math.max(topRight[i], Math.ceil(af[i]) | 0));
            }
        }
                    
        return {
            bottomLeft: bottomLeft,
            topRight: topRight
        };
    }
    
    export function create(
        parent: Entity.Density.Data,
        transform: Tree.Transform<Entity.Density.Data, Entity.Density.Visual, any>,
        style: Style): Task<Entity.Density.Visual> {

        return Task.create<Entity.Density.Visual>(`Density Surface (${parent.props.label})`, style.computeOnBackground ? 'Silent' : 'Normal', ctx => {
            let params = style.params!;
            
            let source = Tree.Node.findClosestNodeOfType(parent, [Entity.Density.Data]) as Entity.Density.Data;
            if (!source) {
                ctx.reject('Cannot create density visual on ' + parent.props.label);
                return;
            }
            
            let data = source.props.data;
            let basis = data.basis;
            let fromFrac = new LiteMol.Visualization.THREE.Matrix4().set(
                basis.x[0], basis.y[0], basis.z[0], 0.0,
                0.0, basis.y[1], basis.z[1], 0.0,
                0.0, 0.0, basis.z[2], 0.0,
                0.0, 0.0, 0.0, 1.0);                                    
            fromFrac.setPosition(new LiteMol.Visualization.THREE.Vector3(data.origin[0], data.origin[1], data.origin[2]));
            let toFrac = new LiteMol.Visualization.THREE.Matrix4().getInverse(fromFrac);
            
            let min: number[], max: number[];
            if (params.bottomLeft && params.topRight) {
                let offsets = getOffsets(data, params.bottomLeft, params.topRight, toFrac);
                min = offsets.bottomLeft;
                max = offsets.topRight; 
            } else {
                min = [0,0,0];
                max = data.dataDimensions;
            }
                        
            if (!(min[0] - max[0]) || !(min[1] - max[1]) || !(min[2] - max[2]) ) {
                ctx.reject({ warn: true, message: 'Empty box.' });
                return;
            }
            
            let isSigma = params.isoValueType === void 0 || params.isoValueType === IsoValueType.Sigma;
            let isoValue = isSigma 
                ? data.valuesInfo.mean + data.valuesInfo.sigma * params.isoValue
                : params.isoValue!;
            
            let surface = Geom.MarchingCubes.compute({
                isoLevel: isoValue,
                scalarField: data.data,
                bottomLeft: min,
                topRight: max
            }).bind(s => Geom.Surface.transform(s, <number[]><any>fromFrac.elements)
                .bind(s => Geom.Surface.laplacianSmooth(s, params.smoothing))).run();
                 
            surface.progress.subscribe(p => ctx.update(`Density Surface (${source.props.label}): ${Utils.formatProgress(p)}`, p.requestAbort));
            
            surface.result.then(s => {    
                let theme = style.theme!.template!.provider(source, Theme.getProps(style.theme!));
                                
                ctx.update('Creating visual...');
                ctx.schedule(() => {               
                    let surface = LiteMol.Visualization.Surface.Model.create(source, { surface: s, theme, parameters: { isWireframe: style.params!.isWireframe } }).run();                    
                    surface.progress.subscribe(p => ctx.update(`Density Surface (${source.props.label}): ${Utils.formatProgress(p)}`, p.requestAbort));
                    surface.result.then(model => {                                                            
                        let label = `Surface, ${Utils.round(params.isoValue!, 2)}${isSigma ? ' \u03C3' : ''}`;                    
                        let visual = Entity.Density.Visual.create(transform, { label, model, style, isSelectable: !style.isNotSelectable });
                        ctx.resolve(visual);
                    }).catch(ctx.reject);
                }, 0);
            }).catch(ctx.reject);
        });
    }    
}