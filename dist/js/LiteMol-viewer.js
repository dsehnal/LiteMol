var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        Viewer.VERSION = { number: "1.6.5", date: "Feb 8 2018" };
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
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
                defaultId: 'https://cs.litemol.org/1tqn/cartoon',
                urlTemplate: function (id) { return id; },
                isFullUrl: true
            });
            DataSources.ObtainDownloadSources = ['CoordinateServer', 'PDBe Updated mmCIF', 'URL', 'File on Disk'];
            DataSources.ObtainMolecule = Bootstrap.Tree.Transformer.action({
                id: 'viewer-obtain-molecule',
                name: 'Molecule',
                description: 'Download or open a molecule from various sources.',
                from: [Entity.Root],
                to: [Entity.Action],
                defaultParams: function (ctx) { return ({
                    sourceKind: 'CoordinateServer',
                    sources: {
                        'CoordinateServer': { kind: 'CoordinateServer', id: '1cbs', type: 'Full', lowPrecisionCoords: true, serverUrl: ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') ? ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') : 'https://cs.litemol.org' },
                        'PDBe Updated mmCIF': { kind: 'PDBe Updated mmCIF', id: '1cbs' },
                        'URL': { kind: 'URL', format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF, url: 'https://cs.litemol.org/1tqn/cartoon' },
                        'File on Disk': { kind: 'File on Disk', file: void 0 }
                    }
                }); },
                validateParams: function (p) {
                    var src = p.sources[p.sourceKind];
                    switch (src.kind) {
                        case 'CoordinateServer':
                            return (!src.id || !src.id.trim().length) ? ['Enter Id'] : (!src.serverUrl || !src.serverUrl.trim().length) ? ['Enter CoordinateServer base URL'] : void 0;
                        case 'PDBe Updated mmCIF':
                            return (!src.id || !src.id.trim().length) ? ['Enter Id'] : void 0;
                        case 'URL':
                            return (!src.url || !src.url.trim().length) ? ['Enter URL'] : void 0;
                        case 'File on Disk':
                            return (!src.file) ? ['Select a File'] : void 0;
                    }
                    return void 0;
                }
            }, function (context, a, t) {
                var src = t.params.sources[t.params.sourceKind];
                var transform = Bootstrap.Tree.Transform.build();
                switch (src.kind) {
                    case 'CoordinateServer':
                        transform.add(a, Viewer.PDBe.Data.DownloadBinaryCIFFromCoordinateServer, src);
                        break;
                    case 'PDBe Updated mmCIF':
                        transform.add(a, Viewer.PDBe.Data.DownloadMolecule, { id: src.id });
                        break;
                    case 'URL':
                        transform.add(a, DataSources.DownloadMolecule, { format: src.format, id: src.url });
                        break;
                    case 'File on Disk':
                        transform.add(a, Bootstrap.Entity.Transformer.Molecule.OpenMoleculeFromFile, { file: src.file });
                        break;
                }
                return transform;
            });
        })(DataSources = Viewer.DataSources || (Viewer.DataSources = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var ValidatorDB;
        (function (ValidatorDB) {
            var _this = this;
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
                var RedFlags = LiteMol.Core.Utils.FastSet.ofArray(['Missing', 'NotAnalyzed']);
                function isRed(flags) {
                    for (var _i = 0, flags_1 = flags; _i < flags_1.length; _i++) {
                        var f = flags_1[_i];
                        if (RedFlags.has(f))
                            return true;
                    }
                    return false;
                }
                function createReport(data) {
                    var report = LiteMol.Core.Utils.FastMap.create();
                    if (!data.Models)
                        return report;
                    var residue = { authSeqNumber: 0, authAsymId: '' };
                    var emptySet = LiteMol.Core.Utils.FastSet.create();
                    for (var _i = 0, _a = data.Models; _i < _a.length; _i++) {
                        var model = _a[_i];
                        for (var _b = 0, _c = model.Entries; _b < _c.length; _b++) {
                            var entry = _c[_b];
                            if (!entry.MainResidue)
                                continue;
                            getResidueId(entry.MainResidue, residue);
                            var residueReport = report.get(residue.authAsymId);
                            if (residueReport === void 0) {
                                residueReport = LiteMol.Core.Utils.FastMap.create();
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
                                    chiralityMismatchSet = LiteMol.Core.Utils.FastSet.create();
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
            })(Api = ValidatorDB.Api || (ValidatorDB.Api = {}));
            var Interactivity;
            (function (Interactivity) {
                var Behaviour = /** @class */ (function () {
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
                        if (!i || i.residues.length !== 1)
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
            })(Interactivity = ValidatorDB.Interactivity || (ValidatorDB.Interactivity = {}));
            var Theme;
            (function (Theme) {
                var colorMap = (function () {
                    var colors = LiteMol.Core.Utils.FastMap.create();
                    colors.set(0, { r: 0.4, g: 0.4, b: 0.4 });
                    colors.set(1, { r: 0, g: 1, b: 0 });
                    colors.set(2, { r: 1, g: 0, b: 0 });
                    return colors;
                })();
                var defaultColor = { r: 0.6, g: 0.6, b: 0.6 };
                var selectionColor = { r: 0, g: 0, b: 1 };
                var highlightColor = { r: 1, g: 0, b: 1 };
                function createAtomMapNormal(model, report) {
                    var map = new Uint8Array(model.data.atoms.count);
                    var _a = model.data.residues, authAsymId = _a.authAsymId, authSeqNumber = _a.authSeqNumber, atomStartIndex = _a.atomStartIndex, atomEndIndex = _a.atomEndIndex;
                    var authName = model.data.atoms.authName;
                    for (var rI = 0, _rI = model.data.residues.count; rI < _rI; rI++) {
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
                    var map = new Uint8Array(model.data.atoms.count);
                    var _a = model.data.residues, authSeqNumber = _a.authSeqNumber, atomStartIndex = _a.atomStartIndex, atomEndIndex = _a.atomEndIndex, chainIndex = _a.chainIndex;
                    var sourceChainIndex = model.data.chains.sourceChainIndex;
                    var authAsymId = parent.data.chains.authAsymId;
                    var authName = model.data.atoms.authName;
                    for (var rI = 0, _rI = model.data.residues.count; rI < _rI; rI++) {
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
                    var map = model.source === LiteMol.Core.Structure.Molecule.Model.Source.File
                        ? createAtomMapNormal(model, report)
                        : createAtomMapComputed(model, report);
                    var colors = LiteMol.Core.Utils.FastMap.create();
                    colors.set('Uniform', defaultColor);
                    colors.set('Selection', selectionColor);
                    colors.set('Highlight', highlightColor);
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
                return LiteMol.Bootstrap.Task.create("ValidatorDB Report (" + t.params.id + ")", 'Normal', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                    var data, report;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ctx.updateProgress('Parsing...')];
                            case 1:
                                _a.sent();
                                data = JSON.parse(a.props.data);
                                report = Api.createReport(data || {});
                                return [2 /*return*/, ValidatorDB.Report.create(t, { label: 'Ligand Validation Report', behaviour: new Interactivity.Behaviour(context, report) })];
                        }
                    });
                }); }).setReportTime(true);
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
                    .then(Create, { id: id }, { isBinding: true, ref: t.params.reportRef });
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
                return LiteMol.Bootstrap.Task.create('Validation Coloring', 'Background', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                    var molecule, themes, visuals, _i, visuals_1, v, model, theme;
                    return __generator(this, function (_a) {
                        molecule = LiteMol.Bootstrap.Tree.Node.findAncestor(a, LiteMol.Bootstrap.Entity.Molecule.Molecule);
                        if (!molecule) {
                            throw 'No suitable parent found.';
                        }
                        themes = LiteMol.Core.Utils.FastMap.create();
                        visuals = context.select(LiteMol.Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(LiteMol.Bootstrap.Entity.Molecule.Visual));
                        for (_i = 0, visuals_1 = visuals; _i < visuals_1.length; _i++) {
                            v = visuals_1[_i];
                            model = LiteMol.Bootstrap.Utils.Molecule.findModel(v);
                            if (!model)
                                continue;
                            theme = themes.get(model.id);
                            if (!theme) {
                                theme = Theme.create(model, a.props.behaviour.report);
                                themes.set(model.id, theme);
                            }
                            LiteMol.Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(context, { visual: v, theme: theme });
                        }
                        context.logger.message('Validation coloring applied.');
                        return [2 /*return*/, LiteMol.Bootstrap.Tree.Node.Null];
                    });
                }); });
            });
        })(ValidatorDB = Viewer.ValidatorDB || (Viewer.ValidatorDB = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var DensityStreaming;
        (function (DensityStreaming) {
            'use strict';
            DensityStreaming.FieldSources = ['X-ray', 'EM'];
            var ServerDataFormat;
            (function (ServerDataFormat) {
                var ValueType;
                (function (ValueType) {
                    ValueType.Float32 = 'float32';
                    ValueType.Int8 = 'int8';
                })(ValueType = ServerDataFormat.ValueType || (ServerDataFormat.ValueType = {}));
            })(ServerDataFormat = DensityStreaming.ServerDataFormat || (DensityStreaming.ServerDataFormat = {}));
        })(DensityStreaming = Extensions.DensityStreaming || (Extensions.DensityStreaming = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var DensityStreaming;
        (function (DensityStreaming) {
            'use strict';
            var _this = this;
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
                var b = new DensityStreaming.Behaviour(ctx, t.params);
                return LiteMol.Bootstrap.Task.resolve('Behaviour', 'Background', DensityStreaming.Streaming.create(t, { label: "Density Streaming", behaviour: b }));
            }, function (ctx, b, t) {
                return LiteMol.Bootstrap.Task.create('Density', 'Background', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                    var e_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, 3, 4]);
                                return [4 /*yield*/, b.props.behaviour.invalidateParams(t.params)];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 4];
                            case 2:
                                e_1 = _a.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                Entity.nodeUpdated(b);
                                return [2 /*return*/, Tree.Node.Null];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
            });
            DensityStreaming.Setup = LiteMol.Bootstrap.Tree.Transformer.actionWithContext({
                id: 'density-streaming-create',
                name: 'Density Streaming',
                description: 'On demand download of density data when a residue or atom is selected.',
                from: [Entity.Molecule.Molecule],
                to: [Entity.Action],
                defaultParams: function (ctx, e) {
                    var source = 'X-ray';
                    var methods = (e.props.molecule.properties.experimentMethods || []);
                    for (var _i = 0, methods_1 = methods; _i < methods_1.length; _i++) {
                        var m = methods_1[_i];
                        if (m.toLowerCase().indexOf('microscopy') >= 0) {
                            source = 'EM';
                            break;
                        }
                    }
                    return {
                        server: ctx.settings.get('extensions.densityStreaming.defaultServer'),
                        id: e.props.molecule.id,
                        source: source
                    };
                },
                validateParams: function (p) {
                    if (!p.server.trim().length)
                        return ['Enter Server'];
                    return !p.id.trim().length ? ['Enter Id'] : void 0;
                }
            }, function (context, a, t) {
                switch (t.params.source) {
                    case 'X-ray': return enableStreaming(a, context, t.params);
                    case 'EM': return doEm(a, context, t.params);
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
            function doAction(m, params, header, sourceId, contourLevel) {
                var taskType = 'Silent';
                var styles = params.source === 'EM'
                    ? {
                        'EM': LiteMol.Bootstrap.Visualization.Density.Style.create({
                            isoValue: contourLevel !== void 0 ? contourLevel : 1.5,
                            isoValueType: contourLevel !== void 0 ? LiteMol.Bootstrap.Visualization.Density.IsoValueType.Absolute : LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma,
                            color: LiteMol.Visualization.Color.fromHex(0x638F8F),
                            isWireframe: false,
                            transparency: { alpha: 0.3 },
                            taskType: taskType
                        })
                    }
                    : {
                        '2Fo-Fc': LiteMol.Bootstrap.Visualization.Density.Style.create({
                            isoValue: 1.5,
                            isoValueType: LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma,
                            color: LiteMol.Visualization.Color.fromHex(0x3362B2),
                            isWireframe: false,
                            transparency: { alpha: 0.4 },
                            taskType: taskType
                        }),
                        'Fo-Fc(+ve)': LiteMol.Bootstrap.Visualization.Density.Style.create({
                            isoValue: 3,
                            isoValueType: LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma,
                            color: LiteMol.Visualization.Color.fromHex(0x33BB33),
                            isWireframe: true,
                            transparency: { alpha: 1.0 },
                            taskType: taskType
                        }),
                        'Fo-Fc(-ve)': LiteMol.Bootstrap.Visualization.Density.Style.create({
                            isoValue: -3,
                            isoValueType: LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma,
                            color: LiteMol.Visualization.Color.fromHex(0xBB3333),
                            isWireframe: true,
                            transparency: { alpha: 1.0 },
                            taskType: taskType
                        })
                    };
                var streaming = __assign({ maxRadius: params.source === 'X-ray' ? 10 : 50, server: params.server, source: params.source, id: sourceId ? sourceId : params.id, header: header, isoValueType: params.source === 'X-ray' || contourLevel === void 0
                        ? LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma
                        : LiteMol.Bootstrap.Visualization.Density.IsoValueType.Absolute, isoValues: params.source === 'X-ray'
                        ? { '2Fo-Fc': 1.5, 'Fo-Fc(+ve)': 3, 'Fo-Fc(-ve)': -3 }
                        : { 'EM': contourLevel !== void 0 ? contourLevel : 1.5 }, displayType: params.source === 'X-ray' ? 'Around Selection' : 'Everything', detailLevel: Math.min(2, header.availablePrecisions.length - 1), radius: params.source === 'X-ray' ? 5 : 15, showEverythingExtent: 3 }, styles, params.initialStreamingParams);
                return {
                    action: LiteMol.Bootstrap.Tree.Transform.build().add(m, DensityStreaming.CreateStreaming, streaming, { ref: params.streamingEntityRef }),
                    context: void 0
                };
            }
            function enableStreaming(m, ctx, params, sourceId, contourLevel) {
                return __awaiter(this, void 0, void 0, function () {
                    var server, uri, s, header;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                server = params.server.trim();
                                if (server[server.length - 1] !== '/')
                                    server += '/';
                                uri = "" + server + params.source + "/" + (sourceId ? sourceId : params.id);
                                return [4 /*yield*/, LiteMol.Bootstrap.Utils.ajaxGetString(uri, 'DensityServer').run(ctx)];
                            case 1:
                                s = _a.sent();
                                try {
                                    header = JSON.parse(s);
                                    if (!header.isAvailable) {
                                        return [2 /*return*/, fail(m, "Density streaming is not available for '" + params.source + "/" + params.id + "'.")];
                                    }
                                    header.channels = header.channels.map(function (c) { return c.toUpperCase(); });
                                    return [2 /*return*/, doAction(m, params, header, sourceId, contourLevel)];
                                }
                                catch (e) {
                                    return [2 /*return*/, fail(e, 'DensityServer API call failed.')];
                                }
                                return [2 /*return*/];
                        }
                    });
                });
            }
            function doEmdbId(m, ctx, params, id) {
                return __awaiter(this, void 0, void 0, function () {
                    var s, json, e, contour, e_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                id = id.trim();
                                return [4 /*yield*/, LiteMol.Bootstrap.Utils.ajaxGetString("https://www.ebi.ac.uk/pdbe/api/emdb/entry/map/" + id, 'EMDB API').run(ctx)];
                            case 1:
                                s = _a.sent();
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 4, , 5]);
                                json = JSON.parse(s);
                                e = json[id];
                                contour = void 0;
                                if (e && e[0] && e[0].map && e[0].map.contour_level && e[0].map.contour_level.value !== void 0) {
                                    contour = +e[0].map.contour_level.value;
                                }
                                return [4 /*yield*/, enableStreaming(m, ctx, params, id, contour)];
                            case 3: return [2 /*return*/, _a.sent()];
                            case 4:
                                e_2 = _a.sent();
                                return [2 /*return*/, fail(m, 'EMDB API call failed.')];
                            case 5: return [2 /*return*/];
                        }
                    });
                });
            }
            function doEm(m, ctx, params) {
                return __awaiter(this, void 0, void 0, function () {
                    var id, s, json, e, emdbId, emdb, e_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                id = params.id.trim().toLowerCase();
                                return [4 /*yield*/, LiteMol.Bootstrap.Utils.ajaxGetString("https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary/" + id, 'PDB API').run(ctx)];
                            case 1:
                                s = _a.sent();
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 4, , 5]);
                                json = JSON.parse(s);
                                e = json[id];
                                emdbId = void 0;
                                if (e && e[0] && e[0].related_structures) {
                                    emdb = e[0].related_structures.filter(function (s) { return s.resource === 'EMDB'; });
                                    if (!emdb.length) {
                                        return [2 /*return*/, fail(m, "No related EMDB entry found for '" + id + "'.")];
                                    }
                                    emdbId = emdb[0].accession;
                                }
                                else {
                                    return [2 /*return*/, fail(m, "No related EMDB entry found for '" + id + "'.")];
                                }
                                return [4 /*yield*/, doEmdbId(m, ctx, params, emdbId)];
                            case 3: return [2 /*return*/, _a.sent()];
                            case 4:
                                e_3 = _a.sent();
                                return [2 /*return*/, fail(m, 'PDBe API call failed.')];
                            case 5: return [2 /*return*/];
                        }
                    });
                });
            }
        })(DensityStreaming = Extensions.DensityStreaming || (Extensions.DensityStreaming = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
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
            var ToastKey = '__ShowDynamicDensity-toast';
            var Behaviour = /** @class */ (function () {
                function Behaviour(context, params) {
                    this.context = context;
                    this.params = params;
                    this.obs = [];
                    this.groups = {
                        requested: LiteMol.Core.Utils.FastSet.create(),
                        shown: LiteMol.Core.Utils.FastSet.create(),
                        locked: LiteMol.Core.Utils.FastSet.create(),
                        toBeRemoved: LiteMol.Core.Utils.FastSet.create()
                    };
                    this.download = void 0;
                    this.selectionBox = void 0;
                    this.modelBoundingBox = void 0;
                    this.channels = void 0;
                    this.cache = LiteMol.Bootstrap.Utils.LRUCache.create(25);
                    this.performance = new LiteMol.Core.Utils.PerformanceMonitor();
                    this.wasCached = false;
                    this.server = params.server;
                    if (this.server[this.server.length - 1] === '/')
                        this.server = this.server.substr(0, this.server.length - 1);
                    if (params.source === 'EM') {
                        this.types = ['EM'];
                    }
                    else {
                        this.types = ['2Fo-Fc', 'Fo-Fc(+ve)', 'Fo-Fc(-ve)'];
                    }
                }
                Behaviour.prototype.areBoxesSame = function (b) {
                    if (!this.selectionBox)
                        return false;
                    for (var i = 0; i < 3; i++) {
                        if (b.a[i] !== this.selectionBox.a[i] || b.b[i] !== this.selectionBox.b[i])
                            return false;
                    }
                    return true;
                };
                Behaviour.prototype.getModelBoundingBox = function () {
                    if (this.modelBoundingBox)
                        return this.modelBoundingBox;
                    var sourceMolecule = Utils.Molecule.findMolecule(this.behaviour);
                    var _a = Utils.Molecule.getBox(sourceMolecule.props.molecule.models[0], sourceMolecule.props.molecule.models[0].data.atoms.indices, this.params.showEverythingExtent), a = _a.bottomLeft, b = _a.topRight;
                    this.modelBoundingBox = { a: a, b: b };
                    return this.modelBoundingBox;
                };
                Behaviour.prototype.stop = function () {
                    if (this.download) {
                        this.download.tryAbort();
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
                    this.channels = void 0;
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
                    return LiteMol.Bootstrap.Tree.Transform.apply(this.context, b).run();
                };
                Behaviour.prototype.finish = function () {
                    this.performance.end('query');
                    this.context.logger.info("[Density] Streaming done in " + this.performance.formatTime('query') + (this.wasCached ? ' (cached)' : '') + ".");
                };
                Behaviour.prototype.createXray = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var twoF, oneF, action, ref, group, styles, a, b, c, e_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 5, , 6]);
                                    if (!this.channels)
                                        return [2 /*return*/];
                                    this.syncStyles();
                                    twoF = this.channels['2FO-FC'];
                                    oneF = this.channels['FO-FC'];
                                    action = LiteMol.Bootstrap.Tree.Transform.build();
                                    ref = Utils.generateUUID();
                                    this.groups.requested.add(ref);
                                    group = action.add(this.behaviour, Transformer.Basic.CreateGroup, { label: 'Density' }, { ref: ref, isHidden: true });
                                    styles = this.params;
                                    group.then(Transformer.Density.CreateFromData, { id: '2Fo-Fc', data: twoF }, { ref: ref + '2Fo-Fc-data' });
                                    group.then(Transformer.Density.CreateFromData, { id: 'Fo-Fc', data: oneF }, { ref: ref + 'Fo-Fc-data' });
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
                                    this.finish();
                                    this.groupDone(ref, true);
                                    return [3 /*break*/, 6];
                                case 5:
                                    e_4 = _a.sent();
                                    this.context.logger.error('[Density] ' + e_4);
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    });
                };
                Behaviour.prototype.createEm = function () {
                    var _this = this;
                    try {
                        if (!this.channels)
                            return;
                        this.syncStyles();
                        var emd = this.channels['EM'];
                        var action = LiteMol.Bootstrap.Tree.Transform.build();
                        var ref_1 = Utils.generateUUID();
                        this.groups.requested.add(ref_1);
                        var styles = this.params;
                        action.add(this.behaviour, Transformer.Basic.CreateGroup, { label: 'Density' }, { ref: ref_1, isHidden: true })
                            .then(Transformer.Density.CreateFromData, { id: 'EM', data: emd })
                            .then(Transformer.Density.CreateVisual, { style: styles['EM'] }, { ref: ref_1 + 'EM' });
                        LiteMol.Bootstrap.Tree.Transform.apply(this.context, action).run()
                            .then(function () { _this.finish(); _this.groupDone(ref_1, true); })
                            .catch(function () { return _this.groupDone(ref_1, false); });
                    }
                    catch (e) {
                        this.context.logger.error('[Density] ' + e);
                    }
                };
                Behaviour.prototype.extendSelectionBox = function () {
                    var _a = this.selectionBox, a = _a.a, b = _a.b;
                    var r = this.params.radius;
                    return {
                        a: a.map(function (v) { return v - r; }),
                        b: b.map(function (v) { return v + r; }),
                    };
                };
                Behaviour.prototype.isSameMolecule = function (info) {
                    var sourceMolecule = Utils.Molecule.findMolecule(this.behaviour);
                    var infoMolecule = Utils.Molecule.findMolecule(info.source);
                    return sourceMolecule === infoMolecule;
                };
                Behaviour.getChannel = function (data, name) {
                    var block = data.dataBlocks.filter(function (b) { return b.header === name; })[0];
                    if (!block) {
                        return void 0;
                    }
                    var density = LiteMol.Core.Formats.Density.CIF.parse(block);
                    if (density.isError)
                        return void 0;
                    return density.result;
                };
                Behaviour.prototype.noChannels = function () {
                    this.context.logger.warning('Density Streaming: No data.');
                    return void 0;
                };
                Behaviour.prototype.parseChannels = function (data) {
                    var cif = LiteMol.Core.Formats.CIF.Binary.parse(data);
                    if (cif.isError || !this.checkResult(cif.result))
                        return this.noChannels();
                    if (this.params.source === 'EM') {
                        var ch = Behaviour.getChannel(cif.result, 'EM');
                        if (!ch)
                            return this.noChannels();
                        return { 'EM': ch };
                    }
                    else {
                        var twoF = Behaviour.getChannel(cif.result, '2FO-FC');
                        if (!twoF)
                            return this.noChannels();
                        var oneF = Behaviour.getChannel(cif.result, 'FO-FC');
                        if (!oneF)
                            return this.noChannels();
                        return { '2FO-FC': twoF, 'FO-FC': oneF };
                    }
                };
                Behaviour.prototype.query = function (box) {
                    var _this = this;
                    this.clear();
                    var url = "" + this.server
                        + ("/" + this.params.source)
                        + ("/" + this.params.id);
                    if (box) {
                        var a = box.a, b = box.b;
                        url += "/box"
                            + ("/" + a.map(function (v) { return Math.round(1000 * v) / 1000; }).join(','))
                            + ("/" + b.map(function (v) { return Math.round(1000 * v) / 1000; }).join(','));
                    }
                    else {
                        url += "/cell";
                    }
                    url += "?detail=" + this.params.detailLevel;
                    this.performance.start('query');
                    var channels = LiteMol.Bootstrap.Utils.LRUCache.get(this.cache, url);
                    if (channels) {
                        this.clear();
                        this.channels = channels;
                        this.wasCached = true;
                        if (this.params.source === 'EM')
                            this.createEm();
                        else
                            this.createXray();
                        return;
                    }
                    this.download = Utils.ajaxGetArrayBuffer(url, 'Density').runWithContext(this.context);
                    this.download.result.then(function (data) {
                        _this.clear();
                        _this.channels = _this.parseChannels(data);
                        if (!_this.channels)
                            return;
                        _this.wasCached = false;
                        LiteMol.Bootstrap.Utils.LRUCache.set(_this.cache, url, _this.channels);
                        if (_this.params.source === 'EM')
                            _this.createEm();
                        else
                            _this.createXray();
                    });
                };
                Behaviour.prototype.tryUpdateSelectionDataBox = function (info) {
                    var i = info;
                    if (!Interactivity.Molecule.isMoleculeModelInteractivity(info) || !this.isSameMolecule(i)) {
                        var changed = this.selectionBox !== void 0;
                        this.selectionBox = void 0;
                        return changed;
                    }
                    var model = Utils.Molecule.findModel(i.source);
                    var elems = i.elements;
                    var m = model.props.model;
                    if (i.elements.length === 1) {
                        elems = Utils.Molecule.getResidueIndices(m, i.elements[0]);
                    }
                    var _a = Utils.Molecule.getBox(m, elems, 0), a = _a.bottomLeft, b = _a.topRight;
                    var box = { a: a, b: b };
                    if (this.areBoxesSame(box)) {
                        return false;
                    }
                    else {
                        this.selectionBox = box;
                        return true;
                    }
                };
                Behaviour.prototype.update = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            LiteMol.Bootstrap.Command.Toast.Hide.dispatch(this.context, { key: ToastKey });
                            if (this.params.displayType === 'Everything') {
                                if (this.params.source === 'EM') {
                                    if (this.params.forceBox)
                                        this.query(this.getModelBoundingBox());
                                    else
                                        this.query();
                                }
                                else {
                                    this.query(this.getModelBoundingBox());
                                }
                            }
                            else {
                                if (this.selectionBox) {
                                    this.query(this.extendSelectionBox());
                                }
                                else {
                                    this.clear();
                                }
                            }
                            return [2 /*return*/];
                        });
                    });
                };
                Behaviour.prototype.toSigma = function (type) {
                    ;
                    var index = this.params.header.channels.indexOf(DensityStreaming.IsoInfo[type].dataKey);
                    var valuesInfo = this.params.header.sampling[0].valuesInfo[index];
                    var value = this.params.isoValues[type];
                    return (value - valuesInfo.mean) / valuesInfo.sigma;
                };
                Behaviour.prototype.syncStyles = function () {
                    var taskType = this.params.displayType === 'Everything'
                        ? 'Background' : (this.params.radius > 15 ? 'Background' : 'Silent');
                    var isSigma = this.params.isoValueType === LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma;
                    for (var _i = 0, _a = this.types; _i < _a.length; _i++) {
                        var t = _a[_i];
                        var oldStyle = this.params[t];
                        var oldParams = oldStyle.params;
                        var isoValue = isSigma
                            ? this.params.isoValues[t]
                            : this.toSigma(t);
                        this.params[t] = __assign({}, oldStyle, { taskType: taskType, params: __assign({}, oldParams, { isoValueType: LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma, isoValue: isoValue }) });
                    }
                };
                Behaviour.prototype.updateVisual = function (v, style) {
                    return Entity.Transformer.Density.CreateVisual.create({ style: style }, { ref: v.ref }).update(this.context, v).run();
                };
                Behaviour.prototype.invalidateStyles = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var styles, refs, _loop_1, this_1, _i, _a, t, _b, refs_1, r;
                        var _this = this;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    if (this.groups.shown.size === 0)
                                        return [2 /*return*/];
                                    this.syncStyles();
                                    styles = this.params;
                                    refs = [];
                                    this.groups.shown.forEach(function (r) {
                                        refs.push(r);
                                        _this.groups.locked.add(r);
                                    });
                                    _loop_1 = function (t) {
                                        var _a, s, vs, _i, vs_1, v;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0:
                                                    s = styles[t];
                                                    if (!s)
                                                        return [2 /*return*/, "continue"];
                                                    vs = this_1.context.select((_a = LiteMol.Bootstrap.Tree.Selection).byRef.apply(_a, refs.map(function (r) { return r + t; })));
                                                    _i = 0, vs_1 = vs;
                                                    _b.label = 1;
                                                case 1:
                                                    if (!(_i < vs_1.length)) return [3 /*break*/, 4];
                                                    v = vs_1[_i];
                                                    return [4 /*yield*/, this_1.updateVisual(v, s)];
                                                case 2:
                                                    _b.sent();
                                                    _b.label = 3;
                                                case 3:
                                                    _i++;
                                                    return [3 /*break*/, 1];
                                                case 4: return [2 /*return*/];
                                            }
                                        });
                                    };
                                    this_1 = this;
                                    _i = 0, _a = this.types;
                                    _c.label = 1;
                                case 1:
                                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                                    t = _a[_i];
                                    return [5 /*yield**/, _loop_1(t)];
                                case 2:
                                    _c.sent();
                                    _c.label = 3;
                                case 3:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 4:
                                    // unlock and delete if the request is pending
                                    for (_b = 0, refs_1 = refs; _b < refs_1.length; _b++) {
                                        r = refs_1[_b];
                                        this.groups.locked.delete(r);
                                        if (this.groups.toBeRemoved.has(r))
                                            this.remove(r);
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                Behaviour.prototype.invalidateParams = function (newParams) {
                    return __awaiter(this, void 0, void 0, function () {
                        var oldParams;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    oldParams = this.params;
                                    if (oldParams.displayType !== newParams.displayType
                                        || oldParams.detailLevel !== newParams.detailLevel
                                        || oldParams.radius !== newParams.radius) {
                                        this.params = newParams;
                                        this.update();
                                        return [2 /*return*/];
                                    }
                                    this.params = newParams;
                                    return [4 /*yield*/, this.invalidateStyles()];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
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
                    var message = this.params.source === 'X-ray'
                        ? 'Streaming enabled, click on a residue or an atom to view the data.'
                        : "Streaming enabled, showing full surface. To view higher detail, use 'Around Selection' mode.";
                    LiteMol.Bootstrap.Command.Toast.Show.dispatch(this.context, { key: ToastKey, title: 'Density', message: message, timeoutMs: 30 * 1000 });
                    this.obs.push(this.context.behaviours.select.subscribe(function (e) {
                        if (_this.tryUpdateSelectionDataBox(e)) {
                            if (_this.params.displayType === 'Around Selection') {
                                _this.update();
                            }
                        }
                    }));
                    if (this.params.displayType === 'Everything')
                        this.update();
                };
                return Behaviour;
            }());
            DensityStreaming.Behaviour = Behaviour;
        })(DensityStreaming = Extensions.DensityStreaming || (Extensions.DensityStreaming = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var DensityStreaming;
        (function (DensityStreaming) {
            'use strict';
            var React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
            var Controls = LiteMol.Plugin.Controls;
            var CreateView = /** @class */ (function (_super) {
                __extends(CreateView, _super);
                function CreateView() {
                    return _super !== null && _super.apply(this, arguments) || this;
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
            DensityStreaming.IsoInfo = {
                'EM': { min: -5, max: 5, dataKey: 'EM' },
                '2Fo-Fc': { min: 0, max: 2, dataKey: '2FO-FC' },
                'Fo-Fc(+ve)': { min: 0, max: 5, dataKey: 'FO-FC' },
                'Fo-Fc(-ve)': { min: -5, max: 0, dataKey: 'FO-FC' },
            };
            var StreamingView = /** @class */ (function (_super) {
                __extends(StreamingView, _super);
                function StreamingView() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                StreamingView.prototype.updateIso = function (type, v) {
                    var _a;
                    var isoValues = __assign({}, this.params.isoValues, (_a = {}, _a[type] = v, _a));
                    this.controller.autoUpdateParams({ isoValues: isoValues });
                };
                StreamingView.prototype.iso = function (type) {
                    var _this = this;
                    var params = this.params;
                    var isSigma = params.isoValueType === LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma;
                    var label = isSigma ? type + " \u03C3" : type;
                    var valuesIndex = params.header.channels.indexOf(DensityStreaming.IsoInfo[type].dataKey);
                    var baseValuesInfo = params.header.sampling[0].valuesInfo[valuesIndex];
                    var sampledValuesInfo = params.header.sampling[params.header.sampling.length - 1].valuesInfo[valuesIndex];
                    var isoInfo = DensityStreaming.IsoInfo[type];
                    var value = params.isoValues[type];
                    var sigmaMin = (sampledValuesInfo.min - sampledValuesInfo.mean) / sampledValuesInfo.sigma;
                    var sigmaMax = (sampledValuesInfo.max - sampledValuesInfo.mean) / sampledValuesInfo.sigma;
                    var min, max;
                    if (isSigma) {
                        if (type === 'EM') {
                            min = Math.max((baseValuesInfo.min - baseValuesInfo.mean) / baseValuesInfo.sigma, sigmaMin);
                            max = Math.min((baseValuesInfo.max - baseValuesInfo.mean) / baseValuesInfo.sigma, sigmaMax);
                        }
                        else {
                            min = isoInfo.min;
                            max = isoInfo.max;
                        }
                    }
                    else {
                        min = Math.max(baseValuesInfo.mean + sigmaMin * baseValuesInfo.sigma, baseValuesInfo.min);
                        max = Math.min(baseValuesInfo.mean + sigmaMax * baseValuesInfo.sigma, baseValuesInfo.max);
                    }
                    return React.createElement(Controls.Slider, { label: label, onChange: function (v) { return _this.updateIso(type, v); }, min: min, max: max, value: value, step: 0.001 });
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
                StreamingView.prototype.details = function () {
                    var _this = this;
                    var availablePrecisions = this.params.header.availablePrecisions;
                    if (availablePrecisions.length < 2)
                        return void 0;
                    var params = this.params;
                    var detailLevel = params.detailLevel;
                    var options = availablePrecisions.map(function (p) {
                        var d = "" + Math.ceil(Math.pow(p.maxVoxels, (1 / 3)));
                        return d + " \u00D7 " + d + " \u00D7 " + d;
                    });
                    return React.createElement(Controls.OptionsGroup, { options: options, caption: function (s) { return s; }, current: options[detailLevel], title: 'Determines the detail level of the surface.', onChange: function (o) { return _this.autoUpdateParams({ detailLevel: options.indexOf(o) }); }, label: 'Max Voxels' });
                };
                StreamingView.prototype.updateValueType = function (toSigma) {
                    var params = this.params;
                    var isSigma = params.isoValueType === LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma;
                    if (isSigma === toSigma)
                        return;
                    var newValues = {};
                    for (var _i = 0, _a = Object.getOwnPropertyNames(params.isoValues); _i < _a.length; _i++) {
                        var k = _a[_i];
                        var valuesIndex = params.header.channels.indexOf(DensityStreaming.IsoInfo[k].dataKey);
                        var valuesInfo = params.header.sampling[0].valuesInfo[valuesIndex];
                        var value = params.isoValues[k];
                        newValues[k] = toSigma
                            ? (value - valuesInfo.mean) / valuesInfo.sigma
                            : valuesInfo.mean + valuesInfo.sigma * value;
                    }
                    this.controller.autoUpdateParams({
                        isoValueType: toSigma ? LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma : LiteMol.Bootstrap.Visualization.Density.IsoValueType.Absolute,
                        isoValues: newValues
                    });
                };
                StreamingView.prototype.displayType = function () {
                    var _this = this;
                    var showDisplayOptions = this.getPersistentState('showDisplayOptions', false);
                    var params = this.params;
                    var isSigma = params.isoValueType === LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma;
                    var show = React.createElement(Controls.OptionsGroup, { options: ['Everything', 'Around Selection'], caption: function (s) { return s; }, current: params.displayType, onChange: function (o) { return _this.autoUpdateParams({ displayType: o }); }, label: 'Show' });
                    return React.createElement(Controls.ExpandableGroup, { select: show, expander: React.createElement(Controls.ControlGroupExpander, { isExpanded: showDisplayOptions, onChange: function (e) { return _this.setPersistentState('showDisplayOptions', e); } }), options: [
                            this.details(),
                            React.createElement(Controls.Toggle, { onChange: function (v) { return _this.updateValueType(v); }, value: isSigma, label: 'Relative (\\u03C3)', title: 'Specify contour level as relative (\\u03C3) or absolute value.' })
                        ], isExpanded: showDisplayOptions });
                };
                StreamingView.prototype.renderControls = function () {
                    var _this = this;
                    var params = this.params;
                    return React.createElement("div", null,
                        params.source === 'EM'
                            ? [this.style('EM')]
                            : [this.style('2Fo-Fc'), this.style('Fo-Fc(+ve)'), this.style('Fo-Fc(-ve)')],
                        params.displayType === 'Everything'
                            ? void 0
                            : React.createElement(Controls.Slider, { label: 'Radius', onChange: function (v) { return _this.autoUpdateParams({ radius: v }); }, min: 0, max: params.maxRadius, step: 0.005, value: params.radius }),
                        this.displayType());
                };
                return StreamingView;
            }(LiteMol.Plugin.Views.Transform.ControllerBase));
            DensityStreaming.StreamingView = StreamingView;
        })(DensityStreaming = Extensions.DensityStreaming || (Extensions.DensityStreaming = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var ComplexReprensetation;
        (function (ComplexReprensetation) {
            var Carbohydrates;
            (function (Carbohydrates) {
                var Shapes;
                (function (Shapes) {
                    var THREE = LiteMol.Visualization.THREE;
                    var LA = LiteMol.Core.Geometry.LinearAlgebra;
                    var Geom = LiteMol.Core.Geometry;
                    var Vis = LiteMol.Visualization;
                    var Mat4 = LA.Matrix4;
                    var Vec3 = LA.Vector3;
                    var sqSide = 0.806; //Math.cos(Math.PI / 4);
                    Shapes.Sphere = toSurface(new THREE.IcosahedronGeometry(1.0, 2));
                    Shapes.Cube = toSurface(new THREE.BoxGeometry(2 * sqSide, 2 * sqSide, 2 * sqSide));
                    Shapes.Diamond = toSurface(new THREE.OctahedronGeometry(1.3, 0));
                    Shapes.Cone = toSurface(new THREE.CylinderGeometry(0, 1, 1.6, 32, 1), [0, 0.5, 0]);
                    Shapes.ConeLeft = toSurface(new THREE.CylinderGeometry(0, 1, 1.6, 16, 1, false, 0, Math.PI), [0, 0.5, 0]);
                    Shapes.ConeRight = toSurface(new THREE.CylinderGeometry(0, 1, 1.6, 16, 1, false, 0, -Math.PI), [0, 0.5, 0]);
                    Shapes.Star = toSurface(star());
                    Shapes.FlatRectangle = toSurface(new THREE.BoxGeometry(sqSide, sqSide, 2 * sqSide));
                    Shapes.FlatDiamond = toSurface(polygon(4, 0.66));
                    Shapes.FlatPentagon = toSurface(polygon(5, 0.66));
                    Shapes.FlatHexagon = toSurface(polygon(6, 0.66), void 0, [0.75, 1, 1]);
                    function toSurface(g, translation, scale) {
                        g.computeVertexNormals();
                        var geom = Vis.GeometryHelper.toSurface(g);
                        g.dispose();
                        if (scale) {
                            var t = Mat4.fromScaling(Mat4.zero(), scale);
                            Geom.Surface.transformImmediate(geom, t);
                        }
                        if (translation) {
                            var t = Mat4.fromTranslation(Mat4.zero(), translation);
                            Geom.Surface.transformImmediate(geom, t);
                        }
                        return geom;
                    }
                    function star() {
                        var pts = [], numPts = 5;
                        for (var i = 0; i < numPts * 2; i++) {
                            var l = i % 2 == 1 ? 0.2 : 0.85;
                            var a = i / numPts * Math.PI;
                            pts.push(new THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l));
                        }
                        return new THREE.ExtrudeGeometry(new THREE.Shape(pts), { amount: 0, steps: 2, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.15, bevelSegments: 12 });
                    }
                    function polygon(numPts, height) {
                        var pts = [];
                        for (var i = 0; i < numPts; i++) {
                            var a = 2 * i / numPts * Math.PI;
                            pts.push(new THREE.Vector2(Math.cos(a), Math.sin(a)));
                        }
                        var shape = new THREE.Shape(pts);
                        var extrudePath = new THREE.LineCurve3(new THREE.Vector3(0, 0, -height / 2), new THREE.Vector3(0, 0, height / 2));
                        return new THREE.ExtrudeGeometry(shape, { amout: height / 2, steps: 2, bevelEnabled: false, extrudePath: extrudePath });
                    }
                    function stripe(s) {
                        var lower = Math.ceil(s.triangleCount / 2), upper = Math.floor(s.triangleCount / 2);
                        var lowIndices = new Uint32Array(lower * 3), upIndices = new Uint32Array(upper * 3);
                        var li = 0, ui = 0;
                        for (var i = 0; i < s.triangleIndices.length; i += 6) {
                            lowIndices[li++] = s.triangleIndices[i];
                            lowIndices[li++] = s.triangleIndices[i + 1];
                            lowIndices[li++] = s.triangleIndices[i + 2];
                        }
                        for (var i = 3; i < s.triangleIndices.length; i += 6) {
                            upIndices[ui++] = s.triangleIndices[i];
                            upIndices[ui++] = s.triangleIndices[i + 1];
                            upIndices[ui++] = s.triangleIndices[i + 2];
                        }
                        return [
                            __assign({}, s, { triangleCount: lower, triangleIndices: lowIndices, boundingSphere: void 0 }),
                            __assign({}, s, { triangleCount: upper, triangleIndices: upIndices, boundingSphere: void 0 })
                        ];
                    }
                    Shapes.stripe = stripe;
                    function split(s) {
                        var lower = Math.ceil(s.triangleCount / 2), upper = Math.floor(s.triangleCount / 2);
                        var lowIndices = new Uint32Array(lower * 3), upIndices = new Uint32Array(upper * 3);
                        var li = 0, ui = 0;
                        var div = lower * 3;
                        for (var i = 0; i < div; i += 3) {
                            lowIndices[li++] = s.triangleIndices[i];
                            lowIndices[li++] = s.triangleIndices[i + 1];
                            lowIndices[li++] = s.triangleIndices[i + 2];
                        }
                        for (var i = div; i < s.triangleIndices.length; i += 3) {
                            upIndices[ui++] = s.triangleIndices[i];
                            upIndices[ui++] = s.triangleIndices[i + 1];
                            upIndices[ui++] = s.triangleIndices[i + 2];
                        }
                        return [
                            __assign({}, s, { triangleCount: lower, triangleIndices: lowIndices, boundingSphere: void 0 }),
                            __assign({}, s, { triangleCount: upper, triangleIndices: upIndices, boundingSphere: void 0 })
                        ];
                    }
                    Shapes.split = split;
                    var signMatrix = Mat4();
                    Mat4.setValue(signMatrix, 3, 3, 1);
                    function sign(a, b, c) {
                        for (var i = 0; i < 3; i++) {
                            Mat4.setValue(signMatrix, i, 0, a[i]);
                            Mat4.setValue(signMatrix, i, 1, b[i]);
                            Mat4.setValue(signMatrix, i, 2, c[i]);
                        }
                        return Mat4.determinant(signMatrix) < 0 ? -1 : 1;
                    }
                    function ringPlane(model, _a) {
                        var ringAtoms = _a.ringAtoms, ringCenter = _a.ringCenter;
                        var _b = model.positions, x = _b.x, y = _b.y, z = _b.z;
                        // determine the ring plane from C2, C4, O
                        var o = ringAtoms[ringAtoms.length - 1], c2 = ringAtoms[1], c4 = ringAtoms[3];
                        var dU = Vec3.sub(Vec3(), Vec3(x[c2], y[c2], z[c2]), Vec3(x[o], y[o], z[o])); // C2 - O
                        var dV = Vec3.sub(Vec3(), Vec3(x[c4], y[c4], z[c4]), Vec3(x[o], y[o], z[o])); // C4 - O
                        var ringNormal = Vec3.cross(Vec3(), dU, dV);
                        var c1 = ringAtoms[0];
                        var towardsC1 = Vec3.sub(Vec3(), Vec3(x[c1], y[c1], z[c1]), ringCenter);
                        return { ringNormal: ringNormal, towardsC1: towardsC1 };
                    }
                    var majorRotationTemp = Mat4();
                    function getRotation(majorAxis, minorAxis, entry) {
                        var _a = entry.representation, upVector = _a.axisUp, sideVector = _a.axisSide;
                        var majorRotation = Vec3.makeRotation(majorRotationTemp, upVector, majorAxis);
                        var side = Vec3.transformMat4(Vec3(), sideVector, majorRotation);
                        var angle = sign(side, minorAxis, majorAxis) * Vec3.angle(side, minorAxis);
                        var minorRotation = Math.abs(angle) > 0.001
                            ? Mat4.fromRotation(Mat4(), angle, majorAxis)
                            : Mat4.fromIdentity(Mat4());
                        return Mat4.mul(minorRotation, minorRotation, majorRotation);
                    }
                    function alignedNormal(dU, dV, s) {
                        var n = Vec3.cross(Vec3(), dU, dV);
                        if (s * n[2] < 0)
                            Vec3.scale(n, n, -1);
                        Vec3.normalize(n, n);
                        return n;
                    }
                    function findRotation(ringNormal, towardsC1, entry, type) {
                        // if (type === 'Icons') {
                        //     return getRotation(ringNormal, towardsC1, entry);
                        // }
                        var links = entry.links, terminalLinks = entry.terminalLinks;
                        var linkCount = links.length, terminalLinkCount = terminalLinks.length;
                        var majorAxis /*, minorAxis*/;
                        if (linkCount > 1 && terminalLinkCount > 0) {
                            majorAxis = Vec3();
                            //minorAxis = towardsC1;
                            for (var _i = 0, terminalLinks_1 = terminalLinks; _i < terminalLinks_1.length; _i++) {
                                var l = terminalLinks_1[_i];
                                var dir = Vec3.sub(Vec3(), l.centerB, l.centerA);
                                Vec3.normalize(dir, dir);
                                Vec3.add(majorAxis, majorAxis, dir);
                            }
                            Vec3.normalize(majorAxis, majorAxis);
                        }
                        else if (linkCount === 1) {
                            majorAxis = Vec3.sub(Vec3(), links[0].centerA, links[0].centerB);
                            //minorAxis = Vec3.cross(Vec3(), majorAxis, towardsC1);
                        }
                        else if (linkCount === 2) {
                            var dU = Vec3.sub(Vec3(), links[0].centerA, links[0].centerB);
                            var dV = Vec3.sub(Vec3(), links[1].centerA, links[1].centerB);
                            Vec3.normalize(dU, dU);
                            Vec3.normalize(dV, dV);
                            majorAxis = Vec3.add(Vec3(), dU, dV);
                            //minorAxis = Vec3.cross(dU, dU, dV);
                            //if (ringNormal[2] * minorAxis[2] < 0) Vec3.scale(minorAxis, minorAxis, -1);
                        }
                        else if (linkCount === 3) {
                            var dA = Vec3.sub(Vec3(), links[0].centerA, links[0].centerB);
                            var dB = Vec3.sub(Vec3(), links[1].centerA, links[1].centerB);
                            var dC = Vec3.sub(Vec3(), links[2].centerA, links[2].centerB);
                            var n1 = alignedNormal(dA, dB, ringNormal[2]);
                            var n2 = alignedNormal(dA, dC, ringNormal[2]);
                            var n3 = alignedNormal(dB, dC, ringNormal[2]);
                            var a1 = Vec3.angle(n1, dC);
                            var a2 = Vec3.angle(n2, dB);
                            var a3 = Vec3.angle(n3, dA);
                            var max = a1;
                            majorAxis = n1; /*minorAxis = dA;*/
                            if (a2 > max) {
                                max = a2;
                                majorAxis = n2; /* minorAxis = dB;*/
                            }
                            if (a3 > max) {
                                max = a3;
                                majorAxis = n3; /*minorAxis = dC;*/
                            }
                        }
                        else {
                            majorAxis = ringNormal;
                            //minorAxis = towardsC1;
                        }
                        return getRotation(majorAxis, towardsC1, entry);
                    }
                    function makeTransform(model, entry, radiusFactor, type) {
                        var ringCenter = entry.ringCenter, ringRadius = entry.ringRadius;
                        var _a = ringPlane(model, entry), ringNormal = _a.ringNormal, towardsC1 = _a.towardsC1;
                        var rotation = findRotation(ringNormal, towardsC1, entry, type);
                        var radius = radiusFactor * ringRadius;
                        return { scale: [radius, radius, radius], rotation: rotation, translation: ringCenter };
                    }
                    Shapes.makeTransform = makeTransform;
                })(Shapes = Carbohydrates.Shapes || (Carbohydrates.Shapes = {}));
            })(Carbohydrates = ComplexReprensetation.Carbohydrates || (ComplexReprensetation.Carbohydrates = {}));
        })(ComplexReprensetation = Extensions.ComplexReprensetation || (Extensions.ComplexReprensetation = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var ComplexReprensetation;
        (function (ComplexReprensetation) {
            var Carbohydrates;
            (function (Carbohydrates) {
                var Mapping;
                (function (Mapping) {
                    Mapping.RingNames = [
                        { __len: 6, 'C1': 0, 'C2': 1, 'C3': 2, 'C4': 3, 'C5': 4, 'O5': 5 },
                        { __len: 6, 'C1': 0, 'C2': 1, 'C3': 2, 'C4': 3, 'C5': 4, 'O': 5 },
                        { __len: 6, 'C2': 0, 'C3': 1, 'C4': 2, 'C5': 3, 'C6': 4, 'O6': 5 },
                        { __len: 5, 'C1': 0, 'C2': 1, 'C3': 2, 'C4': 3, 'O4': 4 },
                        { __len: 5, 'C1\'': 0, 'C2\'': 1, 'C3\'': 2, 'C4\'': 3, 'O4\'': 4 },
                    ];
                    var data = [
                        /* === Filled sphere  === */
                        {
                            shape: [Carbohydrates.Shapes.Sphere] /* Filled sphere  */,
                            axisUp: [0, 0, 1],
                            instances: [{
                                    name: 'Glc',
                                    common: { colorA: '#0090bc', names: ['GLC', 'BGC'] },
                                    charmm: { colorA: '#0090bc', names: ['AGLC', 'BGLC'] },
                                    glycam: { colorA: '#0090bc', names: ['0GA', '0GB', '1GA', '1GB', '2GA', '2GB', '3GA', '3GB', '4GA', '4GB', '6GA', '6GB', 'ZGA', 'ZGB', 'YGA', 'YGB', 'XGA', 'XGB', 'WGA', 'WGB', 'VGA', 'VGB', 'UGA', 'UGB', 'TGA', 'TGB', 'SGA', 'SGB', 'RGA', 'RGB', 'QGA', 'QGB', 'PGA', 'PGB', '0gA', '0gB', '1gA', '1gB', '2gA', '2gB', '3gA', '3gB', '4gA', '4gB', '6gA', '6gB', 'ZgA', 'ZgB', 'YgA', 'YgB', 'XgA', 'XgB', 'WgA', 'WgB', 'VgA', 'VgB', 'UgA', 'UgB', 'TgA', 'TgB', 'SgA', 'SgB', 'RgA', 'RgB', 'QgA', 'QgB', 'PgA', 'PgB'] },
                                }, {
                                    name: 'Man',
                                    common: { colorA: '#00a651', names: ['MAN', 'BMA'] },
                                    charmm: { colorA: '#00a651', names: ['AMAN', 'BMAN'] },
                                    glycam: { colorA: '#00a651', names: ['0MA', '0MB', '1MA', '1MB', '2MA', '2MB', '3MA', '3MB', '4MA', '4MB', '6MA', '6MB', 'ZMA', 'ZMB', 'YMA', 'YMB', 'XMA', 'XMB', 'WMA', 'WMB', 'VMA', 'VMB', 'UMA', 'UMB', 'TMA', 'TMB', 'SMA', 'SMB', 'RMA', 'RMB', 'QMA', 'QMB', 'PMA', 'PMB', '0mA', '0mB', '1mA', '1mB', '2mA', '2mB', '3mA', '3mB', '4mA', '4mB', '6mA', '6mB', 'ZmA', 'ZmB', 'YmA', 'YmB', 'XmA', 'XmB', 'WmA', 'WmB', 'VmA', 'VmB', 'UmA', 'UmB', 'TmA', 'TmB', 'SmA', 'SmB', 'RmA', 'RmB', 'QmA', 'QmB', 'PmA', 'PmB'] },
                                }, {
                                    name: 'Gal',
                                    common: { colorA: '#ffd400', names: ['GAL', 'GLA'] },
                                    charmm: { colorA: '#ffd400', names: ['AGAL', 'BGAL'] },
                                    glycam: { colorA: '#ffd400', names: ['0LA', '0LB', '1LA', '1LB', '2LA', '2LB', '3LA', '3LB', '4LA', '4LB', '6LA', '6LB', 'ZLA', 'ZLB', 'YLA', 'YLB', 'XLA', 'XLB', 'WLA', 'WLB', 'VLA', 'VLB', 'ULA', 'ULB', 'TLA', 'TLB', 'SLA', 'SLB', 'RLA', 'RLB', 'QLA', 'QLB', 'PLA', 'PLB', '0lA', '0lB', '1lA', '1lB', '2lA', '2lB', '3lA', '3lB', '4lA', '4lB', '6lA', '6lB', 'ZlA', 'ZlB', 'YlA', 'YlB', 'XlA', 'XlB', 'WlA', 'WlB', 'VlA', 'VlB', 'UlA', 'UlB', 'TlA', 'TlB', 'SlA', 'SlB', 'RlA', 'RlB', 'QlA', 'QlB', 'PlA', 'PlB'] },
                                }, {
                                    name: 'Gul',
                                    common: { colorA: '#f47920', names: ['GUP', 'GL0'] },
                                    charmm: { colorA: '#f47920', names: ['AGUL', 'BGUL'] },
                                    glycam: { colorA: '#f47920', names: ['0KA', '0KB', '1KA', '1KB', '2KA', '2KB', '3KA', '3KB', '4KA', '4KB', '6KA', '6KB', 'ZKA', 'ZKB', 'YKA', 'YKB', 'XKA', 'XKB', 'WKA', 'WKB', 'VKA', 'VKB', 'UKA', 'UKB', 'TKA', 'TKB', 'SKA', 'SKB', 'RKA', 'RKB', 'QKA', 'QKB', 'PKA', 'PKB', '0kA', '0kB', '1kA', '1kB', '2kA', '2kB', '3kA', '3kB', '4kA', '4kB', '6kA', '6kB', 'ZkA', 'ZkB', 'YkA', 'YkB', 'XkA', 'XkB', 'WkA', 'WkB', 'VkA', 'VkB', 'UkA', 'UkB', 'TkA', 'TkB', 'SkA', 'SkB', 'RkA', 'RkB', 'QkA', 'QkB', 'PkA', 'PkB'] },
                                }, {
                                    name: 'Alt',
                                    common: { colorA: '#f69ea1', names: ['ALT'] },
                                    charmm: { colorA: '#f69ea1', names: ['AALT', 'BALT'] },
                                    glycam: { colorA: '#f69ea1', names: ['0EA', '0EB', '1EA', '1EB', '2EA', '2EB', '3EA', '3EB', '4EA', '4EB', '6EA', '6EB', 'ZEA', 'ZEB', 'YEA', 'YEB', 'XEA', 'XEB', 'WEA', 'WEB', 'VEA', 'VEB', 'UEA', 'UEB', 'TEA', 'TEB', 'SEA', 'SEB', 'REA', 'REB', 'QEA', 'QEB', 'PEA', 'PEB', '0eA', '0eB', '1eA', '1eB', '2eA', '2eB', '3eA', '3eB', '4eA', '4eB', '6eA', '6eB', 'ZeA', 'ZeB', 'YeA', 'YeB', 'XeA', 'XeB', 'WeA', 'WeB', 'VeA', 'VeB', 'UeA', 'UeB', 'TeA', 'TeB', 'SeA', 'SeB', 'ReA', 'ReB', 'QeA', 'QeB', 'PeA', 'PeB'] },
                                }, {
                                    name: 'All',
                                    common: { colorA: '#a54399', names: ['ALL', 'AFD'] },
                                    charmm: { colorA: '#a54399', names: ['AALL', 'BALL'] },
                                    glycam: { colorA: '#a54399', names: ['0NA', '0NB', '1NA', '1NB', '2NA', '2NB', '3NA', '3NB', '4NA', '4NB', '6NA', '6NB', 'ZNA', 'ZNB', 'YNA', 'YNB', 'XNA', 'XNB', 'WNA', 'WNB', 'VNA', 'VNB', 'UNA', 'UNB', 'TNA', 'TNB', 'SNA', 'SNB', 'RNA', 'RNB', 'QNA', 'QNB', 'PNA', 'PNB', '0nA', '0nB', '1nA', '1nB', '2nA', '2nB', '3nA', '3nB', '4nA', '4nB', '6nA', '6nB', 'ZnA', 'ZnB', 'YnA', 'YnB', 'XnA', 'XnB', 'WnA', 'WnB', 'VnA', 'VnB', 'UnA', 'UnB', 'TnA', 'TnB', 'SnA', 'SnB', 'RnA', 'RnB', 'QnA', 'QnB', 'PnA', 'PnB'] },
                                }, {
                                    name: 'Tal',
                                    common: { colorA: '#8fcce9', names: ['TAL'] },
                                    charmm: { colorA: '#8fcce9', names: ['ATAL', 'BTAL'] },
                                    glycam: { colorA: '#8fcce9', names: ['0TA', '0TB', '1TA', '1TB', '2TA', '2TB', '3TA', '3TB', '4TA', '4TB', '6TA', '6TB', 'ZTA', 'ZTB', 'YTA', 'YTB', 'XTA', 'XTB', 'WTA', 'WTB', 'VTA', 'VTB', 'UTA', 'UTB', 'TTA', 'TTB', 'STA', 'STB', 'RTA', 'RTB', 'QTA', 'QTB', 'PTA', 'PTB', '0tA', '0tB', '1tA', '1tB', '2tA', '2tB', '3tA', '3tB', '4tA', '4tB', '6tA', '6tB', 'ZtA', 'ZtB', 'YtA', 'YtB', 'XtA', 'XtB', 'WtA', 'WtB', 'VtA', 'VtB', 'UtA', 'UtB', 'TtA', 'TtB', 'StA', 'StB', 'RtA', 'RtB', 'QtA', 'QtB', 'PtA', 'PtB'] },
                                }, {
                                    name: 'Ido',
                                    common: { colorA: '#a17a4d', names: ['4N2'] },
                                    charmm: { colorA: '#a17a4d', names: ['AIDO', 'BIDO'] },
                                    glycam: { colorA: '#a17a4d', names: [] },
                                }]
                        },
                        /* === Filled cube  === */
                        {
                            shape: [Carbohydrates.Shapes.Cube] /* Filled cube  */,
                            axisUp: [0, 0, 1],
                            instances: [{
                                    name: 'GlcNAc',
                                    common: { colorA: '#0090bc', names: ['NAG', 'NDG'] },
                                    charmm: { colorA: '#0090bc', names: ['AGLCNA', 'BGLCNA', 'BGLCN0'] },
                                    glycam: { colorA: '#0090bc', names: ['0YA', '0YB', '1YA', '1YB', '3YA', '3YB', '4YA', '4YB', '6YA', '6YB', 'WYA', 'WYB', 'VYA', 'VYB', 'UYA', 'UYB', 'QYA', 'QYB', '0yA', '0yB', '1yA', '1yB', '3yA', '3yB', '4yA', '4yB', '6yA', '6yB', 'WyA', 'WyB', 'VyA', 'VyB', 'UyA', 'UyB', 'QyA', 'QyB', '0YS', '0Ys', '3YS', '3Ys', '4YS', '4Ys', '6YS', '6Ys', 'QYS', 'QYs', 'UYS', 'UYs', 'VYS', 'VYs', 'WYS', 'WYs', '0yS', '0ys', '3yS', '3ys', '4yS', '4ys'] },
                                }, {
                                    name: 'ManNAc',
                                    common: { colorA: '#00a651', names: ['BM3'] },
                                    charmm: { colorA: '#00a651', names: [] },
                                    glycam: { colorA: '#00a651', names: ['0WA', '0WB', '1WA', '1WB', '3WA', '3WB', '4WA', '4WB', '6WA', '6WB', 'WWA', 'WWB', 'VWA', 'VWB', 'UWA', 'UWB', 'QWA', 'QWB', '0wA', '0wB', '1wA', '1wB', '3wA', '3wB', '4wA', '4wB', '6wA', '6wB', 'WwA', 'WwB', 'VwA', 'VwB', 'UwA', 'UwB', 'QwA', 'QwB'] },
                                }, {
                                    name: 'GalNAc',
                                    common: { colorA: '#ffd400', names: ['NGA', 'A2G'] },
                                    charmm: { colorA: '#ffd400', names: ['AGALNA', 'BGALNA'] },
                                    glycam: { colorA: '#ffd400', names: ['0VA', '0VB', '1VA', '1VB', '3VA', '3VB', '4VA', '4VB', '6VA', '6VB', 'WVA', 'WVB', 'VVA', 'VVB', 'UVA', 'UVB', 'QVA', 'QVB', '0vA', '0vB', '1vA', '1vB', '3vA', '3vB', '4vA', '4vB', '6vA', '6vB', 'WvA', 'WvB', 'VvA', 'VvB', 'UvA', 'UvB', 'QvA', 'QvB'] },
                                }, {
                                    name: 'GulNAc',
                                    common: { colorA: '#f47920', names: [] },
                                    charmm: { colorA: '#f47920', names: [] },
                                    glycam: { colorA: '#f47920', names: [] },
                                }, {
                                    name: 'AltNAc',
                                    common: { colorA: '#f69ea1', names: [] },
                                    charmm: { colorA: '#f69ea1', names: [] },
                                    glycam: { colorA: '#f69ea1', names: [] },
                                }, {
                                    name: 'AllNAc',
                                    common: { colorA: '#a54399', names: ['NAA'] },
                                    charmm: { colorA: '#a54399', names: [] },
                                    glycam: { colorA: '#a54399', names: [] },
                                }, {
                                    name: 'TalNAc',
                                    common: { colorA: '#8fcce9', names: [] },
                                    charmm: { colorA: '#8fcce9', names: [] },
                                    glycam: { colorA: '#8fcce9', names: [] },
                                }, {
                                    name: 'IdoNAc',
                                    common: { colorA: '#a17a4d', names: ['HSQ'] },
                                    charmm: { colorA: '#a17a4d', names: [] },
                                    glycam: { colorA: '#a17a4d', names: [] },
                                }]
                        },
                        /* === Crossed cube  === */
                        {
                            shape: Carbohydrates.Shapes.stripe(Carbohydrates.Shapes.Cube) /* Crossed cube  */,
                            axisUp: [0, 0, 1],
                            instances: [{
                                    name: 'GlcN',
                                    common: { colorA: '#0090bc', colorB: '#f1ece1', names: ['GCS', 'PA1'] },
                                    charmm: { colorA: '#0090bc', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#0090bc', colorB: '#f1ece1', names: ['0YN', '3YN', '4YN', '6YN', 'WYN', 'VYN', 'UYN', 'QYN', '3Yn', '4Yn', 'WYn', '0Yn', '0YP', '3YP', '4YP', '6YP', 'WYP', 'VYP', 'UYP', 'QYP', '0Yp', '3Yp', '4Yp', 'WYp'] },
                                }, {
                                    name: 'ManN',
                                    common: { colorA: '#00a651', colorB: '#f1ece1', names: ['95Z'] },
                                    charmm: { colorA: '#00a651', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#00a651', colorB: '#f1ece1', names: [] },
                                }, {
                                    name: 'GalN',
                                    common: { colorA: '#ffd400', colorB: '#f1ece1', names: ['X6X', '1GN'] },
                                    charmm: { colorA: '#ffd400', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#ffd400', colorB: '#f1ece1', names: [] },
                                }, {
                                    name: 'GulN',
                                    common: { colorA: '#f47920', colorB: '#f1ece1', names: [] },
                                    charmm: { colorA: '#f47920', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#f47920', colorB: '#f1ece1', names: [] },
                                }, {
                                    name: 'AltN',
                                    common: { colorA: '#f69ea1', colorB: '#f1ece1', names: [] },
                                    charmm: { colorA: '#f69ea1', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#f69ea1', colorB: '#f1ece1', names: [] },
                                }, {
                                    name: 'AllN',
                                    common: { colorA: '#a54399', colorB: '#f1ece1', names: [] },
                                    charmm: { colorA: '#a54399', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#a54399', colorB: '#f1ece1', names: [] },
                                }, {
                                    name: 'TalN',
                                    common: { colorA: '#8fcce9', colorB: '#f1ece1', names: [] },
                                    charmm: { colorA: '#8fcce9', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#8fcce9', colorB: '#f1ece1', names: [] },
                                }, {
                                    name: 'IdoN',
                                    common: { colorA: '#a17a4d', colorB: '#f1ece1', names: [] },
                                    charmm: { colorA: '#a17a4d', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#a17a4d', colorB: '#f1ece1', names: [] },
                                }]
                        },
                        /* === Divided diamond  === */
                        {
                            shape: Carbohydrates.Shapes.split(Carbohydrates.Shapes.Diamond) /* Divided diamond  */,
                            axisUp: [1, 0, 0],
                            instances: [{
                                    name: 'GlcA',
                                    common: { colorA: '#0090bc', colorB: '#f1ece1', names: ['GCU', 'BDP'] },
                                    charmm: { colorA: '#0090bc', colorB: '#f1ece1', names: ['AGLCA', 'BGLCA', 'BGLCA0'] },
                                    glycam: { colorA: '#0090bc', colorB: '#f1ece1', names: ['0ZA', '0ZB', '1ZA', '1ZB', '2ZA', '2ZB', '3ZA', '3ZB', '4ZA', '4ZB', 'ZZA', 'ZZB', 'YZA', 'YZB', 'WZA', 'WZB', 'TZA', 'TZB', '0zA', '0zB', '1zA', '1zB', '2zA', '2zB', '3zA', '3zB', '4zA', '4zB', 'ZzA', 'ZzB', 'YzA', 'YzB', 'WzA', 'WzB', 'TzA', 'TzB', '0ZBP'] },
                                }, {
                                    name: 'ManA',
                                    common: { colorA: '#00a651', colorB: '#f1ece1', names: ['MAV', 'BEM'] },
                                    charmm: { colorA: '#00a651', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#00a651', colorB: '#f1ece1', names: [] },
                                }, {
                                    name: 'GalA',
                                    common: { colorA: '#ffd400', colorB: '#f1ece1', names: ['ADA', 'GTR'] },
                                    charmm: { colorA: '#ffd400', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#ffd400', colorB: '#f1ece1', names: ['0OA', '0OB', '1OA', '1OB', '2OA', '2OB', '3OA', '3OB', '4OA', '4OB', 'ZOA', 'ZOB', 'YOA', 'YOB', 'WOA', 'WOB', 'TOA', 'TOB', '0oA', '0oB', '1oA', '1oB', '2oA', '2oB', '3oA', '3oB', '4oA', '4oB', 'ZoA', 'ZoB', 'YoA', 'YoB', 'WoA', 'WoB', 'ToA', 'ToB'] },
                                }, {
                                    name: 'GulA',
                                    common: { colorA: '#f47920', colorB: '#f1ece1', names: ['LGU'] },
                                    charmm: { colorA: '#f47920', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#f47920', colorB: '#f1ece1', names: [] },
                                }, {
                                    name: 'AltA',
                                    common: { colorA: '#f1ece1', colorB: '#f69ea1', names: [] },
                                    charmm: { colorA: '#f1ece1', colorB: '#f69ea1', names: [] },
                                    glycam: { colorA: '#f1ece1', colorB: '#f69ea1', names: [] },
                                }, {
                                    name: 'AllA',
                                    common: { colorA: '#a54399', colorB: '#f1ece1', names: [] },
                                    charmm: { colorA: '#a54399', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#a54399', colorB: '#f1ece1', names: [] },
                                }, {
                                    name: 'TalA',
                                    common: { colorA: '#8fcce9', colorB: '#f1ece1', names: ['X0X', 'X1X'] },
                                    charmm: { colorA: '#8fcce9', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#8fcce9', colorB: '#f1ece1', names: [] },
                                }, {
                                    name: 'IdoA',
                                    common: { colorA: '#f1ece1', colorB: '#a17a4d', names: ['IDR'] },
                                    charmm: { colorA: '#f1ece1', colorB: '#a17a4d', names: ['AIDOA', 'BIDOA'] },
                                    glycam: { colorA: '#f1ece1', colorB: '#a17a4d', names: ['0UA', '0UB', '1UA', '1UB', '2UA', '2UB', '3UA', '3UB', '4UA', '4UB', 'ZUA', 'ZUB', 'YUA', 'YUB', 'WUA', 'WUB', 'TUA', 'TUB', '0uA', '0uB', '1uA', '1uB', '2uA', '2uB', '3uA', '3uB', '4uA', '4uB', 'ZuA', 'ZuB', 'YuA', 'YuB', 'WuA', 'WuB', 'TuA', 'TuB', 'YuAP'] },
                                }]
                        },
                        /* === Filled cone  === */
                        {
                            shape: [Carbohydrates.Shapes.Cone] /* Filled cone  */,
                            axisUp: [0, 1, 0],
                            instances: [{
                                    name: 'Qui',
                                    common: { colorA: '#0090bc', names: ['G6D'] },
                                    charmm: { colorA: '#0090bc', names: [] },
                                    glycam: { colorA: '#0090bc', names: ['0QA', '0QB', '1QA', '1QB', '2QA', '2QB', '3QA', '3QB', '4QA', '4QB', 'ZQA', 'ZQB', 'YQA', 'YQB', 'WQA', 'WQB', 'TQA', 'TQB', '0qA', '0qB', '1qA', '1qB', '2qA', '2qB', '3qA', '3qB', '4qA', '4qB', 'ZqA', 'ZqB', 'YqA', 'YqB', 'WqA', 'WqB', 'TqA', 'TqB'] },
                                }, {
                                    name: 'Rha',
                                    common: { colorA: '#00a651', names: ['RAM', 'RM4'] },
                                    charmm: { colorA: '#00a651', names: ['ARHM', 'BRHM'] },
                                    glycam: { colorA: '#00a651', names: ['0HA', '0HB', '1HA', '1HB', '2HA', '2HB', '3HA', '3HB', '4HA', '4HB', 'ZHA', 'ZHB', 'YHA', 'YHB', 'WHA', 'WHB', 'THA', 'THB', '0hA', '0hB', '1hA', '1hB', '2hA', '2hB', '3hA', '3hB', '4hA', '4hB', 'ZhA', 'ZhB', 'YhA', 'YhB', 'WhA', 'WhB', 'ThA', 'ThB'] },
                                }, {
                                    name: 'x6dAlt',
                                    common: { colorA: '#F88CD2', names: [] },
                                    charmm: { colorA: '#935D38', names: [] },
                                    glycam: { colorA: '#57913F', names: [] },
                                }, {
                                    name: 'x6dTal',
                                    common: { colorA: '#B490DE', names: [] },
                                    charmm: { colorA: '#64CABE', names: [] },
                                    glycam: { colorA: '#D9147F', names: [] },
                                }, {
                                    name: 'Fuc',
                                    common: { colorA: '#ed1c24', names: ['FUC', 'FUL'] },
                                    charmm: { colorA: '#ed1c24', names: ['AFUC', 'BFUC'] },
                                    glycam: { colorA: '#ed1c24', names: ['0FA', '0FB', '1FA', '1FB', '2FA', '2FB', '3FA', '3FB', '4FA', '4FB', 'ZFA', 'ZFB', 'YFA', 'YFB', 'WFA', 'WFB', 'TFA', 'TFB', '0fA', '0fB', '1fA', '1fB', '2fA', '2fB', '3fA', '3fB', '4fA', '4fB', 'ZfA', 'ZfB', 'YfA', 'YfB', 'WfA', 'WfB', 'TfA', 'TfB'] },
                                }]
                        },
                        /* === Divided cone  === */
                        {
                            shape: [Carbohydrates.Shapes.ConeLeft, Carbohydrates.Shapes.ConeRight] /* Divided cone */,
                            axisUp: [0, 1, 0],
                            instances: [{
                                    name: 'QuiNAc',
                                    common: { colorA: '#0090bc', colorB: '#f1ece1', names: [] },
                                    charmm: { colorA: '#0090bc', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#0090bc', colorB: '#f1ece1', names: [] },
                                }, {
                                    name: 'RhaNAc',
                                    common: { colorA: '#00a651', colorB: '#f1ece1', names: [] },
                                    charmm: { colorA: '#00a651', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#00a651', colorB: '#f1ece1', names: [] },
                                }, {
                                    name: 'FucNAc',
                                    common: { colorA: '#ed1c24', colorB: '#f1ece1', names: [] },
                                    charmm: { colorA: '#ed1c24', colorB: '#f1ece1', names: [] },
                                    glycam: { colorA: '#ed1c24', colorB: '#f1ece1', names: [] },
                                }]
                        },
                        /* === Flat rectangle  === */
                        {
                            shape: [Carbohydrates.Shapes.FlatRectangle] /* Flat rectangle  */,
                            axisUp: [0, 1, 0],
                            instances: [{
                                    name: 'Oli',
                                    common: { colorA: '#0090bc', names: ['DDA'] },
                                    charmm: { colorA: '#0090bc', names: [] },
                                    glycam: { colorA: '#0090bc', names: [] },
                                }, {
                                    name: 'Tyv',
                                    common: { colorA: '#00a651', names: ['TYV'] },
                                    charmm: { colorA: '#00a651', names: [] },
                                    glycam: { colorA: '#00a651', names: ['0TV', '0Tv', '1TV', '1Tv', '2TV', '2Tv', '4TV', '4Tv', 'YTV', 'YTv', '0tV', '0tv', '1tV', '1tv', '2tV', '2tv', '4tV', '4tv', 'YtV', 'Ytv'] },
                                }, {
                                    name: 'Abe',
                                    common: { colorA: '#f47920', names: ['ABE'] },
                                    charmm: { colorA: '#f47920', names: [] },
                                    glycam: { colorA: '#f47920', names: ['0AE', '2AE', '4AE', 'YGa', '0AF', '2AF', '4AF', 'YAF'] },
                                }, {
                                    name: 'Par',
                                    common: { colorA: '#f69ea1', names: ['PZU'] },
                                    charmm: { colorA: '#f69ea1', names: [] },
                                    glycam: { colorA: '#f69ea1', names: [] },
                                }, {
                                    name: 'Dig',
                                    common: { colorA: '#a54399', names: [] },
                                    charmm: { colorA: '#a54399', names: [] },
                                    glycam: { colorA: '#a54399', names: [] },
                                }, {
                                    name: 'Col',
                                    common: { colorA: '#8fcce9', names: [] },
                                    charmm: { colorA: '#8fcce9', names: [] },
                                    glycam: { colorA: '#8fcce9', names: [] },
                                }]
                        },
                        /* === Filled star  === */
                        {
                            shape: [Carbohydrates.Shapes.Star] /* Filled star  */,
                            axisUp: [0, 0, 1],
                            instances: [{
                                    name: 'Ara',
                                    common: { colorA: '#00a651', names: ['ARA', 'ARB'] },
                                    charmm: { colorA: '#00a651', names: ['AARB', 'BARB'] },
                                    glycam: { colorA: '#00a651', names: ['0AA', '0AB', '1AA', '1AB', '2AA', '2AB', '3AA', '3AB', '4AA', '4AB', 'ZAA', 'ZAB', 'YAA', 'YAB', 'WAA', 'WAB', 'TAA', 'TAB', '0AD', '0AU', '1AD', '1AU', '2AD', '2AU', '3AD', '3AU', '5AD', '5AU', 'ZAD', 'ZAU', '0aA', '0aB', '1aA', '1aB', '2aA', '2aB', '3aA', '3aB', '4aA', '4aB', 'ZaA', 'ZaB', 'YaA', 'YaB', 'WaA', 'WaB', 'TaA', 'TaB', '0aD', '0aU', '1aD', '1aU', '2aD', '2aU', '3aD', '3aU', '5aD', '5aU', 'ZaD', 'ZaU'] },
                                }, {
                                    name: 'Lyx',
                                    common: { colorA: '#ffd400', names: ['LDY'] },
                                    charmm: { colorA: '#ffd400', names: ['ALYF', 'BLYF'] },
                                    glycam: { colorA: '#ffd400', names: ['0DA', '0DB', '1DA', '1DB', '2DA', '2DB', '3DA', '3DB', '4DA', '4DB', 'ZDA', 'ZDB', 'YDA', 'YDB', 'WDA', 'WDB', 'TDA', 'TDB', '0DD', '0DU', '1DD', '1DU', '2DD', '2DU', '3DD', '3DU', '5DD', '5DU', 'ZDD', 'ZDU', '0dA', '0dB', '1dA', '1dB', '2dA', '2dB', '3dA', '3dB', '4dA', '4dB', 'ZdA', 'ZdB', 'YdA', 'YdB', 'WdA', 'WdB', 'TdA', 'TdB', '0dD', '0dU', '1dD', '1dU', '2dD', '2dU', '3dD', '3dU', '5dD', '5dU', 'ZdD', 'ZdU'] },
                                }, {
                                    name: 'Xyl',
                                    common: { colorA: '#f47920', names: ['XYS', 'XYP'] },
                                    charmm: { colorA: '#f47920', names: ['AXYL', 'BXYL', 'AXYF', 'BXYF'] },
                                    glycam: { colorA: '#f47920', names: ['0XA', '0XB', '1XA', '1XB', '2XA', '2XB', '3XA', '3XB', '4XA', '4XB', 'ZXA', 'ZXB', 'YXA', 'YXB', 'WXA', 'WXB', 'TXA', 'TXB', '0XD', '0XU', '1XD', '1XU', '2XD', '2XU', '3XD', '3XU', '5XD', '5XU', 'ZXD', 'ZXU', '0xA', '0xB', '1xA', '1xB', '2xA', '2xB', '3xA', '3xB', '4xA', '4xB', 'ZxA', 'ZxB', 'YxA', 'YxB', 'WxA', 'WxB', 'TxA', 'TxB', '0xD', '0xU', '1xD', '1xU', '2xD', '2xU', '3xD', '3xU', '5xD', '5xU', 'ZxD', 'ZxU'] },
                                }, {
                                    name: 'Rib',
                                    common: { colorA: '#f69ea1', names: ['RIP', '0MK'] },
                                    charmm: { colorA: '#f69ea1', names: ['ARIB', 'BRIB'] },
                                    glycam: { colorA: '#f69ea1', names: ['0RA', '0RB', '1RA', '1RB', '2RA', '2RB', '3RA', '3RB', '4RA', '4RB', 'ZRA', 'ZRB', 'YRA', 'YRB', 'WRA', 'WRB', 'TRA', 'TRB', '0RD', '0RU', '1RD', '1RU', '2RD', '2RU', '3RD', '3RU', '5RD', '5RU', 'ZRD', 'ZRU', '0rA', '0rB', '1rA', '1rB', '2rA', '2rB', '3rA', '3rB', '4rA', '4rB', 'ZrA', 'ZrB', 'YrA', 'YrB', 'WrA', 'WrB', 'TrA', 'TrB', '0rD', '0rU', '1rD', '1rU', '2rD', '2rU', '3rD', '3rU', '5rD', '5rU', 'ZrD', 'ZrU'] },
                                }]
                        },
                        /* === Filled diamond  === */
                        {
                            shape: [Carbohydrates.Shapes.Diamond] /* Filled diamond  */,
                            axisUp: [1, 0, 0],
                            instances: [{
                                    name: 'Kdn',
                                    common: { colorA: '#00a651', names: ['KDN', 'KDM'] },
                                    charmm: { colorA: '#00a651', names: [] },
                                    glycam: { colorA: '#00a651', names: [] },
                                }, {
                                    name: 'Neu5Ac',
                                    common: { colorA: '#a54399', names: ['SIA', 'SLB'] },
                                    charmm: { colorA: '#a54399', names: ['ANE5AC', 'BNE5AC'] },
                                    glycam: { colorA: '#a54399', names: ['0SA', '0SB', '4SA', '4SB', '7SA', '7SB', '8SA', '8SB', '9SA', '9SB', 'ASA', 'ASB', 'BSA', 'BSB', 'CSA', 'CSB', 'DSA', 'DSB', 'ESA', 'ESB', 'FSA', 'FSB', 'GSA', 'GSB', 'HSA', 'HSB', 'ISA', 'ISB', 'JSA', 'JSB', 'KSA', 'KSB', '0sA', '0sB', '4sA', '4sB', '7sA', '7sB', '8sA', '8sB', '9sA', '9sB', 'AsA', 'AsB', 'BsA', 'BsB', 'CsA', 'CsB', 'DsA', 'DsB', 'EsA', 'EsB', 'FsA', 'FsB', 'GsA', 'GsB', 'HsA', 'HsB', 'IsA', 'IsB', 'JsA', 'JsB', 'KsA', 'KsB'] },
                                }, {
                                    name: 'Neu5Gc',
                                    common: { colorA: '#8fcce9', names: ['NGC', 'NGE'] },
                                    charmm: { colorA: '#8fcce9', names: [] },
                                    glycam: { colorA: '#8fcce9', names: ['0GL', '4GL', '7GL', '8GL', '9GL', 'CGL', 'DGL', 'EGL', 'FGL', 'GGL', 'HGL', 'IGL', 'JGL', 'KGL', '0gL', '4gL', '7gL', '8gL', '9gL', 'AgL', 'BgL', 'CgL', 'DgL', 'EgL', 'FgL', 'GgL', 'HgL', 'IgL', 'JgL', 'KgL'] },
                                }, {
                                    name: 'Neu',
                                    common: { colorA: '#a17a4d', names: [] },
                                    charmm: { colorA: '#a17a4d', names: [] },
                                    glycam: { colorA: '#a17a4d', names: [] },
                                }]
                        },
                        /* === Flat hexagon  === */
                        {
                            shape: [Carbohydrates.Shapes.FlatHexagon] /* Flat hexagon  */,
                            axisUp: [0, 0, 1],
                            instances: [{
                                    name: 'Bac',
                                    common: { colorA: '#0090bc', names: ['B6D'] },
                                    charmm: { colorA: '#0090bc', names: [] },
                                    glycam: { colorA: '#0090bc', names: ['0BC', '3BC', '0bC', '3bC'] },
                                }, {
                                    name: 'LDManHep',
                                    common: { colorA: '#00a651', names: ['GMH'] },
                                    charmm: { colorA: '#00a651', names: [] },
                                    glycam: { colorA: '#00a651', names: [] },
                                }, {
                                    name: 'Kdo',
                                    common: { colorA: '#ffd400', names: ['KDO'] },
                                    charmm: { colorA: '#ffd400', names: [] },
                                    glycam: { colorA: '#ffd400', names: [] },
                                }, {
                                    name: 'Dha',
                                    common: { colorA: '#f47920', names: [] },
                                    charmm: { colorA: '#f47920', names: [] },
                                    glycam: { colorA: '#f47920', names: [] },
                                }, {
                                    name: 'DDManHep',
                                    common: { colorA: '#f69ea1', names: [] },
                                    charmm: { colorA: '#f69ea1', names: [] },
                                    glycam: { colorA: '#f69ea1', names: [] },
                                }, {
                                    name: 'MurNAc',
                                    common: { colorA: '#a54399', names: ['AMU'] },
                                    charmm: { colorA: '#a54399', names: [] },
                                    glycam: { colorA: '#a54399', names: [] },
                                }, {
                                    name: 'MurNGc',
                                    common: { colorA: '#8fcce9', names: [] },
                                    charmm: { colorA: '#8fcce9', names: [] },
                                    glycam: { colorA: '#8fcce9', names: [] },
                                }, {
                                    name: 'Mur',
                                    common: { colorA: '#a17a4d', names: ['MUR'] },
                                    charmm: { colorA: '#a17a4d', names: [] },
                                    glycam: { colorA: '#a17a4d', names: [] },
                                }]
                        },
                        /* === Flat pentagon  === */
                        {
                            shape: [Carbohydrates.Shapes.FlatPentagon] /* Flat pentagon  */,
                            axisUp: [0, 0, 1],
                            instances: [{
                                    name: 'Api',
                                    common: { colorA: '#0090bc', names: ['XXM'] },
                                    charmm: { colorA: '#0090bc', names: [] },
                                    glycam: { colorA: '#0090bc', names: [] },
                                }, {
                                    name: 'Fruc',
                                    common: { colorA: '#00a651', names: ['BDF'] },
                                    charmm: { colorA: '#00a651', names: ['AFRU', 'BFRU'] },
                                    glycam: { colorA: '#00a651', names: ['0CA', '0CB', '1CA', '1CB', '2CA', '2CB', '3CA', '3CB', '4CA', '4CB', '5CA', '5CB', 'WCA', 'WCB', '0CD', '0CU', '1CD', '1CU', '2CD', '2CU', '3CD', '3CU', '4CD', '4CU', '6CD', '6CU', 'WCD', 'WCU', 'VCD', 'VCU', 'UCD', 'UCU', 'QCD', 'QCU', '0cA', '0cB', '1cA', '1cB', '2cA', '2cB', '3cA', '3cB', '4cA', '4cB', '5cA', '5cB', 'WcA', 'WcB', '0cD', '0cU', '1cD', '1cU', '2cD', '2cU', '3cD', '3cU', '4cD', '4cU', '6cD', '6cU', 'WcD', 'WcU', 'VcD', 'VcU', 'UcD', 'UcU', 'QcD', 'QcU'] },
                                }, {
                                    name: 'Tag',
                                    common: { colorA: '#ffd400', names: ['T6T'] },
                                    charmm: { colorA: '#ffd400', names: [] },
                                    glycam: { colorA: '#ffd400', names: ['0JA', '0JB', '1JA', '1JB', '2JA', '2JB', '3JA', '3JB', '4JA', '4JB', '5JA', '5JB', 'WJA', 'WJB', '0JD', '0JU', '1JD', '1JU', '2JD', '2JU', '3JD', '3JU', '4JD', '4JU', '6JD', '6JU', 'WJD', 'WJU', 'VJD', 'VJU', 'UJD', 'UJU', 'QJD', 'QJU', '0jA', '0jB', '1jA', '1jB', '2jA', '2jB', '3jA', '3jB', '4jA', '4jB', '5jA', '5jB', 'WjA', 'WjB', '0jD', '0jU', '1jD', '1jU', '2jD', '2jU', '3jD', '3jU', '4jD', '4jU', '6jD', '6jU', 'WjD', 'WjU', 'VjD', 'VjU', 'UjD', 'UjU', 'QjD', 'QjU'] },
                                }, {
                                    name: 'Sor',
                                    common: { colorA: '#f47920', names: ['SOE'] },
                                    charmm: { colorA: '#f47920', names: [] },
                                    glycam: { colorA: '#f47920', names: ['0BA', '0BB', '1BA', '1BB', '2BA', '2BB', '3BA', '3BB', '4BA', '4BB', '5BA', '5BB', 'WBA', 'WBB', '0BD', '0BU', '1BD', '1BU', '2BD', '2BU', '3BD', '3BU', '4BD', '4BU', '6BD', '6BU', 'WBD', 'WBU', 'VBD', 'VBU', 'UBD', 'UBU', 'QBD', 'QBU', '0bA', '0bB', '1bA', '1bB', '2bA', '2bB', '3bA', '3bB', '4bA', '4bB', '5bA', '5bB', 'WbA', 'WbB', '0bD', '0bU', '1bD', '1bU', '2bD', '2bU', '3bD', '3bU', '4bD', '4bU', '6bD', '6bU', 'WbD', 'WbU', 'VbD', 'VbU', 'UbD', 'UbU', 'QbD', 'QbU'] },
                                }, {
                                    name: 'Psi',
                                    common: { colorA: '#f69ea1', names: [] },
                                    charmm: { colorA: '#f69ea1', names: [] },
                                    glycam: { colorA: '#f69ea1', names: [] }
                                }]
                        },
                        /* === Flat diamond  === */
                        {
                            shape: [Carbohydrates.Shapes.FlatDiamond] /* Flat pentagon  */,
                            axisUp: [0, 0, 1],
                            instances: [{
                                    name: 'Pse',
                                    common: { colorA: '#00a850', names: ['6PZ'] },
                                    charmm: { colorA: '#00a850', names: [] },
                                    glycam: { colorA: '#00a850', names: [] }
                                }, {
                                    name: 'Leg',
                                    common: { colorA: '#f9d10d', names: [] },
                                    charmm: { colorA: '#f9d10d', names: [] },
                                    glycam: { colorA: '#f9d10d', names: [] }
                                }, {
                                    name: 'Aci',
                                    common: { colorA: '#f69e9d', names: [] },
                                    charmm: { colorA: '#f69e9d', names: [] },
                                    glycam: { colorA: '#f69e9d', names: [] }
                                }, {
                                    name: '4eLeg',
                                    common: { colorA: '#89c6e3', names: [] },
                                    charmm: { colorA: '#89c6e3', names: [] },
                                    glycam: { colorA: '#89c6e3', names: [] }
                                }]
                        }
                    ];
                    var mappedData = (function () {
                        var map = LiteMol.Core.Utils.FastMap.create();
                        var _loop_2 = function (shape) {
                            var _loop_3 = function (instance) {
                                var entry = function (name, elem) { return map.set(name, {
                                    instanceName: instance.name,
                                    name: name,
                                    color: elem.colorB ? [LiteMol.Visualization.Color.fromHexString(elem.colorA), LiteMol.Visualization.Color.fromHexString(elem.colorB)] : [LiteMol.Visualization.Color.fromHexString(elem.colorA)],
                                    shape: shape.shape,
                                    axisUp: shape.axisUp,
                                    axisSide: [1, 0, 0]
                                }); };
                                for (var _i = 0, _a = instance.common.names; _i < _a.length; _i++) {
                                    var name_1 = _a[_i];
                                    entry(name_1, instance.common);
                                }
                                //for (const name of instance.charmm.names) entry(name, instance.charmm);
                                //for (const name of instance.glycam.names) entry(name, instance.glycam);
                            };
                            for (var _i = 0, _a = shape.instances; _i < _a.length; _i++) {
                                var instance = _a[_i];
                                _loop_3(instance);
                            }
                        };
                        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                            var shape = data_1[_i];
                            _loop_2(shape);
                        }
                        return map;
                    })();
                    function isResidueRepresentable(name) {
                        return mappedData.has(name);
                    }
                    Mapping.isResidueRepresentable = isResidueRepresentable;
                    function getResidueRepresentation(name) {
                        return mappedData.get(name);
                    }
                    Mapping.getResidueRepresentation = getResidueRepresentation;
                })(Mapping = Carbohydrates.Mapping || (Carbohydrates.Mapping = {}));
            })(Carbohydrates = ComplexReprensetation.Carbohydrates || (ComplexReprensetation.Carbohydrates = {}));
        })(ComplexReprensetation = Extensions.ComplexReprensetation || (Extensions.ComplexReprensetation = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var ComplexReprensetation;
        (function (ComplexReprensetation) {
            var Carbohydrates;
            (function (Carbohydrates) {
                var Struct = LiteMol.Core.Structure;
                var LA = LiteMol.Core.Geometry.LinearAlgebra;
                var Entity = LiteMol.Bootstrap.Entity;
                var Tree = LiteMol.Bootstrap.Tree;
                Carbohydrates.Types = ['Icons', 'Full'];
                Carbohydrates.FullSizes = ['Small', 'Medium', 'Large'];
                Carbohydrates.DefaultIconsParams = { type: 'Icons', iconScale: 0.55 };
                Carbohydrates.DefaultFullParams = { type: 'Full', fullSize: 'Large', linkColor: LiteMol.Visualization.Color.fromRgb(255 * 0.6, 255 * 0.6, 255 * 0.6), showTerminalLinks: true, showTerminalAtoms: false };
                function isRepresentable(model, residueIndices) {
                    var name = model.data.residues.name;
                    for (var _c = 0, residueIndices_1 = residueIndices; _c < residueIndices_1.length; _c++) {
                        var rI = residueIndices_1[_c];
                        if (!Carbohydrates.Mapping.isResidueRepresentable(name[rI]))
                            return true;
                    }
                    return false;
                }
                Carbohydrates.isRepresentable = isRepresentable;
                var Transforms;
                (function (Transforms) {
                    var _this = this;
                    Transforms.CarbohydratesInfo = Entity.create({ name: 'Carbohydrate Information', typeClass: 'Object', shortName: 'CI', description: 'Information about carbohydrate residues.' });
                    Transforms.CreateInfo = Tree.Transformer.create({
                        id: 'carbohydrate-representation-create-info',
                        name: 'Carbohydrates',
                        description: 'Information about carbohydrate residues.',
                        from: [Entity.Molecule.Model],
                        to: [Transforms.CarbohydratesInfo],
                        isApplicable: function () { return false; },
                        isUpdatable: false,
                        defaultParams: function () { return ({}); }
                    }, function (ctx, a, t) {
                        return LiteMol.Bootstrap.Task.resolve('Carbohydrates', 'Silent', Transforms.CarbohydratesInfo.create(t, { label: 'Carbohydrates', info: t.params.info }));
                    });
                    Transforms.CreateVisual = Tree.Transformer.create({
                        id: 'carbohydrate-representation-create-visual',
                        name: '3D-SNFG',
                        description: 'Create carbohydrate representation using 3D-SNFG shapes.',
                        from: [Transforms.CarbohydratesInfo],
                        to: [Entity.Molecule.Visual],
                        isUpdatable: true,
                        defaultParams: function () { return Carbohydrates.DefaultFullParams; }
                    }, function (ctx, a, t) {
                        return LiteMol.Bootstrap.Task.create('Carbohydrate Representation', 'Background', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                            var model, _c, surface, theme, tag, mapper, visual, _d, _e, _f, _g, style;
                            return __generator(this, function (_h) {
                                switch (_h.label) {
                                    case 0:
                                        model = LiteMol.Bootstrap.Utils.Molecule.findModel(a);
                                        if (!model)
                                            throw Error('Carbohydrate representation requires a Molecule.Model entity ancestor.');
                                        _c = getRepresentation(model.props.model, a.props.info, t.params), surface = _c.surface, theme = _c.theme, tag = _c.tags, mapper = _c.mapper;
                                        _e = (_d = LiteMol.Visualization.Surface.Model).create;
                                        _f = [a];
                                        _g = {};
                                        return [4 /*yield*/, surface.run(ctx)];
                                    case 1: return [4 /*yield*/, _e.apply(_d, _f.concat([(_g.surface = _h.sent(), _g.theme = theme, _g.parameters = { mapPickElements: mapper }, _g)])).run(ctx)];
                                    case 2:
                                        visual = _h.sent();
                                        style = { type: 'Surface', taskType: 'Background', params: {}, theme: void 0 };
                                        return [2 /*return*/, LiteMol.Bootstrap.Entity.Molecule.Visual.create(t, { label: '3D-SNFG', model: visual, style: style, isSelectable: true, tag: tag })];
                                }
                            });
                        }); }).setReportTime(true);
                    }, function (ctx, b, t) {
                        var oldParams = __assign({}, b.transform.params);
                        var newParams = __assign({}, t.params);
                        if (oldParams.type !== 'Full' || newParams.type !== 'Full')
                            return void 0;
                        delete oldParams.linkColor;
                        delete newParams.linkColor;
                        if (!LiteMol.Bootstrap.Utils.deepEqual(oldParams, newParams))
                            return void 0;
                        var colors = b.props.tag.colors;
                        var colorMapping = LiteMol.Visualization.Theme.createColorMapMapping(function (i) { return i; }, colors, t.params.type === 'Full' ? t.params.linkColor : LiteMol.Visualization.Color.fromHexString('#666666'));
                        var theme = LiteMol.Visualization.Theme.createMapping(colorMapping);
                        b.props.model.applyTheme(theme);
                        return LiteMol.Bootstrap.Task.resolve(t.transformer.info.name, 'Background', Tree.Node.Null);
                    });
                })(Transforms = Carbohydrates.Transforms || (Carbohydrates.Transforms = {}));
                function EmptyInfo(warnings) { return { links: [], map: LiteMol.Core.Utils.FastMap.create(), entries: [], carbohydrateIndices: [], terminalIndices: [], warnings: warnings }; }
                Carbohydrates.EmptyInfo = EmptyInfo;
                function getInfo(params) {
                    var model = params.model, fragment = params.fragment, atomMask = params.atomMask, bonds = params.bonds;
                    var _c = getRepresentableResidues(model, fragment.residueIndices), carbohydrateIndices = _c.residueIndices, entries = _c.entries, warnings = _c.warnings;
                    if (!carbohydrateIndices.length) {
                        return EmptyInfo(warnings);
                    }
                    ;
                    var map = LiteMol.Core.Utils.FastMap.create();
                    for (var i = 0, __i = carbohydrateIndices.length; i < __i; i++) {
                        map.set(carbohydrateIndices[i], i);
                    }
                    var _d = findLinks({ model: model, atomMask: atomMask, bonds: bonds, carbohydrateMap: map, entries: entries }), links = _d.links, terminalIndices = _d.terminalIndices;
                    return { links: links, map: map, entries: entries, carbohydrateIndices: carbohydrateIndices, terminalIndices: terminalIndices, warnings: warnings };
                }
                Carbohydrates.getInfo = getInfo;
                function getRepresentation(model, info, params) {
                    var carbohydrateIndices = info.carbohydrateIndices, entries = info.entries, links = info.links;
                    var shapes = LiteMol.Visualization.Primitive.Builder.create();
                    var tags = LiteMol.Core.Utils.FastMap.create();
                    var colors = LiteMol.Core.Utils.FastMap.create();
                    var scale = params.type === 'Full'
                        ? params.fullSize === 'Small' ? 0.55 : params.fullSize === 'Medium' ? 0.75 : 1.1
                        : params.iconScale;
                    var id = 0;
                    for (var i = 0; i < carbohydrateIndices.length; i++) {
                        var representation = entries[i].representation;
                        var ts = Carbohydrates.Shapes.makeTransform(model, entries[i], scale, params.type);
                        var colorIndex = 0;
                        for (var _c = 0, _d = representation.shape; _c < _d.length; _c++) {
                            var surface = _d[_c];
                            colors.set(id, representation.color[colorIndex++]);
                            tags.set(id, { type: 'Residue', instanceName: representation.instanceName, residueIndex: carbohydrateIndices[i], model: model });
                            shapes.add(__assign({ type: 'Surface', surface: surface, id: id++ }, ts));
                        }
                    }
                    if (params.type === 'Full') {
                        var showTerminalLinks = params.showTerminalLinks, showTerminalAtoms = params.showTerminalAtoms;
                        var linkRadius = params.fullSize === 'Small' ? 0.12 : params.fullSize === 'Medium' ? 0.2 : 0.28;
                        for (var _e = 0, links_1 = links; _e < links_1.length; _e++) {
                            var link = links_1[_e];
                            switch (link.type) {
                                case 'Carbohydrate': {
                                    var a = link.centerA, b = link.centerB;
                                    shapes.add({ type: 'Tube', id: id++, radius: linkRadius, slices: 12, a: a, b: b });
                                    break;
                                }
                                case 'Terminal': {
                                    if (!showTerminalLinks)
                                        continue;
                                    var rB = link.rB, bondType = link.bondType, a = link.centerA, b = link.centerB;
                                    if (Struct.isBondTypeCovalent(bondType)) {
                                        shapes.add({ type: 'Tube', id: id++, radius: linkRadius / 2, slices: 8, a: a, b: b });
                                    }
                                    else {
                                        shapes.add({ type: 'DashedLine', id: id++, width: linkRadius / 2, dashSize: 0.33, spaceSize: 0.33, a: a, b: b });
                                    }
                                    if (showTerminalAtoms) {
                                        var atomRadius = 2 * linkRadius;
                                        tags.set(id, { type: 'Terminal', residueIndex: rB, model: model });
                                        shapes.add({ type: 'Surface', surface: Carbohydrates.Shapes.Sphere, id: id++, scale: [atomRadius, atomRadius, atomRadius], translation: b });
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    var colorMapping = LiteMol.Visualization.Theme.createColorMapMapping(function (i) { return i; }, colors, params.type === 'Full' ? params.linkColor : LiteMol.Visualization.Color.fromHexString('#666666'));
                    var theme = LiteMol.Visualization.Theme.createMapping(colorMapping);
                    var surfTags = { type: 'CarbohydrateRepresentation', colors: colors };
                    return {
                        surface: shapes.buildSurface(),
                        mapper: createElementMapper(model, tags),
                        tags: surfTags,
                        theme: theme
                    };
                }
                Carbohydrates.getRepresentation = getRepresentation;
                function createElementMapper(model, tags) {
                    var _c = model.data.residues, atomStartIndex = _c.atomStartIndex, atomEndIndex = _c.atomEndIndex;
                    return function (pickId) {
                        var tag = tags.get(pickId);
                        if (!tag)
                            return void 0;
                        var ret = [];
                        if (tag.type !== 'Link') {
                            for (var i = atomStartIndex[tag.residueIndex], _i = atomEndIndex[tag.residueIndex]; i < _i; i++)
                                ret.push(i);
                        }
                        else {
                            var rI = tag.link.rA;
                            for (var i = atomStartIndex[rI], _i = atomEndIndex[rI]; i < _i; i++)
                                ret.push(i);
                            rI = tag.link.rB;
                            for (var i = atomStartIndex[rI], _i = atomEndIndex[rI]; i < _i; i++)
                                ret.push(i);
                        }
                        return ret;
                    };
                }
                function swapLink(link) {
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
                function findLinks(params) {
                    var model = params.model, bonds = params.bonds, atomMask = params.atomMask, carbohydrateMap = params.carbohydrateMap, entries = params.entries;
                    var atomAIndex = bonds.atomAIndex, atomBIndex = bonds.atomBIndex, type = bonds.type;
                    var residueIndex = model.data.atoms.residueIndex;
                    var _c = model.positions, x = _c.x, y = _c.y, z = _c.z;
                    var existingPairs = LiteMol.Core.Utils.FastSet.create();
                    var links = [];
                    var terminalIndices = LiteMol.Core.Utils.UniqueArray();
                    for (var i = 0, _ic = bonds.count; i < _ic; i++) {
                        var _a = atomAIndex[i], _b = atomBIndex[i];
                        if (!atomMask.has(_a) || !atomMask.has(_b))
                            continue;
                        var a = Math.min(_a, _b), b = Math.max(_a, _b);
                        var rA = residueIndex[a], rB = residueIndex[b];
                        var hasA = carbohydrateMap.has(rA), hasB = carbohydrateMap.has(rB);
                        var bondType = type[i];
                        if (hasA && hasB) {
                            if (rA === rB)
                                continue;
                            var key = rA + " " + rB;
                            if (existingPairs.has(key))
                                continue;
                            existingPairs.add(key);
                            var e1 = entries[carbohydrateMap.get(rA)], e2 = entries[carbohydrateMap.get(rB)];
                            var link = { type: 'Carbohydrate', rA: rA, rB: rB, atomA: a, atomB: b, centerA: e1.ringCenter, centerB: e2.ringCenter, bondType: bondType };
                            links.push(link);
                            e1.links.push(link);
                            e2.links.push(swapLink(link));
                        }
                        else if (hasA) {
                            var e1 = entries[carbohydrateMap.get(rA)];
                            var link = { type: 'Terminal', rA: rA, rB: rB, atomA: a, atomB: b, centerA: e1.ringCenter, centerB: LA.Vector3(x[b], y[b], z[b]), bondType: bondType };
                            links.push(link);
                            e1.terminalLinks.push(link);
                            LiteMol.Core.Utils.UniqueArray.add(terminalIndices, rB);
                        }
                        else if (hasB) {
                            var e2 = entries[carbohydrateMap.get(rB)];
                            var link = { type: 'Terminal', rA: rB, rB: rA, atomA: b, atomB: a, centerA: e2.ringCenter, centerB: LA.Vector3(x[a], y[a], z[a]), bondType: bondType };
                            links.push(link);
                            e2.terminalLinks.push(link);
                            LiteMol.Core.Utils.UniqueArray.add(terminalIndices, rA);
                        }
                    }
                    return { links: links, terminalIndices: terminalIndices.array };
                }
                function warn(model, rI) {
                    return "Residue '" + Carbohydrates.formatResidueName(model, rI) + "' has a recognized carbohydrate name, but is missing ring atoms with standard names.";
                }
                function isRing(model, atoms, ringCenter) {
                    var ringRadius = LiteMol.Bootstrap.Utils.Molecule.getCentroidAndRadius(model, atoms, ringCenter);
                    if (ringRadius > 1.95)
                        return 0;
                    var u = LA.Vector3.zero(), v = LA.Vector3.zero();
                    var _c = model.positions, x = _c.x, y = _c.y, z = _c.z;
                    var len = atoms.length;
                    for (var i = 0; i < len - 1; i++) {
                        var a = atoms[i];
                        LA.Vector3.set(u, x[a], y[a], z[a]);
                        for (var j = i + 1; j < len; j++) {
                            var b = atoms[j];
                            LA.Vector3.set(v, x[b], y[b], z[b]);
                            if (LA.Vector3.squaredDistance(u, v) > 16)
                                return 0.0;
                        }
                    }
                    return ringRadius;
                }
                function getRepresentableResidues(model, sourceResidueIndices) {
                    var name = model.data.residues.name;
                    var residueIndices = [], entries = [], warnings = [];
                    for (var _c = 0, sourceResidueIndices_1 = sourceResidueIndices; _c < sourceResidueIndices_1.length; _c++) {
                        var rI = sourceResidueIndices_1[_c];
                        if (!Carbohydrates.Mapping.isResidueRepresentable(name[rI]))
                            continue;
                        var possibleRingAtoms = getRingAtoms(model, rI);
                        if (!possibleRingAtoms.length) {
                            warnings.push(warn(model, rI));
                            continue;
                        }
                        var added = false;
                        for (var _d = 0, possibleRingAtoms_1 = possibleRingAtoms; _d < possibleRingAtoms_1.length; _d++) {
                            var ringAtoms = possibleRingAtoms_1[_d];
                            var ringCenter = LA.Vector3.zero();
                            var ringRadius = isRing(model, ringAtoms, ringCenter);
                            if (ringRadius === 0.0)
                                continue;
                            residueIndices.push(rI);
                            entries.push({ representation: Carbohydrates.Mapping.getResidueRepresentation(name[rI]), ringAtoms: ringAtoms, ringCenter: ringCenter, ringRadius: ringRadius, links: [], terminalLinks: [] });
                            added = true;
                            break;
                        }
                        if (!added) {
                            warnings.push(warn(model, rI));
                        }
                    }
                    return { residueIndices: residueIndices, entries: entries, warnings: warnings };
                }
                function getRingAtoms(model, rI) {
                    var _c = model.data.residues, atomStartIndex = _c.atomStartIndex, atomEndIndex = _c.atomEndIndex;
                    var name = model.data.atoms.name;
                    var ret = [];
                    for (var _d = 0, _e = Carbohydrates.Mapping.RingNames; _d < _e.length; _d++) {
                        var names = _e[_d];
                        var atoms = [];
                        var found = 0;
                        for (var i = 0; i < names.__len; i++)
                            atoms.push(0);
                        for (var aI = atomStartIndex[rI], _b = atomEndIndex[rI]; aI < _b; aI++) {
                            var idx = names[name[aI]];
                            if (idx === void 0)
                                continue;
                            atoms[idx] = aI;
                            found++;
                            if (found === atoms.length)
                                ret.push(atoms);
                        }
                    }
                    return ret;
                }
            })(Carbohydrates = ComplexReprensetation.Carbohydrates || (ComplexReprensetation.Carbohydrates = {}));
        })(ComplexReprensetation = Extensions.ComplexReprensetation || (Extensions.ComplexReprensetation = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var ComplexReprensetation;
        (function (ComplexReprensetation) {
            var Carbohydrates;
            (function (Carbohydrates) {
                var Interactivity = LiteMol.Bootstrap.Interactivity;
                function formatResidueName(model, r) {
                    var _a = model.data.residues, authName = _a.authName, authAsymId = _a.authAsymId, authSeqNumber = _a.authSeqNumber, insCode = _a.insCode;
                    return authName[r] + " " + authAsymId[r] + " " + authSeqNumber[r] + (insCode[r] !== null ? ' i: ' + insCode[r] : '');
                }
                Carbohydrates.formatResidueName = formatResidueName;
                function HighlightCustomElementsBehaviour(context) {
                    context.highlight.addProvider(function (info) {
                        if (!Interactivity.Molecule.isMoleculeModelInteractivity(info))
                            return void 0;
                        var data = Interactivity.Molecule.transformInteraction(info);
                        if (!data || data.residues.length !== 1)
                            return void 0;
                        var repr = Carbohydrates.Mapping.getResidueRepresentation(data.residues[0].name);
                        if (!repr)
                            return void 0;
                        return "Carb: <b>" + repr.instanceName + "</b>";
                    });
                }
                Carbohydrates.HighlightCustomElementsBehaviour = HighlightCustomElementsBehaviour;
            })(Carbohydrates = ComplexReprensetation.Carbohydrates || (ComplexReprensetation.Carbohydrates = {}));
        })(ComplexReprensetation = Extensions.ComplexReprensetation || (Extensions.ComplexReprensetation = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var ComplexReprensetation;
        (function (ComplexReprensetation) {
            var CU = LiteMol.Core.Utils;
            var S = LiteMol.Core.Structure;
            var Q = S.Query;
            var MAX_AMINO_SEQ_LIGAND_LENGTH = 10;
            var MAX_NUCLEOTIDE_SEQ_LIGAND_LENGTH = 2;
            function createComplexRepresentation(computation, model, queryCtx) {
                return __awaiter(this, void 0, void 0, function () {
                    var sequenceAtoms, modRes, hasModRes, ret_1, sequenceCtx, modifiedSequence, ret_2, waterAtoms, possibleHetGroupsAndInteractingSequenceQ, possibleHetGroupsAndInteractingSequence, ret_3, bonds, _a, entityIndex, residueIndex, entType, atomAIndex, atomBIndex, boundWaters, i, __i, a, b, tA, tB, freeWaterAtoms, waterAtomsOffset, _i, waterAtoms_1, aI, sequenceMask, _hetGroupsWithSequence, boundSequence, boundHetAtoms, i, __i, a, b, hasA, hasB, _b, _c, aI, rI, hetGroupsWithSequence, carbohydrates, commonAtoms, carbMap, _d, hetGroupsWithSequence_1, aI, rI, interactingSequenceAtoms, _e, hetGroupsWithSequence_2, aI, rI, ret;
                    return __generator(this, function (_f) {
                        switch (_f.label) {
                            case 0: return [4 /*yield*/, computation.updateProgress('Determing main sequence atoms...')];
                            case 1:
                                _f.sent();
                                sequenceAtoms = findMainSequence(model, queryCtx);
                                modRes = model.data.modifiedResidues;
                                hasModRes = modRes && modRes.count > 0;
                                // is everything cartoon?
                                if (sequenceAtoms.length === queryCtx.atomCount && !hasModRes) {
                                    ret_1 = { sequence: { all: sequenceAtoms, interacting: [], modified: [] }, het: { other: [], carbohydrates: ComplexReprensetation.Carbohydrates.EmptyInfo([]) }, freeWaterAtoms: [] };
                                    return [2 /*return*/, ret_1];
                                }
                                sequenceCtx = Q.Context.ofAtomIndices(model, sequenceAtoms);
                                modifiedSequence = getModRes(model, sequenceCtx);
                                if (sequenceAtoms.length === queryCtx.atomCount) {
                                    ret_2 = { sequence: { all: sequenceAtoms, interacting: [], modified: modifiedSequence }, het: { other: [], carbohydrates: ComplexReprensetation.Carbohydrates.EmptyInfo([]) }, freeWaterAtoms: [] };
                                    return [2 /*return*/, ret_2];
                                }
                                waterAtoms = Q.entities({ type: 'water' }).union().compile()(queryCtx).unionAtomIndices();
                                possibleHetGroupsAndInteractingSequenceQ = Q.or(Q.atomsFromIndices(waterAtoms), Q.atomsFromIndices(sequenceAtoms)).complement().ambientResidues(getMaxInteractionRadius(model)).union().compile();
                                possibleHetGroupsAndInteractingSequence = possibleHetGroupsAndInteractingSequenceQ(queryCtx).fragments[0];
                                // is everything cartoon?
                                if (!possibleHetGroupsAndInteractingSequence) {
                                    ret_3 = { sequence: { all: sequenceAtoms, interacting: [], modified: modifiedSequence }, het: { other: [], carbohydrates: ComplexReprensetation.Carbohydrates.EmptyInfo([]) }, freeWaterAtoms: waterAtoms };
                                    return [2 /*return*/, ret_3];
                                }
                                return [4 /*yield*/, computation.updateProgress('Computing bonds...')];
                            case 2:
                                _f.sent();
                                bonds = S.computeBonds(model, possibleHetGroupsAndInteractingSequence.atomIndices);
                                _a = model.data.atoms, entityIndex = _a.entityIndex, residueIndex = _a.residueIndex;
                                entType = model.data.entities.type;
                                atomAIndex = bonds.atomAIndex, atomBIndex = bonds.atomBIndex;
                                /////////////////////////////////////////////////////
                                // WATERS
                                return [4 /*yield*/, computation.updateProgress('Identifying free waters...')];
                            case 3:
                                /////////////////////////////////////////////////////
                                // WATERS
                                _f.sent();
                                boundWaters = CU.FastSet.create();
                                for (i = 0, __i = bonds.count; i < __i; i++) {
                                    a = atomAIndex[i], b = atomBIndex[i];
                                    tA = entType[entityIndex[a]], tB = entType[entityIndex[b]];
                                    if (tA === 'water') {
                                        if (tB !== 'water')
                                            boundWaters.add(residueIndex[a]);
                                    }
                                    else if (tB === 'water') {
                                        boundWaters.add(residueIndex[b]);
                                    }
                                }
                                freeWaterAtoms = new Int32Array(waterAtoms.length - boundWaters.size);
                                waterAtomsOffset = 0;
                                for (_i = 0, waterAtoms_1 = waterAtoms; _i < waterAtoms_1.length; _i++) {
                                    aI = waterAtoms_1[_i];
                                    if (!boundWaters.has(aI))
                                        freeWaterAtoms[waterAtomsOffset++] = aI;
                                }
                                /////////////////////////////////////////////////////
                                // HET GROUPS with SEQUENCE RESIDUES
                                return [4 /*yield*/, computation.updateProgress('Identifying HET groups...')];
                            case 4:
                                /////////////////////////////////////////////////////
                                // HET GROUPS with SEQUENCE RESIDUES
                                _f.sent();
                                sequenceMask = sequenceCtx.mask;
                                _hetGroupsWithSequence = CU.ChunkedArray.forInt32(possibleHetGroupsAndInteractingSequence.atomCount / 2);
                                boundSequence = CU.FastSet.create(), boundHetAtoms = CU.FastSet.create();
                                for (i = 0, __i = bonds.count; i < __i; i++) {
                                    a = atomAIndex[i], b = atomBIndex[i];
                                    hasA = sequenceMask.has(a), hasB = sequenceMask.has(b);
                                    if (hasA) {
                                        if (!hasB) {
                                            boundSequence.add(residueIndex[a]);
                                            boundHetAtoms.add(b);
                                        }
                                    }
                                    else if (hasB) {
                                        boundSequence.add(residueIndex[b]);
                                        boundHetAtoms.add(a);
                                    }
                                }
                                for (_b = 0, _c = possibleHetGroupsAndInteractingSequence.atomIndices; _b < _c.length; _b++) {
                                    aI = _c[_b];
                                    rI = residueIndex[aI];
                                    if (sequenceMask.has(aI) && !boundSequence.has(rI))
                                        continue;
                                    if (entType[entityIndex[aI]] === 'water' && !boundWaters.has(rI))
                                        continue;
                                    CU.ChunkedArray.add(_hetGroupsWithSequence, aI);
                                }
                                hetGroupsWithSequence = CU.ChunkedArray.compact(_hetGroupsWithSequence);
                                /////////////////////////////////////////////////////
                                // CARBS
                                return [4 /*yield*/, computation.updateProgress('Identifying carbohydrates...')];
                            case 5:
                                /////////////////////////////////////////////////////
                                // CARBS
                                _f.sent();
                                carbohydrates = ComplexReprensetation.Carbohydrates.getInfo({ model: model, fragment: Q.Fragment.ofArray(queryCtx, hetGroupsWithSequence[0], hetGroupsWithSequence), atomMask: queryCtx.mask, bonds: bonds });
                                /////////////////////////////////////////////////////
                                // OTHER HET GROUPS
                                return [4 /*yield*/, computation.updateProgress('Identifying non-carbohydrate HET groups...')];
                            case 6:
                                /////////////////////////////////////////////////////
                                // OTHER HET GROUPS
                                _f.sent();
                                commonAtoms = CU.ChunkedArray.forInt32(hetGroupsWithSequence.length);
                                carbMap = carbohydrates.map;
                                for (_d = 0, hetGroupsWithSequence_1 = hetGroupsWithSequence; _d < hetGroupsWithSequence_1.length; _d++) {
                                    aI = hetGroupsWithSequence_1[_d];
                                    rI = residueIndex[aI];
                                    if (!carbMap.has(rI) && !sequenceMask.has(aI))
                                        CU.ChunkedArray.add(commonAtoms, aI);
                                }
                                /////////////////////////////////////////////////////
                                // INTERACTING SEQUENCE
                                return [4 /*yield*/, computation.updateProgress('Identifying interacting sequence residues...')];
                            case 7:
                                /////////////////////////////////////////////////////
                                // INTERACTING SEQUENCE
                                _f.sent();
                                interactingSequenceAtoms = CU.ChunkedArray.forInt32(hetGroupsWithSequence.length);
                                for (_e = 0, hetGroupsWithSequence_2 = hetGroupsWithSequence; _e < hetGroupsWithSequence_2.length; _e++) {
                                    aI = hetGroupsWithSequence_2[_e];
                                    rI = residueIndex[aI];
                                    if (boundSequence.has(rI) || (boundHetAtoms.has(aI) && !carbMap.has(rI)))
                                        CU.ChunkedArray.add(interactingSequenceAtoms, aI);
                                }
                                ret = {
                                    sequence: { all: sequenceAtoms, interacting: CU.ChunkedArray.compact(interactingSequenceAtoms), modified: modifiedSequence },
                                    het: { other: CU.ChunkedArray.compact(commonAtoms), carbohydrates: carbohydrates },
                                    freeWaterAtoms: freeWaterAtoms
                                };
                                return [2 /*return*/, ret];
                        }
                    });
                });
            }
            ComplexReprensetation.createComplexRepresentation = createComplexRepresentation;
            function getModRes(model, ctx) {
                var modRes = model.data.modifiedResidues;
                var hasModRes = modRes && modRes.count > 0;
                if (!modRes || !hasModRes)
                    return [];
                var asymId = modRes.asymId, seqNumber = modRes.seqNumber, insCode = modRes.insCode;
                var residues = [];
                for (var i = 0, __i = modRes.count; i < __i; i++) {
                    residues.push({ asymId: asymId[i], seqNumber: seqNumber[i], insCode: insCode[i] });
                }
                var q = Q.residues.apply(null, residues).compile();
                return q(ctx).unionAtomIndices();
            }
            function getMaxInteractionRadius(model) {
                var maxLength = 3;
                if (model.data.bonds.structConn) {
                    for (var _i = 0, _a = model.data.bonds.structConn.entries; _i < _a.length; _i++) {
                        var c = _a[_i];
                        if (c.distance > maxLength)
                            maxLength = c.distance;
                    }
                }
                return maxLength + 0.1;
            }
            function chainLengthAndType(model, cI, mask) {
                var secondaryStructure = model.data.secondaryStructure;
                var _a = model.data.chains, residueStartIndex = _a.residueStartIndex, residueEndIndex = _a.residueEndIndex;
                var _b = model.data.residues, atomStartIndex = _b.atomStartIndex, atomEndIndex = _b.atomEndIndex, ssi = _b.secondaryStructureIndex;
                var length = 0;
                var isAmk = false, isNucleotide = false;
                for (var rI = residueStartIndex[cI], __b = residueEndIndex[cI]; rI < __b; rI++) {
                    var ss = secondaryStructure[ssi[rI]].type;
                    if (ss === 5 /* Strand */) {
                        isNucleotide = true;
                    }
                    else if (ss !== 0 /* None */) {
                        isAmk = true;
                    }
                    for (var aI = atomStartIndex[rI], __i = atomEndIndex[rI]; aI < __i; aI++) {
                        if (mask.has(aI)) {
                            length++;
                            break;
                        }
                    }
                }
                return { length: length, isAmk: isAmk, isNucleotide: isNucleotide };
            }
            function findMainSequence(model, queryCtx) {
                var mask = queryCtx.mask;
                var _a = model.data.chains, residueStartIndex = _a.residueStartIndex, residueEndIndex = _a.residueEndIndex;
                var _b = model.data.residues, atomStartIndex = _b.atomStartIndex, atomEndIndex = _b.atomEndIndex;
                var atoms = CU.ChunkedArray.forInt32(queryCtx.atomCount);
                for (var _i = 0, _c = model.data.chains.indices; _i < _c.length; _i++) {
                    var cI = _c[_i];
                    var _d = chainLengthAndType(model, cI, mask), length_1 = _d.length, isAmk = _d.isAmk, isNucleotide = _d.isNucleotide;
                    if ((isAmk && length_1 <= MAX_AMINO_SEQ_LIGAND_LENGTH) || (isNucleotide && length_1 <= MAX_NUCLEOTIDE_SEQ_LIGAND_LENGTH))
                        continue;
                    for (var rI = residueStartIndex[cI], __b = residueEndIndex[cI]; rI < __b; rI++) {
                        if (!isCartoonLike(model, mask, rI))
                            continue;
                        for (var aI = atomStartIndex[rI], __i = atomEndIndex[rI]; aI < __i; aI++) {
                            if (mask.has(aI)) {
                                CU.ChunkedArray.add(atoms, aI);
                            }
                        }
                    }
                }
                return CU.ChunkedArray.compact(atoms);
            }
            function _isCartoonLike(mask, start, end, name, a, b, isAmk) {
                var aU = false, aV = false, hasP = false;
                for (var i = start; i < end; i++) {
                    if (!mask.has(i))
                        continue;
                    var n = name[i];
                    if (!aU && n === a) {
                        aU = true;
                    }
                    else if (!aV && n === b) {
                        aV = true;
                    }
                    if (aU && aV)
                        return true;
                    if (n === 'P') {
                        hasP = true;
                    }
                }
                if (isAmk)
                    return aU;
                return hasP;
            }
            function isCartoonLike(model, mask, rI) {
                var _a = model.data, secondaryStructure = _a.secondaryStructure, residues = _a.residues, atoms = _a.atoms;
                var atomStartIndex = residues.atomStartIndex, atomEndIndex = residues.atomEndIndex, ssi = residues.secondaryStructureIndex;
                var ss = secondaryStructure[ssi[rI]].type;
                if (ss === 0 /* None */)
                    return false;
                var name = atoms.name;
                if (ss === 5 /* Strand */) {
                    return _isCartoonLike(mask, atomStartIndex[rI], atomEndIndex[rI], name, "O5'", "C3'", false);
                }
                else {
                    return _isCartoonLike(mask, atomStartIndex[rI], atomEndIndex[rI], name, "CA", "O", true);
                }
            }
        })(ComplexReprensetation = Extensions.ComplexReprensetation || (Extensions.ComplexReprensetation = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var ComplexReprensetation;
        (function (ComplexReprensetation) {
            var Transforms;
            (function (Transforms) {
                var _this = this;
                var Entity = LiteMol.Bootstrap.Entity;
                var Transformer = LiteMol.Bootstrap.Entity.Transformer;
                var Tree = LiteMol.Bootstrap.Tree;
                var Q = LiteMol.Core.Structure.Query;
                Transforms.ComplexInfo = Entity.create({ name: 'Macromolecular Complex Info', typeClass: 'Object', shortName: 'MC', description: 'Information about a macromolecular complex.' });
                Transforms.CreateComplexInfo = Tree.Transformer.create({
                    id: 'complex-representation-create-info',
                    name: 'Complex Info',
                    description: 'Information about macromolecular complex (Main sequence, ligands, etc.).',
                    from: [Entity.Molecule.Model, Entity.Molecule.Selection],
                    to: [Transforms.ComplexInfo],
                    isUpdatable: false,
                    defaultParams: function () { return ({}); }
                }, function (ctx, a, t) {
                    return LiteMol.Bootstrap.Task.create('Complex', 'Normal', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var model, queryCtx, info;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    model = LiteMol.Bootstrap.Utils.Molecule.findModel(a);
                                    queryCtx = LiteMol.Bootstrap.Utils.Molecule.findQueryContext(a);
                                    return [4 /*yield*/, ComplexReprensetation.createComplexRepresentation(ctx, model.props.model, queryCtx)];
                                case 1:
                                    info = _a.sent();
                                    return [2 /*return*/, Transforms.ComplexInfo.create(t, { label: 'Complex', info: info })];
                            }
                        });
                    }); }).setReportTime(true);
                });
                Transforms.CreateVisual = Tree.Transformer.actionWithContext({
                    id: 'complex-representation-create-visual',
                    name: 'Complex Visual',
                    description: 'Create a visual of a macromolecular complex.',
                    from: [Transforms.ComplexInfo],
                    to: [Entity.Action],
                    defaultParams: function (ctx) { return ({}); },
                }, function (context, a, t) {
                    var action = Tree.Transform.build();
                    var info = a.props.info;
                    if (info.sequence.all.length) {
                        var sequence = action.add(a, Transformer.Basic.CreateGroup, { label: 'Sequence', description: '' }, { isBinding: false });
                        sequence.then(Transformer.Molecule.CreateSelectionFromQuery, { query: Q.atomsFromIndices(info.sequence.all), name: 'All Residues', silent: true }, { isBinding: false })
                            .then(Transformer.Molecule.CreateVisual, { style: LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('Cartoons') }, {});
                        var sequenceBSStyle = {
                            type: 'BallsAndSticks',
                            taskType: 'Silent',
                            params: { useVDW: true, vdwScaling: 0.21, bondRadius: 0.085, detail: 'Automatic' },
                            theme: { template: LiteMol.Bootstrap.Visualization.Molecule.Default.CartoonThemeTemplate, colors: LiteMol.Bootstrap.Visualization.Molecule.Default.CartoonThemeTemplate.colors, transparency: { alpha: 1.0 } },
                        };
                        if (info.sequence.interacting.length) {
                            sequence.then(Transformer.Molecule.CreateSelectionFromQuery, { query: Q.atomsFromIndices(info.sequence.interacting), name: 'Interacting Residues', silent: true }, { isBinding: false })
                                .then(Transformer.Molecule.CreateVisual, { style: sequenceBSStyle });
                        }
                        if (info.sequence.modified.length) {
                            sequence.then(Transformer.Molecule.CreateSelectionFromQuery, { query: Q.atomsFromIndices(info.sequence.modified), name: 'Modified Residues', silent: true }, { isBinding: false })
                                .then(Transformer.Molecule.CreateVisual, { style: sequenceBSStyle });
                        }
                    }
                    if (info.het.other.length || info.het.carbohydrates.entries.length) {
                        var hetGroups = action.add(a, Transformer.Basic.CreateGroup, { label: 'HET', description: '' }, { isBinding: false });
                        if (info.het.other.length) {
                            hetGroups.then(Transformer.Molecule.CreateSelectionFromQuery, { query: Q.atomsFromIndices(info.het.other), name: 'Ligands', silent: true })
                                .then(Transformer.Molecule.CreateVisual, { style: LiteMol.Bootstrap.Visualization.Molecule.Default.ForType.get('BallsAndSticks') }, { isBinding: false });
                        }
                        if (info.het.carbohydrates.entries.length) {
                            var shadeStyle = {
                                type: 'BallsAndSticks',
                                taskType: 'Silent',
                                params: { useVDW: false, atomRadius: 0.15, bondRadius: 0.07, detail: 'Automatic' },
                                theme: { template: LiteMol.Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate, colors: LiteMol.Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate.colors, transparency: { alpha: 0.15 } }
                            };
                            var carbsQ = Q.or(Q.residuesFromIndices(info.het.carbohydrates.carbohydrateIndices), Q.residuesFromIndices(info.het.carbohydrates.terminalIndices)).union();
                            var carbs = hetGroups.then(LiteMol.Bootstrap.Entity.Transformer.Molecule.CreateSelectionFromQuery, { query: carbsQ, name: 'Std. Carbohydrates', silent: true }, {});
                            carbs.then(LiteMol.Bootstrap.Entity.Transformer.Molecule.CreateVisual, { style: shadeStyle });
                            carbs.then(ComplexReprensetation.Carbohydrates.Transforms.CreateInfo, { info: info.het.carbohydrates })
                                .then(ComplexReprensetation.Carbohydrates.Transforms.CreateVisual, ComplexReprensetation.Carbohydrates.DefaultFullParams, { isBinding: true });
                        }
                    }
                    if (info.freeWaterAtoms.length) {
                        var style = {
                            type: 'BallsAndSticks',
                            params: { useVDW: false, atomRadius: 0.15, bondRadius: 0.07, detail: 'Automatic' },
                            theme: { template: LiteMol.Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate, colors: LiteMol.Bootstrap.Visualization.Molecule.Default.ElementSymbolThemeTemplate.colors, transparency: { alpha: 0.2 } }
                        };
                        action.add(a, Transformer.Molecule.CreateSelectionFromQuery, { query: Q.atomsFromIndices(info.freeWaterAtoms), name: 'Unbound Water', silent: true }, { isBinding: true })
                            .then(Transformer.Molecule.CreateVisual, { style: style }, {});
                    }
                    return { action: action, context: { warnings: info.het.carbohydrates.warnings } };
                }, function (context, ws) {
                    if (!ws)
                        return;
                    for (var _i = 0, _a = ws.warnings; _i < _a.length; _i++) {
                        var w = _a[_i];
                        context.logger.warning("Carbohydrates: " + w);
                    }
                });
                Transforms.SuppressCreateVisualWhenModelIsAdded = false;
                function CreateRepresentationWhenModelIsAddedBehaviour(context) {
                    LiteMol.Bootstrap.Event.Tree.NodeAdded.getStream(context).subscribe(function (e) {
                        if (Transforms.SuppressCreateVisualWhenModelIsAdded || !LiteMol.Bootstrap.Tree.Node.is(e.data, LiteMol.Bootstrap.Entity.Molecule.Model) || e.data.isHidden) {
                            return;
                        }
                        var action = LiteMol.Bootstrap.Tree.Transform.build()
                            .add(e.data, Transforms.CreateComplexInfo, {})
                            .then(Transforms.CreateVisual, {}, { isBinding: true });
                        LiteMol.Bootstrap.Tree.Transform.apply(context, action).run().then(function () {
                            LiteMol.Bootstrap.Command.Visual.ResetScene.dispatch(context, void 0);
                        });
                    });
                }
                Transforms.CreateRepresentationWhenModelIsAddedBehaviour = CreateRepresentationWhenModelIsAddedBehaviour;
            })(Transforms = ComplexReprensetation.Transforms || (ComplexReprensetation.Transforms = {}));
        })(ComplexReprensetation = Extensions.ComplexReprensetation || (Extensions.ComplexReprensetation = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var ComplexReprensetation;
        (function (ComplexReprensetation) {
            var Carbohydrates;
            (function (Carbohydrates) {
                var UI;
                (function (UI) {
                    'use strict';
                    var React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
                    var Controls = LiteMol.Plugin.Controls;
                    var CreateVisual = /** @class */ (function (_super) {
                        __extends(CreateVisual, _super);
                        function CreateVisual() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        CreateVisual.prototype.updateVisual = function (newParams) {
                            var p = this.params;
                            var type = newParams.type || p.type;
                            this.autoUpdateParams(__assign({}, (type === 'Full' ? Carbohydrates.DefaultFullParams : Carbohydrates.DefaultIconsParams), p, newParams));
                        };
                        CreateVisual.prototype.renderControls = function () {
                            var _this = this;
                            var params = this.params;
                            return React.createElement("div", null,
                                React.createElement(Controls.Toggle, { onChange: function (v) { return _this.updateVisual({ type: (v ? 'Full' : 'Icons') }); }, value: params.type === 'Full', label: 'Links' }),
                                params.type === 'Full'
                                    ? React.createElement(Controls.OptionsGroup, { options: Carbohydrates.FullSizes, caption: function (s) { return s; }, current: params.fullSize, onChange: function (fullSize) { return _this.updateVisual({ fullSize: fullSize }); }, label: 'Size' })
                                    : React.createElement(Controls.Slider, { label: 'Scale', onChange: function (scale) { return _this.updateVisual({ iconScale: scale }); }, min: 0.5, max: 1.1, step: 0.01, value: params.iconScale }),
                                params.type === 'Full' ? React.createElement(Controls.ToggleColorPicker, { label: 'Link Color', color: params.linkColor, onChange: function (linkColor) { return _this.updateVisual({ linkColor: linkColor }); } }) : void 0,
                                params.type === 'Full' ? React.createElement(Controls.Toggle, { onChange: function (showTerminalLinks) { return _this.updateVisual({ showTerminalLinks: showTerminalLinks }); }, value: params.showTerminalLinks, label: 'Terminal Links', title: 'Show/hide link to non-carbohydrate residues' }) : void 0,
                                params.type === 'Full' ? React.createElement(Controls.Toggle, { onChange: function (showTerminalAtoms) { return _this.updateVisual({ showTerminalAtoms: showTerminalAtoms }); }, value: params.showTerminalAtoms, label: 'Terminal Pegs', title: 'Show/hide terminal residues as spheres' }) : void 0);
                        };
                        return CreateVisual;
                    }(LiteMol.Plugin.Views.Transform.ControllerBase));
                    UI.CreateVisual = CreateVisual;
                })(UI = Carbohydrates.UI || (Carbohydrates.UI = {}));
            })(Carbohydrates = ComplexReprensetation.Carbohydrates || (ComplexReprensetation.Carbohydrates = {}));
        })(ComplexReprensetation = Extensions.ComplexReprensetation || (Extensions.ComplexReprensetation = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2017 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var ParticleColoring;
        (function (ParticleColoring) {
            'use strict';
            var _this = this;
            var Vec3 = LiteMol.Core.Geometry.LinearAlgebra.Vector3;
            var Tree = LiteMol.Bootstrap.Tree;
            var Entity = LiteMol.Bootstrap.Entity;
            ParticleColoring.Coloring = Entity.create({ name: 'Particle Coloring', typeClass: 'Object', shortName: 'PC', description: 'Atom coloring based on distance from the molecule\' centroid.' });
            ParticleColoring.Apply = Tree.Transformer.create({
                id: 'particle-coloring-apply',
                name: 'Particle Coloring',
                description: 'Apply atom coloring based on distance from the molecule\' centroid.',
                from: [Entity.Molecule.Visual],
                to: [ParticleColoring.Coloring],
                isUpdatable: true,
                defaultParams: function () { return ({ min: 0, max: 1e10, steps: 66, opacity: 1.0 }); }
            }, function (context, a, t) {
                return LiteMol.Bootstrap.Task.create('Complex', 'Normal', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                    var model, info, coloring;
                    return __generator(this, function (_a) {
                        model = LiteMol.Bootstrap.Utils.Molecule.findModel(a);
                        info = getAtomParticleDistances(model.props.model);
                        coloring = ParticleColoring.Coloring.create(t, { info: info, label: 'Particle Coloring', description: Math.round(10 * t.params.min) / 10 + " - " + Math.round(10 * t.params.max) / 10 });
                        applyTheme(context, coloring, a, t.params);
                        return [2 /*return*/, coloring];
                    });
                }); });
            }, function (ctx, b, t) {
                applyTheme(ctx, b, b.parent, t.params);
                return LiteMol.Bootstrap.Task.resolve(t.transformer.info.name, 'Background', Tree.Node.Null);
            });
            function getAtomParticleDistances(model) {
                var _a = model.positions, x = _a.x, y = _a.y, z = _a.z, count = _a.count;
                var center = Vec3();
                LiteMol.Bootstrap.Utils.Molecule.getCentroidAndRadius(model, model.data.atoms.indices, center);
                var distances = new Float32Array(count);
                var t = Vec3();
                var min = 1e20, max = 0;
                for (var i = 0; i < count; i++) {
                    Vec3.set(t, x[i], y[i], z[i]);
                    var d = Vec3.distance(t, center);
                    distances[i] = d;
                    if (d < min)
                        min = d;
                    else if (d > max)
                        max = d;
                }
                return { min: min, max: max, distances: distances };
            }
            function createColorMapping(distances, min, max, maxColorIndex) {
                var mapping = new Int32Array(distances.length);
                var delta = (max - min) / maxColorIndex;
                for (var i = 0, __i = distances.length; i < __i; i++) {
                    if (distances[i] < min)
                        mapping[i] = 0;
                    else if (distances[i] > max)
                        mapping[i] = maxColorIndex;
                    else
                        mapping[i] = Math.round((distances[i] - min) / delta);
                }
                return mapping;
            }
            function makeRainbow(steps) {
                var rainbow = [];
                var pal = LiteMol.Bootstrap.Visualization.Molecule.RainbowPalette;
                for (var i = steps - 1; i >= 0; i--) {
                    var t = (pal.length - 1) * i / (steps - 1);
                    var low = Math.floor(t), high = Math.min(Math.ceil(t), pal.length - 1);
                    var color = LiteMol.Visualization.Color.fromRgb(0, 0, 0);
                    LiteMol.Visualization.Color.interpolate(pal[low], pal[high], t - low, color);
                    rainbow.push(color);
                }
                return rainbow;
            }
            ParticleColoring.makeRainbow = makeRainbow;
            function applyTheme(ctx, coloring, visual, _a) {
                var min = _a.min, max = _a.max, stps = _a.steps, alpha = _a.opacity;
                var distInfo = coloring.props.info;
                var steps = Math.ceil(stps);
                var atomMapping = createColorMapping(distInfo.distances, Math.max(min, distInfo.min), Math.min(max, distInfo.max), steps - 1);
                var rainbow = makeRainbow(steps);
                var mapping = LiteMol.Visualization.Theme.createPalleteIndexMapping(function (i) { return atomMapping[i]; }, rainbow);
                var theme = LiteMol.Visualization.Theme.createMapping(mapping, { transparency: { alpha: alpha }, isSticky: true });
                LiteMol.Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(ctx, { visual: visual, theme: theme });
            }
        })(ParticleColoring = Extensions.ParticleColoring || (Extensions.ParticleColoring = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var ParticleColoring;
        (function (ParticleColoring) {
            var UI;
            (function (UI) {
                'use strict';
                var React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
                var Controls = LiteMol.Plugin.Controls;
                var Apply = /** @class */ (function (_super) {
                    __extends(Apply, _super);
                    function Apply() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Apply.prototype.rainbow = function () {
                        var grad = "linear-gradient(to left," + LiteMol.Bootstrap.Visualization.Molecule.RainbowPalette.map(function (c) { return "rgb(" + 255 * c.r + "," + 255 * c.g + "," + 255 * c.b + ")"; }).join(',') + ")";
                        return React.createElement("div", { style: { background: grad, height: '8px', marginTop: '1px' } });
                    };
                    Apply.prototype.renderControls = function () {
                        var _this = this;
                        var params = this.params;
                        if (!this.isUpdate)
                            return React.createElement("div", null);
                        var max = this.controller.entity.props.info.max;
                        var min = this.controller.entity.props.info.min;
                        return React.createElement("div", null,
                            this.rainbow(),
                            React.createElement(Controls.Slider, { label: 'Low Radius', onChange: function (min) { return _this.autoUpdateParams({ min: min }); }, min: min, max: max, step: 0.1, value: Math.max(params.min, min) }),
                            React.createElement(Controls.Slider, { label: 'High Radius', onChange: function (max) { return _this.autoUpdateParams({ max: max }); }, min: params.min, max: max, step: 0.1, value: Math.min(params.max, max) }),
                            React.createElement(Controls.Slider, { label: 'Opacity', onChange: function (opacity) { return _this.autoUpdateParams({ opacity: opacity }); }, min: 0, max: 1, step: 0.01, value: params.opacity }));
                    };
                    return Apply;
                }(LiteMol.Plugin.Views.Transform.ControllerBase));
                UI.Apply = Apply;
            })(UI = ParticleColoring.UI || (ParticleColoring.UI = {}));
        })(ParticleColoring = Extensions.ParticleColoring || (Extensions.ParticleColoring = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var RNALoops;
        (function (RNALoops) {
            var React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
            var Controls = LiteMol.Plugin.Controls;
            var CreateLoopAnnotationView = /** @class */ (function (_super) {
                __extends(CreateLoopAnnotationView, _super);
                function CreateLoopAnnotationView() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                CreateLoopAnnotationView.prototype.renderControls = function () {
                    var _this = this;
                    var params = this.params;
                    return React.createElement("div", null,
                        React.createElement(Controls.TextBoxGroup, { value: params.server, onChange: function (v) { return _this.updateParams({ server: v }); }, label: 'Server', title: 'The base URL of the annotation API.', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter server URL...' }));
                };
                return CreateLoopAnnotationView;
            }(LiteMol.Plugin.Views.Transform.ControllerBase));
            RNALoops.CreateLoopAnnotationView = CreateLoopAnnotationView;
        })(RNALoops = Extensions.RNALoops || (Extensions.RNALoops = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Extensions;
    (function (Extensions) {
        var RNALoops;
        (function (RNALoops) {
            var _this = this;
            var Entity = LiteMol.Bootstrap.Entity;
            var Transformer = LiteMol.Bootstrap.Entity.Transformer;
            RNALoops.LoopAnnotation = Entity.create({ name: 'BGSU RNA Loops', typeClass: 'Behaviour', shortName: 'RL', description: 'Represents BGSU loop annotation.' });
            var Api;
            (function (Api) {
                function parseCSV(data) {
                    var lines = data.split('\n');
                    var entries = [];
                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i].trim();
                        var comma = line.indexOf(',');
                        if (comma < 0)
                            continue;
                        var id = line.substring(1, comma - 2);
                        var type = (id[0] + id[1]);
                        var residueIds = line.substring(comma + 2, line.length - 1).split(',');
                        var residues = [];
                        for (var j = 0; j < residueIds.length; j++) {
                            var t = residueIds[j].split('|');
                            residues.push({ modelId: t[1], authAsymId: t[2], authSeqNumber: +t[4], insCode: t[7] || '' });
                        }
                        entries.push({ id: id, type: type, residues: residues });
                    }
                    return entries;
                }
                Api.parseCSV = parseCSV;
                function create(entries) {
                    var annotation = {};
                    if (!entries.length) {
                        return annotation;
                    }
                    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                        var entry = entries_1[_i];
                        for (var _a = 0, _c = entry.residues; _a < _c.length; _a++) {
                            var residue = _c[_a];
                            var model = annotation[residue.modelId] || (annotation[residue.modelId] = {});
                            var chain = model[residue.authAsymId] || (model[residue.authAsymId] = {});
                            var seq = chain[residue.authSeqNumber] || (chain[residue.authSeqNumber] = {});
                            var ins = seq[residue.insCode] || (seq[residue.insCode] = []);
                            ins[ins.length] = entry;
                        }
                    }
                    return annotation;
                }
                Api.create = create;
                function getEntries(annotation, modelId, asymId, seqNumber, insCode) {
                    var m = annotation[modelId];
                    if (!m)
                        return void 0;
                    var c = m[asymId];
                    if (!c)
                        return void 0;
                    var r = c[seqNumber];
                    if (!r)
                        return void 0;
                    return r[insCode];
                }
                Api.getEntries = getEntries;
            })(Api = RNALoops.Api || (RNALoops.Api = {}));
            var Interactivity;
            (function (Interactivity) {
                var Behaviour = /** @class */ (function () {
                    function Behaviour(context, annotation) {
                        var _this = this;
                        this.context = context;
                        this.annotation = annotation;
                        this.provider = function (info) {
                            try {
                                return _this.processInfo(info);
                            }
                            catch (e) {
                                console.error('Error showing loop annotation label', e);
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
                        if (!i || i.residues.length !== 1)
                            return void 0;
                        var r = i.residues[0];
                        var xs = Api.getEntries(this.annotation, i.modelId, r.chain.authAsymId, r.authSeqNumber, r.insCode || '');
                        if (!xs || !xs.length)
                            return void 0;
                        return 'RNA Loops: ' + xs.map(function (x) { return "<b>" + x.type + "</b> (" + x.id + ")"; }).join(', ');
                    };
                    return Behaviour;
                }());
                Interactivity.Behaviour = Behaviour;
            })(Interactivity = RNALoops.Interactivity || (RNALoops.Interactivity = {}));
            var Theme;
            (function (Theme) {
                var colorMap = (function () {
                    var colors = LiteMol.Core.Utils.FastMap.create();
                    colors.set(0, { r: 0x5B / 0xFF, g: 0xB7 / 0xFF, b: 0x5B / 0xFF }); // (IL): #5BB75B
                    colors.set(1, { r: 0x49 / 0xFF, g: 0xAF / 0xFF, b: 0xCD / 0xFF }); // (HL): #49AFCD
                    colors.set(2, { r: 0xCD / 0xFF, g: 0xAC / 0xFF, b: 0x4A / 0xFF }); // (J3): #CDAC4A
                    colors.set(3, { r: 0.6, g: 0.6, b: 0.6 }); // not applicable
                    return colors;
                })();
                var defaultColor = { r: 0.6, g: 0.6, b: 0.6 };
                var selectionColor = { r: 0, g: 0, b: 1 };
                var highlightColor = { r: 1, g: 0, b: 1 };
                function createResidueMapNormal(model, annotation) {
                    var map = new Uint8Array(model.data.residues.count);
                    var mId = model.modelId;
                    var _a = model.data.residues, authAsymId = _a.authAsymId, authSeqNumber = _a.authSeqNumber, insCode = _a.insCode;
                    for (var i = 0, _b = model.data.residues.count; i < _b; i++) {
                        var entries = Api.getEntries(annotation, mId, authAsymId[i], authSeqNumber[i], insCode[i] || '');
                        if (!entries) {
                            map[i] = 3;
                            continue;
                        }
                        var e = entries[0];
                        if (e.type === 'IL')
                            map[i] = 0;
                        else if (e.type === 'HL')
                            map[i] = 1;
                        else if (e.type === 'J3')
                            map[i] = 2;
                        else
                            map[i] = 3;
                    }
                    return map;
                }
                function createResidueMapComputed(model, annotation) {
                    var map = new Uint8Array(model.data.residues.count);
                    var mId = model.modelId;
                    var parent = model.parent;
                    var _a = model.data.residues, chainIndex = _a.chainIndex, authSeqNumber = _a.authSeqNumber, insCode = _a.insCode;
                    var sourceChainIndex = model.data.chains.sourceChainIndex;
                    var authAsymId = parent.data.chains.authAsymId;
                    for (var i = 0, _b = model.data.residues.count; i < _b; i++) {
                        var aId = authAsymId[sourceChainIndex[chainIndex[i]]];
                        var entries = Api.getEntries(annotation, mId, aId, authSeqNumber[i], insCode[i] || '');
                        if (!entries) {
                            map[i] = 3;
                            continue;
                        }
                        var e = entries[0];
                        if (e.type === 'IL')
                            map[i] = 0;
                        else if (e.type === 'HL')
                            map[i] = 1;
                        else if (e.type === 'J3')
                            map[i] = 2;
                        else
                            map[i] = 3;
                    }
                    return map;
                }
                function create(entity, report) {
                    var model = entity.props.model;
                    var map = model.source === LiteMol.Core.Structure.Molecule.Model.Source.File
                        ? createResidueMapNormal(model, report)
                        : createResidueMapComputed(model, report);
                    var colors = LiteMol.Core.Utils.FastMap.create();
                    colors.set('Uniform', defaultColor);
                    colors.set('Selection', selectionColor);
                    colors.set('Highlight', highlightColor);
                    var residueIndex = model.data.atoms.residueIndex;
                    var mapping = LiteMol.Visualization.Theme.createColorMapMapping(function (i) { return map[residueIndex[i]]; }, colorMap, defaultColor);
                    return LiteMol.Visualization.Theme.createMapping(mapping, { colors: colors, interactive: true, transparency: { alpha: 1.0 } });
                }
                Theme.create = create;
            })(Theme || (Theme = {}));
            var Create = LiteMol.Bootstrap.Tree.Transformer.create({
                id: 'rna-loops-create',
                name: 'RNA Loops',
                description: 'Create the RNA loop annotation object from a string.',
                from: [Entity.Data.String],
                to: [RNALoops.LoopAnnotation],
                defaultParams: function () { return ({}); }
            }, function (context, a, t) {
                return LiteMol.Bootstrap.Task.create("RNA Loop Annotation (" + t.params.id + ")", 'Normal', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                    var entries, annotation;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, ctx.updateProgress('Parsing...')];
                            case 1:
                                _a.sent();
                                entries = Api.parseCSV(a.props.data);
                                if (!entries.length) {
                                    throw new Error("No RNA loop annotation for '" + t.params.id + "' is available.");
                                }
                                annotation = Api.create(entries);
                                return [2 /*return*/, RNALoops.LoopAnnotation.create(t, { label: 'RNA Loop Annotation', behaviour: new Interactivity.Behaviour(context, annotation) })];
                        }
                    });
                }); }).setReportTime(true);
            });
            RNALoops.DownloadAndCreate = LiteMol.Bootstrap.Tree.Transformer.actionWithContext({
                id: 'rna-loops-download-and-create',
                name: 'BGSU RNA Loop Annotation',
                description: 'Download RNA loop annotation from BGSU',
                from: [Entity.Molecule.Molecule],
                to: [Entity.Action],
                defaultParams: function (ctx) { return ({ server: ctx.settings.get('extensions.rnaLoops.defaultServer') }); }
            }, function (context, a, t) {
                var id = a.props.molecule.id.trim().toLocaleUpperCase();
                var reportRef = t.params.reportRef || LiteMol.Bootstrap.Utils.generateUUID();
                var action = LiteMol.Bootstrap.Tree.Transform.build()
                    .add(a, Transformer.Data.Download, { url: t.params.server.replace('#id', id), type: 'String', id: id, description: 'Annotation Data', title: 'RNA Annotation' })
                    .then(Create, { id: id }, { isBinding: true, ref: reportRef });
                return { action: action, context: { reportRef: reportRef } };
            }, function (ctx, actionCtx) {
                if (!actionCtx || !ctx.select(actionCtx.reportRef).length) {
                    ctx.logger.error('Failed to load BGSU RNA annotation. Possible causes: no annotation available, server is down, server does not support HTTPS (use http:// in LiteMol URL to fix).');
                    return;
                }
                ctx.logger.info('BGSU RNA annotation loaded. Hovering over RNA residue will now contain loop info. To apply coloring, select the entity in the tree and apply it the right panel.');
            });
            RNALoops.ApplyTheme = LiteMol.Bootstrap.Tree.Transformer.create({
                id: 'rna-loops-apply-theme',
                name: 'Apply Coloring',
                description: 'Colors RNA strands according to annotation of secondary structure loops.',
                from: [RNALoops.LoopAnnotation],
                to: [Entity.Action],
                defaultParams: function () { return ({}); }
            }, function (context, a, t) {
                return LiteMol.Bootstrap.Task.create('RNA Annotation Coloring', 'Background', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                    var molecule, themes, visuals, _i, visuals_2, v, model, theme;
                    return __generator(this, function (_a) {
                        molecule = LiteMol.Bootstrap.Tree.Node.findAncestor(a, LiteMol.Bootstrap.Entity.Molecule.Molecule);
                        if (!molecule) {
                            throw 'No suitable parent found.';
                        }
                        themes = LiteMol.Core.Utils.FastMap.create();
                        visuals = context.select(LiteMol.Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(LiteMol.Bootstrap.Entity.Molecule.Visual));
                        for (_i = 0, visuals_2 = visuals; _i < visuals_2.length; _i++) {
                            v = visuals_2[_i];
                            model = LiteMol.Bootstrap.Utils.Molecule.findModel(v);
                            if (!model)
                                continue;
                            theme = themes.get(model.id);
                            if (!theme) {
                                theme = Theme.create(model, a.props.behaviour.annotation);
                                themes.set(model.id, theme);
                            }
                            LiteMol.Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(context, { visual: v, theme: theme });
                        }
                        context.logger.message('RNA annotation coloring applied.');
                        return [2 /*return*/, LiteMol.Bootstrap.Tree.Node.Null];
                    });
                }); });
            });
        })(RNALoops = Extensions.RNALoops || (Extensions.RNALoops = {}));
    })(Extensions = LiteMol.Extensions || (LiteMol.Extensions = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var PDBe;
        (function (PDBe) {
            var Data;
            (function (Data) {
                "use strict";
                var Bootstrap = LiteMol.Bootstrap;
                var Entity = Bootstrap.Entity;
                var Transformer = Bootstrap.Entity.Transformer;
                // straigtforward
                Data.DownloadMolecule = Transformer.Molecule.downloadMoleculeSource({
                    sourceId: 'pdbe-molecule',
                    name: 'PDBe (mmCIF)',
                    description: 'Download a molecule from PDBe.',
                    defaultId: '1cbs',
                    specificFormat: LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF,
                    urlTemplate: function (id) { return "https://www.ebi.ac.uk/pdbe/static/entry/" + id.toLowerCase() + "_updated.cif"; }
                });
                Data.DownloadBinaryCIFFromCoordinateServer = Bootstrap.Tree.Transformer.action({
                    id: 'molecule-download-bcif-from-coordinate-server',
                    name: 'Download Molecule',
                    description: 'Download full or cartoon representation of a PDB entry using the BinaryCIF format.',
                    from: [Entity.Root],
                    to: [Entity.Action],
                    defaultParams: function (ctx) { return ({ id: '1cbs', type: 'Full', lowPrecisionCoords: true, serverUrl: ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') ? ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') : 'https://cs.litemol.org' }); },
                    validateParams: function (p) { return (!p.id || !p.id.trim().length) ? ['Enter Id'] : (!p.serverUrl || !p.serverUrl.trim().length) ? ['Enter CoordinateServer base URL'] : void 0; },
                }, function (context, a, t) {
                    var query = t.params.type === 'Cartoon' ? 'cartoon' : 'full';
                    var id = t.params.id.toLowerCase().trim();
                    var url = "" + t.params.serverUrl + (t.params.serverUrl[t.params.serverUrl.length - 1] === '/' ? '' : '/') + id + "/" + query + "?encoding=bcif&lowPrecisionCoords=" + (t.params.lowPrecisionCoords ? '1' : '0');
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
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var PDBe;
        (function (PDBe) {
            var Data;
            (function (Data) {
                "use strict";
                var Bootstrap = LiteMol.Bootstrap;
                var Entity = Bootstrap.Entity;
                var Transformer = Bootstrap.Entity.Transformer;
                var Tree = Bootstrap.Tree;
                var Visualization = Bootstrap.Visualization;
                Data.DensitySourceLabels = {
                    'electron-density': 'X-ray (from PDB Id)',
                    'emdb-pdbid': 'EMDB (from PDB Id)',
                    'emdb-id': 'EMDB (from EMDB Id)'
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
                        .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: 'Fo-Fc' }, { isBinding: true, ref: diffRef });
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
                    group
                        .then(Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/coordinates/files/" + id + ".ccp4", type: 'Binary', id: id, description: '2Fo-Fc', title: 'Density' })
                        .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: '2Fo-Fc' }, { isBinding: true, ref: mainRef })
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
                        .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: labelId }, { isBinding: true, ref: mainRef })
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
                    return __awaiter(this, void 0, void 0, function () {
                        var s, json, emdbId, e, emdb;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    id = id.trim().toLowerCase();
                                    return [4 /*yield*/, Bootstrap.Utils.ajaxGetString("https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary/" + id, 'PDB API').run(ctx)];
                                case 1:
                                    s = _a.sent();
                                    try {
                                        json = JSON.parse(s);
                                        emdbId = void 0;
                                        e = json[id];
                                        if (e && e[0] && e[0].related_structures) {
                                            emdb = e[0].related_structures.filter(function (s) { return s.resource === 'EMDB'; });
                                            if (!emdb.length) {
                                                return [2 /*return*/, fail(a, "No related EMDB entry found for '" + id + "'.")];
                                            }
                                            emdbId = emdb[0].accession.split('-')[1];
                                        }
                                        else {
                                            return [2 /*return*/, fail(a, "No related EMDB entry found for '" + id + "'.")];
                                        }
                                        return [2 /*return*/, doEmdbId(ctx, a, t, emdbId)];
                                    }
                                    catch (e) {
                                        return [2 /*return*/, fail(a, 'PDBe API call failed.')];
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    });
                }
                function doEmdbId(ctx, a, t, id) {
                    return __awaiter(this, void 0, void 0, function () {
                        var s, json, contour, e;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    id = id.trim();
                                    return [4 /*yield*/, Bootstrap.Utils.ajaxGetString("https://www.ebi.ac.uk/pdbe/api/emdb/entry/map/EMD-" + id, 'EMDB API').run(ctx)];
                                case 1:
                                    s = _a.sent();
                                    try {
                                        json = JSON.parse(s);
                                        contour = void 0;
                                        e = json['EMD-' + id];
                                        if (e && e[0] && e[0].map && e[0].map.contour_level && e[0].map.contour_level.value !== void 0) {
                                            contour = +e[0].map.contour_level.value;
                                        }
                                        return [2 /*return*/, doEmdb(a, t, id, contour)];
                                    }
                                    catch (e) {
                                        return [2 /*return*/, fail(a, 'EMDB API call failed.')];
                                    }
                                    return [2 /*return*/];
                            }
                        });
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
                    var _a;
                    if (!actionCtx)
                        return;
                    var _b = actionCtx, id = _b.id, refs = _b.refs, groupRef = _b.groupRef;
                    var sel = ctx.select((_a = Tree.Selection).byRef.apply(_a, refs));
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
                });
            })(Data = PDBe.Data || (PDBe.Data = {}));
        })(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var PDBe;
        (function (PDBe) {
            var Validation;
            (function (Validation) {
                var _this = this;
                var Entity = LiteMol.Bootstrap.Entity;
                var Transformer = LiteMol.Bootstrap.Entity.Transformer;
                Validation.Report = Entity.create({ name: 'PDBe Molecule Validation Report', typeClass: 'Behaviour', shortName: 'VR', description: 'Represents PDBe validation report.' });
                var Api;
                (function (Api) {
                    function getResidueId(seqNumber, insCode) {
                        var id = seqNumber.toString();
                        if ((insCode || "").length !== 0 && insCode !== " ")
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
                            var chains = report[entity.entity_id.toString()] || {};
                            for (var _c = 0, _d = entity.chains; _c < _d.length; _c++) {
                                var chain = _d[_c];
                                var models = chains[chain.struct_asym_id] || {};
                                for (var _e = 0, _f = chain.models; _e < _f.length; _e++) {
                                    var model = _f[_e];
                                    var residues = models[model.model_id.toString()] || {};
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
                })(Api = Validation.Api || (Validation.Api = {}));
                var Interactivity;
                (function (Interactivity) {
                    var Behaviour = /** @class */ (function () {
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
                            if (!i || i.residues.length !== 1)
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
                })(Interactivity = Validation.Interactivity || (Validation.Interactivity = {}));
                var Theme;
                (function (Theme) {
                    var colorMap = (function () {
                        var colors = LiteMol.Core.Utils.FastMap.create();
                        colors.set(0, { r: 0, g: 1, b: 0 });
                        colors.set(1, { r: 1, g: 1, b: 0 });
                        colors.set(2, { r: 1, g: 0.5, b: 0 });
                        colors.set(3, { r: 1, g: 0, b: 0 });
                        colors.set(4, { r: 0.7, g: 0.7, b: 0.7 }); // not applicable
                        return colors;
                    })();
                    var defaultColor = { r: 0.6, g: 0.6, b: 0.6 };
                    var selectionColor = { r: 0, g: 0, b: 1 };
                    var highlightColor = { r: 1, g: 0, b: 1 };
                    function createResidueMapNormal(model, report) {
                        var map = new Uint8Array(model.data.residues.count);
                        var mId = model.modelId;
                        var _a = model.data.residues, asymId = _a.asymId, entityId = _a.entityId, seqNumber = _a.seqNumber, insCode = _a.insCode, isHet = _a.isHet;
                        for (var i = 0, _b = model.data.residues.count; i < _b; i++) {
                            var entry = Api.getEntry(report, mId, entityId[i], asymId[i], Api.getResidueId(seqNumber[i], insCode[i]));
                            if (entry) {
                                map[i] = Math.min(entry.numIssues, 3);
                            }
                            else if (isHet[i]) {
                                map[i] = 4;
                            }
                        }
                        return map;
                    }
                    function createResidueMapComputed(model, report) {
                        var map = new Uint8Array(model.data.residues.count);
                        var mId = model.modelId;
                        var parent = model.parent;
                        var _a = model.data.residues, entityId = _a.entityId, seqNumber = _a.seqNumber, insCode = _a.insCode, chainIndex = _a.chainIndex, isHet = _a.isHet;
                        var sourceChainIndex = model.data.chains.sourceChainIndex;
                        var asymId = parent.data.chains.asymId;
                        for (var i = 0, _b = model.data.residues.count; i < _b; i++) {
                            var aId = asymId[sourceChainIndex[chainIndex[i]]];
                            var e = Api.getEntry(report, mId, entityId[i], aId, Api.getResidueId(seqNumber[i], insCode[i]));
                            if (e) {
                                map[i] = Math.min(e.numIssues, 3);
                            }
                            else if (isHet[i]) {
                                map[i] = 4;
                            }
                        }
                        return map;
                    }
                    function create(entity, report) {
                        var model = entity.props.model;
                        var map = model.source === LiteMol.Core.Structure.Molecule.Model.Source.File
                            ? createResidueMapNormal(model, report)
                            : createResidueMapComputed(model, report);
                        var colors = LiteMol.Core.Utils.FastMap.create();
                        colors.set('Uniform', defaultColor);
                        colors.set('Selection', selectionColor);
                        colors.set('Highlight', highlightColor);
                        var residueIndex = model.data.atoms.residueIndex;
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
                    return LiteMol.Bootstrap.Task.create("Validation Report (" + t.params.id + ")", 'Normal', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var data, model, report;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ctx.updateProgress('Parsing...')];
                                case 1:
                                    _a.sent();
                                    data = JSON.parse(a.props.data);
                                    model = data[t.params.id];
                                    report = Api.createReport(model || {});
                                    return [2 /*return*/, Validation.Report.create(t, { label: 'Validation Report', behaviour: new Interactivity.Behaviour(context, report) })];
                            }
                        });
                    }); }).setReportTime(true);
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
                        .then(Create, { id: id }, { isBinding: true, ref: t.params.reportRef });
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
                    return LiteMol.Bootstrap.Task.create('Validation Coloring', 'Background', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var molecule, themes, visuals, _i, visuals_3, v, model, theme;
                        return __generator(this, function (_a) {
                            molecule = LiteMol.Bootstrap.Tree.Node.findAncestor(a, LiteMol.Bootstrap.Entity.Molecule.Molecule);
                            if (!molecule) {
                                throw 'No suitable parent found.';
                            }
                            themes = LiteMol.Core.Utils.FastMap.create();
                            visuals = context.select(LiteMol.Bootstrap.Tree.Selection.byValue(molecule).subtree().ofType(LiteMol.Bootstrap.Entity.Molecule.Visual));
                            for (_i = 0, visuals_3 = visuals; _i < visuals_3.length; _i++) {
                                v = visuals_3[_i];
                                model = LiteMol.Bootstrap.Utils.Molecule.findModel(v);
                                if (!model)
                                    continue;
                                theme = themes.get(model.id);
                                if (!theme) {
                                    theme = Theme.create(model, a.props.behaviour.report);
                                    themes.set(model.id, theme);
                                }
                                LiteMol.Bootstrap.Command.Visual.UpdateBasicTheme.dispatch(context, { visual: v, theme: theme });
                            }
                            context.logger.message('Validation coloring applied.');
                            return [2 /*return*/, LiteMol.Bootstrap.Tree.Node.Null];
                        });
                    }); });
                });
            })(Validation = PDBe.Validation || (PDBe.Validation = {}));
        })(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var PDBe;
        (function (PDBe) {
            var SequenceAnnotation;
            (function (SequenceAnnotation) {
                var _this = this;
                var Entity = LiteMol.Bootstrap.Entity;
                var Transformer = LiteMol.Bootstrap.Entity.Transformer;
                var Query = LiteMol.Core.Structure.Query;
                SequenceAnnotation.Annotations = Entity.create({ name: 'PDBe Sequence Annotations', typeClass: 'Data', shortName: 'SA', description: 'Represents PDBe sequence annotation data.' });
                SequenceAnnotation.Annotation = Entity.create({ name: 'PDBe Sequence Annotation', typeClass: 'Object', shortName: 'SA', description: 'Represents PDBe sequence annotation.' }, { isSilent: true, isFocusable: true });
                SequenceAnnotation.Behaviour = Entity.create({ name: 'PDBe Sequence Annotation Behaviour', typeClass: 'Behaviour', shortName: 'SA', description: 'Represents PDBe sequence annoation behaviour.' });
                var Interactivity;
                (function (Interactivity) {
                    var Behaviour = /** @class */ (function () {
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
                            this.context.entityCache.set(a, "theme-" + model.id, theme);
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
                            for (var _i = 0, visuals_4 = visuals; _i < visuals_4.length; _i++) {
                                var v = visuals_4[_i];
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
                })(Interactivity = SequenceAnnotation.Interactivity || (SequenceAnnotation.Interactivity = {}));
                var Theme;
                (function (Theme) {
                    var defaultColor = { r: 1, g: 1, b: 1 };
                    var selectionColor = LiteMol.Visualization.Theme.Default.SelectionColor;
                    var highlightColor = LiteMol.Visualization.Theme.Default.HighlightColor;
                    function createResidueMap(model, fs) {
                        var map = new Uint8Array(model.data.residues.count);
                        var residueIndex = model.data.atoms.residueIndex;
                        for (var _i = 0, _a = fs.fragments; _i < _a.length; _i++) {
                            var f = _a[_i];
                            for (var _b = 0, _c = f.atomIndices; _b < _c.length; _b++) {
                                var i = _c[_b];
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
                        var colors = LiteMol.Core.Utils.FastMap.create();
                        colors.set('Uniform', defaultColor);
                        colors.set('Bond', defaultColor);
                        colors.set('Selection', selectionColor);
                        colors.set('Highlight', highlightColor);
                        var colorMap = LiteMol.Core.Utils.FastMap.create();
                        colorMap.set(1, color);
                        var residueIndex = model.data.atoms.residueIndex;
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
                    var _loop_4 = function (g) {
                        var ans = data[g];
                        if (!ans)
                            return "continue";
                        var entries = Object.keys(ans).filter(function (a) { return Object.prototype.hasOwnProperty.call(ans, a); });
                        if (!entries.length)
                            return "continue";
                        var group = action.add(parent, Transformer.Basic.CreateGroup, { label: g, isCollapsed: true }, { isBinding: true });
                        for (var _i = 0, entries_2 = entries; _i < entries_2.length; _i++) {
                            var a = entries_2[_i];
                            group.then(SequenceAnnotation.CreateSingle, { data: ans[a], id: a, color: baseColor });
                        }
                    };
                    for (var _i = 0, _a = ["Pfam", "InterPro", "CATH", "SCOP", "UniProt"]; _i < _a.length; _i++) {
                        var g = _a[_i];
                        _loop_4(g);
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
                    return LiteMol.Bootstrap.Task.create("Sequence Annotation", 'Background', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var data, query;
                        return __generator(this, function (_a) {
                            data = t.params.data;
                            query = Query.or.apply(null, data.mappings.map(function (m) {
                                return Query.sequence(m.entity_id.toString(), m.struct_asym_id, { seqNumber: m.start.residue_number, insCode: getInsCode(m.start.author_insertion_code) }, { seqNumber: m.end.residue_number, insCode: getInsCode(m.end.author_insertion_code) });
                            }))
                                .union();
                            return [2 /*return*/, SequenceAnnotation.Annotation.create(t, { label: data.identifier, description: t.params.id, query: query, color: t.params.color })];
                        });
                    }); });
                });
                var Parse = LiteMol.Bootstrap.Tree.Transformer.create({
                    id: 'pdbe-sequence-annotations-parse',
                    name: 'PDBe Sequence Annotations',
                    description: 'Parse sequence annotation JSON.',
                    from: [Entity.Data.String],
                    to: [SequenceAnnotation.Annotations],
                    defaultParams: function () { return ({}); }
                }, function (context, a, t) {
                    return LiteMol.Bootstrap.Task.create("Sequence Annotations", 'Normal', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var data;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, ctx.updateProgress('Parsing...')];
                                case 1:
                                    _a.sent();
                                    data = JSON.parse(a.props.data);
                                    return [2 /*return*/, SequenceAnnotation.Annotations.create(t, { label: 'Sequence Annotations', data: data })];
                            }
                        });
                    }); }).setReportTime(true);
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
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
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
                var CreateSequenceAnnotationView = /** @class */ (function (_super) {
                    __extends(CreateSequenceAnnotationView, _super);
                    function CreateSequenceAnnotationView() {
                        return _super !== null && _super.apply(this, arguments) || this;
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
                var DownloadBinaryCIFFromCoordinateServerView = /** @class */ (function (_super) {
                    __extends(DownloadBinaryCIFFromCoordinateServerView, _super);
                    function DownloadBinaryCIFFromCoordinateServerView() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    DownloadBinaryCIFFromCoordinateServerView.prototype.renderControls = function () {
                        var _this = this;
                        var showDetails = this.getPersistentState('showDetails', false);
                        var params = this.params;
                        var idField = React.createElement(Controls.TextBoxGroup, { value: params.id, onChange: function (v) { return _this.updateParams({ id: v }); }, label: 'Id', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter pdb id...' });
                        var options = [
                            React.createElement(Controls.OptionsGroup, { options: ['Cartoon', 'Full'], caption: function (s) { return s; }, current: params.type, onChange: function (o) { return _this.updateParams({ type: o }); }, label: 'Type', title: 'Determines whether to send all atoms or just atoms that are needed for the Cartoon representation.' }),
                            React.createElement(Controls.Toggle, { onChange: function (v) { return _this.updateParams({ lowPrecisionCoords: v }); }, value: params.lowPrecisionCoords, label: 'Low Precicion', title: 'If on, sends coordinates with 1 digit precision instead of 3. This saves up to 50% of data that need to be sent.' }),
                            React.createElement(Controls.TextBoxGroup, { value: params.serverUrl, onChange: function (v) { return _this.updateParams({ serverUrl: v }); }, label: 'Server', title: 'The base URL of the CoordinateServer.', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter server URL...' })
                        ];
                        return React.createElement(Controls.ExpandableGroup, { select: idField, expander: React.createElement(Controls.ControlGroupExpander, { isExpanded: showDetails, onChange: function (e) { return _this.setPersistentState('showDetails', e); } }), options: options, isExpanded: showDetails });
                    };
                    return DownloadBinaryCIFFromCoordinateServerView;
                }(LiteMol.Plugin.Views.Transform.ControllerBase));
                Views.DownloadBinaryCIFFromCoordinateServerView = DownloadBinaryCIFFromCoordinateServerView;
                var DownloadDensityView = /** @class */ (function (_super) {
                    __extends(DownloadDensityView, _super);
                    function DownloadDensityView() {
                        return _super !== null && _super.apply(this, arguments) || this;
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
                        var _a, _b;
                        var params = this.params;
                        var id = params.id;
                        if (!id || typeof id === 'string')
                            id = (_a = {}, _a[params.sourceId] = newId, _a);
                        else
                            id = LiteMol.Bootstrap.Utils.merge(id, (_b = {}, _b[params.sourceId] = newId, _b));
                        this.updateParams({ id: id });
                    };
                    DownloadDensityView.prototype.renderControls = function () {
                        var _this = this;
                        var params = this.params;
                        var label = params.sourceId === 'emdb-id' ? 'EMDB Id' : 'PDB Id';
                        return React.createElement("div", null,
                            React.createElement(Controls.OptionsGroup, { options: PDBe.Data.DensitySources, caption: function (s) { return PDBe.Data.DensitySourceLabels[s]; }, current: params.sourceId, onChange: function (o) { return _this.updateParams({ sourceId: o }); }, label: 'Source', title: 'Determines where to obtain the data.' }),
                            React.createElement(Controls.TextBoxGroup, { value: this.getId(), onChange: function (v) { return _this.updateId(v); }, label: label, onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter id...' }));
                    };
                    return DownloadDensityView;
                }(LiteMol.Plugin.Views.Transform.ControllerBase));
                Views.DownloadDensityView = DownloadDensityView;
            })(Views = PDBe.Views || (PDBe.Views = {}));
        })(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var Views;
        (function (Views) {
            'use strict';
            var React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
            var Controls = LiteMol.Plugin.Controls;
            var LoadExample = /** @class */ (function (_super) {
                __extends(LoadExample, _super);
                function LoadExample() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                LoadExample.prototype.renderControls = function () {
                    var _this = this;
                    var exampleId = this.params.exampleId;
                    return React.createElement(Controls.OptionsGroup, { options: Viewer.Examples.ExampleIds, caption: function (s) { return Viewer.Examples.ExampleMap[s].name; }, current: exampleId, onChange: function (exampleId) { return _this.updateParams({ exampleId: exampleId }); }, label: 'Name' });
                };
                return LoadExample;
            }(LiteMol.Plugin.Views.Transform.ControllerBase));
            Views.LoadExample = LoadExample;
            var ObtainDownload = /** @class */ (function (_super) {
                __extends(ObtainDownload, _super);
                function ObtainDownload() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                ObtainDownload.prototype.updateSourceParams = function (newSrc) {
                    var _a;
                    var params = this.params;
                    var src = params.sources[params.sourceKind];
                    var newParams = {
                        sources: __assign({}, params.sources, (_a = {}, _a[params.sourceKind] = __assign({}, src, newSrc), _a))
                    };
                    this.updateParams(newParams);
                };
                ObtainDownload.prototype.coordServer = function (src) {
                    var _this = this;
                    if (src.kind !== 'CoordinateServer')
                        return [];
                    var showDetails = this.getPersistentState('showDetails', false);
                    var params = src;
                    var idField = React.createElement(Controls.TextBoxGroup, { value: params.id, onChange: function (v) { return _this.updateSourceParams({ id: v }); }, label: 'Id', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter pdb id...' });
                    var options = [
                        React.createElement(Controls.OptionsGroup, { options: ['Cartoon', 'Full'], caption: function (s) { return s; }, current: params.type, onChange: function (o) { return _this.updateSourceParams({ type: o }); }, label: 'Type', title: 'Determines whether to send all atoms or just atoms that are needed for the Cartoon representation.' }),
                        React.createElement(Controls.Toggle, { onChange: function (v) { return _this.updateSourceParams({ lowPrecisionCoords: v }); }, value: params.lowPrecisionCoords, label: 'Low Precicion', title: 'If on, sends coordinates with 1 digit precision instead of 3. This saves up to 50% of data that need to be sent.' }),
                        React.createElement(Controls.TextBoxGroup, { value: params.serverUrl, onChange: function (v) { return _this.updateSourceParams({ serverUrl: v }); }, label: 'Server', title: 'The base URL of the CoordinateServer.', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter server URL...' })
                    ];
                    return React.createElement(Controls.ExpandableGroup, { select: idField, expander: React.createElement(Controls.ControlGroupExpander, { isExpanded: showDetails, onChange: function (e) { return _this.setPersistentState('showDetails', e); } }), options: options, isExpanded: showDetails });
                };
                ObtainDownload.prototype.PDBe = function (src) {
                    var _this = this;
                    if (src.kind !== 'PDBe Updated mmCIF')
                        return [];
                    return React.createElement(Controls.TextBoxGroup, { value: src.id, onChange: function (v) { return _this.updateSourceParams({ id: v }); }, label: 'Id', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter pdb id...' });
                };
                ObtainDownload.prototype.url = function (src) {
                    var _this = this;
                    if (src.kind !== 'URL')
                        return [];
                    return [
                        React.createElement(Controls.OptionsGroup, { options: LiteMol.Core.Formats.Molecule.SupportedFormats.All, caption: function (s) { return s.name; }, current: src.format, onChange: function (o) { return _this.updateSourceParams({ format: o }); }, label: 'Format' }),
                        React.createElement(Controls.TextBoxGroup, { value: src.url, onChange: function (v) { return _this.updateSourceParams({ url: v }); }, label: 'URL', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'Enter pdb id...' })
                    ];
                };
                ObtainDownload.prototype.file = function (src) {
                    var _this = this;
                    if (src.kind !== 'File on Disk')
                        return [];
                    var state = this.controller.latestState;
                    var extensions = LiteMol.Core.Formats.FormatInfo.formatFileFilters(LiteMol.Core.Formats.Molecule.SupportedFormats.All);
                    return React.createElement("div", null,
                        React.createElement("div", { className: 'lm-btn lm-btn-block lm-btn-action lm-loader-lm-btn-file', style: { marginTop: '1px' } },
                            src.file ? src.file.name : 'Select a file...',
                            " ",
                            React.createElement("input", { disabled: state.isBusy, type: 'file', accept: extensions, onChange: function (evt) { return _this.updateSourceParams({ file: evt.target.files[0] }); }, multiple: false })));
                };
                ObtainDownload.prototype.renderControls = function () {
                    var _this = this;
                    var params = this.params;
                    var src = params.sources[params.sourceKind];
                    var options = params.sourceKind === 'CoordinateServer'
                        ? this.coordServer(src)
                        : params.sourceKind === 'PDBe Updated mmCIF'
                            ? this.PDBe(src)
                            : params.sourceKind === 'URL'
                                ? this.url(src)
                                : this.file(src);
                    return React.createElement("div", null,
                        React.createElement(Controls.OptionsGroup, { options: Viewer.DataSources.ObtainDownloadSources, caption: function (s) { return s; }, current: params.sourceKind, onChange: function (o) { return _this.updateParams({ sourceKind: o }); }, label: 'Source', title: 'Determines where to obtain the data.' }),
                        options);
                };
                return ObtainDownload;
            }(LiteMol.Plugin.Views.Transform.ControllerBase));
            Views.ObtainDownload = ObtainDownload;
        })(Views = Viewer.Views || (Viewer.Views = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        var Examples;
        (function (Examples) {
            var Transformer = LiteMol.Bootstrap.Entity.Transformer;
            var Vis = LiteMol.Bootstrap.Visualization;
            Examples.ExampleMap = {
                'zika-cryo-em': {
                    name: 'Zika Virus + Cryo-EM Map',
                    provider: Zika
                },
                '5va1-cryo-em': {
                    name: 'Open Human Ether-a-go-go-Related K(+) Channel hERG + Cryo-EM Map',
                    provider: _5va1_cryo_em
                },
                '3a4x-lig': {
                    name: 'PDB ID 3A4X Ligand Validation',
                    provider: LigandInteraction_3a4x
                },
                'hiv1-protease': {
                    name: 'HIV-1 Protease + PDBe Validation + X-ray Density',
                    provider: HIV1Protease
                },
                'hiv1-capsid': {
                    name: 'HIV-1 Capsid Cartoon Model',
                    provider: HIV1Capsid
                }
            };
            Examples.ExampleIds = Object.getOwnPropertyNames(Examples.ExampleMap);
            Examples.LoadExample = LiteMol.Bootstrap.Tree.Transformer.action({
                id: 'viewer-load-example',
                name: 'Examples',
                description: 'Clears the scene and loads the selected example',
                from: [LiteMol.Bootstrap.Entity.Root],
                to: [LiteMol.Bootstrap.Entity.Action],
                defaultParams: function () { return ({ exampleId: Examples.ExampleIds[0] }); }
            }, function (context, a, t) {
                LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(context, context.tree.root);
                var example = Examples.ExampleMap[t.params.exampleId];
                if (example)
                    example.provider(new LiteMol.Plugin.Controller(context.plugin));
                // an ugly hack to temporarily hide add button from the UIs
                var delay = t.params.exampleId === 'hiv1-capsid' ? 10000 : 2500;
                return LiteMol.Bootstrap.Tree.Transform.build().add(a, Transformer.Basic.Delay, { timeoutMs: delay });
            });
            function hideControlsIfNarrow(plugin) {
                if (document.body.clientWidth < 825)
                    plugin.setLayoutState({ hideControls: true });
            }
            function unsubscribeOnDelete(plugin, subProvider, ref, extraCall) {
                var sub = subProvider();
                var del = plugin.subscribe(LiteMol.Bootstrap.Event.Tree.NodeRemoved, function (e) {
                    if (!del || !sub || e.data.ref !== ref)
                        return;
                    sub.dispose();
                    sub = void 0;
                    if (del) {
                        del.dispose();
                        del = void 0;
                    }
                    if (extraCall)
                        extraCall();
                });
            }
            function suppressCreateModel(supp) {
                LiteMol.Extensions.ComplexReprensetation.Transforms.SuppressCreateVisualWhenModelIsAdded = supp;
                LiteMol.Bootstrap.Behaviour.SuppressCreateVisualWhenModelIsAdded = supp;
            }
            function Zika(plugin) {
                suppressCreateModel(true);
                hideControlsIfNarrow(plugin);
                var molecule = plugin.createTransform()
                    .add(plugin.root, Transformer.Data.Download, { url: "https://cs.litemol.org/5ire/full?encoding=bcif&lowPrecisionCoords=1", type: 'Binary', id: '5ire' })
                    .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true });
                plugin.applyTransform(molecule).then(function () {
                    var model = plugin.createTransform()
                        .add('molecule', Transformer.Molecule.CreateModel, { modelIndex: 0 })
                        .then(Transformer.Molecule.CreateAssembly, { name: '1' })
                        .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: false, hetRef: 'het', polymerRef: 'polymer' }, {});
                    plugin.applyTransform(model).then(function () {
                        suppressCreateModel(false);
                        var theme = {
                            template: Vis.Molecule.Default.UniformThemeTemplate,
                            colors: Vis.Molecule.Default.UniformThemeTemplate.colors.set('Uniform', LiteMol.Visualization.Color.fromHex(0x00BFEF))
                        };
                        plugin.context.transforms.getController(Transformer.Molecule.CreateVisual, plugin.selectEntities('polymer')[0])
                            .updateStyleTheme(theme);
                        plugin.context.transforms.getController(Transformer.Molecule.CreateVisual, plugin.selectEntities('het')[0])
                            .updateStyleTheme(theme);
                        var streamingEntity = plugin.selectEntities('5ire_density_streaming')[0];
                        if (streamingEntity) {
                            plugin.command(LiteMol.Bootstrap.Command.Entity.SetCurrent, streamingEntity);
                        }
                    }).catch(function () { return suppressCreateModel(false); });
                    var params = {
                        server: 'https://ds.litemol.org/',
                        id: '5ire',
                        source: 'EM',
                        initialStreamingParams: {
                            'EM': Vis.Density.Style.create({
                                isoValue: 3,
                                isoValueType: Vis.Density.IsoValueType.Absolute,
                                color: LiteMol.Visualization.Color.fromHex(0x999999),
                                isWireframe: false,
                                transparency: { alpha: 0.2 },
                                taskType: 'Background'
                            }),
                            isoValues: { 'EM': 3 },
                            detailLevel: 4
                        },
                        streamingEntityRef: '5ire_density_streaming'
                    };
                    var streaming = plugin.createTransform()
                        .add('molecule', LiteMol.Extensions.DensityStreaming.Setup, params);
                    plugin.applyTransform(streaming);
                });
            }
            function _5va1_cryo_em(plugin) {
                suppressCreateModel(true);
                hideControlsIfNarrow(plugin);
                var molecule = plugin.createTransform()
                    .add(plugin.root, Transformer.Data.Download, { url: "https://cs.litemol.org/5va1/full?encoding=bcif&lowPrecisionCoords=1", type: 'Binary', id: '5va1' })
                    .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true });
                plugin.applyTransform(molecule).then(function () {
                    var model = plugin.createTransform()
                        .add('molecule', Transformer.Molecule.CreateModel, { modelIndex: 0 })
                        .then(Transformer.Molecule.CreateAssembly, { name: '1' })
                        .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: false, hetRef: 'het', polymerRef: 'polymer' }, {});
                    plugin.applyTransform(model).then(function () {
                        suppressCreateModel(false);
                        var theme = {
                            template: Vis.Molecule.Default.RainbowEntityThemeTemplate
                        };
                        plugin.context.transforms.getController(Transformer.Molecule.CreateVisual, plugin.selectEntities('polymer')[0])
                            .updateStyleTheme(theme);
                        var streamingEntity = plugin.selectEntities('5va1_density_streaming')[0];
                        if (streamingEntity) {
                            plugin.command(LiteMol.Bootstrap.Command.Entity.SetCurrent, streamingEntity);
                        }
                    }).catch(function () { return suppressCreateModel(false); });
                    var params = {
                        server: 'https://ds.litemol.org/',
                        id: '5va1',
                        source: 'EM',
                        initialStreamingParams: {
                            detailLevel: 4
                        },
                        streamingEntityRef: '5va1_density_streaming'
                    };
                    var streaming = plugin.createTransform()
                        .add('molecule', LiteMol.Extensions.DensityStreaming.Setup, params);
                    plugin.applyTransform(streaming);
                });
            }
            function HIV1Capsid(plugin) {
                suppressCreateModel(true);
                hideControlsIfNarrow(plugin);
                var molecule = plugin.createTransform()
                    .add(plugin.root, Transformer.Data.Download, { url: "https://cs.litemol.org/3j3q/cartoon?encoding=bcif&lowPrecisionCoords=1", type: 'Binary', id: '3j3q' })
                    .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true })
                    .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
                    .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: false, polymerRef: 'polymer' }, {});
                plugin.applyTransform(molecule).then(function () {
                    suppressCreateModel(false);
                    var theme = {
                        template: Vis.Molecule.Default.RainbowEntityThemeTemplate
                    };
                    plugin.context.transforms.getController(Transformer.Molecule.CreateVisual, plugin.selectEntities('polymer')[0])
                        .updateStyleTheme(theme);
                }).catch(function () { return suppressCreateModel(false); });
                return molecule;
            }
            function HIV1Protease(plugin) {
                return __awaiter(this, void 0, void 0, function () {
                    function applyColoring() {
                        var coloring = plugin.createTransform().add('hiv1-validation', Viewer.PDBe.Validation.ApplyTheme, {});
                        return plugin.applyTransform(coloring);
                    }
                    var rootRef, molecule, annotation, annotationTransform, streamingParams, streaming;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                suppressCreateModel(true);
                                hideControlsIfNarrow(plugin);
                                rootRef = 'hiv1-protease-data';
                                molecule = plugin.createTransform()
                                    .add(plugin.root, Transformer.Data.Download, { url: "https://cs.litemol.org/2f80/full?encoding=bcif&lowPrecisionCoords=1", type: 'Binary', id: '2f80' }, { ref: rootRef })
                                    .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true })
                                    .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
                                    .then(Transformer.Molecule.CreateMacromoleculeVisual, { het: true, polymer: true, water: false, hetRef: 'het-visual', polymerRef: 'polymer-visual' }, {});
                                return [4 /*yield*/, plugin.applyTransform(molecule)];
                            case 1:
                                _a.sent();
                                suppressCreateModel(false);
                                plugin.command(LiteMol.Bootstrap.Command.Molecule.CreateSelectInteraction, {
                                    entity: plugin.selectEntities('het-visual')[0],
                                    query: LiteMol.Core.Structure.Query.atomsById(1625)
                                });
                                plugin.command(LiteMol.Bootstrap.Command.Entity.Focus, plugin.selectEntities('polymer-visual'));
                                annotation = plugin.createTransform()
                                    .add('molecule', Viewer.PDBe.Validation.DownloadAndCreate, { reportRef: 'hiv1-validation' });
                                annotationTransform = plugin.applyTransform(annotation);
                                streamingParams = {
                                    server: 'https://ds.litemol.org/',
                                    id: '2f80',
                                    source: 'X-ray',
                                    initialStreamingParams: {
                                        radius: 1.5,
                                        '2Fo-Fc': LiteMol.Bootstrap.Visualization.Density.Style.create({
                                            isoValue: 1.5,
                                            isoValueType: LiteMol.Bootstrap.Visualization.Density.IsoValueType.Sigma,
                                            color: LiteMol.Visualization.Color.fromHex(0x3362B2),
                                            isWireframe: true,
                                            transparency: { alpha: 0.4 },
                                            taskType: 'Background'
                                        })
                                    }
                                };
                                streaming = plugin.createTransform()
                                    .add('molecule', LiteMol.Extensions.DensityStreaming.Setup, streamingParams);
                                plugin.applyTransform(streaming);
                                return [4 /*yield*/, annotationTransform];
                            case 2:
                                _a.sent();
                                setTimeout(function () { return applyColoring(); }, 50);
                                unsubscribeOnDelete(plugin, function () { return plugin.subscribe(LiteMol.Bootstrap.Command.Visual.ResetScene, function () { return setTimeout(function () { return applyColoring(); }, 25); }); }, rootRef);
                                return [2 /*return*/];
                        }
                    });
                });
            }
            function LigandInteraction_3a4x(plugin) {
                return __awaiter(this, void 0, void 0, function () {
                    function applyColoring() {
                        var coloring = plugin.createTransform().add('validation', Viewer.ValidatorDB.ApplyTheme, {});
                        plugin.applyTransform(coloring);
                    }
                    var styleAmb, styleLig, rootRef, query, model, annotation, annotationTransform, streamingParams, streaming;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                suppressCreateModel(true);
                                LiteMol.Bootstrap.Behaviour.Molecule.SuppressShowInteractionOnSelect = true;
                                hideControlsIfNarrow(plugin);
                                styleAmb = {
                                    type: 'BallsAndSticks',
                                    taskType: 'Background',
                                    params: { useVDW: false, atomRadius: 0.14, bondRadius: 0.08, detail: 'Automatic' },
                                    theme: { template: Vis.Molecule.Default.UniformThemeTemplate, colors: Vis.Molecule.Default.UniformThemeTemplate.colors.set('Uniform', { r: 0.4, g: 0.4, b: 0.4 }), transparency: { alpha: 1.0 } }
                                };
                                styleLig = {
                                    type: 'BallsAndSticks',
                                    taskType: 'Background',
                                    params: { useVDW: false, atomRadius: 0.30, bondRadius: 0.12, detail: 'Automatic' },
                                    theme: { template: Vis.Molecule.Default.UniformThemeTemplate, colors: Vis.Molecule.Default.UniformThemeTemplate.colors.set('Uniform', { r: 0.4, g: 0.4, b: 0.4 }), transparency: { alpha: 1.0 } }
                                };
                                rootRef = '3a4x-ligint-data';
                                query = LiteMol.Core.Structure.Query.residues({ entityId: '2', authAsymId: 'B', authSeqNumber: 2 });
                                model = plugin.createTransform()
                                    .add(plugin.root, Transformer.Data.Download, { url: "https://cs.litemol.org/3a4x/ligandInteraction?modelId=1&entityId=2&authAsymId=B&authSeqNumber=2&insCode=&radius=5&atomSitesOnly=1&encoding=bcif&lowPrecisionCoords=1", type: 'Binary', id: '3a4x' }, { ref: rootRef })
                                    .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { ref: 'molecule', isBinding: true })
                                    .then(Transformer.Molecule.CreateModel, { modelIndex: 0 });
                                model
                                    .then(Transformer.Molecule.CreateVisual, { style: styleAmb });
                                model
                                    .then(Transformer.Molecule.CreateSelectionFromQuery, { query: query, name: 'Ligand', silent: true, inFullContext: true }, { isBinding: true })
                                    .then(Transformer.Molecule.CreateVisual, { style: styleLig });
                                return [4 /*yield*/, plugin.applyTransform(model)];
                            case 1:
                                _a.sent();
                                suppressCreateModel(false);
                                annotation = plugin.createTransform()
                                    .add('molecule', Viewer.ValidatorDB.DownloadAndCreate, { reportRef: 'validation' });
                                annotationTransform = plugin.applyTransform(annotation);
                                streamingParams = {
                                    server: 'https://ds.litemol.org/',
                                    id: '3a4x',
                                    source: 'X-ray',
                                    initialStreamingParams: {
                                        displayType: 'Everything',
                                        showEverythingExtent: 0
                                    }
                                };
                                streaming = plugin.createTransform()
                                    .add('molecule', LiteMol.Extensions.DensityStreaming.Setup, streamingParams);
                                plugin.applyTransform(streaming);
                                return [4 /*yield*/, annotationTransform];
                            case 2:
                                _a.sent();
                                applyColoring();
                                unsubscribeOnDelete(plugin, function () { return plugin.subscribe(LiteMol.Bootstrap.Command.Visual.ResetScene, function () { return setTimeout(function () { return applyColoring(); }, 25); }); }, rootRef, function () { return LiteMol.Bootstrap.Behaviour.Molecule.SuppressShowInteractionOnSelect = false; });
                                return [2 /*return*/];
                        }
                    });
                });
            }
        })(Examples = Viewer.Examples || (Viewer.Examples = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
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
                'molecule.coordinateStreaming.defaultServer': 'https://cs.litemol.org',
                'molecule.downloadBinaryCIFFromCoordinateServer.server': 'https://cs.litemol.org',
                'molecule.coordinateStreaming.defaultRadius': 10,
                'density.defaultVisualBehaviourRadius': 5,
                'extensions.densityStreaming.defaultServer': 'https://ds.litemol.org/',
                'extensions.rnaLoops.defaultServer': 'http://rna.bgsu.edu/rna3dhub/loops/download/#id'
            },
            transforms: [
                // Root transforms -- things that load data.
                { transformer: Viewer.DataSources.ObtainMolecule, view: Viewer.Views.ObtainDownload },
                //{ transformer: PDBe.Data.DownloadBinaryCIFFromCoordinateServer, view: Viewer.PDBe.Views.DownloadBinaryCIFFromCoordinateServerView },
                { transformer: Viewer.PDBe.Data.DownloadDensity, view: Viewer.PDBe.Views.DownloadDensityView },
                { transformer: Viewer.Examples.LoadExample, view: Viewer.Views.LoadExample },
                //{ transformer: PDBe.Data.DownloadMolecule, view: Views.Transform.Data.WithIdField, initiallyCollapsed: true },
                { transformer: Transformer.Molecule.CoordinateStreaming.InitStreaming, view: Views.Transform.Molecule.InitCoordinateStreaming, initiallyCollapsed: true },
                //{ transformer: DataSources.DownloadMolecule, view: Views.Transform.Molecule.DownloadFromUrl, initiallyCollapsed: true },
                //{ transformer: Transformer.Molecule.OpenMoleculeFromFile, view: Views.Transform.Molecule.OpenFile, initiallyCollapsed: true },                
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
                { transformer: Transformer.Molecule.CreateLabels, view: Views.Transform.Molecule.CreateLabels },
                { transformer: LiteMol.Extensions.ParticleColoring.Apply, view: LiteMol.Extensions.ParticleColoring.UI.Apply, initiallyCollapsed: true },
                // complex representation
                { transformer: LiteMol.Extensions.ComplexReprensetation.Carbohydrates.Transforms.CreateVisual, view: LiteMol.Extensions.ComplexReprensetation.Carbohydrates.UI.CreateVisual },
                { transformer: LiteMol.Extensions.ComplexReprensetation.Transforms.CreateComplexInfo, view: Views.Transform.Empty },
                { transformer: LiteMol.Extensions.ComplexReprensetation.Transforms.CreateVisual, view: Views.Transform.Empty },
                // density transforms
                { transformer: Transformer.Density.CreateFromCif, view: Views.Transform.Molecule.CreateFromMmCif },
                { transformer: Transformer.Density.CreateVisual, view: Views.Transform.Density.CreateVisual },
                { transformer: Transformer.Density.CreateVisualBehaviour, view: Views.Transform.Density.CreateVisualBehaviour },
                { transformer: LiteMol.Extensions.DensityStreaming.Setup, view: LiteMol.Extensions.DensityStreaming.CreateView },
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
                { transformer: LiteMol.Extensions.RNALoops.DownloadAndCreate, view: LiteMol.Extensions.RNALoops.CreateLoopAnnotationView, initiallyCollapsed: true },
                { transformer: LiteMol.Extensions.RNALoops.ApplyTheme, view: Views.Transform.Empty, initiallyCollapsed: false },
            ],
            behaviours: [
                // you will find the source of all behaviours in the Bootstrap/Behaviour directory
                Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
                Bootstrap.Behaviour.FocusCameraOnSelect,
                Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
                // this colors the visual when a selection is created on it.
                Bootstrap.Behaviour.ApplySelectionToVisual,
                // creates a visual when model is added.
                LiteMol.Extensions.ComplexReprensetation.Transforms.CreateRepresentationWhenModelIsAddedBehaviour,
                //Bootstrap.Behaviour.CreateVisualWhenModelIsAdded,
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
                Bootstrap.Behaviour.GoogleAnalytics('UA-77062725-1'),
                // extensions
                LiteMol.Extensions.ComplexReprensetation.Carbohydrates.HighlightCustomElementsBehaviour
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
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        function getParam(name, regex) {
            var r = new RegExp(name + "=(" + regex + ")[&]?", 'i');
            return decodeURIComponent(((window.location.search || '').match(r) || [])[1] || '');
        }
        function createInstance(target, layoutState, ignoreUrlParams) {
            if (ignoreUrlParams === void 0) { ignoreUrlParams = false; }
            var plugin = LiteMol.Plugin.create({
                customSpecification: Viewer.PluginSpec,
                target: target,
                layoutState: layoutState
            });
            plugin.context.logger.message("LiteMol Viewer " + Viewer.VERSION.number);
            if (ignoreUrlParams)
                return plugin;
            var theme = getParam('theme', '[a-z]+').toLowerCase() || 'light';
            if (theme === 'light') {
                plugin.setViewportBackground('#FCFBF9');
            }
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
            var downloadCS = getParam('loadFromCS', '[^&]+').trim();
            if (downloadCS && downloadCS.length >= 4 && downloadCS.length <= 10) {
                var t = plugin.createTransform().add(plugin.context.tree.root, Viewer.PDBe.Data.DownloadBinaryCIFFromCoordinateServer, {
                    id: downloadCS,
                    type: 'Full',
                    lowPrecisionCoords: true,
                    serverUrl: 'https://cs.litemol.org'
                });
                plugin.applyTransform(t);
            }
            var example = Viewer.Examples.ExampleMap[getParam('example', '[a-z0-9\-]+').toLowerCase().trim()];
            if (example)
                example.provider(plugin);
            return plugin;
        }
        Viewer.createInstance = createInstance;
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
