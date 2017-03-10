/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Visualization.Density {
    "use strict";

    import Geom = LiteMol.Core.Geometry;
    
    function getOffsets(data: Core.Formats.Density.Data, min: number[], max: number[], toFrac: LiteMol.Visualization.THREE.Matrix4) {
        const dx = max[0] - min[0], dy = max[1] - min[1], dz = max[2] - min[2];
        const corners = [
            min,
            [min[0] + dx, min[1], min[2]],
            [min[0], min[1] + dy, min[2]],
            [min[0], min[1], min[2] + dz],
            [min[0] + dx, min[1] + dy, min[2]],
            [min[0] + dx, min[1], min[2] + dz],
            [min[0], min[1] + dy, min[2] + dz],
            [min[0] + dx, min[1] + dy, min[2] + dz]
        ].map(c => {
            const f = new LiteMol.Visualization.THREE.Vector3().fromArray(c).applyMatrix4(toFrac);
            return [f.x, f.y, f.z];
        });

        const bottomLeftFrac = [...corners[0]], topRightFrac = [...corners[0]];        
        // bounding box in fractional space.
        for (const c of corners) {            
            for (let i = 0; i < 3; i++) {
                bottomLeftFrac[i] = Math.min(bottomLeftFrac[i], c[i]);
                topRightFrac[i] = Math.max(topRightFrac[i], c[i]);
            }
        }

        const { origin, dimensions, sampleCount } = data.box;
        const bottomLeft = [0,0,0], topRight = [0,0,0];        
        // convert to the sample space.
        for (let i = 0; i < 3; i++) {
            let c = Math.floor(sampleCount[i] * (bottomLeftFrac[i] - origin[i]) / dimensions[i]);
            bottomLeft[i] = Math.min(Math.max(c, 0), sampleCount[i]);

            c = Math.ceil(sampleCount[i] * (topRightFrac[i] - origin[i]) / dimensions[i]);
            topRight[i] = Math.min(Math.max(c, 0), sampleCount[i]);
        }
        return { bottomLeft, topRight };
    }
    
    export function create(
        parent: Entity.Density.Data,
        transform: Tree.Transform<Entity.Density.Data, Entity.Density.Visual, any>,
        style: Style): Task<Entity.Density.Visual> {

        const name = style.taskType === 'Background' ? parent.props.label : `Density Surface (${parent.props.label})`;
        return Task.create<Entity.Density.Visual>(name, Visualization.Style.getTaskType(style), async ctx => {
            const params = style.params!;
            
            const source = Tree.Node.findClosestNodeOfType(parent, [Entity.Density.Data]) as Entity.Density.Data;
            if (!source) {
                throw 'Cannot create density visual on ' + parent.props.label;
            }
            
            const data = source.props.data;
            const basis = data.spacegroup.basis;
            const { sampleCount, origin, dimensions } = data.box;
            const scale = new LiteMol.Visualization.THREE.Matrix4().makeScale(
                dimensions[0] / (sampleCount[0] ), 
                dimensions[1] / (sampleCount[1] ), 
                dimensions[2] / (sampleCount[2] ));
            const translate = new LiteMol.Visualization.THREE.Matrix4().makeTranslation(origin[0], origin[1], origin[2]);
            const fromFrac = new LiteMol.Visualization.THREE.Matrix4().set(
                basis.x[0], basis.y[0], basis.z[0], 0.0,
                0.0, basis.y[1], basis.z[1], 0.0,
                0.0, 0.0, basis.z[2], 0.0,
                0.0, 0.0, 0.0, 1.0); 
            const toFrac = new LiteMol.Visualization.THREE.Matrix4().getInverse(fromFrac);
            const dataTransform = fromFrac.multiply(translate).multiply(scale);

            let min: number[], max: number[];
            if (params.bottomLeft && params.topRight) {
                const offsets = getOffsets(data, params.bottomLeft, params.topRight, toFrac);
                min = offsets.bottomLeft;
                max = offsets.topRight; 
            } else {
                min = [0,0,0];
                max = data.box.sampleCount;
            }
                        
            if (!(min[0] - max[0]) || !(min[1] - max[1]) || !(min[2] - max[2]) ) {
                throw { warn: true, message: 'Empty box.' };
            }
            
            const isSigma = params.isoValueType === void 0 || params.isoValueType === IsoValueType.Sigma;
            const isoValue = isSigma 
                ? data.valuesInfo.mean + data.valuesInfo.sigma * params.isoValue
                : params.isoValue!;
            
            let surface = await Geom.MarchingCubes.compute({
                    isoLevel: isoValue,
                    scalarField: data.data,
                    bottomLeft: min,
                    topRight: max
                }).run(ctx);

            surface = await Geom.Surface.transform(surface, <number[]><any>dataTransform.elements).run(ctx);
            surface = await Geom.Surface.laplacianSmooth(surface, params.smoothing, 8).run(ctx);
                             
            const theme = style.theme!.template!.provider(source, Theme.getProps(style.theme!));
                            
            await ctx.updateProgress('Creating visual...');
            const model = await LiteMol.Visualization.Surface.Model.create(source, { surface, theme, parameters: { isWireframe: style.params!.isWireframe } }).run(ctx);                    
            const label = `Surface, ${Utils.round(params.isoValue!, 2)}${isSigma ? ' \u03C3' : ''}`;                    
            return Entity.Density.Visual.create(transform, { label, model, style, isSelectable: !style.isNotSelectable });
        });
    }    
}