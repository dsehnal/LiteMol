var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        Viewer.VERSION = { number: "1.1.14", date: "Dec 3 2016" };
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var DataSources;
        (function (DataSources) {
            var Bootstrap = LiteMol.Bootstrap;
            var Entity = Bootstrap.Entity;
            DataSources.DownloadMolecule = Entity.Transformer.Molecule.downloadMoleculeSource({
                sourceId: 'url-molecule',
                name: 'URL',
                description: 'Download a molecule from the specified Url (if the host server supports cross domain requests).',
                defaultId: 'https://webchemdev.ncbr.muni.cz/CoordinateServer/1tqn/cartoon',
                urlTemplate: function (id) { return id; },
                isFullUrl: true
            });
        })(DataSources = Viewer.DataSources || (Viewer.DataSources = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var ValidatorDB;
        (function (ValidatorDB) {
            var Entity = LiteMol.Bootstrap.Entity;
            var Transformer = LiteMol.Bootstrap.Entity.Transformer;
            ValidatorDB.Report = Entity.create({ name: 'Ligand Validation Report', typeClass: 'Behaviour', shortName: 'VR', description: 'Represents ValidatorDB ligand validation report.' });
            var Api;
            (function (Api) {
                function getResidueId(id, out) {
                    var fields = id.split(' ');
                    out.authSeqNumber = +fields[1];
                    out.authAsymId = fields[2];
                }
                function getAtomId(id) {
                    return +id.split(' ')[2];
                }
                var RedFlags = new Set(['Missing', 'NotAnalyzed']);
                function isRed(flags) {
                    for (var _i = 0, flags_1 = flags; _i < flags_1.length; _i++) {
                        var f = flags_1[_i];
                        if (RedFlags.has(f))
                            return true;
                    }
                    return false;
                }
                function createReport(data) {
                    var report = new Map();
                    if (!data.Models)
                        return report;
                    var residue = { authSeqNumber: 0, authAsymId: '' };
                    var emptySet = new Set();
                    for (var _i = 0, _a = data.Models; _i < _a.length; _i++) {
                        var model = _a[_i];
                        for (var _b = 0, _c = model.Entries; _b < _c.length; _b++) {
                            var entry = _c[_b];
                            if (!entry.MainResidue)
                                continue;
                            getResidueId(entry.MainResidue, residue);
                            var residueReport = report.get(residue.authAsymId);
                            if (residueReport === void 0) {
                                residueReport = new Map();
                                report.set(residue.authAsymId, residueReport);
                            }
                            var flags = [];
                            if (entry.Flags.indexOf('Missing_Atoms') >= 0)
                                flags.push('Missing Atoms');
                            if (entry.Flags.indexOf('Missing_Rings') >= 0)
                                flags.push('Missing Rings');
                            if (entry.Flags.indexOf('Missing_Degenerate') >= 0)
                                flags.push('Degenerate');
                            if (entry.Flags.indexOf('HasAll_BadChirality') >= 0)
                                flags.push('Bad Chirality');
                            if (!flags.length)
                                flags.push('No Issue');
                            var chiralityMismatchSet = void 0;
                            var chiralityMismatches = entry.ChiralityMismatches;
                            for (var _d = 0, _e = Object.keys(chiralityMismatches); _d < _e.length; _d++) {
                                var _m = _e[_d];
                                if (!Object.prototype.hasOwnProperty.call(chiralityMismatches, _m))
                                    continue;
                                var a = chiralityMismatches[_m];
                                if (!chiralityMismatchSet)
                                    chiralityMismatchSet = new Set();
                                chiralityMismatchSet.add(getAtomId(a));
                            }
                            residueReport.set(residue.authSeqNumber, {
                                isRed: isRed(entry.Flags),
                                flags: flags,
                                chiralityMismatches: chiralityMismatchSet ? chiralityMismatchSet : emptySet
                            });
                        }
                    }
                    return report;
                }
                Api.createReport = createReport;
            })(Api || (Api = {}));
            var Interactivity;
            (function (Interactivity) {
                var Behaviour = (function () {
                    function Behaviour(context, report) {
                        var _this = this;
                        this.context = context;
                        this.report = report;
                        this.provider = function (info) {
                            try {
                                return _this.processInfo(info);
                            }
                            catch (e) {
                                console.error('Error showing validation label', e);
                                return void 0;
                            }
                        };
                    }
                    Behaviour.prototype.dispose = function () {
                        this.context.highlight.removeProvider(this.provider);
                    };
                    Behaviour.prototype.register = function (behaviour) {
                        this.context.highlight.addProvider(this.provider);
                    };
                    Behaviour.prototype.processInfo = function (info) {
                        var i = LiteMol.Bootstrap.Interactivity.Molecule.transformInteraction(info);
                        if (!i || i.residues.length > 1)
                            return void 0;
                        var r = this.report;
                        if (i.atoms.length === 1) {
                            var a = i.atoms[0];
                            var chain = r.get(a.residue.chain.authAsymId);
                            var residue = chain ? chain.get(a.residue.authSeqNumber) : void 0;
                            var badChirality = residue ? residue.chiralityMismatches.has(a.id) : false;
                            if (!residue)
                                return void 0;
                            return "<div><small>[Validation]</small> Atom: <b>" + (badChirality ? 'Bad Chirality' : 'OK') + "</b>, Residue: <b>" + residue.flags.join(', ') + "</b></div>";
                        }
                        else {
                            var res = i.residues[0];
                            var chain = r.get(res.chain.authAsymId);
                            var residue = chain ? chain.get(res.authSeqNumber) : void 0;
                            if (!residue)
                                return void 0;
                            return "<div><small>[Validation]</small> Residue: <b>" + residue.flags.join(', ') + "</b></div>";
                        }
                    };
                    return Behaviour;
                }());
                Interactivity.Behaviour = Behaviour;
            })(Interactivity || (Interactivity = {}));
            var Theme;
            (function (Theme) {
                var colorMap = (function () {
                    var colors = new Map();
                    colors.set(0, { r: 0.4, g: 0.4, b: 0.4 });
                    colors.set(1, { r: 0, g: 1, b: 0 });
                    colors.set(2, { r: 1, g: 0, b: 0 });
                    return colors;
                })();
                var defaultColor = { r: 0.6, g: 0.6, b: 0.6 };
                var selectionColor = { r: 0, g: 0, b: 1 };
                var highlightColor = { r: 1, g: 0, b: 1 };
                function createAtomMapNormal(model, report) {
                    var map = new Uint8Array(model.atoms.count);
                    var mId = model.modelId;
                    var _a = model.residues, authAsymId = _a.authAsymId, authSeqNumber = _a.authSeqNumber, atomStartIndex = _a.atomStartIndex, atomEndIndex = _a.atomEndIndex;
                    var id = model.atoms.id;
                    for (var rI = 0, _rI = model.residues.count; rI < _rI; rI++) {
                        var repC = report.get(authAsymId[rI]);
                        if (!repC)
                            continue;
                        var repR = repC.get(authSeqNumber[rI]);
                        if (!repR)
                            continue;
                        var chiralityMismatches = repR.chiralityMismatches;
                        for (var aI = atomStartIndex[rI], _aI = atomEndIndex[rI]; aI < _aI; aI++) {
                            if (repR.isRed)
                                map[aI] = 2;
                            else if (chiralityMismatches.has(id[aI]))
                                map[aI] = 2;
                            else
                                map[aI] = 1;
                        }
                    }
                    return map;
                }
                function createAtomMapComputed(model, report) {
                    var parent = model.parent;
                    var map = new Uint8Array(model.atoms.count);
                    var mId = model.modelId;
                    var _a = model.residues, authAsymId = _a.authAsymId, authSeqNumber = _a.authSeqNumber, atomStartIndex = _a.atomStartIndex, atomEndIndex = _a.atomEndIndex, chainIndex = _a.chainIndex;
                    var sourceChainIndex = model.chains.sourceChainIndex;
                    var id = model.atoms.id;
                    for (var rI = 0, _rI = model.residues.count; rI < _rI; rI++) {
                        var repC = report.get(authAsymId[sourceChainIndex[chainIndex[rI]]]);
                        if (!repC)
                            continue;
                        var repR = repC.get(authSeqNumber[rI]);
                        if (!repR)
                            continue;
                        var chiralityMismatches = repR.chiralityMismatches;
                        for (var aI = atomStartIndex[rI], _aI = atomEndIndex[rI]; aI < _aI; aI++) {
                            if (repR.isRed)
                                map[aI] = 2;
                            else if (!chiralityMismatches.has(id[aI]))
                                map[aI] = 2;
                            else
                                map[aI] = 1;
                        }
                    }
                    return map;
                }
                function create(entity, report) {
                    var model = entity.props.model;
                    var map = model.source === LiteMol.Core.Structure.MoleculeModelSource.File
                        ? createAtomMapNormal(model, report)
                        : createAtomMapComputed(model, report);
                    var colors = new Map();
                    colors.set('Uniform', defaultColor);
                    colors.set('Selection', selectionColor);
                    colors.set('Highlight', highlightColor);
                    var residueIndex = model.atoms.residueIndex;
                    var mapping = LiteMol.Visualization.Theme.createColorMapMapping(function (i) { return map[i]; }, colorMap, defaultColor);
                    return LiteMol.Visualization.Theme.createMapping(mapping, { colors: colors, interactive: true, transparency: { alpha: 1.0 } });
                }
                Theme.create = create;
            })(Theme || (Theme = {}));
            var Create = LiteMol.Bootstrap.Tree.Transformer.create({
                id: 'validatordb-create',
                name: 'Ligand Validation',
                description: 'Create the validation report from a string.',
                from: [Entity.Data.String],
                to: [ValidatorDB.Report],
                defaultParams: function () { return ({}); }
            }, function (context, a, t) {
                return LiteMol.Bootstrap.Task.create("ValidatorDB Report (" + t.params.id + ")", 'Normal', function (ctx) {
                    ctx.update('Parsing...');
                    ctx.schedule(function () {
                        var data = JSON.parse(a.props.data);
                        var report = Api.createReport(data || {});
                        ctx.resolve(ValidatorDB.Report.create(t, { label: 'Ligand Validation Report', behaviour: new Interactivity.Behaviour(context, report) }));
                    });
                }).setReportTime(true);
            });
            ValidatorDB.DownloadAndCreate = LiteMol.Bootstrap.Tree.Transformer.action({
                id: 'validatordb-download-and-create',
                name: 'Ligand Validation Report',
                description: 'Download Validation Report from ValidatorDB',
                from: [Entity.Molecule.Molecule],
                to: [Entity.Action],
                defaultParams: function () { return ({}); }
            }, function (context, a, t) {
                var id = a.props.molecule.id.trim().toLocaleLowerCase();
                var action = LiteMol.Bootstrap.Tree.Transform.build()
                    .add(a, Transformer.Data.Download, { url: "https://webchem.ncbr.muni.cz/Platform/ValidatorDb/Data/" + id + "?source=ByStructure", type: 'String', id: id, description: 'Validation Data', title: 'Validation' })
                    .then(Create, { id: id }, { isBinding: true });
                return action;
            }, "Validation report loaded. Hovering over residue will now contain validation info. To apply validation coloring, select the 'Ligand Validation Report' entity in the tree and apply it the right panel. " +
                "Only missing atoms/rings and chirality issues are shown, for more details please visit https://webchem.ncbr.muni.cz/Platform/ValidatorDb/Index.");
            ValidatorDB.ApplyTheme = LiteMol.Bootstrap.Tree.Transformer.create({
                id: 'validatordb-apply-theme',
                name: 'Apply Coloring',
                description: 'Colors all visuals using the validation report.',
                from: [ValidatorDB.Report],
                to: [Entity.Action],
                defaultParams: function () { return ({}); }
            }, function (context, a, t) {
                return LiteMol.Bootstrap.Task.create('Validation Coloring', 'Background', function (ctx) {
                    var molecule = LiteMol.Bootstrap.Tree.Node.findAncestor(a, LiteMol.Bootstrap.Entity.Molecule.Molecule);
                    if (!molecule) {
                        ctx.reject('No suitable parent found.');
                        return;
                    }
                    var themes = new Map();
                    var visuals = context.select(LiteMol.Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(LiteMol.Bootstrap.Entity.Molecule.Visual));
                    for (var _i = 0, visuals_1 = visuals; _i < visuals_1.length; _i++) {
                        var v = visuals_1[_i];
                        var model = LiteMol.Bootstrap.Utils.Molecule.findModel(v);
                        if (!model)
                            continue;
                        var theme = themes.get(model.id);
                        if (!theme) {
                            theme = Theme.create(model, a.props.behaviour.report);
                            themes.set(model.id, theme);
                        }
                        LiteMol.Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(context, { visual: v, theme: theme });
                    }
                    context.logger.message('Validation coloring applied.');
                    ctx.resolve(LiteMol.Bootstrap.Tree.Node.Null);
                });
            });
        })(ValidatorDB = Viewer.ValidatorDB || (Viewer.ValidatorDB = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var PDBe;
        (function (PDBe) {
            var Data;
            (function (Data) {
                var Bootstrap = LiteMol.Bootstrap;
                var Entity = Bootstrap.Entity;
                var Transformer = Bootstrap.Entity.Transformer;
                // straigtforward
                Data.DownloadMolecule = Transformer.Molecule.downloadMoleculeSource({
                    sourceId: 'pdbe-molecule',
                    name: 'PDBe',
                    description: 'Download a molecule from PDBe.',
                    defaultId: '1cbs',
                    specificFormat: LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF,
                    urlTemplate: function (id) { return "https://www.ebi.ac.uk/pdbe/static/entry/" + id.toLowerCase() + "_updated.cif"; }
                });
                Data.DownloadBinaryCIFFromCoordinateServer = Bootstrap.Tree.Transformer.action({
                    id: 'molecule-download-bcif-from-coordinate-server',
                    name: 'Molecule (BinaryCIF)',
                    description: 'Download full or cartoon representation of a PDB entry from the CoordinateServer.',
                    from: [Entity.Root],
                    to: [Entity.Action],
                    defaultParams: function (ctx) { return ({ id: '5iv5', type: 'Cartoon', lowPrecisionCoords: true, serverUrl: ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') ? ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') : 'https://webchemdev.ncbr.muni.cz/CoordinateServer' }); },
                    validateParams: function (p) { return (!p.id || !p.id.trim().length) ? ['Enter Id'] : (!p.serverUrl || !p.serverUrl.trim().length) ? ['Enter CoordinateServer base URL'] : void 0; },
                }, function (context, a, t) {
                    var query = t.params.type === 'Cartoon' ? 'cartoon' : 'full';
                    var id = t.params.id.toLowerCase().trim();
                    var url = "" + t.params.serverUrl + (t.params.serverUrl[t.params.serverUrl.length - 1] === '/' ? '' : '/') + id + "/" + query + "?encoding=bcif&lowPrecisionCoords=" + (t.params.lowPrecisionCoords ? '1' : '2');
                    return Bootstrap.Tree.Transform.build()
                        .add(a, Entity.Transformer.Data.Download, { url: url, type: 'Binary', id: id, title: 'Molecule' })
                        .then(Entity.Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { isBinding: true })
                        .then(Entity.Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false });
                });
            })(Data = PDBe.Data || (PDBe.Data = {}));
        })(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var PDBe;
        (function (PDBe) {
            var Data;
            (function (Data) {
                var Bootstrap = LiteMol.Bootstrap;
                var Entity = Bootstrap.Entity;
                var Transformer = Bootstrap.Entity.Transformer;
                var Tree = Bootstrap.Tree;
                var Visualization = Bootstrap.Visualization;
                Data.DensitySources = ['electron-density', 'emdb-pdbid', 'emdb-id'];
                Data.DensitySourceLabels = {
                    'electron-density': 'Electron Density',
                    'emdb-pdbid': 'EMDB (from PDB ID)',
                    'emdb-id': 'EMDB'
                };
                function doElectron(a, t, id) {
                    var action = Bootstrap.Tree.Transform.build();
                    id = id.trim().toLocaleLowerCase();
                    var groupRef = t.props.ref ? t.props.ref : Bootstrap.Utils.generateUUID();
                    var group = action.add(a, Transformer.Basic.CreateGroup, { label: id, description: 'Density' }, { ref: groupRef });
                    var diffRef = Bootstrap.Utils.generateUUID();
                    var mainRef = Bootstrap.Utils.generateUUID();
                    var diff = group
                        .then(Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/coordinates/files/" + id + "_diff.ccp4", type: 'Binary', id: id, description: 'Fo-Fc', title: 'Density' })
                        .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: 'Fo-Fc', normalize: false }, { isBinding: true, ref: diffRef });
                    diff
                        .then(Transformer.Density.CreateVisualBehaviour, {
                        id: 'Fo-Fc(-ve)',
                        isoSigmaMin: -5,
                        isoSigmaMax: 0,
                        minRadius: 0,
                        maxRadius: 10,
                        radius: 5,
                        showFull: false,
                        style: Visualization.Density.Style.create({
                            isoValue: -3,
                            isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                            color: LiteMol.Visualization.Color.fromHex(0xBB3333),
                            isWireframe: true,
                            transparency: { alpha: 1.0 }
                        })
                    });
                    diff
                        .then(Transformer.Density.CreateVisualBehaviour, {
                        id: 'Fo-Fc(+ve)',
                        isoSigmaMin: 0,
                        isoSigmaMax: 5,
                        minRadius: 0,
                        maxRadius: 10,
                        radius: 5,
                        showFull: false,
                        style: Visualization.Density.Style.create({
                            isoValue: 3,
                            isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                            color: LiteMol.Visualization.Color.fromHex(0x33BB33),
                            isWireframe: true,
                            transparency: { alpha: 1.0 }
                        })
                    });
                    var base = group
                        .then(Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/coordinates/files/" + id + ".ccp4", type: 'Binary', id: id, description: '2Fo-Fc', title: 'Density' })
                        .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: '2Fo-Fc', normalize: false }, { isBinding: true, ref: mainRef })
                        .then(Transformer.Density.CreateVisualBehaviour, {
                        id: '2Fo-Fc',
                        isoSigmaMin: 0,
                        isoSigmaMax: 2,
                        minRadius: 0,
                        maxRadius: 10,
                        radius: 5,
                        showFull: false,
                        style: Visualization.Density.Style.create({
                            isoValue: 1.5,
                            isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                            color: LiteMol.Visualization.Color.fromHex(0x3362B2),
                            isWireframe: false,
                            transparency: { alpha: 0.4 }
                        })
                    });
                    return {
                        action: action,
                        context: { id: id, refs: [mainRef, diffRef], groupRef: groupRef }
                    };
                }
                function doEmdb(a, t, id, contourLevel) {
                    var action = Bootstrap.Tree.Transform.build();
                    var mainRef = Bootstrap.Utils.generateUUID();
                    var labelId = 'EMD-' + id;
                    action
                        .add(a, Transformer.Data.Download, {
                        url: "http://ftp.ebi.ac.uk/pub/databases/emdb/structures/EMD-" + id + "/map/emd_" + id + ".map.gz",
                        type: 'Binary',
                        id: labelId,
                        description: 'EMDB Density',
                        responseCompression: Bootstrap.Utils.DataCompressionMethod.Gzip,
                        title: 'Density'
                    })
                        .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: labelId, normalize: false }, { isBinding: true, ref: mainRef })
                        .then(Transformer.Density.CreateVisualBehaviour, {
                        id: 'Density',
                        isoSigmaMin: -5,
                        isoSigmaMax: 5,
                        minRadius: 0,
                        maxRadius: 50,
                        radius: 5,
                        showFull: false,
                        style: Visualization.Density.Style.create({
                            isoValue: contourLevel !== void 0 ? contourLevel : 1.5,
                            isoValueType: contourLevel !== void 0 ? Bootstrap.Visualization.Density.IsoValueType.Absolute : Bootstrap.Visualization.Density.IsoValueType.Sigma,
                            color: LiteMol.Visualization.Color.fromHex(0x638F8F),
                            isWireframe: false,
                            transparency: { alpha: 0.3 }
                        })
                    });
                    return {
                        action: action,
                        context: { id: id, refs: [mainRef] }
                    };
                }
                function fail(a, message) {
                    return {
                        action: Bootstrap.Tree.Transform.build()
                            .add(a, Transformer.Basic.Fail, { title: 'Density', message: message }),
                        context: void 0
                    };
                }
                function doEmdbPdbId(ctx, a, t, id) {
                    return new LiteMol.Core.Promise(function (res, rej) {
                        id = id.trim().toLowerCase();
                        Bootstrap.Utils.ajaxGetString("https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary/" + id, 'PDB API')
                            .run(ctx)
                            .then(function (s) {
                            try {
                                var json = JSON.parse(s);
                                var emdbId = void 0;
                                var e = json[id];
                                if (e && e[0] && e[0].related_structures) {
                                    var emdb = e[0].related_structures.filter(function (s) { return s.resource === 'EMDB'; });
                                    if (!emdb.length) {
                                        res(fail(a, "No related EMDB entry found for '" + id + "'."));
                                        return;
                                    }
                                    emdbId = emdb[0].accession.split('-')[1];
                                }
                                else {
                                    res(fail(a, "No related EMDB entry found for '" + id + "'."));
                                    return;
                                }
                                res(doEmdbId(ctx, a, t, emdbId));
                            }
                            catch (e) {
                                res(fail(a, 'PDB API call failed.'));
                            }
                        })
                            .catch(function (e) { return res(fail(a, 'PDB API call failed.')); });
                    });
                }
                function doEmdbId(ctx, a, t, id) {
                    return new LiteMol.Core.Promise(function (res, rej) {
                        id = id.trim();
                        Bootstrap.Utils.ajaxGetString("https://www.ebi.ac.uk/pdbe/api/emdb/entry/map/EMD-" + id, 'EMDB API')
                            .run(ctx)
                            .then(function (s) {
                            try {
                                var json = JSON.parse(s);
                                var contour = void 0;
                                var e = json['EMD-' + id];
                                if (e && e[0] && e[0].map && e[0].map.contour_level && e[0].map.contour_level.value !== void 0) {
                                    contour = +e[0].map.contour_level.value;
                                }
                                res(doEmdb(a, t, id, contour));
                            }
                            catch (e) {
                                res(fail(a, 'EMDB API call failed.'));
                            }
                        })
                            .catch(function (e) { return res(fail(a, 'EMDB API call failed.')); });
                    });
                }
                // this creates the electron density based on the spec you sent me
                Data.DownloadDensity = Bootstrap.Tree.Transformer.actionWithContext({
                    id: 'pdbe-density-download-data',
                    name: 'Density Data from PDBe',
                    description: 'Download density data from PDBe.',
                    from: [Entity.Root],
                    to: [Entity.Action],
                    defaultParams: function () { return ({
                        sourceId: 'electron-density',
                        id: {
                            'electron-density': '1cbs',
                            'emdb-id': '8015',
                            'emdb-pdbid': '5gag'
                        }
                    }); },
                    validateParams: function (p) {
                        var source = p.sourceId ? p.sourceId : 'electron-density';
                        if (!p.id)
                            return ['Enter Id'];
                        var id = typeof p.id === 'string' ? p.id : p.id[source];
                        return !id.trim().length ? ['Enter Id'] : void 0;
                    }
                }, function (context, a, t) {
                    var id;
                    if (typeof t.params.id === 'string')
                        id = t.params.id;
                    else
                        id = t.params.id[t.params.sourceId];
                    switch (t.params.sourceId || 'electron-density') {
                        case 'electron-density': return doElectron(a, t, id);
                        case 'emdb-id': return doEmdbId(context, a, t, id);
                        case 'emdb-pdbid': return doEmdbPdbId(context, a, t, id);
                        default: return fail(a, 'Unknown source.');
                    }
                }, function (ctx, actionCtx) {
                    if (!actionCtx)
                        return;
                    var _a = actionCtx, id = _a.id, refs = _a.refs, groupRef = _a.groupRef;
                    var sel = ctx.select((_b = Tree.Selection).byRef.apply(_b, refs));
                    if (sel.length === refs.length) {
                        ctx.logger.message('Density loaded, click on a residue or an atom to view the data.');
                    }
                    else if (sel.length > 0) {
                        ctx.logger.message('Density partially loaded, click on a residue or an atom to view the data.');
                    }
                    else {
                        ctx.logger.error("Density failed to load. The data for the id '" + id + "' does not seem to exist.");
                        if (groupRef) {
                            Bootstrap.Command.Tree.RemoveNode.dispatch(ctx, groupRef);
                        }
                    }
                    var _b;
                });
            })(Data = PDBe.Data || (PDBe.Data = {}));
        })(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var PDBe;
        (function (PDBe) {
            var Validation;
            (function (Validation) {
                var Entity = LiteMol.Bootstrap.Entity;
                var Transformer = LiteMol.Bootstrap.Entity.Transformer;
                Validation.Report = Entity.create({ name: 'PDBe Molecule Validation Report', typeClass: 'Behaviour', shortName: 'VR', description: 'Represents PDBe validation report.' });
                var Api;
                (function (Api) {
                    function getResidueId(seqNumber, insCode) {
                        var id = seqNumber.toString();
                        if ((insCode || "").length !== 0)
                            id += " " + insCode;
                        return id;
                    }
                    Api.getResidueId = getResidueId;
                    function getEntry(report, modelId, entity, asymId, residueId) {
                        var e = report[entity];
                        if (!e)
                            return void 0;
                        e = e[asymId];
                        if (!e)
                            return void 0;
                        e = e[modelId];
                        if (!e)
                            return void 0;
                        return e[residueId];
                    }
                    Api.getEntry = getEntry;
                    function createReport(data) {
                        var report = {};
                        if (!data.molecules)
                            return report;
                        for (var _i = 0, _a = data.molecules; _i < _a.length; _i++) {
                            var entity = _a[_i];
                            var chains = {};
                            for (var _c = 0, _d = entity.chains; _c < _d.length; _c++) {
                                var chain = _d[_c];
                                var models = {};
                                for (var _e = 0, _f = chain.models; _e < _f.length; _e++) {
                                    var model = _f[_e];
                                    var residues = {};
                                    for (var _g = 0, _h = model.residues; _g < _h.length; _g++) {
                                        var residue = _h[_g];
                                        var id = getResidueId(residue.residue_number, residue.author_insertion_code), entry = residues[id];
                                        if (entry) {
                                            entry.residues.push(residue);
                                            entry.numIssues = Math.max(entry.numIssues, residue.outlier_types.length);
                                        }
                                        else {
                                            residues[id] = {
                                                residues: [residue],
                                                numIssues: residue.outlier_types.length
                                            };
                                        }
                                    }
                                    models[model.model_id.toString()] = residues;
                                }
                                chains[chain.struct_asym_id] = models;
                            }
                            report[entity.entity_id.toString()] = chains;
                        }
                        return report;
                    }
                    Api.createReport = createReport;
                })(Api || (Api = {}));
                var Interactivity;
                (function (Interactivity) {
                    var Behaviour = (function () {
                        function Behaviour(context, report) {
                            var _this = this;
                            this.context = context;
                            this.report = report;
                            this.provider = function (info) {
                                try {
                                    return _this.processInfo(info);
                                }
                                catch (e) {
                                    console.error('Error showing validation label', e);
                                    return void 0;
                                }
                            };
                        }
                        Behaviour.prototype.dispose = function () {
                            this.context.highlight.removeProvider(this.provider);
                        };
                        Behaviour.prototype.register = function (behaviour) {
                            this.context.highlight.addProvider(this.provider);
                        };
                        Behaviour.prototype.processInfo = function (info) {
                            var i = LiteMol.Bootstrap.Interactivity.Molecule.transformInteraction(info);
                            if (!i || i.residues.length > 1)
                                return void 0;
                            var r = i.residues[0];
                            var e = Api.getEntry(this.report, i.modelId, r.chain.entity.entityId, r.chain.asymId, Api.getResidueId(r.seqNumber, r.insCode));
                            if (!e)
                                return void 0;
                            var label;
                            if (e.residues.length === 1) {
                                var vr = e.residues[0];
                                label = 'Validation: ';
                                if (!vr.outlier_types.length)
                                    label += 'no issue';
                                else
                                    label += "<b>" + e.residues[0].outlier_types.join(", ") + "</b>";
                                return label;
                            }
                            else {
                                label = '';
                                var index = 0;
                                for (var _i = 0, _a = e.residues; _i < _a.length; _i++) {
                                    var v = _a[_i];
                                    if (index > 0)
                                        label += ', ';
                                    label += "Validation (altLoc " + v.alt_code + "): <b>" + v.outlier_types.join(", ") + "</b>";
                                    index++;
                                }
                                return label;
                            }
                        };
                        return Behaviour;
                    }());
                    Interactivity.Behaviour = Behaviour;
                })(Interactivity || (Interactivity = {}));
                var Theme;
                (function (Theme) {
                    var colorMap = (function () {
                        var colors = new Map();
                        colors.set(0, { r: 0, g: 1, b: 0 });
                        colors.set(1, { r: 1, g: 1, b: 0 });
                        colors.set(2, { r: 1, g: 0.5, b: 0 });
                        colors.set(3, { r: 1, g: 0, b: 0 });
                        return colors;
                    })();
                    var defaultColor = { r: 0.6, g: 0.6, b: 0.6 };
                    var selectionColor = { r: 0, g: 0, b: 1 };
                    var highlightColor = { r: 1, g: 0, b: 1 };
                    function createResidueMapNormal(model, report) {
                        var map = new Uint8Array(model.residues.count);
                        var mId = model.modelId;
                        var _a = model.residues, asymId = _a.asymId, entityId = _a.entityId, seqNumber = _a.seqNumber, insCode = _a.insCode;
                        for (var i = 0, _b = model.residues.count; i < _b; i++) {
                            var e = Api.getEntry(report, mId, entityId[i], asymId[i], Api.getResidueId(seqNumber[i], insCode[i]));
                            if (e) {
                                map[i] = Math.min(e.numIssues, 3);
                            }
                        }
                        return map;
                    }
                    function createResidueMapComputed(model, report) {
                        var map = new Uint8Array(model.residues.count);
                        var mId = model.modelId;
                        var parent = model.parent;
                        var _a = model.residues, entityId = _a.entityId, seqNumber = _a.seqNumber, insCode = _a.insCode, chainIndex = _a.chainIndex;
                        var sourceChainIndex = model.chains.sourceChainIndex;
                        var asymId = parent.chains.asymId;
                        for (var i = 0, _b = model.residues.count; i < _b; i++) {
                            var aId = asymId[sourceChainIndex[chainIndex[i]]];
                            var e = Api.getEntry(report, mId, entityId[i], aId, Api.getResidueId(seqNumber[i], insCode[i]));
                            if (e) {
                                map[i] = Math.min(e.numIssues, 3);
                            }
                        }
                        return map;
                    }
                    function create(entity, report) {
                        var model = entity.props.model;
                        var map = model.source === LiteMol.Core.Structure.MoleculeModelSource.File
                            ? createResidueMapNormal(model, report)
                            : createResidueMapComputed(model, report);
                        var colors = new Map();
                        colors.set('Uniform', defaultColor);
                        colors.set('Selection', selectionColor);
                        colors.set('Highlight', highlightColor);
                        var residueIndex = model.atoms.residueIndex;
                        var mapping = LiteMol.Visualization.Theme.createColorMapMapping(function (i) { return map[residueIndex[i]]; }, colorMap, defaultColor);
                        return LiteMol.Visualization.Theme.createMapping(mapping, { colors: colors, interactive: true, transparency: { alpha: 1.0 } });
                    }
                    Theme.create = create;
                })(Theme || (Theme = {}));
                var Create = LiteMol.Bootstrap.Tree.Transformer.create({
                    id: 'pdbe-validation-create',
                    name: 'PDBe Validation',
                    description: 'Create the validation report from a string.',
                    from: [Entity.Data.String],
                    to: [Validation.Report],
                    defaultParams: function () { return ({}); }
                }, function (context, a, t) {
                    return LiteMol.Bootstrap.Task.create("Validation Report (" + t.params.id + ")", 'Normal', function (ctx) {
                        ctx.update('Parsing...');
                        ctx.schedule(function () {
                            var data = JSON.parse(a.props.data);
                            var model = data[t.params.id];
                            var report = Api.createReport(model || {});
                            ctx.resolve(Validation.Report.create(t, { label: 'Validation Report', behaviour: new Interactivity.Behaviour(context, report) }));
                        });
                    }).setReportTime(true);
                });
                Validation.DownloadAndCreate = LiteMol.Bootstrap.Tree.Transformer.action({
                    id: 'pdbe-validation-download-and-create',
                    name: 'PDBe Validation Report',
                    description: 'Download Validation Report from PDBe',
                    from: [Entity.Molecule.Molecule],
                    to: [Entity.Action],
                    defaultParams: function () { return ({}); }
                }, function (context, a, t) {
                    var id = a.props.molecule.id.trim().toLocaleLowerCase();
                    var action = LiteMol.Bootstrap.Tree.Transform.build()
                        .add(a, Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/api/validation/residuewise_outlier_summary/entry/" + id, type: 'String', id: id, description: 'Validation Data', title: 'Validation' })
                        .then(Create, { id: id }, { isBinding: true });
                    return action;
                }, "Validation report loaded. Hovering over residue will now contain validation info. To apply validation coloring, select the entity in the tree and apply it the right panel.");
                Validation.ApplyTheme = LiteMol.Bootstrap.Tree.Transformer.create({
                    id: 'pdbe-validation-apply-theme',
                    name: 'Apply Coloring',
                    description: 'Colors all visuals using the validation report.',
                    from: [Validation.Report],
                    to: [Entity.Action],
                    defaultParams: function () { return ({}); }
                }, function (context, a, t) {
                    return LiteMol.Bootstrap.Task.create('Validation Coloring', 'Background', function (ctx) {
                        var molecule = LiteMol.Bootstrap.Tree.Node.findAncestor(a, LiteMol.Bootstrap.Entity.Molecule.Molecule);
                        if (!molecule) {
                            ctx.reject('No suitable parent found.');
                            return;
                        }
                        var themes = new Map();
                        var visuals = context.select(LiteMol.Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(LiteMol.Bootstrap.Entity.Molecule.Visual));
                        for (var _i = 0, visuals_2 = visuals; _i < visuals_2.length; _i++) {
                            var v = visuals_2[_i];
                            var model = LiteMol.Bootstrap.Utils.Molecule.findModel(v);
                            if (!model)
                                continue;
                            var theme = themes.get(model.id);
                            if (!theme) {
                                theme = Theme.create(model, a.props.behaviour.report);
                                themes.set(model.id, theme);
                            }
                            LiteMol.Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(context, { visual: v, theme: theme });
                        }
                        context.logger.message('Validation coloring applied.');
                        ctx.resolve(LiteMol.Bootstrap.Tree.Node.Null);
                    });
                });
            })(Validation = PDBe.Validation || (PDBe.Validation = {}));
        })(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var PDBe;
        (function (PDBe) {
            var SequenceAnnotation;
            (function (SequenceAnnotation) {
                var Entity = LiteMol.Bootstrap.Entity;
                var Transformer = LiteMol.Bootstrap.Entity.Transformer;
                var Query = LiteMol.Core.Structure.Query;
                SequenceAnnotation.Annotations = Entity.create({ name: 'PDBe Sequence Annotations', typeClass: 'Data', shortName: 'SA', description: 'Represents PDBe sequence annotation data.' });
                SequenceAnnotation.Annotation = Entity.create({ name: 'PDBe Sequence Annotation', typeClass: 'Object', shortName: 'SA', description: 'Represents PDBe sequence annotation.' }, { isSilent: true, isFocusable: true });
                SequenceAnnotation.Behaviour = Entity.create({ name: 'PDBe Sequence Annotation Behaviour', typeClass: 'Behaviour', shortName: 'SA', description: 'Represents PDBe sequence annoation behaviour.' });
                var Interactivity;
                (function (Interactivity) {
                    var Behaviour = (function () {
                        function Behaviour(context) {
                            var _this = this;
                            this.context = context;
                            this.node = void 0;
                            this.current = void 0;
                            this.subs = [];
                            this.toHighlight = void 0;
                            this.isHighlightOn = false;
                            this.__highlight = LiteMol.Core.Utils.debounce(function () { return _this.highlight(); }, 33);
                        }
                        Behaviour.prototype.dispose = function () {
                            this.resetTheme();
                            for (var _i = 0, _a = this.subs; _i < _a.length; _i++) {
                                var sub = _a[_i];
                                sub.dispose();
                            }
                            this.subs = [];
                            this.node = void 0;
                        };
                        Behaviour.prototype.register = function (behaviour) {
                            var _this = this;
                            this.node = behaviour;
                            this.subs.push(this.context.behaviours.currentEntity.subscribe(function (e) { return _this.update(e); }));
                            this.subs.push(LiteMol.Bootstrap.Command.Entity.Highlight.getStream(this.context).subscribe(function (e) {
                                if (e.data.entities.length === 1) {
                                    var a = e.data.entities[0];
                                    if (a.type !== SequenceAnnotation.Annotation)
                                        return;
                                    _this.toHighlight = a;
                                    _this.isHighlightOn = e.data.isOn;
                                    _this.__highlight();
                                }
                            }));
                            this.subs.push(LiteMol.Bootstrap.Command.Entity.Focus.getStream(this.context).subscribe(function (e) {
                                if (e.data.length === 1) {
                                    var a = e.data[0];
                                    if (a.type !== SequenceAnnotation.Annotation)
                                        return;
                                    _this.focus(a);
                                }
                            }));
                        };
                        Object.defineProperty(Behaviour.prototype, "molecule", {
                            get: function () {
                                return LiteMol.Bootstrap.Utils.Molecule.findMolecule(this.node);
                            },
                            enumerable: true,
                            configurable: true
                        });
                        Behaviour.prototype.resetTheme = function () {
                            var molecule = this.molecule;
                            if (molecule) {
                                LiteMol.Bootstrap.Command.Visual.ResetTheme.dispatch(this.context, { selection: LiteMol.Bootstrap.Tree.Selection.byValue(molecule).subtree() });
                            }
                        };
                        Behaviour.prototype.getCached = function (a, model) {
                            return this.context.entityCache.get(a, "theme-" + model.id);
                        };
                        Behaviour.prototype.setCached = function (a, model, theme) {
                            var e = this.context.entityCache.set(a, "theme-" + model.id, theme);
                        };
                        Behaviour.prototype.highlight = function () {
                            var e = this.toHighlight;
                            this.toHighlight = void 0;
                            if (!e || e.type !== SequenceAnnotation.Annotation)
                                return;
                            var a = e;
                            if (!this.isHighlightOn) {
                                if (this.current) {
                                    this.update(this.current);
                                }
                                else {
                                    this.resetTheme();
                                }
                            }
                            else {
                                this.apply(a);
                            }
                        };
                        Behaviour.prototype.focus = function (a) {
                            var molecule = this.molecule;
                            if (!molecule)
                                return;
                            var model = this.context.select(LiteMol.Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(LiteMol.Bootstrap.Entity.Molecule.Model))[0];
                            if (!model)
                                return;
                            LiteMol.Bootstrap.Command.Molecule.FocusQuery.dispatch(this.context, { model: model, query: a.props.query });
                            LiteMol.Bootstrap.Command.Entity.SetCurrent.dispatch(this.context, a);
                        };
                        Behaviour.prototype.apply = function (a) {
                            var molecule = this.molecule;
                            if (!molecule)
                                return;
                            var visuals = this.context.select(LiteMol.Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(LiteMol.Bootstrap.Entity.Molecule.Visual));
                            for (var _i = 0, visuals_3 = visuals; _i < visuals_3.length; _i++) {
                                var v = visuals_3[_i];
                                var model = LiteMol.Bootstrap.Utils.Molecule.findModel(v);
                                if (!model)
                                    continue;
                                var theme = this.getCached(a, model);
                                if (!theme) {
                                    theme = Theme.create(model, a.props.query, a.props.color);
                                    this.setCached(a, model, theme);
                                }
                                LiteMol.Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(this.context, { visual: v, theme: theme });
                            }
                        };
                        Behaviour.prototype.update = function (e) {
                            if (!e || e.type !== SequenceAnnotation.Annotation) {
                                if (this.current)
                                    this.resetTheme();
                                this.current = void 0;
                                return;
                            }
                            this.current = e;
                            this.apply(this.current);
                        };
                        return Behaviour;
                    }());
                    Interactivity.Behaviour = Behaviour;
                })(Interactivity || (Interactivity = {}));
                var Theme;
                (function (Theme) {
                    var defaultColor = { r: 1, g: 1, b: 1 };
                    var selectionColor = LiteMol.Visualization.Theme.Default.SelectionColor;
                    var highlightColor = LiteMol.Visualization.Theme.Default.HighlightColor;
                    function createResidueMap(model, fs) {
                        var map = new Uint8Array(model.residues.count);
                        var mId = model.modelId;
                        var residueIndex = model.atoms.residueIndex;
                        var _a = model.residues, asymId = _a.asymId, entityId = _a.entityId, seqNumber = _a.seqNumber, insCode = _a.insCode;
                        for (var _i = 0, _b = fs.fragments; _i < _b.length; _i++) {
                            var f = _b[_i];
                            for (var _c = 0, _d = f.atomIndices; _c < _d.length; _c++) {
                                var i = _d[_c];
                                map[residueIndex[i]] = 1;
                            }
                        }
                        return map;
                    }
                    function create(entity, query, color) {
                        var model = entity.props.model;
                        var q = Query.Builder.toQuery(query);
                        var fs = q(model.queryContext);
                        var map = createResidueMap(model, fs);
                        var colors = new Map();
                        colors.set('Uniform', defaultColor);
                        colors.set('Bond', defaultColor);
                        colors.set('Selection', selectionColor);
                        colors.set('Highlight', highlightColor);
                        var colorMap = new Map();
                        colorMap.set(1, color);
                        var residueIndex = model.atoms.residueIndex;
                        var mapping = LiteMol.Visualization.Theme.createColorMapMapping(function (i) { return map[residueIndex[i]]; }, colorMap, defaultColor);
                        return LiteMol.Visualization.Theme.createMapping(mapping, { colors: colors, interactive: true, transparency: { alpha: 1.0 } });
                    }
                    Theme.create = create;
                })(Theme || (Theme = {}));
                function buildAnnotations(parent, id, data) {
                    var action = LiteMol.Bootstrap.Tree.Transform.build();
                    if (!data) {
                        return action;
                    }
                    var baseColor = LiteMol.Visualization.Color.fromHex(0xFA6900);
                    var _loop_1 = function (g) {
                        var ans = data[g];
                        if (!ans)
                            return "continue";
                        var entries = Object.keys(ans).filter(function (a) { return Object.prototype.hasOwnProperty.call(ans, a); });
                        if (!entries.length)
                            return "continue";
                        var group = action.add(parent, Transformer.Basic.CreateGroup, { label: g, isCollapsed: true }, { isBinding: true });
                        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                            var a = entries_1[_i];
                            group.then(SequenceAnnotation.CreateSingle, { data: ans[a], id: a, color: baseColor });
                        }
                    };
                    for (var _i = 0, _a = ["Pfam", "InterPro", "CATH", "SCOP", "UniProt"]; _i < _a.length; _i++) {
                        var g = _a[_i];
                        _loop_1(g);
                    }
                    action.add(parent, CreateBehaviour, {}, { isHidden: true });
                    return action;
                }
                function getInsCode(v) {
                    if (v.length === 0)
                        return null;
                    return v;
                }
                SequenceAnnotation.CreateSingle = LiteMol.Bootstrap.Tree.Transformer.create({
                    id: 'pdbe-sequence-annotations-create-single',
                    name: 'PDBe Sequence Annotation',
                    description: 'Create a sequence annotation object.',
                    from: [],
                    to: [SequenceAnnotation.Annotation],
                    defaultParams: function () { return ({}); },
                    isUpdatable: true
                }, function (context, a, t) {
                    return LiteMol.Bootstrap.Task.create("Sequence Annotation", 'Background', function (ctx) {
                        var data = t.params.data;
                        var query = Query.or.apply(null, data.mappings.map(function (m) {
                            return Query.sequence(m.entity_id.toString(), m.struct_asym_id, { seqNumber: m.start.residue_number, insCode: getInsCode(m.start.author_insertion_code) }, { seqNumber: m.end.residue_number, insCode: getInsCode(m.end.author_insertion_code) });
                        }))
                            .union();
                        ctx.resolve(SequenceAnnotation.Annotation.create(t, { label: data.identifier, description: t.params.id, query: query, color: t.params.color }));
                    });
                });
                var Parse = LiteMol.Bootstrap.Tree.Transformer.create({
                    id: 'pdbe-sequence-annotations-parse',
                    name: 'PDBe Sequence Annotations',
                    description: 'Parse sequence annotaions JSON.',
                    from: [Entity.Data.String],
                    to: [SequenceAnnotation.Annotations],
                    defaultParams: function () { return ({}); }
                }, function (context, a, t) {
                    return LiteMol.Bootstrap.Task.create("Sequence Annotations", 'Normal', function (ctx) {
                        ctx.update('Parsing...');
                        ctx.schedule(function () {
                            var data = JSON.parse(a.props.data);
                            ctx.resolve(SequenceAnnotation.Annotations.create(t, { label: 'Sequence Annotations', data: data }));
                        });
                    }).setReportTime(true);
                });
                var CreateBehaviour = LiteMol.Bootstrap.Tree.Transformer.create({
                    id: 'pdbe-sequence-annotations-create-behaviour',
                    name: 'PDBe Sequence Annotation Behaviour',
                    description: 'Create sequence annotation behaviour.',
                    from: [SequenceAnnotation.Annotations],
                    to: [SequenceAnnotation.Behaviour],
                    defaultParams: function () { return ({}); }
                }, function (context, a, t) {
                    return LiteMol.Bootstrap.Task.resolve("Sequence Annotations", 'Background', SequenceAnnotation.Behaviour.create(t, { label: 'Sequence Annotations', behaviour: new Interactivity.Behaviour(context) }));
                });
                var Build = LiteMol.Bootstrap.Tree.Transformer.action({
                    id: 'pdbe-sequence-annotations-build',
                    name: 'PDBe Sequence Annotations',
                    description: 'Build sequence validations behaviour.',
                    from: [SequenceAnnotation.Annotations],
                    to: [Entity.Action],
                    defaultParams: function () { return ({}); }
                }, function (context, a, t) {
                    var data = a.props.data;
                    var keys = Object.keys(data);
                    return buildAnnotations(a, keys[0], data[keys[0]]);
                }, "Sequence annotations downloaded. Selecting or hovering an annotation in the tree will color the visuals.");
                SequenceAnnotation.DownloadAndCreate = LiteMol.Bootstrap.Tree.Transformer.action({
                    id: 'pdbe-sequence-annotations-download-and-create',
                    name: 'PDBe Sequence Annotations',
                    description: 'Download Sequence Annotations from PDBe',
                    from: [Entity.Molecule.Molecule],
                    to: [Entity.Action],
                    defaultParams: function () { return ({}); }
                }, function (context, a, t) {
                    var id = a.props.molecule.id.trim().toLocaleLowerCase();
                    return LiteMol.Bootstrap.Tree.Transform.build()
                        .add(a, Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/api/mappings/" + id, type: 'String', id: id, description: 'Annotation Data', title: 'Annotation' })
                        .then(Parse, {}, { isBinding: true })
                        .then(Build, {}, { isBinding: true });
                });
            })(SequenceAnnotation = PDBe.SequenceAnnotation || (PDBe.SequenceAnnotation = {}));
        })(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var PDBe;
        (function (PDBe) {
            var Views;
            (function (Views) {
                var React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
                var Controls = LiteMol.Plugin.Controls;
                var CreateSequenceAnnotationView = (function (_super) {
                    __extends(CreateSequenceAnnotationView, _super);
                    function CreateSequenceAnnotationView() {
                        return _super.apply(this, arguments) || this;
                    }
                    CreateSequenceAnnotationView.prototype.renderControls = function () {
                        var _this = this;
                        var params = this.params;
                        return React.createElement("div", null,
                            React.createElement(Controls.ToggleColorPicker, { label: 'Color', color: params.color, onChange: function (c) { return _this.controller.autoUpdateParams({ color: c }); }, position: 'below' }));
                    };
                    return CreateSequenceAnnotationView;
                }(LiteMol.Plugin.Views.Transform.ControllerBase));
                Views.CreateSequenceAnnotationView = CreateSequenceAnnotationView;
                var DownloadBinaryCIFFromCoordinateServerView = (function (_super) {
                    __extends(DownloadBinaryCIFFromCoordinateServerView, _super);
                    function DownloadBinaryCIFFromCoordinateServerView() {
                        return _super.apply(this, arguments) || this;
                    }
                    DownloadBinaryCIFFromCoordinateServerView.prototype.renderControls = function () {
                        var _this = this;
                        var params = this.params;
                        return React.createElement("div", null,
                            React.createElement(Controls.TextBoxGroup, { value: params.id, onChange: function (v) { return _this.updateParams({ id: v }); }, label: 'Id', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter pdb id...' }),
                            React.createElement(Controls.OptionsGroup, { options: ['Cartoon', 'Full'], caption: function (s) { return s; }, current: params.type, onChange: function (o) { return _this.updateParams({ type: o }); }, label: 'Type', title: 'Determines whether to send all atoms or just atoms that are needed for the Cartoon representation.' }),
                            React.createElement(Controls.Toggle, { onChange: function (v) { return _this.updateParams({ lowPrecisionCoords: v }); }, value: params.lowPrecisionCoords, label: 'Low Precicion', title: 'If on, sends coordinates with 1 digit precision instead of 3. This saves up to 50% of data that need to be sent.' }),
                            React.createElement(Controls.TextBoxGroup, { value: params.serverUrl, onChange: function (v) { return _this.updateParams({ serverUrl: v }); }, label: 'Server', title: 'The base URL of the CoordinateServer.', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter server URL...' }));
                    };
                    return DownloadBinaryCIFFromCoordinateServerView;
                }(LiteMol.Plugin.Views.Transform.ControllerBase));
                Views.DownloadBinaryCIFFromCoordinateServerView = DownloadBinaryCIFFromCoordinateServerView;
                var DownloadDensityView = (function (_super) {
                    __extends(DownloadDensityView, _super);
                    function DownloadDensityView() {
                        return _super.apply(this, arguments) || this;
                    }
                    DownloadDensityView.prototype.getId = function () {
                        var id = this.params.id;
                        if (!id)
                            return '';
                        if (typeof id === 'string')
                            return id;
                        return id[this.params.sourceId];
                    };
                    DownloadDensityView.prototype.updateId = function (newId) {
                        var params = this.params;
                        var id = params.id;
                        if (!id || typeof id === 'string')
                            id = (_a = {}, _a[params.sourceId] = newId, _a);
                        else
                            id = LiteMol.Bootstrap.Utils.merge(id, (_b = {}, _b[params.sourceId] = newId, _b));
                        this.updateParams({ id: id });
                        var _a, _b;
                    };
                    DownloadDensityView.prototype.renderControls = function () {
                        var _this = this;
                        var params = this.params;
                        return React.createElement("div", null,
                            React.createElement(Controls.OptionsGroup, { options: PDBe.Data.DensitySources, caption: function (s) { return PDBe.Data.DensitySourceLabels[s]; }, current: params.sourceId, onChange: function (o) { return _this.updateParams({ sourceId: o }); }, label: 'Source', title: 'Determines where to obtain the data.' }),
                            React.createElement(Controls.TextBoxGroup, { value: this.getId(), onChange: function (v) { return _this.updateId(v); }, label: 'Id', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter id...' }));
                    };
                    return DownloadDensityView;
                }(LiteMol.Plugin.Views.Transform.ControllerBase));
                Views.DownloadDensityView = DownloadDensityView;
            })(Views = PDBe.Views || (PDBe.Views = {}));
        })(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var Views = LiteMol.Plugin.Views;
        var Bootstrap = LiteMol.Bootstrap;
        var Transformer = Bootstrap.Entity.Transformer;
        var LayoutRegion = Bootstrap.Components.LayoutRegion;
        Viewer.PluginSpec = {
            settings: {
                'molecule.model.defaultQuery': "residuesByName('GLY', 'ALA')",
                'molecule.model.defaultAssemblyName': '1',
                'molecule.coordinateStreaming.defaultId': '5iv5',
                'molecule.coordinateStreaming.defaultServer': 'https://webchemdev.ncbr.muni.cz/CoordinateServer',
                'molecule.downloadBinaryCIFFromCoordinateServer.server': 'https://webchemdev.ncbr.muni.cz/CoordinateServer',
                'molecule.coordinateStreaming.defaultRadius': 10,
                'density.defaultVisualBehaviourRadius': 5
            },
            transforms: [
                // Root transforms -- things that load data.
                { transformer: Viewer.PDBe.Data.DownloadMolecule, view: Views.Transform.Data.WithIdField },
                { transformer: Viewer.PDBe.Data.DownloadDensity, view: Viewer.PDBe.Views.DownloadDensityView },
                { transformer: Viewer.PDBe.Data.DownloadBinaryCIFFromCoordinateServer, view: Viewer.PDBe.Views.DownloadBinaryCIFFromCoordinateServerView, initiallyCollapsed: true },
                { transformer: Transformer.Molecule.CoordinateStreaming.InitStreaming, view: Views.Transform.Molecule.InitCoordinateStreaming, initiallyCollapsed: true },
                { transformer: Viewer.DataSources.DownloadMolecule, view: Views.Transform.Molecule.DownloadFromUrl, initiallyCollapsed: true },
                { transformer: Transformer.Molecule.OpenMoleculeFromFile, view: Views.Transform.Molecule.OpenFile, initiallyCollapsed: true },
                { transformer: Transformer.Data.Download, view: Views.Transform.Data.Download, initiallyCollapsed: true },
                { transformer: Transformer.Data.OpenFile, view: Views.Transform.Data.OpenFile, initiallyCollapsed: true },
                // Raw data transforms
                { transformer: Transformer.Molecule.CreateFromData, view: Views.Transform.Molecule.CreateFromData },
                { transformer: Transformer.Data.ParseCif, view: Views.Transform.Empty },
                { transformer: Transformer.Data.ParseBinaryCif, view: Views.Transform.Empty },
                { transformer: Transformer.Density.ParseData, view: Views.Transform.Density.ParseData },
                // Molecule(model) transforms
                { transformer: Transformer.Molecule.CreateFromMmCif, view: Views.Transform.Molecule.CreateFromMmCif },
                { transformer: Transformer.Molecule.CreateModel, view: Views.Transform.Molecule.CreateModel, initiallyCollapsed: true },
                { transformer: Transformer.Molecule.CreateSelection, view: Views.Transform.Molecule.CreateSelection, initiallyCollapsed: true },
                { transformer: Transformer.Molecule.CreateAssembly, view: Views.Transform.Molecule.CreateAssembly, initiallyCollapsed: true },
                { transformer: Transformer.Molecule.CreateSymmetryMates, view: Views.Transform.Molecule.CreateSymmetryMates, initiallyCollapsed: true },
                { transformer: Transformer.Molecule.CreateMacromoleculeVisual, view: Views.Transform.Empty },
                { transformer: Transformer.Molecule.CreateVisual, view: Views.Transform.Molecule.CreateVisual },
                // density transforms
                { transformer: Transformer.Density.CreateVisual, view: Views.Transform.Density.CreateVisual },
                { transformer: Transformer.Density.CreateVisualBehaviour, view: Views.Transform.Density.CreateVisualBehaviour },
                // Coordinate streaming
                { transformer: Transformer.Molecule.CoordinateStreaming.CreateBehaviour, view: Views.Transform.Empty, initiallyCollapsed: true },
                // Validation reports
                { transformer: Viewer.PDBe.Validation.DownloadAndCreate, view: Views.Transform.Empty },
                { transformer: Viewer.PDBe.Validation.ApplyTheme, view: Views.Transform.Empty },
                { transformer: Viewer.ValidatorDB.DownloadAndCreate, view: Views.Transform.Empty },
                { transformer: Viewer.ValidatorDB.ApplyTheme, view: Views.Transform.Empty },
                // annotations
                { transformer: Viewer.PDBe.SequenceAnnotation.DownloadAndCreate, view: Views.Transform.Empty, initiallyCollapsed: true },
                { transformer: Viewer.PDBe.SequenceAnnotation.CreateSingle, view: Viewer.PDBe.Views.CreateSequenceAnnotationView, initiallyCollapsed: true },
            ],
            behaviours: [
                // you will find the source of all behaviours in the Bootstrap/Behaviour directory
                Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
                Bootstrap.Behaviour.FocusCameraOnSelect,
                Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
                // this colors the visual when a selection is created on it.
                Bootstrap.Behaviour.ApplySelectionToVisual,
                // creates a visual when model is added.
                Bootstrap.Behaviour.CreateVisualWhenModelIsAdded,
                // this colors the visual when it's selected by mouse or touch
                Bootstrap.Behaviour.ApplyInteractivitySelection,
                // this shows what atom/residue is the pointer currently over
                Bootstrap.Behaviour.Molecule.HighlightElementInfo,
                // distance to the last "clicked" element
                Bootstrap.Behaviour.Molecule.DistanceToLastClickedElement,
                // when somethinh is selected, this will create an "overlay visual" of the selected residue and show every other residue within 5ang
                // you will not want to use this for the ligand pages, where you create the same thing this does at startup
                Bootstrap.Behaviour.Molecule.ShowInteractionOnSelect(5),
                // this tracks what is downloaded and some basic actions. Does not send any private data etc. Source in Bootstrap/Behaviour/Analytics 
                Bootstrap.Behaviour.GoogleAnalytics('UA-77062725-1')
            ],
            components: [
                LiteMol.Plugin.Components.Visualization.HighlightInfo(LayoutRegion.Main, true),
                LiteMol.Plugin.Components.Entity.Current('LiteMol', LiteMol.Plugin.VERSION.number)(LayoutRegion.Right, true),
                LiteMol.Plugin.Components.Transform.View(LayoutRegion.Right),
                LiteMol.Plugin.Components.Context.Log(LayoutRegion.Bottom, true),
                LiteMol.Plugin.Components.Context.Overlay(LayoutRegion.Root),
                LiteMol.Plugin.Components.Context.Toast(LayoutRegion.Main, true),
                LiteMol.Plugin.Components.Context.BackgroundTasks(LayoutRegion.Main, true)
            ],
            viewport: {
                view: Views.Visualization.Viewport,
                controlsView: Views.Visualization.ViewportControls
            },
            layoutView: Views.Layout,
            tree: {
                region: LayoutRegion.Left,
                view: Views.Entity.Tree
            }
        };
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        function getParam(name, regex) {
            var r = new RegExp(name + "=(" + regex + ")[&]?", 'i');
            return decodeURIComponent(((window.location.search || '').match(r) || [])[1] || '');
        }
        var plugin = LiteMol.Plugin.create({
            customSpecification: Viewer.PluginSpec,
            target: document.getElementById('app'),
            layoutState: { isExpanded: true }
        });
        plugin.context.logger.message("LiteMol Viewer " + Viewer.VERSION.number);
        var theme = getParam('theme', '[a-z]+').toLowerCase();
        if (theme === 'light') {
            plugin.setViewportBackground('#fff');
        }
        (function () {
            var pdbId = getParam('loadFromPDB', '[a-z0-9]+').toLowerCase().trim();
            if (pdbId.length === 4) {
                var t = plugin.createTransform().add(plugin.root, Viewer.PDBe.Data.DownloadMolecule, { id: pdbId });
                plugin.applyTransform(t);
                return;
            }
            var downloadUrl = getParam('loadFromURL', '[^&]+').trim();
            if (downloadUrl) {
                var format = LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF;
                switch (getParam('loadFromURLFormat', '[a-z]+').toLocaleLowerCase().trim()) {
                    case 'pdb':
                        format = LiteMol.Core.Formats.Molecule.SupportedFormats.PDB;
                        break;
                    case 'sdf':
                        format = LiteMol.Core.Formats.Molecule.SupportedFormats.SDF;
                        break;
                    case 'mmbcif':
                        format = LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF;
                        break;
                }
                var t = plugin.createTransform().add(plugin.root, Viewer.DataSources.DownloadMolecule, { id: downloadUrl, format: format });
                plugin.applyTransform(t);
            }
        })();
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
