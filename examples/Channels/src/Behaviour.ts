/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Example.Channels.Behaviour {
    import Rx = Bootstrap.Rx;
    import Interactivity = Bootstrap.Interactivity;
    import Vec3 = Core.Geometry.LinearAlgebra.Vector3;

    export const CavityTheme = {
        inner: Visualization.Theme.createUniform({ 
            colors: LiteMol.Core.Utils.FastMap.ofArray<string, LiteMol.Visualization.Color>([['Uniform', Visualization.Color.fromHex(0x999999)]]),
            transparency: { alpha: 0.33 }
        }),
        boundary: Visualization.Theme.createUniform({ 
            colors: LiteMol.Core.Utils.FastMap.ofArray<string, LiteMol.Visualization.Color>([['Uniform', Visualization.Color.fromHex(0x90ee90)]]),
            transparency: { alpha: 0.66 }
        }),
        selectableBoundary: Visualization.Theme.createUniform({ 
            colors: LiteMol.Core.Utils.FastMap.ofArray<string, LiteMol.Visualization.Color>([['Uniform', Visualization.Color.fromHex(0xee3010)]]),
            transparency: { alpha: 1.0 }
        })
    };

    export function getTriangleCenter({ vertices: vs, triangleIndices: ts }: Core.Geometry.Surface, tI: number) {
        const c = Vec3.zero();
        for (let i = 0; i < 3; i++) {
            const v = 3 * tI + i;          
            Vec3.add(c, c, Vec3(vs[3 * v], vs[3 * v + 1], vs[3 * v + 2]));
        }
        return Vec3.scale(c, c, 1 / 3);
    }

    export function vec3str(v: Vec3) {
        return `(${v[0].toFixed(2)}, ${v[1].toFixed(2)}, ${v[2].toFixed(2)})`
    }

    export function createSelectEvent(plugin: Plugin.Controller): Rx.Observable<State.SelectableElement> {
        return plugin.context.behaviours.click.map<State.SelectableElement>(info => {
            if (!info || Interactivity.isEmpty(info)) {
                return { kind: 'nothing' };
            }
            if (info.source.type === Bootstrap.Entity.Visual.Surface) {            
                const tag = (info.source as Bootstrap.Entity.Visual.Surface).props.tag as State.SurfaceTag;
                if (!tag || tag.kind !== 'Cavity-boundary') return { kind: 'nothing' };
                return { kind: 'point', data: getTriangleCenter(tag.surface, info.elements[0]) };
            } else if (Interactivity.Molecule.isMoleculeModelInteractivity(info)) {
                return { kind: 'molecule', data: Interactivity.Molecule.transformInteraction(info)! };
            }
            return { kind: 'nothing' };
        });
    }

    export function initCavityBoundaryToggle(plugin: Plugin.Controller) {
        const boundaries = Bootstrap.Tree.Selection
            .byRef('mole-data')
            .subtree()
            .ofType(Bootstrap.Entity.Visual.Surface)
            .filter(n => n.props.tag && (n.props.tag as State.SurfaceTag).kind === 'Cavity-boundary')

        const getModels = () => plugin.selectEntities(boundaries).map(e => (e as Bootstrap.Entity.Visual.Surface).props.model);

        let ctrlPressed = false;
        window.addEventListener('keydown', e => {
            if (ctrlPressed || !e.ctrlKey) return;

            ctrlPressed = true;
            getModels().forEach(m => m.applyTheme(CavityTheme.selectableBoundary));
        });

        window.addEventListener('keyup', e => {
            if (ctrlPressed && !e.ctrlKey) {
                ctrlPressed = false;
                getModels().forEach(m => m.applyTheme(CavityTheme.boundary));
            }
        })
    }
}