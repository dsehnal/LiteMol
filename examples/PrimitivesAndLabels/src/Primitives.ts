/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.PrimitivesAndLabels {

    import Transformer = Bootstrap.Entity.Transformer
    import Q = Core.Structure.Query
    import Model = Core.Structure.Molecule.Model
    import LA = Core.Geometry.LinearAlgebra

    export type PrimitiveTag = { kind: 'Center', residueIndex: number, model: Model, center: LA.ObjectVec3 } 
        | { kind: 'Connector', aResidueIndex: number, bResidueIndex: number, center: LA.ObjectVec3, length: number, model: Model }
    export type Tags = Core.Utils.FastMap<number, PrimitiveTag>
    export type SurfaceTag = { type: 'BindingMap', tags: Tags }

    function createTheme(tags: Tags) {
        const colors = Core.Utils.FastMap.ofObject({
            'Center': Visualization.Color.fromHexString('#996633'),
            'Connector': Visualization.Color.fromHexString('#339933')
        });
        const mapping = Visualization.Theme.createColorMapMapping(i => tags.get(i)!.kind, colors, Visualization.Color.fromHexString('#000000'));
        return Visualization.Theme.createMapping(mapping);
    }

    function createLabelsParams(tags: Tags, count: number) {
        const positions = Core.Utils.DataTable.ofDefinition(Core.Structure.Tables.Positions, count);
        const { x, y, z } = positions;
        const labels: string[] = [];
        const sizes = new Float32Array(count) as any as number[];
        const options = Visualization.Labels.DefaultLabelsOptions;

        let index = 0;
        tags.forEach(tag => {
            if (tag.kind !== 'Connector') return;

            x[index] = tag.center.x;
            y[index] = tag.center.y;
            z[index] = tag.center.z;
            labels.push(`${tag.length.toFixed(2)} Å`);
            sizes[index] = 0.75;

            index++;
        })

        const style = { ...Bootstrap.Visualization.Labels.Default.GenericLabels };
        style.theme = { 
            ...style.theme, 
            variables: style.theme.variables!.set('backgroundOpacity', 0.55),
            colors: style.theme.colors!.set('Uniform', Visualization.Color.fromHexString('#ffff00'))
        }

        const params: Bootstrap.Entity.Transformer.Labels.CreateParams = {
            labels,
            sizes,
            options,
            positions,
            style
        };
        return params;
    }

    async function createBindingMapSurface(model: Model) {

        const pocketQ = Q.residues().inside(Q.residues({ name: 'REA' }).ambientResidues(5)).compile();
        const { name: residueName } = model.data.residues;
        const fs = pocketQ(model.queryContext);

        const centers = fs.fragments.map(f => {
            const c = { x: 0, y: 0, z: 0 };
            Bootstrap.Utils.Molecule.getCentroidAndRadius(model, f.atomIndices, c);
            return c;
        });

        let reaIndex = 0;
        for (const f of fs.fragments) {
            if (residueName[f.residueIndices[0]] === 'REA') {
                break;
            }
            reaIndex++;
        }

        const reaCenter = centers[reaIndex];
        const tags = Core.Utils.FastMap.create<number, PrimitiveTag>();
        
        const shapes = Visualization.Primitive.Builder.create();

        for (let i = 0; i < centers.length; i++) {
            tags.set(i, { kind: 'Center', residueIndex: fs.fragments[i].residueIndices[0], model, center: centers[i] });
            shapes.add({ type: 'Sphere', id: i, radius: 0.45, center: centers[i], tessalation: 2 });
        }

        for (let i = 0; i < centers.length; i++) {
            if (i === reaIndex) continue;
            const id = i + centers.length;
            const a = centers[reaIndex], b = centers[i];
            const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
            const length = Math.sqrt(dx*dx + dy*dy + dz * dz);
            const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 }
            tags.set(id, { kind: 'Connector', aResidueIndex: fs.fragments[reaIndex].residueIndices[0], bResidueIndex: fs.fragments[i].residueIndices[0], length, model, center });
            shapes.add({ type: 'Tube', id, radius: 0.1, a, b, slices: 12 });
        }

        return {
            surface: await shapes.buildSurface().run(),
            tags,
            theme: createTheme(tags),
            labels: createLabelsParams(tags, centers.length - 1)
        };

        // let s = Visualization.Primitive.Builder.create();
        // let id = 0;
        // for (let p of origins.Points) {
        //     s.add({ type: 'Sphere', id: id++, radius: 1.69, center: { x: p.X, y: p.Y, z: p.Z } });
        // }
        // return s.buildSurface().run();        

    }

    export async function createBindingMap(plugin: Plugin.Controller, model: Model) {
        const { surface, tags, theme, labels } = await createBindingMapSurface(model);

        const t = plugin.createTransform();
        
        t.add('model', CreateBindingMap, {
            label: 'Binding Map',
            tag: <SurfaceTag>{ type: 'BindingMap', tags },
            surface,
            isInteractive: true,
            theme
        }, { });
        t.add('model', Bootstrap.Entity.Transformer.Labels.Create, labels);

        plugin.applyTransform(t);
    }

    export interface CreateBindingMapProps { label?: string, tag?: any, surface?: Core.Geometry.Surface, theme?: Visualization.Theme, transparency?: Visualization.Theme.Transparency, isWireframe?: boolean, isInteractive?: boolean }
    export const CreateBindingMap = Bootstrap.Tree.Transformer.create<Bootstrap.Entity.Molecule.Model, Bootstrap.Entity.Visual.Surface, CreateBindingMapProps>({
        id: 'primitives-and-labels-example-create-surface',
        name: 'Create Binding Map',
        description: 'Create a binding map.',
        from: [Bootstrap.Entity.Molecule.Model],
        to: [Bootstrap.Entity.Visual.Surface],
        defaultParams: () => ({}),
        isUpdatable: false
    }, (context, a, t) => {
        let theme = t.params.theme!;
        let style: Bootstrap.Visualization.Style<'Surface', {}> = {
            type: 'Surface',
            taskType: 'Silent',
            //isNotSelectable: false,
            params: {},
            theme: <any>void 0
        };

        return Bootstrap.Task.create<Bootstrap.Entity.Visual.Surface>(`Create Surface`, 'Silent', async ctx => {
            let model = await LiteMol.Visualization.Surface.Model.create(t.params.tag, { surface: t.params.surface!, theme, parameters: { isWireframe: t.params.isWireframe! } }).run(ctx);
            return Bootstrap.Entity.Visual.Surface.create(t, { label: t.params.label!, model, style, isSelectable: true, tag: t.params.tag });
        });
    });
}