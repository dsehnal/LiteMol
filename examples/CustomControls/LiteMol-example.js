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
                    return LiteMol.Bootstrap.Task.create('Validation Coloring', 'Background', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                        var molecule, themes, visuals, _i, visuals_1, v, model, theme;
                        return __generator(this, function (_a) {
                            molecule = LiteMol.Bootstrap.Tree.Node.findAncestor(a, LiteMol.Bootstrap.Entity.Molecule.Molecule);
                            if (!molecule) {
                                throw 'No suitable parent found.';
                            }
                            themes = new Map();
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
            })(Validation = PDBe.Validation || (PDBe.Validation = {}));
        })(PDBe = Viewer.PDBe || (Viewer.PDBe = {}));
    })(Viewer = LiteMol.Viewer || (LiteMol.Viewer = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Custom;
    (function (Custom) {
        var React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
        var Controls = LiteMol.Plugin.Controls;
        var RepresentationView = (function (_super) {
            __extends(RepresentationView, _super);
            function RepresentationView() {
                return _super.apply(this, arguments) || this;
            }
            RepresentationView.prototype.asm = function () {
                var _this = this;
                var n = this.params.params ? this.params.params.name : this.params.assemblyNames[0];
                if (!n)
                    n = this.params.assemblyNames[0];
                return [React.createElement(Controls.OptionsGroup, { options: this.params.assemblyNames, current: n, onChange: function (o) { return _this.updateParams({ params: { name: o } }); }, label: 'Asm. Name' })];
            };
            RepresentationView.prototype.symm = function () {
                var _this = this;
                var options = ['Mates', 'Interaction'];
                var params = this.params.params;
                return [React.createElement(Controls.OptionsGroup, { options: options, current: params.type, onChange: function (o) { return _this.updateParams({ params: { type: o, radius: params.radius } }); }, label: 'Type', title: 'Mates: copies whole asymetric unit. Interaction: Includes only residues that are no more than `radius` from the asymetric unit.' }),
                    React.createElement(Controls.Slider, { label: 'Radius', onChange: function (v) { return _this.updateParams({ params: { type: params.type, radius: v } }); }, min: 0, max: 25, step: 0.1, value: params.radius, title: 'Interaction radius.' })];
            };
            RepresentationView.prototype.updateSource = function (source) {
                switch (source) {
                    case 'Assembly':
                        this.updateParams({ source: source, params: { name: this.params.assemblyNames[0] } });
                        break;
                    case 'Symmetry':
                        this.updateParams({ source: source, params: { type: 'Mates', radius: 5.0 } });
                        break;
                    default:
                        this.updateParams({ source: 'Asymmetric Unit' });
                        break;
                }
            };
            RepresentationView.prototype.renderControls = function () {
                var _this = this;
                var params = this.params;
                var molecule = this.controller.entity.props.molecule;
                var model = molecule.models[0];
                var options = ['Asymmetric Unit'];
                if (params.assemblyNames && params.assemblyNames.length > 0)
                    options.push('Assembly');
                if (model.symmetryInfo)
                    options.push('Symmetry');
                var modelIndex = molecule.models.length > 1
                    ? React.createElement(Controls.Slider, { label: 'Model', onChange: function (v) { return _this.updateParams({ modelIndex: v - 1 }); }, min: 1, max: molecule.models.length, step: 1, value: params.modelIndex + 1, title: 'Interaction radius.' })
                    : void 0;
                return React.createElement("div", null,
                    React.createElement(Controls.OptionsGroup, { options: options, caption: function (s) { return s; }, current: params.source, onChange: function (o) { return _this.updateSource(o); }, label: 'Source' }),
                    params.source === 'Assembly'
                        ? this.asm()
                        : params.source === 'Symmetry'
                            ? this.symm()
                            : void 0,
                    modelIndex);
            };
            return RepresentationView;
        }(LiteMol.Plugin.Views.Transform.ControllerBase));
        Custom.RepresentationView = RepresentationView;
    })(Custom = LiteMol.Custom || (LiteMol.Custom = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Custom;
    (function (Custom) {
        var Entity = LiteMol.Bootstrap.Entity;
        var Transformer = LiteMol.Bootstrap.Entity.Transformer;
        Custom.CreateRepresentation = LiteMol.Bootstrap.Tree.Transformer.action({
            id: 'lm-custom-create-representation',
            name: 'Representation',
            description: 'Create visual representation from the selected source.',
            from: [Entity.Molecule.Molecule],
            to: [Entity.Action],
            defaultParams: function (ctx, e) {
                var m = LiteMol.Bootstrap.Utils.Molecule.findMolecule(e).props.molecule.models[0];
                var asm = m.assemblyInfo;
                if (!asm || !asm.assemblies.length)
                    return { source: 'Asymmetric Unit', assemblyNames: [] };
                return { source: 'Asymmetric Unit', assemblyNames: asm.assemblies.map(function (a) { return a.name; }), modelIndex: 0 };
            }
        }, function (context, a, t) {
            // remove any old representation
            var children = LiteMol.Bootstrap.Tree.Selection.byRef('molecule').children();
            LiteMol.Bootstrap.Command.Tree.RemoveNode.dispatch(context, children);
            var action = LiteMol.Bootstrap.Tree.Transform.build().add(a, Transformer.Molecule.CreateModel, { modelIndex: t.params.modelIndex || 0 }, { ref: 'model' });
            var visualParams = {
                polymer: true,
                polymerRef: 'polymer-visual',
                het: true,
                hetRef: 'het-visual',
                water: true,
                waterRef: 'water-visual'
            };
            switch (t.params.source || 'Asymmetric Unit') {
                case 'Assembly':
                    action
                        .then(Transformer.Molecule.CreateAssembly, t.params.params)
                        .then(Transformer.Molecule.CreateMacromoleculeVisual, visualParams);
                    break;
                case 'Symmetry':
                    action
                        .then(Transformer.Molecule.CreateSymmetryMates, t.params.params)
                        .then(Transformer.Molecule.CreateMacromoleculeVisual, visualParams);
                    break;
                default:
                    action.then(Transformer.Molecule.CreateMacromoleculeVisual, visualParams);
                    break;
            }
            return action;
        });
    })(Custom = LiteMol.Custom || (LiteMol.Custom = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Custom;
    (function (Custom) {
        var Plugin = LiteMol.Plugin;
        var Views = Plugin.Views;
        var Bootstrap = LiteMol.Bootstrap;
        var Transformer = Bootstrap.Entity.Transformer;
        var LayoutRegion = Bootstrap.Components.LayoutRegion;
        function create(target) {
            var customSpecification = {
                settings: {
                    // currently these are all the 'global' settings available 
                    'molecule.model.defaultQuery': "residues({ name: 'ALA' })",
                    'molecule.model.defaultAssemblyName': '1',
                    'molecule.coordinateStreaming.defaultId': '1jj2',
                    'molecule.coordinateStreaming.defaultServer': 'https://webchemdev.ncbr.muni.cz/CoordinateServer/',
                    'molecule.coordinateStreaming.defaultRadius': 10,
                    'density.defaultVisualBehaviourRadius': 5
                },
                transforms: [
                    // These are the controls that are available in the UI. Removing any of them wont break anything, but the user 
                    // be able to create a particular thing if he deletes something.
                    // Root transforms -- things that load data.
                    // { transformer: LiteMol.Viewer.PDBe.Data.DownloadMolecule, view: Views.Transform.Data.WithIdField },
                    // { transformer: LiteMol.Viewer.PDBe.Data.DownloadDensity, view: Views.Transform.Data.WithIdField },
                    // { transformer: LiteMol.Viewer.DataSources.DownloadMolecule, view: Views.Transform.Data.WithUrlIdField },
                    // { transformer: Transformer.Molecule.OpenCifMoleculeFromFile, view: Views.Transform.Data.OpenCifMolecule },                
                    // { transformer: Transformer.Data.Download, view: Views.Transform.Data.Download },
                    // { transformer: Transformer.Data.OpenFile, view: Views.Transform.Data.OpenFile },
                    // Raw data transforms
                    // { transformer: Transformer.Data.ParseCif, view: Views.Transform.Empty },
                    // { transformer: Transformer.Density.ParseCcp4, view: Views.Transform.Density.ParseCcp4 },
                    // Molecule(model) transforms
                    // { transformer: Transformer.Molecule.CreateFromCif, view: Views.Transform.Molecule.CreateFromCif },
                    // { transformer: Transformer.Molecule.CreateModel, view: Views.Transform.Molecule.CreateModel },
                    // { transformer: Transformer.Molecule.CreateSelection, view: Views.Transform.Molecule.CreateSelection },        
                    // { transformer: Transformer.Molecule.CreateAssembly, view: Views.Transform.Molecule.CreateAssembly },
                    // { transformer: Transformer.Molecule.CreateSymmetryMates, view: Views.Transform.Molecule.CreateSymmetryMates },
                    // { transformer: Transformer.Molecule.CreateMacromoleculeVisual, view: Views.Transform.Empty },
                    { transformer: Transformer.Molecule.CreateVisual, view: Views.Transform.Molecule.CreateVisual },
                    // // density transforms
                    // { transformer: Transformer.Density.CreateVisual, view: Views.Transform.Density.CreateVisual },
                    // { transformer: Transformer.Density.CreateVisualBehaviour, view: Views.Transform.Density.CreateVisualBehaviour },
                    // // Coordinate streaming            
                    // { transformer: Transformer.Molecule.CoordinateStreaming.CreateBehaviour, view: Views.Transform.Empty },
                    // // Validation report
                    // { transformer: LiteMol.Viewer.PDBe.Validation.DownloadAndCreate, view: Views.Transform.Empty },
                    // { transformer: LiteMol.Viewer.PDBe.Validation.ApplyTheme, view: Views.Transform.Empty }
                    { transformer: Custom.CreateRepresentation, view: LiteMol.Custom.RepresentationView, initiallyCollapsed: true }
                ],
                behaviours: [
                    // you will find the source of all behaviours in the Bootstrap/Behaviour directory
                    // keep these 2
                    Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
                    Bootstrap.Behaviour.FocusCameraOnSelect,
                    // this colors the visual when a selection is created on it.
                    Bootstrap.Behaviour.ApplySelectionToVisual,
                    // this colors the visual when it's selected by mouse or touch
                    Bootstrap.Behaviour.ApplyInteractivitySelection,
                    // this shows what atom/residue is the pointer currently over
                    Bootstrap.Behaviour.Molecule.HighlightElementInfo,
                    // distance to the last "clicked" element
                    Bootstrap.Behaviour.Molecule.DistanceToLastClickedElement,
                    // when the same element is clicked twice in a row, the selection is emptied
                    Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
                    // when somethinh is selected, this will create an "overlay visual" of the selected residue and show every other residue within 5ang
                    // you will not want to use this for the ligand pages, where you create the same thing this does at startup
                    Bootstrap.Behaviour.Molecule.ShowInteractionOnSelect(5),
                    // this tracks what is downloaded and some basic actions. Does not send any private data etc.
                    // While it is not required for any functionality, we as authors are very much interested in basic 
                    // usage statistics of the application and would appriciate if this behaviour is used.
                    Bootstrap.Behaviour.GoogleAnalytics('UA-77062725-1')
                ],
                components: [
                    Plugin.Components.Visualization.HighlightInfo(LayoutRegion.Main, true),
                    Plugin.Components.create('RepresentationControls', function (ctx) { return new Bootstrap.Components.Transform.Action(ctx, 'molecule', Custom.CreateRepresentation, 'Source'); }, Plugin.Views.Transform.Action)(LayoutRegion.Right),
                    Plugin.Components.create('PolymerControls', function (ctx) { return new Bootstrap.Components.Transform.Updater(ctx, 'polymer-visual', 'Polymer Visual'); }, Plugin.Views.Transform.Updater)(LayoutRegion.Right),
                    Plugin.Components.create('HetControls', function (ctx) { return new Bootstrap.Components.Transform.Updater(ctx, 'het-visual', 'HET Groups Visual'); }, Plugin.Views.Transform.Updater)(LayoutRegion.Right),
                    Plugin.Components.create('WaterControls', function (ctx) { return new Bootstrap.Components.Transform.Updater(ctx, 'water-visual', 'Water Visual'); }, Plugin.Views.Transform.Updater)(LayoutRegion.Right),
                    Plugin.Components.Context.Log(LayoutRegion.Bottom, true),
                    Plugin.Components.Context.Overlay(LayoutRegion.Root),
                    Plugin.Components.Context.Toast(LayoutRegion.Main, true),
                    Plugin.Components.Context.BackgroundTasks(LayoutRegion.Main, true)
                ],
                viewport: {
                    // dont touch this either 
                    view: Views.Visualization.Viewport,
                    controlsView: Views.Visualization.ViewportControls
                },
                layoutView: Views.Layout,
                tree: void 0 // { region: LayoutRegion.Left, view: Views.Entity.Tree }
            };
            var plugin = Plugin.create({ target: target, customSpecification: customSpecification, layoutState: { isExpanded: true } });
            plugin.context.logger.message("LiteMol Plugin " + Plugin.VERSION.number);
            return plugin;
        }
        Custom.create = create;
        // create the instance...
        var id = '1tqn';
        var plugin = create(document.getElementById('app'));
        var action = plugin.createTransform();
        action.add(plugin.context.tree.root, Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/static/entry/" + id + "_updated.cif", type: 'String', id: id })
            .then(Transformer.Data.ParseCif, { id: id }, { isBinding: true })
            .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { ref: 'molecule' })
            .then(Custom.CreateRepresentation, {});
        plugin.applyTransform(action).then(function () {
            console.log(plugin.context.select('molecule'));
        });
    })(Custom = LiteMol.Custom || (LiteMol.Custom = {}));
})(LiteMol || (LiteMol = {}));
