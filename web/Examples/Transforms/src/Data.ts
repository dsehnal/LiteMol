/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Example.Transforms {

    import Transformer = Bootstrap.Entity.Transformer;

    export function fetch(plugin: Plugin.SimpleController, ids: string[]): Promise<{}> {
        return new Promise(async (res, rej) => {
            
            let ts = ids
                .filter(id => id.length === 4)
                .map(id => id.toLowerCase())
                .map(id => {
                    let t = plugin.createTransform();

                    t.add(plugin.root, <Bootstrap.Tree.Transformer.To<Bootstrap.Entity.Data.Binary | Bootstrap.Entity.Data.String>>Transformer.Data.Download, 
                        { url: `https://webchemdev.ncbr.muni.cz/CoordinateServer/${id}/cartoon?encoding=bcif`, type: 'Binary', id })
                        .then(Transformer.Molecule.CreateFromData, { format: Core.Formats.Molecule.SupportedFormats.mmBCIF }, { isBinding: true });
                    
                    return { id, t };
                })
                .map(({ id, t }) => new Promise<{ id: string, ok: boolean }>(async res => {
                    try {
                        await plugin.applyTransform(t);
                        return { id, ok: true };
                    } catch (e) {
                        return { id, ok: false };
                    }
                }));

            await Promise.all(ts).then(rs => {
                let notOK = rs.filter(r => !r.ok);
                if (notOK.length) {
                    for (let r of notOK) {
                        console.error(r.id + ' not downloaded.');
                    }
                }
            });

            res();
        });
    }

    import Q = Core.Structure.Query;
    export function getSuperpositionData(plugin: Plugin.SimpleController) {
        let models = plugin.context.select(Bootstrap.Tree.Selection.ofType(plugin.root, Bootstrap.Entity.Molecule.Model)) as Bootstrap.Entity.Molecule.Model[];

        let query = Q.atomsByName('CA').inside(Q.entities({ type: 'polymer' })).union();

        let xs = models
            .map(m => ({ model: m.props.model, fragments: m.props.model.query(query) }))
            .filter(x => !!x.fragments.length)
            .map(x => ({ model: x.model, atomIndices: x.fragments.fragments[0].atomIndices  }));

        let maxCommonLength = xs.reduce((m, x) => Math.max(m, x.atomIndices.length), 0);

        for (let x of xs) {
            x.atomIndices = Array.prototype.slice.call(x.atomIndices, 0, maxCommonLength);
        } 

        console.log(xs)

    }
}