var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var LiteMol;
(function (LiteMol) {
    var Viewer;
    (function (Viewer) {
        Viewer.VERSION = { number: "1.1.12", date: "Nov 28 2016" };
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
        var PDBe;
        (function (PDBe) {
            var Data;
            (function (Data) {
                var Bootstrap = LiteMol.Bootstrap;
                var Entity = Bootstrap.Entity;
                var Transformer = Bootstrap.Entity.Transformer;
                var Visualization = Bootstrap.Visualization;
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
                        .add(a, Entity.Transformer.Data.Download, { url: url, type: 'Binary', id: id })
                        .then(Entity.Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmBCIF }, { isBinding: true })
                        .then(Entity.Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false });
                });
                // this creates the electron density based on the spec you sent me
                Data.DownloadDensity = Bootstrap.Tree.Transformer.action({
                    id: 'pdbe-density-download-data',
                    name: 'Density Data from PDBe',
                    description: 'Download density data from PDBe.',
                    from: [Entity.Root],
                    to: [Entity.Action],
                    defaultParams: function () { return ({ id: '1cbs' }); },
                    validateParams: function (p) { return (!p.id || !p.id.trim().length) ? ['Enter Id'] : void 0; },
                }, function (context, a, t) {
                    var action = Bootstrap.Tree.Transform.build();
                    var id = t.params.id.trim().toLocaleLowerCase();
                    var group = action.add(a, Transformer.Basic.CreateGroup, { label: id, description: 'Density' }, { ref: t.props.ref });
                    var diff = group
                        .then(Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/coordinates/files/" + id + "_diff.ccp4", type: 'Binary', id: t.params.id, description: 'Fo-Fc' })
                        .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: 'Fo-Fc', normalize: false }, { isBinding: true });
                    diff
                        .then(Transformer.Density.CreateVisualBehaviour, {
                        id: 'Fo-Fc(-ve)',
                        isoSigmaMin: -5,
                        isoSigmaMax: 0,
                        minRadius: 0,
                        maxRadius: 10,
                        radius: 5,
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
                        style: Visualization.Density.Style.create({
                            isoValue: 3,
                            isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                            color: LiteMol.Visualization.Color.fromHex(0x33BB33),
                            isWireframe: true,
                            transparency: { alpha: 1.0 }
                        })
                    });
                    var base = group
                        .then(Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/coordinates/files/" + id + ".ccp4", type: 'Binary', id: t.params.id, description: '2Fo-Fc' })
                        .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: '2Fo-Fc', normalize: false }, { isBinding: true })
                        .then(Transformer.Density.CreateVisualBehaviour, {
                        id: '2Fo-Fc',
                        isoSigmaMin: 0,
                        isoSigmaMax: 2,
                        minRadius: 0,
                        maxRadius: 10,
                        radius: 5,
                        style: Visualization.Density.Style.create({
                            isoValue: 1.5,
                            isoValueType: Bootstrap.Visualization.Density.IsoValueType.Sigma,
                            color: LiteMol.Visualization.Color.fromHex(0x3362B2),
                            isWireframe: false,
                            transparency: { alpha: 0.45 }
                        })
                    });
                    return action;
                }, "Electron density loaded, click on a residue or an atom to view the data.");
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
                        .add(a, Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/api/validation/residuewise_outlier_summary/entry/" + id, type: 'String', id: id, description: 'Validation Data' })
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
                            for (var _i = 0, visuals_2 = visuals; _i < visuals_2.length; _i++) {
                                var v = visuals_2[_i];
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
                        .add(a, Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/api/mappings/" + id, type: 'String', id: id, description: 'Annotation Data' })
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
                { transformer: Viewer.PDBe.Data.DownloadDensity, view: Views.Transform.Data.WithIdField },
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
                // Validation report
                { transformer: Viewer.PDBe.Validation.DownloadAndCreate, view: Views.Transform.Empty },
                { transformer: Viewer.PDBe.Validation.ApplyTheme, view: Views.Transform.Empty },
                // annotations
                { transformer: Viewer.PDBe.SequenceAnnotation.DownloadAndCreate, view: Views.Transform.Empty, initiallyCollapsed: true },
                { transformer: Viewer.PDBe.SequenceAnnotation.CreateSingle, view: Viewer.PDBe.Views.CreateSequenceAnnotationView, initiallyCollapsed: true }
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
