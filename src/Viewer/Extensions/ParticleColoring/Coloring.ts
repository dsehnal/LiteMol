/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.ParticleColoring {
    'use strict';

    import Model = Core.Structure.Molecule.Model
    import Vec3 = Core.Geometry.LinearAlgebra.Vector3
    import Tree = Bootstrap.Tree
    import Entity = Bootstrap.Entity

    export interface Params {
        min: number,
        max: number,
        steps: number, 
        opacity: number
    }

    export interface DistanceInfo {
        min: number,
        max: number,
        distances: Float32Array
    }

    export interface Coloring extends Entity<{ info: DistanceInfo }> { }
    export const Coloring = Entity.create<{ info: DistanceInfo }>({ name: 'Particle Coloring', typeClass: 'Object', shortName: 'PC', description: 'Atom coloring based on distance from the molecule\' centroid.' });

    export const Apply = Tree.Transformer.create<Entity.Molecule.Visual, Coloring, Params>({
        id: 'particle-coloring-apply',
        name: 'Particle Coloring',
        description: 'Apply atom coloring based on distance from the molecule\' centroid.',
        from: [Entity.Molecule.Visual],
        to: [Coloring],
        isUpdatable: true,
        defaultParams: () => ({ min: 0, max: 1e10, steps: 66, opacity: 1.0 })
    }, (context, a, t) => {
        return Bootstrap.Task.create<Coloring>('Complex', 'Normal', async ctx => {
            const model = Bootstrap.Utils.Molecule.findModel(a)!;
            const info = getAtomParticleDistances(model.props.model);
            const coloring = Coloring.create(t, { info, label: 'Particle Coloring', description: `${Math.round(10 * t.params.min) / 10} - ${Math.round(10 * t.params.max) / 10}` })
            applyTheme(context, coloring, a, t.params);
            return coloring;
        });
    }, (ctx, b, t) => {
        applyTheme(ctx, b, b.parent, t.params);
        return Bootstrap.Task.resolve(t.transformer.info.name, 'Background', Tree.Node.Null);
    });

    function getAtomParticleDistances(model: Model): DistanceInfo {
        const { x, y, z, count } = model.positions;
        const center = Vec3();
        Bootstrap.Utils.Molecule.getCentroidAndRadius(model, model.data.atoms.indices, center);

        const distances = new Float32Array(count);

        const t = Vec3();
        let min = 1e20, max = 0;
        for (let i = 0; i < count; i++) {
            Vec3.set(t, x[i], y[i], z[i]);
            const d = Vec3.distance(t, center);
            distances[i] = d;
            if (d < min) min = d;
            else if (d > max) max = d;
        }

        return { min, max, distances };
    }

    function createColorMapping(distances: Float32Array, min: number, max: number, maxColorIndex: number) {
        const mapping = new Int32Array(distances.length);
        const delta = (max - min) / maxColorIndex;
        for (let i = 0, __i = distances.length; i < __i; i++) {
            if (distances[i] < min) mapping[i] = 0;
            else if (distances[i] > max) mapping[i] = maxColorIndex;
            else mapping[i] = Math.round((distances[i] - min) / delta);
        }
        return mapping;
    }

    export function makeRainbow(steps: number) {
        const rainbow = [];
        const pal = Bootstrap.Visualization.Molecule.RainbowPalette;
        for (let i = steps - 1; i >= 0; i--) {
            const t = (pal.length - 1) * i / (steps - 1);
            const low = Math.floor(t), high = Math.min(Math.ceil(t), pal.length - 1);
            const color = Visualization.Color.fromRgb(0, 0, 0);
            Visualization.Color.interpolate(pal[low], pal[high], t - low, color);
            rainbow.push(color);
        }
        return rainbow;
    }

    function applyTheme(ctx: Bootstrap.Context, coloring: Coloring, visual: Bootstrap.Entity.Molecule.Visual, { min, max, steps:stps, opacity: alpha }: Params) {
        let distInfo = coloring.props.info;
        const steps = Math.ceil(stps);

        const atomMapping = createColorMapping(distInfo.distances, Math.max(min, distInfo.min), Math.min(max, distInfo.max), steps - 1);
        const rainbow = makeRainbow(steps);

        const mapping = Visualization.Theme.createPalleteIndexMapping(i => atomMapping[i], rainbow);
        const theme = Visualization.Theme.createMapping(mapping, { transparency: { alpha }, isSticky: true });
        Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(ctx, { visual, theme });
    }
}
