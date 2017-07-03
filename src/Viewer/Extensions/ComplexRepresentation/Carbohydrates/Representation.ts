/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Extensions.ComplexReprensetation.Carbohydrates {
    import Struct = Core.Structure
    import Model = Struct.Molecule.Model
    import LA = Core.Geometry.LinearAlgebra
    import Entity = Bootstrap.Entity
    import Tree = Bootstrap.Tree

    export type RepresentationType = 'Icons' | 'Reduced' | 'Hydbrid'

    export interface Link { 
        type: 'Carbohydrate' | 'Terminal', 
        rA: number, 
        rB: number, 
        atomA: number, 
        atomB: number,
        centerA: LA.Vector3,
        centerB: LA.Vector3,
        bondType: Struct.BondType
    }

    export interface Entry {
        representation: Mapping.RepresentationEntry,
        ringCenter: LA.Vector3,
        ringRadius: number,
        ringAtoms: number[],
        links: Link[],
        terminalLinks: Link[]        
    }

    export interface Info {
        links: Link[],
        map: Core.Utils.FastMap<number, number>,
        entries: Entry[],
        carbohydrateIndices: number[],
        terminalIndices: number[],
        warnings: string[]
    }

    export type FullParams = { type: 'Full', fullSize: 'Small' | 'Medium' | 'Large', showTerminalLinks: boolean, showTerminalAtoms: boolean, linkColor: Visualization.Color }
    export type IconsParams = { type: 'Icons', iconScale: number } 
    export type Params = FullParams | IconsParams

    export const Types: Params['type'][] = ['Icons', 'Full']
    export const FullSizes: FullParams['fullSize'][] = ['Small', 'Medium', 'Large']
    export const DefaultIconsParams: Params = { type: 'Icons', iconScale: 0.55 }
    export const DefaultFullParams: Params = { type: 'Full', fullSize: 'Medium', linkColor: Visualization.Color.fromRgb(255*0.6, 255*0.6, 255*0.6), showTerminalLinks: true, showTerminalAtoms: false }

    export type Tags = { type: 'CarbohydrateRepresentation', tags: Core.Utils.FastMap<number, Tag>, colors: Core.Utils.FastMap<number, Visualization.Color> }
    export type Tag = { type: 'Link', link: Link } | { type: 'Residue', instanceName: string, residueIndex: number, model: Model } | { type: 'Terminal', residueIndex: number, model: Model }

    export function isRepresentable(model: Model, residueIndices: number[]) {
        const { name } = model.data.residues;
        for (const rI of residueIndices) {
            if (!Mapping.isResidueRepresentable(name[rI])) return true;
        }
        return false;
    }

    export namespace Transforms {
        export interface CarbohydratesInfo extends Entity<{ info: Info }> { }
        export const CarbohydratesInfo = Entity.create<{ info: Info }>({ name: 'Carbohydrate Information', typeClass: 'Object', shortName: 'CI', description: 'Information about carbohydrate residues.' });

        export const CreateInfo = Tree.Transformer.create<Entity.Molecule.Model, CarbohydratesInfo, { info: Info }>({
            id: 'carbohydrate-representation-create-info',
            name: 'Carbohydrates',
            description: 'Information about carbohydrate residues.',
            from: [Entity.Molecule.Model],
            to: [CarbohydratesInfo],
            isApplicable: () => false,
            isUpdatable: false,
            defaultParams: () => ({} as any)
        }, (ctx, a, t) => {
            return Bootstrap.Task.resolve('Carbohydrates', 'Silent', CarbohydratesInfo.create(t, { label: 'Carbohydrates',  info: t.params.info }));
        });

        export const CreateVisual = Tree.Transformer.create<CarbohydratesInfo, Entity.Visual.Surface, Params>({
            id: 'carbohydrate-representation-create-visual',
            name: '3D-SNFG',
            description: 'Create carbohydrate representation using 3D-SNFG shapes.',
            from: [CarbohydratesInfo],
            to: [Entity.Visual.Surface],
            isUpdatable: true,
            defaultParams: () => DefaultFullParams
        }, (ctx, a, t) => {
            return Bootstrap.Task.create<Entity.Visual.Surface>('Carbohydrate Representation', 'Background', async ctx => {
                const model = Bootstrap.Utils.Molecule.findModel(a);
                if (!model) throw Error('Carbohydrate representation requires a Molecule.Model entity ancestor.');
                const { surface, theme, tags: tag } = getRepresentation(model.props.model, a.props.info, t.params);            
                const visual = await LiteMol.Visualization.Surface.Model.create(a, { surface: await surface.run(ctx), theme }).run(ctx);
                const style: Bootstrap.Visualization.Style<'Surface', {}> = { type: 'Surface', taskType: 'Background', params: {}, theme: <any>void 0 };            
                return Bootstrap.Entity.Visual.Surface.create(t, {  label: '3D-SNFG',  model: visual,  style,  isSelectable: true, tag });
            }).setReportTime(true);
        },(ctx, b, t) => {
            const oldParams = { ...b.transform.params } as Params;
            const newParams = { ...t.params } as Params;

            if (oldParams.type !== 'Full' || newParams.type !== 'Full') return void 0;
            delete oldParams.linkColor;
            delete newParams.linkColor;

            if (!Bootstrap.Utils.deepEqual(oldParams, newParams)) return void 0;

            const { colors } = b.props.tag as Tags;
            const colorMapping = Visualization.Theme.createColorMapMapping(i => i, colors, t.params.type === 'Full' ? t.params.linkColor : Visualization.Color.fromHexString('#666666'));
            const theme = Visualization.Theme.createMapping(colorMapping);
            b.props.model.applyTheme(theme);
            return Bootstrap.Task.resolve(t.transformer.info.name, 'Background', Tree.Node.Null);
        });
    }

    export const EmptyInto: Info = { links: [], map: Core.Utils.FastMap.create(), entries: [], carbohydrateIndices: [], terminalIndices: [], warnings: [] };

    export function getInfo(params: {
        model: Model, 
        fragment: Struct.Query.Fragment,
        atomMask: Core.Utils.Mask,
        bonds: Struct.BondTable
    }): Info {
        const { model, fragment, atomMask, bonds } = params;
        const { residueIndices: carbohydrateIndices, entries, warnings } = getRepresentableResidues(model, fragment.residueIndices);
        if (!carbohydrateIndices.length) {
            return EmptyInto;
        };

        const map = Core.Utils.FastMap.create<number, number>();
        for (let i = 0, __i = carbohydrateIndices.length; i < __i; i++) {
            map.set(carbohydrateIndices[i], i);
        }

        const { links, terminalIndices } = findLinks({ model, atomMask, bonds, carbohydrateMap: map, entries });
        return { links, map, entries, carbohydrateIndices, terminalIndices, warnings };        
    }

    export function getRepresentation(model: Model, info: Info, params: Params) {
        const { carbohydrateIndices, entries, links } = info
        const shapes = Visualization.Primitive.Builder.create();
        const tags = Core.Utils.FastMap.create<number, Tag>();
        const colors = Core.Utils.FastMap.create<number, Visualization.Color>(); 

        const scale = params.type === 'Full'
            ? params.fullSize === 'Small' ? 0.55 : params.fullSize === 'Medium' ? 0.75 : 1.1
            : params.iconScale;

        let id = 0;
        for (let i = 0; i < carbohydrateIndices.length; i++) {
            const { representation } = entries[i];
            const ts = Shapes.makeTransform(model, entries[i], scale, params.type);

            let colorIndex = 0;
            for (const surface of representation.shape) {
                colors.set(id, representation.color[colorIndex++]);
                tags.set(id, { type: 'Residue', instanceName: representation.instanceName, residueIndex: carbohydrateIndices[i], model });
                shapes.add({ type: 'Surface', surface, id: id++, ...ts });
            }
        }

        if (params.type === 'Full') {
            const { showTerminalLinks, showTerminalAtoms } = params;
            const linkRadius = params.fullSize === 'Small' ? 0.12 : params.fullSize === 'Medium' ? 0.2 : 0.28
            for (const link of links) {
                switch (link.type) {
                    case 'Carbohydrate': {
                        const { centerA: a, centerB: b } = link;
                        shapes.add({ type: 'Tube', id: id++, radius: linkRadius, slices: 12, a, b });
                        break;
                    }
                    case 'Terminal': {
                        if (!showTerminalLinks) continue;
                        
                        const { rB, bondType, centerA: a, centerB: b } = link;
                        if (Struct.isBondTypeCovalent(bondType)) {
                            shapes.add({ type: 'Tube', id: id++, radius: linkRadius / 2, slices: 8, a, b });
                        } else {
                            shapes.add({ type: 'DashedLine', id: id++, width: linkRadius / 2, dashSize: 0.33, spaceSize: 0.33, a, b });
                        }

                        if (showTerminalAtoms) {
                            const atomRadius = 2 * linkRadius;
                            tags.set(id, { type: 'Terminal', residueIndex: rB, model });
                            shapes.add({ type: 'Surface', surface: Shapes.Sphere, id: id++, scale: [atomRadius, atomRadius, atomRadius], translation: b });
                        }

                        break;
                    }
                }
            }
        }

        const colorMapping = Visualization.Theme.createColorMapMapping(i => i, colors, params.type === 'Full' ? params.linkColor : Visualization.Color.fromHexString('#666666'));
        const theme = Visualization.Theme.createMapping(colorMapping);
        const surfTags: Tags =  { type: 'CarbohydrateRepresentation', tags, colors };

        return {
            surface: shapes.buildSurface(),
            tags: surfTags,
            theme
        }
    }

    function swapLink(link: Link): Link {
        return {
            type: link.type,
            rA: link.rB,
            rB: link.rA,
            atomA: link.atomB,
            atomB: link.atomA,
            centerA: link.centerB,
            centerB: link.centerA,
            bondType: link.bondType
        };
    }

    function findLinks(params: {
        model: Model,
        bonds: Struct.BondTable,
        atomMask: Core.Utils.Mask,
        carbohydrateMap: Core.Utils.FastMap<number, number>,
        entries: Entry[]
    }) {
        const { model, bonds, atomMask, carbohydrateMap, entries } = params;
        const { atomAIndex, atomBIndex, type } = bonds;
        const { residueIndex } = model.data.atoms;
        const { x, y, z } = model.positions;

        const existingPairs = Core.Utils.FastSet.create<string>();

        const links: Link[] = [];
        const terminalIndices = Core.Utils.UniqueArray<number>();

        for (let i = 0, _ic = bonds.count; i < _ic; i++) {
            const _a = atomAIndex[i], _b = atomBIndex[i];
            if (!atomMask.has(_a) || !atomMask.has(_b)) continue;

            const a = Math.min(_a, _b), b = Math.max(_a, _b);

            const rA = residueIndex[a], rB = residueIndex[b];
            const hasA = carbohydrateMap.has(rA), hasB = carbohydrateMap.has(rB);
            const bondType = type[i];
            if (hasA && hasB) {
                if (rA === rB) continue;
                const key = `${rA} ${rB}`
                if (existingPairs.has(key)) continue;
                existingPairs.add(key);
                const e1 = entries[carbohydrateMap.get(rA)!], e2 = entries[carbohydrateMap.get(rB)!];
                const link: Link = { type: 'Carbohydrate', rA, rB, atomA: a, atomB: b, centerA: e1.ringCenter, centerB: e2.ringCenter, bondType };
                links.push(link);
                e1.links.push(link);
                e2.links.push(swapLink(link));
            } else if (hasA) {                
                const e1 = entries[carbohydrateMap.get(rA)!];
                const link: Link = { type: 'Terminal', rA, rB, atomA: a, atomB: b, centerA: e1.ringCenter, centerB: LA.Vector3(x[b], y[b], z[b]), bondType };
                links.push(link);
                e1.terminalLinks.push(link);
                Core.Utils.UniqueArray.add(terminalIndices, rB);
            } else if (hasB) {
                const e2 = entries[carbohydrateMap.get(rB)!];
                const link: Link = { type: 'Terminal', rA: rB, rB: rA, atomA: b, atomB: a, centerA: e2.ringCenter, centerB: LA.Vector3(x[a], y[a], z[a]), bondType };
                links.push(link);
                e2.terminalLinks.push(link);
                Core.Utils.UniqueArray.add(terminalIndices, rA);
            }
        }

        return { links, terminalIndices: terminalIndices.array };
    }

    function warn(model: Model, rI: number) {
        return `Residue '${formatResidueName(model, rI)}' has a recognized carbohydrate name, but missing/incorrectly named ring atoms.`;
    }

    function getRepresentableResidues(model: Model, sourceResidueIndices: number[]) {
        const { name } = model.data.residues;
        const residueIndices = [], entries: Entry[] = [], warnings: string[] = [];
        for (const rI of sourceResidueIndices) {            
            if (!Mapping.isResidueRepresentable(name[rI])) continue;
            const possibleRingAtoms = getRingAtoms(model, rI);
            if (!possibleRingAtoms.length) {
                warnings.push(warn(model, rI));
                continue;
            }

            let added = false;
            for (const ringAtoms of possibleRingAtoms) {
                const ringCenter = LA.Vector3.zero();
                const ringRadius = Bootstrap.Utils.Molecule.getCentroidAndRadius(model, ringAtoms, ringCenter);
                if (ringRadius > 1.95) {
                    continue;
                }
                residueIndices.push(rI);
                entries.push({ representation: Mapping.getResidueRepresentation(name[rI])!, ringAtoms, ringCenter, ringRadius, links: [], terminalLinks: [] });
                added = true;
                break;
            }
            if (!added) {
                warnings.push(warn(model, rI));
            }
        }
        return { residueIndices, entries, warnings };
    }

    function getRingAtoms(model: Model, rI: number) {
        const { atomStartIndex, atomEndIndex } = model.data.residues;
        const { name } = model.data.atoms;
        const ret = [];
        for (const names of Mapping.RingNames) {
            const atoms = [];
            let found = 0;
            for (let i = 0; i < names.__len; i++) atoms.push(0);
            for (let aI = atomStartIndex[rI], _b = atomEndIndex[rI]; aI < _b; aI++) {
                const idx = names[name[aI]];
                if (idx === void 0) continue;
                atoms[idx] = aI;
                found++;
                if (found === atoms.length) ret.push(atoms);
            }
        }

        return ret;
    }
}