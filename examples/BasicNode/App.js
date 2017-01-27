/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Core_1 = require("../../../Core");
/*
  If litemol directory is present in the ./node_modules folder, it is
  possible to use

    import LiteMol from 'LiteMol/Core'
*/
const https = require("https");
// this does not check for failures.
function download(url) {
    return new Promise(resolve => {
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
function analyze(data) {
    let parsed = Core_1.default.Formats.CIF.Text.parse(data);
    if (parsed.isError) {
        console.log(parsed.toString());
        return;
    }
    try {
        let model = Core_1.default.Formats.Molecule.mmCIF.ofDataBlock(parsed.result.dataBlocks[0]).models[0];
        // or in async funcion
        // let model = await LiteMol.Formats.Molecule.SupportedFormats.mmCIF.parse(data).run(); // returns a ParserResult<Molecule> object
        let ps = model.positions;
        let atoms = model.data.atoms;
        let { x } = ps;
        let sum = 0;
        for (let i = 0, l = model.positions.count; i < l; i++) {
            let row = ps.getRow(i);
            sum += x[i]; // access thru array
            sum += row.y + row.z; // access thru mutable row reader
        }
        console.log(parsed.result.dataBlocks[0].header);
        console.log('Atom Count: ', model.positions.count);
        console.log('Sum of X Y Z coords: ', sum);
    }
    catch (e) {
        console.log('Parse error: ' + e);
    }
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        let data = yield download('https://www.ebi.ac.uk/pdbe/static/entry/1cbs_updated.cif');
        analyze(data);
    });
})();
