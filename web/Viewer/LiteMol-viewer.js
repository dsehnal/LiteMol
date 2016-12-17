var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        Viewer.VERSION = { number: "1.2.0", date: "Dec 13 2016" };
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
                function getAtomName(id) {
                    return id.split(' ')[0];
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
                                chiralityMismatchSet.add(getAtomName(a));
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
                    Behaviour.prototype.getChainId = function (id) {
                        var idx = id.indexOf('-');
                        // check if we are in a computed chain.
                        if (idx > 0)
                            return id.substr(0, idx);
                        return id;
                    };
                    Behaviour.prototype.processInfo = function (info) {
                        var i = LiteMol.Bootstrap.Interactivity.Molecule.transformInteraction(info);
                        if (!i || i.residues.length > 1)
                            return void 0;
                        var r = this.report;
                        if (i.atoms.length === 1) {
                            var a = i.atoms[0];
                            var chain = r.get(this.getChainId(a.residue.chain.authAsymId));
                            var residue = chain ? chain.get(a.residue.authSeqNumber) : void 0;
                            var badChirality = residue ? residue.chiralityMismatches.has(a.name) : false;
                            if (!residue)
                                return void 0;
                            return "<div><small>[Validation]</small> Atom: <b>" + (badChirality ? 'Bad Chirality' : 'OK') + "</b>, Residue: <b>" + residue.flags.join(', ') + "</b></div>";
                        }
                        else {
                            var res = i.residues[0];
                            var chain = r.get(this.getChainId(res.chain.authAsymId));
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
                    var authName = model.atoms.authName;
                    for (var rI = 0, _rI = model.residues.count; rI < _rI; rI++) {
                        var repC = report.get(authAsymId[rI]);
                        if (!repC)
                            continue;
                        var repR = repC.get(authSeqNumber[rI]);
                        if (!repR)
                            continue;
                        var chiralityMismatches = repR.chiralityMismatches;
                        for (var aI = atomStartIndex[rI], _aI = atomEndIndex[rI]; aI < _aI; aI++) {
                            if (repR.isRed || chiralityMismatches.has(authName[aI]))
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
                    var _a = model.residues, authSeqNumber = _a.authSeqNumber, atomStartIndex = _a.atomStartIndex, atomEndIndex = _a.atomEndIndex, chainIndex = _a.chainIndex;
                    var sourceChainIndex = model.chains.sourceChainIndex;
                    var authAsymId = parent.chains.authAsymId;
                    var authName = model.atoms.authName;
                    for (var rI = 0, _rI = model.residues.count; rI < _rI; rI++) {
                        var repC = report.get(authAsymId[sourceChainIndex[chainIndex[rI]]]);
                        if (!repC)
                            continue;
                        var repR = repC.get(authSeqNumber[rI]);
                        if (!repR)
                            continue;
                        var chiralityMismatches = repR.chiralityMismatches;
                        for (var aI = atomStartIndex[rI], _aI = atomEndIndex[rI]; aI < _aI; aI++) {
                            if (repR.isRed || chiralityMismatches.has(authName[aI]))
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
    var Extensions;
    (function (Extensions) {
        var DensityStreaming;
        (function (DensityStreaming) {
            'use strict';
            var Entity = LiteMol.Bootstrap.Entity;
            var Transformer = LiteMol.Bootstrap.Entity.Transformer;
            var Tree = LiteMol.Bootstrap.Tree;
            DensityStreaming.Streaming = Entity.create({ name: 'Interactive Surface', typeClass: 'Behaviour', shortName: 'B_DS', description: 'Behaviour that downloads density data for molecule selection on demand.' });
            DensityStreaming.CreateStreaming = Tree.Transformer.create({
                id: 'density-streaming-create-streaming',
                name: 'Density Streaming',
                description: 'On demand download of density data when a residue or atom is selected.',
                from: [],
                to: [DensityStreaming.Streaming],
                isUpdatable: true,
                defaultParams: function () { return ({}); },
                customController: function (ctx, t, e) { return new LiteMol.Bootstrap.Components.Transform.DensityVisual(ctx, t, e); }
            }, function (ctx, a, t) {
                var params = t.params;
                var b = new DensityStreaming.Behaviour(ctx, {
                    styles: {
                        'EMD': params['EMD'],
                        '2Fo-Fc': params['2Fo-Fc'],
                        'Fo-Fc(+ve)': params['Fo-Fc(+ve)'],
                        'Fo-Fc(-ve)': params['Fo-Fc(-ve)']
                    },
                    source: t.params.source,
                    id: t.params.id,
                    radius: t.params.radius,
                    server: t.params.server,
                    maxQueryRegion: t.params.info.maxQueryRegion
                });
                return LiteMol.Bootstrap.Task.resolve('Behaviour', 'Background', DensityStreaming.Streaming.create(t, { label: "Density Streaming", behaviour: b }));
            }, function (ctx, b, t) {
                var oldParams = b.transform.params;
                var params = t.params;
                if (oldParams.radius !== params.radius)
                    return void 0;
                return LiteMol.Bootstrap.Task.create('Density', 'Background', function (ctx) {
                    ctx.update('Updating styles...');
                    var update = function () { Entity.nodeUpdated(b); ctx.resolve(Tree.Node.Null); };
                    b.props.behaviour.invalidateStyles(params).then(update).catch(update);
                });
            });
            DensityStreaming.Create = LiteMol.Bootstrap.Tree.Transformer.actionWithContext({
                id: 'density-streaming-create',
                name: 'Density Streaming',
                description: 'On demand download of density data when a residue or atom is selected.',
                from: [Entity.Molecule.Molecule],
                to: [Entity.Action],
                defaultParams: function (ctx, e) {
                    var source = 'X-ray';
                    var method = (e.props.molecule.properties.experimentMethod || '').toLowerCase();
                    if (method.indexOf('microscopy') >= 0)
                        source = 'EMD';
                    return { server: ctx.settings.get('extensions.densityStreaming.defaultServer'), id: e.props.molecule.id, source: source };
                },
                validateParams: function (p) {
                    if (!p.server.trim().length)
                        return ['Enter Server'];
                    return !p.id.trim().length ? ['Enter Id'] : void 0;
                }
            }, function (context, a, t) {
                switch (t.params.source) {
                    case 'X-ray': return doCS(a, context, t.params);
                    case 'EMD': return doEmd(a, context, t.params);
                    default: return fail(a, 'Unknown data source.');
                }
            });
            function fail(e, message) {
                return {
                    action: LiteMol.Bootstrap.Tree.Transform.build()
                        .add(e, Transformer.Basic.Fail, { title: 'Density Streaming', message: message }),
                    context: void 0
                };
            }
            function doAction(m, params, info, sourceId, contourLevel) {
                var radius = info.maxQueryRegion.reduce(function (m, v) { return Math.min(m, v); }, info.maxQueryRegion[0]) / 2 - 3;
                var styles = params.source === 'EMD'
                    ? {
                        'EMD': LiteMol.Bootstrap.Visualization.Density.Style.create({
                            isoValue: contourLevel !== void 0 ? contourLevel : 1.5,
                            isoValueType: contourLevel !== void 0 ? LiteMol.Bootstrap.Visualization.Density.IsoValueType.Absolute : LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma,
                            color: LiteMol.Visualization.Color.fromHex(0x638F8F),
                            isWireframe: false,
                            transparency: { alpha: 0.3 },
                            taskType: 'Background'
                        })
                    }
                    : {
                        '2Fo-Fc': LiteMol.Bootstrap.Visualization.Density.Style.create({
                            isoValue: 1.5,
                            isoValueType: LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma,
                            color: LiteMol.Visualization.Color.fromHex(0x3362B2),
                            isWireframe: false,
                            transparency: { alpha: 0.4 },
                            taskType: 'Background'
                        }),
                        'Fo-Fc(+ve)': LiteMol.Bootstrap.Visualization.Density.Style.create({
                            isoValue: 3,
                            isoValueType: LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma,
                            color: LiteMol.Visualization.Color.fromHex(0x33BB33),
                            isWireframe: true,
                            transparency: { alpha: 1.0 },
                            taskType: 'Background'
                        }),
                        'Fo-Fc(-ve)': LiteMol.Bootstrap.Visualization.Density.Style.create({
                            isoValue: -3,
                            isoValueType: LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma,
                            color: LiteMol.Visualization.Color.fromHex(0xBB3333),
                            isWireframe: true,
                            transparency: { alpha: 1.0 },
                            taskType: 'Background'
                        })
                    };
                var streaming = __assign({ minRadius: 0, maxRadius: params.source === 'X-ray' ? Math.min(10, radius) : Math.min(50, radius), radius: Math.min(5, radius), server: params.server, source: params.source, id: sourceId ? sourceId : params.id, info: info }, styles);
                return {
                    action: LiteMol.Bootstrap.Tree.Transform.build().add(m, DensityStreaming.CreateStreaming, streaming),
                    context: void 0
                };
            }
            function doCS(m, ctx, params, sourceId, contourLevel) {
                var server = params.server.trim();
                if (server[server.length - 1] !== '/')
                    server += '/';
                var uri = "" + server + params.source + "/" + (sourceId ? sourceId : params.id);
                return new LiteMol.Promise(function (res, rej) {
                    LiteMol.Bootstrap.Utils.ajaxGetString(uri, 'DensityServer')
                        .run(ctx)
                        .then(function (s) {
                        try {
                            var json = JSON.parse(s);
                            if (!json.isAvailable) {
                                res(fail(m, "Density streaming is not available for '" + params.source + "/" + params.id + "'."));
                                return;
                            }
                            res(doAction(m, params, { maxQueryRegion: json.maxQueryRegion, data: json.dataInfo }, sourceId, contourLevel));
                        }
                        catch (e) {
                            res(fail(e, 'DensityServer API call failed.'));
                        }
                    })
                        .catch(function (e) { return res(fail(e, 'DensityServer API call failed.')); });
                });
            }
            function doEmdbId(m, ctx, params, id) {
                return new LiteMol.Promise(function (res, rej) {
                    id = id.trim();
                    LiteMol.Bootstrap.Utils.ajaxGetString("https://www.ebi.ac.uk/pdbe/api/emdb/entry/map/EMD-" + id, 'EMDB API')
                        .run(ctx)
                        .then(function (s) {
                        try {
                            var json = JSON.parse(s);
                            var contour = void 0;
                            var e = json['EMD-' + id];
                            if (e && e[0] && e[0].map && e[0].map.contour_level && e[0].map.contour_level.value !== void 0) {
                                contour = +e[0].map.contour_level.value;
                            }
                            doCS(m, ctx, params, id, contour)
                                .then(function (a) { return res(a); })
                                .catch(function () { return res(fail(m, 'Something went terribly wrong.')); });
                        }
                        catch (e) {
                            res(fail(m, 'EMDB API call failed.'));
                        }
                    })
                        .catch(function (e) { return res(fail(m, 'EMDB API call failed.')); });
                });
            }
            function doEmd(m, ctx, params) {
                return new LiteMol.Promise(function (res, rej) {
                    var id = params.id.trim().toLowerCase();
                    LiteMol.Bootstrap.Utils.ajaxGetString("https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary/" + id, 'PDB API')
                        .run(ctx)
                        .then(function (s) {
                        try {
                            var json = JSON.parse(s);
                            var emdbId = void 0;
                            var e = json[id];
                            if (e && e[0] && e[0].related_structures) {
                                var emdb = e[0].related_structures.filter(function (s) { return s.resource === 'EMDB'; });
                                if (!emdb.length) {
                                    res(fail(m, "No related EMDB entry found for '" + id + "'."));
                                    return;
                                }
                                emdbId = emdb[0].accession.split('-')[1];
                            }
                            else {
                                res(fail(m, "No related EMDB entry found for '" + id + "'."));
                                return;
                            }
                            doEmdbId(m, ctx, params, emdbId)
                                .then(function (a) { return res(a); })
                                .catch(function () { return res(fail(m, 'Something went terribly wrong.')); });
                        }
                        catch (e) {
                            res(fail(m, 'PDBe API call failed.'));
                        }
                    })
                        .catch(function (e) { return res(fail(m, 'PDBe API call failed.')); });
                });
            }
        })(DensityStreaming = Extensions.DensityStreaming || (Extensions.DensityStreaming = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var DensityStreaming;
        (function (DensityStreaming) {
            'use strict';
            var Entity = LiteMol.Bootstrap.Entity;
            var Transformer = LiteMol.Bootstrap.Entity.Transformer;
            var Utils = LiteMol.Bootstrap.Utils;
            var Interactivity = LiteMol.Bootstrap.Interactivity;
            DensityStreaming.FieldSources = ['X-ray', 'EMD'];
            var ToastKey = '__ShowDynamicDensity-toast';
            var Behaviour = (function () {
                function Behaviour(context, params) {
                    this.context = context;
                    this.params = params;
                    this.obs = [];
                    this.groups = {
                        requested: new Set(),
                        shown: new Set(),
                        locked: new Set(),
                        toBeRemoved: new Set()
                    };
                    this.removedGroups = new Set();
                    this.download = void 0;
                    this.isBusy = false;
                    this.dataBox = void 0;
                    this.server = params.server;
                    if (this.server[this.server.length - 1] === '/')
                        this.server = this.server.substr(0, this.server.length - 1);
                    if (params.source === 'EMD') {
                        this.types = ['EMD'];
                    }
                    else {
                        this.types = ['2Fo-Fc', 'Fo-Fc(+ve)', 'Fo-Fc(-ve)'];
                    }
                }
                Behaviour.prototype.areBoxesSame = function (b) {
                    if (!this.dataBox)
                        return false;
                    for (var i = 0; i < 3; i++) {
                        if (b.a[i] !== this.dataBox.a[i] || b.b[i] !== this.dataBox.b[i])
                            return false;
                    }
                    return true;
                };
                Behaviour.prototype.stop = function () {
                    if (this.download) {
                        this.download.discard();
                        this.download = void 0;
                    }
                };
                Behaviour.prototype.remove = function (ref) {
                    for (var _i = 0, _a = this.context.select(ref); _i < _a.length; _i++) {
                        var e = _a[_i];
                        LiteMol.Bootstrap.Tree.remove(e);
                    }
                    this.groups.toBeRemoved.delete(ref);
                };
                Behaviour.prototype.clear = function () {
                    var _this = this;
                    this.stop();
                    this.groups.requested.forEach(function (g) { return _this.groups.toBeRemoved.add(g); });
                    this.groups.locked.forEach(function (g) { return _this.groups.toBeRemoved.add(g); });
                    this.groups.shown.forEach(function (g) { if (!_this.groups.locked.has(g))
                        _this.remove(g); });
                    this.groups.shown.clear();
                    this.dataBox = void 0;
                };
                Behaviour.prototype.groupDone = function (ref, ok) {
                    this.groups.requested.delete(ref);
                    if (this.groups.toBeRemoved.has(ref)) {
                        this.remove(ref);
                    }
                    else if (ok) {
                        this.groups.shown.add(ref);
                    }
                };
                Behaviour.prototype.checkResult = function (data) {
                    var server = data.dataBlocks.filter(function (b) { return b.header === 'SERVER'; })[0];
                    if (!server)
                        return false;
                    var cat = server.getCategory('_density_server_result');
                    if (!cat)
                        return false;
                    if (cat.getColumn('is_empty').getString(0) === 'yes' || cat.getColumn('has_error').getString(0) === 'yes') {
                        return false;
                    }
                    return true;
                };
                Behaviour.prototype.apply = function (b) {
                    return LiteMol.Bootstrap.Tree.Transform.apply(this.context, b).run(this.context);
                };
                Behaviour.prototype.createXray = function (data) {
                    return __awaiter(this, void 0, void 0, function () {
                        var twoFB, oneFB, twoF, oneF, action, ref, group, styles, twoFoFc, foFc, a, b, c, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 5, , 6]);
                                    twoFB = data.dataBlocks.filter(function (b) { return b.header === '2FO-FC'; })[0];
                                    oneFB = data.dataBlocks.filter(function (b) { return b.header === 'FO-FC'; })[0];
                                    if (!twoFB || !oneFB)
                                        return [2 /*return*/];
                                    twoF = LiteMol.Core.Formats.Density.CIF.parse(twoFB);
                                    oneF = LiteMol.Core.Formats.Density.CIF.parse(oneFB);
                                    if (twoF.isError || oneF.isError)
                                        return [2 /*return*/];
                                    action = LiteMol.Bootstrap.Tree.Transform.build();
                                    ref = Utils.generateUUID();
                                    this.groups.requested.add(ref);
                                    group = action.add(this.behaviour, Transformer.Basic.CreateGroup, { label: 'Density' }, { ref: ref, isHidden: true });
                                    styles = this.params.styles;
                                    twoFoFc = group.then(Transformer.Density.CreateFromData, { id: '2Fo-Fc', data: twoF.result }, { ref: ref + '2Fo-Fc-data' });
                                    foFc = group.then(Transformer.Density.CreateFromData, { id: 'Fo-Fc', data: oneF.result }, { ref: ref + 'Fo-Fc-data' });
                                    return [4 /*yield*/, this.apply(action)];
                                case 1:
                                    _a.sent();
                                    a = this.apply(LiteMol.Bootstrap.Tree.Transform.build().add(ref + '2Fo-Fc-data', Transformer.Density.CreateVisual, { style: styles['2Fo-Fc'] }, { ref: ref + '2Fo-Fc' }));
                                    b = this.apply(LiteMol.Bootstrap.Tree.Transform.build().add(ref + 'Fo-Fc-data', Transformer.Density.CreateVisual, { style: styles['Fo-Fc(+ve)'] }, { ref: ref + 'Fo-Fc(+ve)' }));
                                    c = this.apply(LiteMol.Bootstrap.Tree.Transform.build().add(ref + 'Fo-Fc-data', Transformer.Density.CreateVisual, { style: styles['Fo-Fc(-ve)'] }, { ref: ref + 'Fo-Fc(-ve)' }));
                                    return [4 /*yield*/, a];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, b];
                                case 3:
                                    _a.sent();
                                    return [4 /*yield*/, c];
                                case 4:
                                    _a.sent();
                                    this.groupDone(ref, true);
                                    return [3 /*break*/, 6];
                                case 5:
                                    e_1 = _a.sent();
                                    this.context.logger.error('[Density] ' + e_1);
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    });
                };
                Behaviour.prototype.createEmd = function (data) {
                    var _this = this;
                    var emdB = data.dataBlocks.filter(function (b) { return b.header === 'EM'; })[0];
                    if (!emdB)
                        return false;
                    var emd = LiteMol.Core.Formats.Density.CIF.parse(emdB);
                    if (emd.isError)
                        return false;
                    var action = LiteMol.Bootstrap.Tree.Transform.build();
                    var ref = Utils.generateUUID();
                    this.groups.requested.add(ref);
                    var styles = this.params.styles; //  this.updateStyles(box);
                    action.add(this.behaviour, Transformer.Basic.CreateGroup, { label: 'Density' }, { ref: ref, isHidden: true })
                        .then(Transformer.Density.CreateFromData, { id: 'EMD', data: emd.result })
                        .then(Transformer.Density.CreateVisual, { style: styles['EMD'] }, { ref: ref + 'EMD' });
                    LiteMol.Bootstrap.Tree.Transform.apply(this.context, action).run(this.context)
                        .then(function () { return _this.groupDone(ref, true); })
                        .catch(function () { return _this.groupDone(ref, false); });
                };
                Behaviour.prototype.clampBox = function (box) {
                    var max = this.params.maxQueryRegion;
                    for (var i = 0; i < 3; i++) {
                        var d = box.b[i] - box.a[i];
                        if (d < max[i])
                            continue;
                        var r = max[i] / 2;
                        var m = 0.5 * (box.b[i] + box.a[i]);
                        box.a[i] = m - r;
                        box.b[i] = m + r;
                    }
                    return box;
                };
                Behaviour.prototype.update = function (info) {
                    var _this = this;
                    if (!Interactivity.Molecule.isMoleculeModelInteractivity(info)) {
                        this.clear();
                        return;
                    }
                    LiteMol.Bootstrap.Command.Toast.Hide.dispatch(this.context, { key: ToastKey });
                    var i = info;
                    var model = Utils.Molecule.findModel(i.source);
                    var elems = i.elements;
                    var m = model.props.model;
                    if (i.elements.length === 1) {
                        elems = Utils.Molecule.getResidueIndices(m, i.elements[0]);
                    }
                    var _a = Utils.Molecule.getBox(m, elems, this.params.radius), a = _a.bottomLeft, b = _a.topRight;
                    var box = this.clampBox({ a: a, b: b });
                    if (this.areBoxesSame(box))
                        return;
                    this.clear();
                    var url = "" + this.server
                        + ("/" + this.params.source)
                        + ("/" + this.params.id)
                        + ("/" + a.map(function (v) { return Math.round(1000 * v) / 1000; }).join(','))
                        + ("/" + b.map(function (v) { return Math.round(1000 * v) / 1000; }).join(','));
                    this.download = Utils.ajaxGetArrayBuffer(url, 'Density').run(this.context);
                    this.download.then(function (data) {
                        _this.clear();
                        _this.dataBox = box;
                        var cif = LiteMol.Core.Formats.CIF.Binary.parse(data);
                        if (cif.isError || !_this.checkResult(cif.result))
                            return;
                        if (_this.params.source === 'EMD')
                            _this.createEmd(cif.result);
                        else
                            _this.createXray(cif.result);
                    });
                };
                Behaviour.prototype.updateVisual = function (v, style) {
                    return Entity.Transformer.Density.CreateVisual.create({ style: style }, { ref: v.ref }).update(this.context, v).run(this.context);
                };
                Behaviour.prototype.invalidate = function (inputStyles) {
                    return __awaiter(this, void 0, LiteMol.Promise, function () {
                        var _this = this;
                        var _i, _a, t, styles, refs, _loop_1, this_1, _b, _c, t, _d, refs_1, r, _e;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    for (_i = 0, _a = this.types; _i < _a.length; _i++) {
                                        t = _a[_i];
                                        this.params.styles[t] = inputStyles[t];
                                    }
                                    if (!this.dataBox)
                                        return [2 /*return*/, true];
                                    styles = this.params.styles;
                                    refs = [];
                                    this.groups.shown.forEach(function (r) {
                                        refs.push(r);
                                        _this.groups.locked.add(r);
                                    });
                                    _loop_1 = function (t) {
                                        var s, vs, _i, vs_1, v;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    s = styles[t];
                                                    if (!s)
                                                        return [2 /*return*/, "continue"];
                                                    vs = this_1.context.select((_e = LiteMol.Bootstrap.Tree.Selection).byRef.apply(_e, refs.map(function (r) { return r + t; })));
                                                    _i = 0, vs_1 = vs;
                                                    _a.label = 1;
                                                case 1:
                                                    if (!(_i < vs_1.length))
                                                        return [3 /*break*/, 4];
                                                    v = vs_1[_i];
                                                    return [4 /*yield*/, this_1.updateVisual(v, s)];
                                                case 2:
                                                    _a.sent();
                                                    _a.label = 3;
                                                case 3:
                                                    _i++;
                                                    return [3 /*break*/, 1];
                                                case 4: return [2 /*return*/];
                                            }
                                        });
                                    };
                                    this_1 = this;
                                    _b = 0, _c = this.types;
                                    _f.label = 1;
                                case 1:
                                    if (!(_b < _c.length))
                                        return [3 /*break*/, 4];
                                    t = _c[_b];
                                    return [5 /*yield**/, _loop_1(t)];
                                case 2:
                                    _f.sent();
                                    _f.label = 3;
                                case 3:
                                    _b++;
                                    return [3 /*break*/, 1];
                                case 4:
                                    // unlock and delete if the request is pending
                                    for (_d = 0, refs_1 = refs; _d < refs_1.length; _d++) {
                                        r = refs_1[_d];
                                        this.groups.locked.delete(r);
                                        if (this.groups.toBeRemoved.has(r))
                                            this.remove(r);
                                    }
                                    return [2 /*return*/, true];
                            }
                        });
                    });
                };
                Behaviour.prototype.invalidateStyles = function (styles) {
                    return __awaiter(this, void 0, LiteMol.Promise, function () {
                        return __generator(this, function (_a) {
                            try {
                                return [2 /*return*/, this.invalidate(styles)];
                            }
                            catch (e) {
                                return [2 /*return*/, true];
                            }
                            return [2 /*return*/];
                        });
                    });
                };
                Behaviour.prototype.dispose = function () {
                    this.clear();
                    LiteMol.Bootstrap.Command.Toast.Hide.dispatch(this.context, { key: ToastKey });
                    for (var _i = 0, _a = this.obs; _i < _a.length; _i++) {
                        var o = _a[_i];
                        o.dispose();
                    }
                    this.obs = [];
                };
                Behaviour.prototype.register = function (behaviour) {
                    var _this = this;
                    this.behaviour = behaviour;
                    LiteMol.Bootstrap.Command.Toast.Show.dispatch(this.context, { key: ToastKey, title: 'Density', message: 'Streaming enabled, click on a residue or an atom to view the data.', timeoutMs: 30 * 1000 });
                    this.obs.push(this.context.behaviours.select.subscribe(function (e) {
                        _this.update(e);
                    }));
                };
                return Behaviour;
            }());
            DensityStreaming.Behaviour = Behaviour;
        })(DensityStreaming = Extensions.DensityStreaming || (Extensions.DensityStreaming = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var DensityStreaming;
        (function (DensityStreaming) {
            'use strict';
            var React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
            var Controls = LiteMol.Plugin.Controls;
            var CreateView = (function (_super) {
                __extends(CreateView, _super);
                function CreateView() {
                    return _super.apply(this, arguments) || this;
                }
                CreateView.prototype.renderControls = function () {
                    var _this = this;
                    var params = this.params;
                    return React.createElement("div", null,
                        React.createElement(Controls.OptionsGroup, { options: DensityStreaming.FieldSources, caption: function (s) { return s; }, current: params.source, onChange: function (o) { return _this.updateParams({ source: o }); }, label: 'Source', title: 'Determines how to obtain the data.' }),
                        React.createElement(Controls.TextBoxGroup, { value: params.id, onChange: function (v) { return _this.updateParams({ id: v }); }, label: 'Id', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter id...' }),
                        React.createElement(Controls.TextBoxGroup, { value: params.server, onChange: function (v) { return _this.updateParams({ server: v }); }, label: 'Server', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter server...' }));
                };
                return CreateView;
            }(LiteMol.Plugin.Views.Transform.ControllerBase));
            DensityStreaming.CreateView = CreateView;
            var IsoInfo = {
                'EMD': { min: -5, max: 5, dataKey: 'EM' },
                '2Fo-Fc': { min: 0, max: 2, dataKey: '2FO-FC' },
                'Fo-Fc(+ve)': { min: 0, max: 5, dataKey: 'FO-FC' },
                'Fo-Fc(-ve)': { min: -5, max: 0, dataKey: 'FO-FC' },
            };
            var StreamingView = (function (_super) {
                __extends(StreamingView, _super);
                function StreamingView() {
                    return _super.apply(this, arguments) || this;
                }
                StreamingView.prototype.iso = function (type) {
                    var _this = this;
                    var data = LiteMol.Bootstrap.Tree.Node.findClosestNodeOfType(this.transformSourceEntity, [LiteMol.Bootstrap.Entity.Density.Data]);
                    var params = this.params[type].params;
                    var isSigma = params.isoValueType === LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma;
                    var label = isSigma ? type + " \u03C3" : type;
                    var info = this.params.info.data[IsoInfo[type].dataKey];
                    return React.createElement(Controls.Slider, { label: label, onChange: function (v) { return _this.controller.updateStyleParams({ isoValue: v }, type); }, min: isSigma ? IsoInfo[type].min : info.min, max: isSigma ? IsoInfo[type].max : info.max, value: params.isoValue, step: 0.001 });
                };
                StreamingView.prototype.style = function (type) {
                    var _this = this;
                    var showTypeOptions = this.getPersistentState('showTypeOptions-' + type, false);
                    var theme = this.params[type].theme;
                    var params = this.params[type].params;
                    var color = theme.colors.get('Uniform');
                    return React.createElement(Controls.ExpandableGroup, { select: this.iso(type), expander: React.createElement(Controls.ControlGroupExpander, { isExpanded: showTypeOptions, onChange: function (e) { return _this.setPersistentState('showTypeOptions-' + type, e); } }), colorStripe: color, options: [
                            React.createElement(Controls.ToggleColorPicker, { key: 'Uniform', label: 'Color', color: color, onChange: function (c) { return _this.controller.updateThemeColor('Uniform', c, type); } }),
                            React.createElement(LiteMol.Plugin.Views.Transform.TransparencyControl, { definition: theme.transparency, onChange: function (d) { return _this.controller.updateThemeTransparency(d, type); } }),
                            React.createElement(Controls.Toggle, { onChange: function (v) { return _this.controller.updateStyleParams({ isWireframe: v }, type); }, value: params.isWireframe, label: 'Wireframe' })
                        ], isExpanded: showTypeOptions });
                };
                StreamingView.prototype.renderControls = function () {
                    var _this = this;
                    var params = this.params;
                    return React.createElement("div", null,
                        params.source === 'EMD'
                            ? [this.style('EMD')]
                            : [this.style('2Fo-Fc'), this.style('Fo-Fc(+ve)'), this.style('Fo-Fc(-ve)')],
                        React.createElement(Controls.Slider, { label: 'Radius', onChange: function (v) { return _this.autoUpdateParams({ radius: v }); }, min: params.minRadius !== void 0 ? params.minRadius : 0, max: params.maxRadius !== void 0 ? params.maxRadius : 10, step: 0.005, value: params.radius }));
                };
                return StreamingView;
            }(LiteMol.Plugin.Views.Transform.ControllerBase));
            DensityStreaming.StreamingView = StreamingView;
        })(DensityStreaming = Extensions.DensityStreaming || (Extensions.DensityStreaming = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
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
                Data.DensitySourceLabels = {
                    'electron-density': 'Electron Density',
                    'emdb-pdbid': 'EMDB (from PDB ID)',
                    'emdb-id': 'EMDB'
                };
                Data.DensitySources = ['electron-density', 'emdb-pdbid', 'emdb-id'];
                function doElectron(a, t, id) {
                    var action = Bootstrap.Tree.Transform.build();
                    id = id.trim().toLowerCase();
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
                        url: "https://www.ebi.ac.uk/pdbe/static/files/em/maps/emd_" + id + ".map.gz",
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
                    return new LiteMol.Promise(function (res, rej) {
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
                                res(fail(a, 'PDBe API call failed.'));
                            }
                        })
                            .catch(function (e) { return res(fail(a, 'PDBe API call failed.')); });
                    });
                }
                function doEmdbId(ctx, a, t, id) {
                    return new LiteMol.Promise(function (res, rej) {
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
                            'emdb-id': '3121',
                            'emdb-pdbid': '5aco'
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
                        ctx.logger.error("Density for ID '" + id + "' failed to load.");
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
                    var _loop_2 = function (g) {
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
                        _loop_2(g);
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
                'density.defaultVisualBehaviourRadius': 5,
                'extensions.densityStreaming.defaultServer': 'https://webchemdev.ncbr.muni.cz/DensityServer/'
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
                { transformer: Transformer.Density.CreateFromCif, view: Views.Transform.Molecule.CreateFromMmCif },
                { transformer: Transformer.Density.CreateVisual, view: Views.Transform.Density.CreateVisual },
                { transformer: Transformer.Density.CreateVisualBehaviour, view: Views.Transform.Density.CreateVisualBehaviour },
                { transformer: LiteMol.Extensions.DensityStreaming.Create, view: LiteMol.Extensions.DensityStreaming.CreateView },
                { transformer: LiteMol.Extensions.DensityStreaming.CreateStreaming, view: LiteMol.Extensions.DensityStreaming.StreamingView },
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
