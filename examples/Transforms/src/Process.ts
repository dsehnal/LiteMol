/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Example.Transforms {

    import Transformer = Bootstrap.Entity.Transformer;

    export function fetch(plugin: Plugin.Controller, ids: string[], createVisuals = false): Promise<{}> {
        return new Promise(async (res, rej) => {
            
            let ts = ids
                .filter(id => id.length === 4)
                .map(id => id.toLowerCase())
                .map(id => {
                    let t = plugin.createTransform();

                    // download cartoon representation data from the CoordinateServer and parse the result
                    let model = t.add(plugin.root, Transformer.Data.Download, { url: `https://cs.litemol.org/${id}/cartoon?encoding=bcif`, type: 'Binary', id })
                        .then(Transformer.Molecule.CreateFromData, { format: Core.Formats.Molecule.SupportedFormats.mmBCIF }, { isBinding: true })
                        .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, { ref: id /* makes it easier to reference later */ });

                    if (createVisuals) {
                        model.then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, het: true }, {});
                    }
                    
                    return { id, t };
                })
                .map(({ id, t }) => new Promise<{ id: string, ok: boolean }>(async res => {
                    try {
                        await plugin.applyTransform(t);
                        res({ id, ok: true });
                    } catch (e) {
                        res({ id, ok: false });
                    }
                }));

            let rs = await Promise.all(ts);          

            let notOK = rs.filter(r => !r.ok);
            if (notOK.length) {
                // in a real application, instead of just
                // reporting an error, you would want to 
                // retry the download.
                for (let r of notOK) {
                    console.error(r.id + ' not downloaded.');
                }
            }

            if (createVisuals) {
                // Reset the camera so that all the models are visible.
                plugin.command(Bootstrap.Command.Visual.ResetScene);
            }
            
            res();
        });
    }

    import Q = Core.Structure.Query;

    export interface SuperpositionEntry extends Comparison.Structure.RmsdTransformByIndicesEntry {
        id: string
    }

    export function getSuperpositionData(plugin: Plugin.Controller): SuperpositionEntry[] {
        // selects all the Models that were downloaded
        let models = plugin.context.select(Bootstrap.Tree.Selection.subtree(plugin.root).ofType(Bootstrap.Entity.Molecule.Model)) as Bootstrap.Entity.Molecule.Model[];
        
        // Find CA atoms inside polymer entities
        let query = Q.atomsByName('CA').inside(Q.entities({ type: 'polymer' })).union();
        let xs = models
            .map(m => ({ id: m.ref, model: m.props.model, fragments: Q.apply(query, m.props.model) }))
            .filter(x => !!x.fragments.length)
            .map(x => ({ id: x.id, model: x.model, atomIndices: x.fragments.fragments[0].atomIndices  }));

        if (!xs.length) {
            throw new Error("No valid molecules.");
        }

        // Find the maximum number of common CA atoms
        let maxCommonLength = xs.reduce((m, x) => Math.min(m, x.atomIndices.length), xs[0].atomIndices.length);

        if (!maxCommonLength) {
            throw new Error("One or more molecules has 0 CA atoms.");
        }

        // Take the common CA atoms 
        for (let x of xs) {
            x.atomIndices = Array.prototype.slice.call(x.atomIndices, 0, maxCommonLength);
        } 

        return xs;
    }

    export function applyTransforms(plugin: Plugin.Controller, data: SuperpositionEntry[], superposition: Comparison.Structure.RmsdTransformByIndicesResult) {

        // create the model for the first molecule.
        let first = plugin.createTransform();
        first.add(plugin.context.select(data[0].id)[0] as Bootstrap.Entity.Molecule.Model,
                Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, het: true }, {});
        plugin.applyTransform(first);

        for (let i = 1; i < data.length; i++) {
            let t = plugin.createTransform();

            // apply the coorresponding 4x4 transform and create a visual.
            // the transform matrix is stored as a 1d array using culumn major order.
            t.add(plugin.context.select(data[i].id)[0] as Bootstrap.Entity.Molecule.Model, 
                Bootstrap.Entity.Transformer.Molecule.ModelTransform3D, { transform: superposition.transforms[i - 1].bTransform }, { })
              .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, het: true }, {});
            plugin.applyTransform(t);
        }

        // Reset the camera so that all the models are visible. 
        plugin.command(Bootstrap.Command.Visual.ResetScene);
    }
}