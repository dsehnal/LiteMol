/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Example.Channels.State {
    import Transformer = Bootstrap.Entity.Transformer;

    export type SelectableElement = 
        | { kind: 'nothing' }
        | { kind: 'molecule', data: Bootstrap.Interactivity.Molecule.SelectionInfo }
        | { kind: 'point', data: number[] }

    export interface AppState {
        plugin: Plugin.Controller,
        events: {
            select: Bootstrap.Rx.Observable<SelectableElement>
        }
    }

    export function AppState(plugin: Plugin.Controller): AppState {
        Behaviour.initCavityBoundaryToggle(plugin);
        return {
            plugin,
            events: {
                select: Behaviour.createSelectEvent(plugin)
            }
        };
    }

    export type SurfaceTag =
        | { kind: 'Channel' | 'Cavity-inner' | 'Origins', element: any }
        | { kind: 'Cavity-boundary', element: any, surface: Core.Geometry.Surface }

    function showDefaultVisuals(plugin: Plugin.Controller, data: any, channelCount: number) {
        return new Promise(res =>
            showChannelVisuals(plugin, data.Channels.Tunnels.slice(0, channelCount), true).then(() => {
                let cavity = data.Cavities.Cavities[0];
                if (cavity) {
                    showCavityVisuals(plugin, [cavity], true).then(() => res());
                }
            }));
    }

    export function loadData(plugin: Plugin.Controller, pdbId: string, url: string) {
        return new Promise<any>((res, rej) => {
            plugin.clear();

            let model = plugin.createTransform()
                .add(plugin.root, Transformer.Data.Download, { url: `https://www.ebi.ac.uk/pdbe/static/entry/${pdbId}_updated.cif`, type: 'String', id: pdbId })
                .then(Transformer.Molecule.CreateFromData, { format: Core.Formats.Molecule.SupportedFormats.mmCIF }, { isBinding: true })
                .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
                .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true })

            let data = plugin.createTransform().add(plugin.root, Transformer.Data.Download, { url, type: 'String', id: 'MOLE Data' }, { isHidden: true })
                .then(Transformer.Data.ParseJson, { id: 'MOLE Data' }, { ref: 'mole-data' });

            plugin.applyTransform(model)
                .then(() => {
                    plugin.command(Bootstrap.Command.Entity.Focus, plugin.context.select('polymer-visual'));
                });

            plugin.applyTransform(data)
                .then(() => {
                    let data = plugin.context.select('mole-data')[0] as Bootstrap.Entity.Data.Json;
                    if (!data) rej('Data not available.');
                    else {
                        showDefaultVisuals(plugin, data.props.data, 2).then(() => res(data.props.data));
                    }
                })
                .catch(e => rej(e));
        });
    }

    function createSurface(mesh: any) {
        // wrap the vertices in typed arrays
        if (!(mesh.Vertices instanceof Float32Array)) {
            mesh.Vertices = new Float32Array(mesh.Vertices);
        }
        if (!(mesh.Vertices instanceof Uint32Array)) {
            mesh.Triangles = new Uint32Array(mesh.Triangles);
        }

        let surface = <Core.Geometry.Surface>{
            vertices: mesh.Vertices,
            vertexCount: (mesh.Vertices.length / 3) | 0,
            triangleIndices: new Uint32Array(mesh.Triangles),
            triangleCount: (mesh.Triangles.length / 3) | 0,
        };

        return surface;
    }

    function createTriangleSurface(mesh: any) {
        const triangleCount = (mesh.Triangles.length / 3) | 0;
        const vertexCount = triangleCount * 3;

        const srcV = mesh.Vertices;
        const srcT = mesh.Triangles;

        const vertices = new Float32Array(vertexCount * 3);
        const triangleIndices = new Uint32Array(triangleCount * 3);
        const annotation = new Int32Array(vertexCount) as any as number[];

        const tri = [0,0,0];
        for (let i = 0, _i = mesh.Triangles.length; i < _i; i += 3) {
            tri[0] = srcT[i]; tri[1] = srcT[i + 1]; tri[2] = srcT[i + 2];

            for (let j = 0; j < 3; j++) {
                const v = i + j;
                vertices[3 * v] =  srcV[3 * tri[j]];
                vertices[3 * v + 1] =  srcV[3 * tri[j] + 1];
                vertices[3 * v + 2] =  srcV[3 * tri[j] + 2];
                triangleIndices[i + j] = i + j;
            }
        }
        for (let i = 0; i < triangleCount; i++) {
            for (let j = 0; j < 3; j++) annotation[3 * i + j] = i;
        }

        const surface = <Core.Geometry.Surface>{
            vertices,
            vertexCount,
            triangleIndices,
            triangleCount,
            annotation
        };

        return surface;
    }

    let colorIndex = Visualization.Molecule.Colors.DefaultPallete.length - 1;
    function nextColor() {
        return Visualization.Color.random();

        // can use the build in palette for example like this:
        // let color = Visualization.Molecule.Colors.DefaultPallete[colorIndex];
        // colorIndex--;
        // if (colorIndex < 0) colorIndex = Visualization.Molecule.Colors.DefaultPallete.length - 1;
        // return color;
    }

    function showSurfaceVisuals(plugin: Plugin.Controller, elements: any[], visible: boolean, type: 'Cavity' | 'Channel', label: (e: any) => string): Promise<any> {
        // I am modifying the original JSON response. In general this is not a very good
        // idea and should be avoided in "real" apps.

        let t = plugin.createTransform();
        let needsApply = false;

        for (let element of elements) {
            if (!element.__id) element.__id = Bootstrap.Utils.generateUUID();
            if (!!element.__isVisible === visible) continue;

            element.__isVisible = visible;
            if (!element.__color) {
                // the colors should probably be initialized when the data is loaded
                // so that they are deterministic...
                element.__color = nextColor();
            }

            if (!visible) {
                plugin.command(Bootstrap.Command.Tree.RemoveNode, element.__id);
            } else if (type === 'Cavity') {
                const boundarySurface = createTriangleSurface(element.Mesh.Boundary);

                const group = t.add('mole-data', Transformer.Basic.CreateGroup, { }, { ref: element.__id, isHidden: true });
                group.then(Transformer.Basic.CreateSurfaceVisual, {
                    label: label(element),
                    tag: <SurfaceTag>{ kind: 'Cavity-boundary', element, surface: boundarySurface },
                    surface: boundarySurface,
                    theme: Behaviour.CavityTheme.boundary
                });
                group.then(Transformer.Basic.CreateSurfaceVisual, {
                    label: label(element),
                    tag: <SurfaceTag>{ kind: 'Cavity-inner', element },
                    surface: createSurface(element.Mesh.Inner),
                    theme: Behaviour.CavityTheme.inner
                });
                needsApply = true;
            } else if (type === 'Channel') {
                let surface = createSurface(element.Mesh);
                t.add('mole-data', Transformer.Basic.CreateSurfaceVisual, {
                    label: label(element),
                    tag: <SurfaceTag>{ kind: 'Channel', element },
                    surface,
                    theme: Visualization.Theme.createUniform({ 
                        colors: LiteMol.Core.Utils.FastMap.ofArray<string, LiteMol.Visualization.Color>([['Uniform', element.__color as Visualization.Color]]),
                        transparency: { alpha: 1.0 }
                    })
                }, { ref: element.__id, isHidden: true });
                needsApply = true;
            }
        }

        if (needsApply) {
            return new Promise<any>((res, rej) => {
                plugin.applyTransform(t).then(() => {
                    for (let element of elements) {
                        element.__isBusy = false;
                    }
                    res();
                }).catch(e => rej(e));
            });
        }
        else {
            return new Promise<any>((res, rej) => {
                for (let element of elements) {
                    element.__isBusy = false;
                }
                res();
            });
        }
    }

    export function showCavityVisuals(plugin: Plugin.Controller, cavities: any[], visible: boolean): Promise<any> {
        return showSurfaceVisuals(plugin, cavities, visible, 'Cavity', (cavity: any) => `${cavity.Type} ${cavity.Id}`);
    }

    export function showChannelVisuals(plugin: Plugin.Controller, channels: any[], visible: boolean): Promise<any> {
        return showSurfaceVisuals(plugin, channels, visible, 'Channel', (channel: any) => `${channel.Type} ${channel.Id}`);
    }

    function createOriginsSurface(origins: any): Promise<Core.Geometry.Surface> {
        if (origins.__surface) return Promise.resolve(origins.__surface);

        let s = Visualization.Primitive.Builder.create();
        let id = 0;
        for (let p of origins.Points) {
            s.add({ type: 'Sphere', id: id++, radius: 1.69, center: [p.X, p.Y, p.Z] });
        }
        return s.buildSurface().run();        
    }

    export function showOriginsSurface(plugin: Plugin.Controller, origins: any, visible: boolean): Promise<any> {
        if (!origins.__id) origins.__id = Bootstrap.Utils.generateUUID();
        if (!origins.Points.length || !!origins.__isVisible === visible) return Promise.resolve();

        origins.__isVisible = visible;
        if (!visible) {
            plugin.command(Bootstrap.Command.Tree.RemoveNode, origins.__id);
            origins.__isBusy = false;
            return Promise.resolve();
        }

        if (!origins.__color) {
            // the colors should probably be initialized when the data is loaded
            // so that they are deterministic...
            origins.__color = nextColor();
        }

        return new Promise((res, rej) => {
            createOriginsSurface(origins).then(surface => {
                let t = plugin.createTransform()
                    .add('mole-data', Transformer.Basic.CreateSurfaceVisual, {
                        label: 'Origins ' + origins.Type,
                        tag: <SurfaceTag>{ kind: 'Origins', element: origins },
                        surface,
                        theme: Visualization.Theme.createUniform({ 
                            colors: LiteMol.Core.Utils.FastMap.ofArray<string, LiteMol.Visualization.Color>([['Uniform', origins.__color as Visualization.Color]])
                        })
                    }, { ref: origins.__id, isHidden: true });
                
                plugin.applyTransform(t).then(() => {
                    origins.__isBusy = false;
                    res();
                }).catch(rej);
            }).catch(rej);
        });
    }
}