/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

import LiteMol from '../../../Core'
/*
  If litemol directory is present in the ./node_modules folder, it is 
  possible to use 

    import LiteMol from 'LiteMol/Core'
*/

import * as https from 'https'

// this does not check for failures.
function download(url: string) {
    return new Promise<string>(resolve => {
        let req = https.get(url, res => {
            let content = '';
            res.setEncoding("utf8");
            res.on("data", chunk => content += chunk);
            res.on("end", () => resolve(content));
        });
        req.end();
    });
}

// Parse the CIF data, sum X coords in _atom_site and print it.
function analyze(data: string) {
    let parsed = LiteMol.Formats.CIF.Text.parse(data);
    if (parsed.isError) {
        console.log(parsed.toString());
        return;
    } 

    try {
        let model = LiteMol.Formats.Molecule.mmCIF.ofDataBlock(parsed.result.dataBlocks[0]).models[0];

        let ps = model.positions;
        let { x } = ps;
        let sum = 0;
        for (let i = 0, l = model.positions.count; i < l; i++) {
            sum += x[i] + ps.getRow(i).y;
        }
        console.log(parsed.result.dataBlocks[0].header);
        console.log('Atom Count: ', model.positions.count);
        console.log('Sum of X and Y coords: ', sum);
    } catch (e) {
        console.log('Parse error: ' + e);
    }
} 

(async function () {
    let data = await download('https://www.ebi.ac.uk/pdbe/static/entry/1cbs_updated.cif');
    analyze(data);
})();

