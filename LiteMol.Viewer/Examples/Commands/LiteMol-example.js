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
                name: 'Url',
                description: 'Download a molecule from the specified Url (if the host server supports cross domain requests).',
                defaultId: 'http://webchemdev.ncbr.muni.cz/CoordinateServer/1tqn/cartoon',
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
                    urlTemplate: function (id) { return ("http://www.ebi.ac.uk/pdbe/static/entry/" + id.toLowerCase() + "_updated.cif"); }
                });
                Data.DownloadBinaryCIFFromCoordinateServer = Bootstrap.Tree.Transformer.action({
                    id: 'molecule-download-bcif-from-coordinate-server',
                    name: 'Molecule (BinaryCIF)',
                    description: 'Download full or cartoon representation of a PDB entry from the CoordinateServer.',
                    from: [Entity.Root],
                    to: [Entity.Action],
                    defaultParams: function (ctx) { return ({ id: '1jj2', type: 'Cartoon', lowPrecisionCoords: true, serverUrl: ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') ? ctx.settings.get('molecule.downloadBinaryCIFFromCoordinateServer.server') : 'http://webchemdev.ncbr.muni.cz/CoordinateServer' }); },
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
                        .then(Transformer.Data.Download, { url: "http://www.ebi.ac.uk/pdbe/coordinates/files/" + id + "_diff.ccp4", type: 'Binary', id: t.params.id, description: 'Fo-Fc' })
                        .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: 'Fo-Fc', normalize: false }, { isBinding: true });
                    diff
                        .then(Transformer.Density.CreateVisualBehaviour, {
                        id: 'Fo-Fc(-ve)',
                        isoSigmaMin: -5,
                        isoSigmaMax: 0,
                        radius: 5,
                        style: Visualization.Density.Style.create({
                            isoSigma: -3,
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
                        radius: 5,
                        style: Visualization.Density.Style.create({
                            isoSigma: 3,
                            color: LiteMol.Visualization.Color.fromHex(0x33BB33),
                            isWireframe: true,
                            transparency: { alpha: 1.0 }
                        })
                    });
                    var base = group
                        .then(Transformer.Data.Download, { url: "http://www.ebi.ac.uk/pdbe/coordinates/files/" + id + ".ccp4", type: 'Binary', id: t.params.id, description: '2Fo-Fc' })
                        .then(Transformer.Density.ParseData, { format: LiteMol.Core.Formats.Density.SupportedFormats.CCP4, id: '2Fo-Fc', normalize: false }, { isBinding: true })
                        .then(Transformer.Density.CreateVisualBehaviour, {
                        id: '2Fo-Fc',
                        isoSigmaMin: 0,
                        isoSigmaMax: 2,
                        radius: 5,
                        style: Visualization.Density.Style.create({
                            isoSigma: 1.5,
                            color: LiteMol.Visualization.Color.fromHex(0x3362B2),
                            isWireframe: false,
                            transparency: { alpha: 0.45 }
                        })
                    });
                    return action;
                }, "Electron density loaded, click on a residue or atom to display it.");
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
                        .add(a, Transformer.Data.Download, { url: "http://www.ebi.ac.uk/pdbe/api/validation/residuewise_outlier_summary/entry/" + id, type: 'String', id: id, description: 'Validation Data' })
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
    var Example;
    (function (Example) {
        var React = LiteMol.Plugin.React; // this is to enable the HTML-like syntax
        var Controls = LiteMol.Plugin.Controls;
        // this defines a custom view for coordinate streaming and lets the user pick from two backing servers
        // check more examples of views in LiteMol.Plugin/View/Transform folder.
        //
        // this uses a default controller for transforms, you can write your own. How to do that, check LiteMol.Bootstrap/Components/Transform folder
        //
        // Transforms transform entities. On how to define custom entities, check LiteMol.Bootstrap/Entity/Types.ts where there are plenty of examples.
        var CoordianteStreamingCustomView = (function (_super) {
            __extends(CoordianteStreamingCustomView, _super);
            function CoordianteStreamingCustomView() {
                _super.apply(this, arguments);
                // this is for demonstration only, for dynamic options, store them in the transform params or in the underlying entity props.
                this.servers = [
                    { name: 'PDBe', url: 'http://wwwdev.ebi.ac.uk/pdbe/coordinates/' },
                    { name: 'WebChem', url: 'http://webchemdev.ncbr.muni.cz/CoordinateServer/' }
                ];
            }
            CoordianteStreamingCustomView.prototype.renderControls = function () {
                var _this = this;
                var params = this.params;
                // this will only work if the "molecule.coordinateStreaming.defaultServer" setting is one of the servers, which now is.
                // normally you would not use hacks like this and store the list of available server for example in the params of the transforms
                // or in the underlying entity.
                var currentServer = this.servers.filter(function (s) { return s.url === params.server; })[0];
                // to update the params, you can use "this.updateParams" or "this.autoUpdateParams". Auto update params will work only on "updateable transforms"
                // and will work similarly to how visuals are updated. If autoUpdateParams is not used, the user has to click "Update" buttom manually.                                    
                return React.createElement("div", null, React.createElement(Controls.OptionsGroup, {options: this.servers, caption: function (s) { return s.name; }, current: currentServer, onChange: function (o) { return _this.updateParams({ server: o.url }); }, label: 'Server'}), React.createElement(Controls.TextBoxGroup, {value: params.id, onChange: function (v) { return _this.updateParams({ id: v }); }, label: 'Id', onEnter: function (e) { return _this.applyEnter(e); }, placeholder: 'PDB id...'}));
            };
            return CoordianteStreamingCustomView;
        }(LiteMol.Plugin.Views.Transform.ControllerBase));
        Example.CoordianteStreamingCustomView = CoordianteStreamingCustomView;
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
var LiteMolPluginInstance;
(function (LiteMolPluginInstance) {
    // For the plugin CSS, look to Plugin/Skin
    // There is also an icon font in assets/font -- CSS path to it is in Plugin/Skin/LiteMol-plugin.scss
    // To compile the scss, refer to README.md in the root dir.
    var Plugin = LiteMol.Plugin;
    var Views = Plugin.Views;
    var Bootstrap = LiteMol.Bootstrap;
    // everything same as before, only the namespace changed.
    var Query = LiteMol.Core.Structure.Query;
    // You can look at what transforms are available in Bootstrap/Entity/Transformer
    // They are well described there and params are given as interfaces.    
    var Transformer = Bootstrap.Entity.Transformer;
    var Tree = Bootstrap.Tree;
    var Transform = Tree.Transform;
    var LayoutRegion = Bootstrap.Components.LayoutRegion;
    var CoreVis = LiteMol.Visualization;
    var Visualization = Bootstrap.Visualization;
    // all commands and events can be found in Bootstrap/Event folder.
    // easy to follow the types and parameters in VSCode.
    // you can subsribe to any command or event using <Event/Command>.getStream(plugin.context).subscribe(e => ....)
    var Command = Bootstrap.Command;
    var Event = Bootstrap.Event;
    function addControl(name, action) {
        var actions = document.getElementById('actions');
        var button = document.createElement('button');
        button.innerText = name;
        button.onclick = action;
        actions.appendChild(button);
    }
    var moleculeId = '1cbs';
    var plugin;
    var interactivityTarget = document.getElementById('interactions');
    function showInteraction(type, i) {
        if (!i) {
            interactivityTarget.innerHTML = (type + ": nothing<br/>") + interactivityTarget.innerHTML;
            return;
        }
        // you have access to atoms, residues, chains, entities in the info object.
        interactivityTarget.innerHTML = (type + ": " + i.residues[0].authName + " " + i.residues[0].chain.authAsymId + " " + i.residues[0].authSeqNumber + "<br/>") + interactivityTarget.innerHTML;
    }
    // this applies the transforms we will build later
    // it results a promise-like object that you can "then/catch".
    function applyTransforms(actions) {
        return Tree.Transform.apply(plugin.context, actions).run(plugin.context);
    }
    function selectNodes(what) {
        return plugin.context.select(what);
    }
    function cleanUp() {
        // the themes will reset automatically, but you need to cleanup all the other stuff you've created that you dont want to persist
        Command.Tree.RemoveNode.dispatch(plugin.context, 'sequence-selection');
    }
    addControl('Create Plugin', function () {
        // you will want to do a browser version check here
        // it will not work on IE <= 10 (no way around this, no WebGL in IE10)
        // also needs ES6 Map and Set -- so check browser compatibility for that, you can try a polyfill using modernizr or something 
        plugin = create(document.getElementById('app'));
        Command.Layout.SetState.dispatch(plugin.context, { hideControls: true });
        var select = Event.Molecule.ModelSelect.getStream(plugin.context).subscribe(function (e) { return showInteraction('select', e.data); });
        // to stop listening, select.dispose();
        var highlight = Event.Molecule.ModelHighlight.getStream(plugin.context).subscribe(function (e) { return showInteraction('highlight', e.data); });
        Command.Visual.ResetScene.getStream(plugin.context).subscribe(function () { return cleanUp(); });
        Command.Visual.ResetTheme.getStream(plugin.context).subscribe(function () { return cleanUp(); });
        // you can use this to view the event/command stream
        //plugin.context.dispatcher.LOG_DISPATCH_STREAM = true;
    });
    addControl('Destroy Plugin', function () { plugin.destroy(); plugin = void 0; });
    addControl('Show Controls', function () { return Command.Layout.SetState.dispatch(plugin.context, { hideControls: false }); });
    addControl('Hide Controls', function () { return Command.Layout.SetState.dispatch(plugin.context, { hideControls: true }); });
    addControl('Expand', function () { return Command.Layout.SetState.dispatch(plugin.context, { isExpanded: true }); });
    addControl('Set Background', function () { return Command.Layout.SetViewportOptions.dispatch(plugin.context, { clearColor: CoreVis.Color.fromRgb(255, 255, 255) }); });
    addControl('Load Molecule', function () {
        var id = moleculeId;
        // this builds the transforms needed to create a molecule
        var action = Transform.build()
            .add(plugin.context.tree.root, Transformer.Data.Download, { url: "http://www.ebi.ac.uk/pdbe/static/entry/" + id + "_updated.cif", type: 'String', id: id })
            .then(Transformer.Data.ParseCif, { id: id }, { isBinding: true })
            .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { isBinding: true })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false, ref: 'model' })
            .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true, water: true });
        // can also add hetRef and waterRef; the refs allow us to reference the model and visual later.
        applyTransforms(action);
        //.then(() => nextAction())
        //.catch(e => reportError(e));
    });
    addControl('Load Ligand', function () {
        // in the ligand instance, you will want to NOT include Bootstrap.Behaviour.ShowInteractionOnSelect(5) 
        var ligandStyle = {
            type: 'BallsAndSticks',
            params: { useVDW: true, vdwScaling: 0.25, bondRadius: 0.13, detail: 'Automatic' },
            theme: { template: Visualization.Molecule.Default.ElementSymbolThemeTemplate, colors: Visualization.Molecule.Default.ElementSymbolThemeTemplate.colors, transparency: { alpha: 1.0 } }
        };
        var ambStyle = {
            type: 'BallsAndSticks',
            params: { useVDW: false, atomRadius: 0.15, bondRadius: 0.07, detail: 'Automatic' },
            theme: { template: Visualization.Molecule.Default.UniformThemeTemplate, colors: Visualization.Molecule.Default.UniformThemeTemplate.colors.set('Uniform', { r: 0.4, g: 0.4, b: 0.4 }), transparency: { alpha: 0.75 } }
        };
        var ligandQ = Query.residues({ name: 'REA' }); // here you will fill in the whole info 
        var ambQ = Query.residues({ name: 'REA' }).ambientResidues(5); // adjust the radius
        var id = '1cbs:REA';
        var url = "http://webchemdev.ncbr.muni.cz/CoordinateServer/1cbs/ligandInteraction?name=REA"; // here you will fill in the full server etc ...
        var action = Transform.build()
            .add(plugin.context.tree.root, Transformer.Data.Download, { url: url, type: 'String', id: id })
            .then(Transformer.Data.ParseCif, { id: id }, { isBinding: true })
            .then(Transformer.Molecule.CreateFromMmCif, { blockIndex: 0 }, { isBinding: true })
            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 }, { isBinding: false, ref: 'ligand-model' });
        action.then(Transformer.Molecule.CreateSelectionFromQuery, { query: ambQ, name: 'Ambience' }, { isBinding: true })
            .then(Transformer.Molecule.CreateVisual, { style: ambStyle });
        action.then(Transformer.Molecule.CreateSelectionFromQuery, { query: ligandQ, name: 'Ligand' }, { isBinding: true })
            .then(Transformer.Molecule.CreateVisual, { style: ligandStyle }, { ref: 'ligand-visual' });
        applyTransforms(action)
            .then(function () {
            // we select the ligand to display the density around it if it's loaded
            Command.Molecule.CreateSelectInteraction.dispatch(plugin.context, { visual: selectNodes('ligand-visual')[0], query: Query.everything() });
        });
        //.catch(e => reportError(e));
    });
    addControl('Load Density', function () {
        var id = moleculeId;
        // this builds the transforms needed to create a molecule
        var action = Transform.build()
            .add(plugin.context.tree.root, LiteMol.Viewer.PDBe.Data.DownloadDensity, { id: id }, { ref: 'density' });
        applyTransforms(action);
    });
    addControl('Toggle Density', function () {
        var density = selectNodes('density')[0];
        if (!density)
            return;
        Command.Entity.SetVisibility.dispatch(plugin.context, { entity: density, visible: density.state.visibility === 2 /* None */ });
    });
    function createSelectionTheme(color) {
        // for more options also see Bootstrap/Visualization/Molecule/Theme
        var colors = new Map();
        colors.set('Uniform', CoreVis.Color.fromHex(0xffffff));
        colors.set('Selection', color);
        colors.set('Highlight', CoreVis.Theme.Default.HighlightColor);
        return Visualization.Molecule.uniformThemeProvider(void 0, { colors: colors });
    }
    addControl('Select, Extract, Focus', function () {
        var visual = selectNodes('polymer-visual')[0];
        if (!visual)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: 10 }, { seqNumber: 25 });
        var theme = createSelectionTheme(CoreVis.Color.fromHex(0x123456));
        var action = Transform.build()
            .add(visual, Transformer.Molecule.CreateSelectionFromQuery, { query: query, name: 'My name' }, { ref: 'sequence-selection' })
            .then(Transformer.Molecule.CreateVisual, { style: Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
        applyTransforms(action).then(function () {
            Command.Visual.UpdateBasicTheme.dispatch(plugin.context, { visual: visual, theme: theme });
            Command.Entity.Focus.dispatch(plugin.context, selectNodes('sequence-selection'));
            // alternatively, you can do this
            //Command.Molecule.FocusQuery.dispatch(plugin.context, { model: selectNodes('model')[0] as any, query })
        });
    });
    addControl('Focus Query', function () {
        var model = selectNodes('model')[0];
        if (!model)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: 10 }, { seqNumber: 25 });
        Command.Molecule.FocusQuery.dispatch(plugin.context, { model: model, query: query });
    });
    addControl('Color Chains', function () {
        var visual = selectNodes('polymer-visual')[0];
        var model = selectNodes('model')[0];
        if (!model || !visual)
            return;
        var colors = new Map();
        colors.set('A', CoreVis.Color.fromRgb(125, 169, 12));
        // etc.
        var theme = Visualization.Molecule.createColorMapThemeProvider(
        // here you can also use m.atoms.residueIndex, m.residues.name/.... etc.
        // you can also get more creative and use "composite properties"
        // for this check Bootstrap/Visualization/Theme.ts and Visualization/Base/Theme.ts and it should be clear hwo to do that.
        //
        // You can create "validation based" coloring using this approach as it is not implemented in the plugin for now.
        function (m) { return ({ index: m.atoms.chainIndex, property: m.chains.asymId }); }, colors, 
        // this a fallback color used for elements not in the set 
        CoreVis.Color.fromRgb(0, 0, 123))(model);
        Command.Visual.UpdateBasicTheme.dispatch(plugin.context, { visual: visual, theme: theme });
        // if you also want to color the ligands and waters, you have to safe references to them and do it manually.          
    });
    addControl('Highlight On', function () {
        var model = selectNodes('model')[0];
        if (!model)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: 10 }, { seqNumber: 25 });
        Command.Molecule.Highlight.dispatch(plugin.context, { model: model, query: query, isOn: true });
    });
    addControl('Highlight Off', function () {
        var model = selectNodes('model')[0];
        if (!model)
            return;
        var query = Query.sequence('1', 'A', { seqNumber: 10 }, { seqNumber: 25 });
        Command.Molecule.Highlight.dispatch(plugin.context, { model: model, query: query, isOn: false });
    });
    addControl('Reset Theme, Sel, Highlight', function () {
        Command.Visual.ResetTheme.dispatch(plugin.context, void 0);
        cleanUp();
    });
    var AQ = Query.Algebraic;
    addControl('Algebraic Query', function () {
        var model = selectNodes('model')[0];
        if (!model)
            return;
        //let query = AQ.query(AQ.sidechain);
        var query = AQ.query(AQ.equal(AQ.residueName, AQ.value('ALA')));
        var action = Transform.build()
            .add(model, Transformer.Molecule.CreateSelectionFromQuery, { query: query, name: 'Alg. query' }, { ref: 'alg-selection' })
            .then(Transformer.Molecule.CreateVisual, { style: Visualization.Molecule.Default.ForType.get('BallsAndSticks') });
        applyTransforms(action);
    });
    function create(target) {
        var spec = {
            settings: {
                // currently these are all the 'global' settings available 
                'molecule.model.defaultQuery': "residues({ name: 'ALA' })",
                'molecule.model.defaultAssemblyName': '1',
                'molecule.coordinateStreaming.defaultId': '1jj2',
                'molecule.coordinateStreaming.defaultServer': 'http://webchemdev.ncbr.muni.cz/CoordinateServer/',
                'molecule.coordinateStreaming.defaultRadius': 10,
                'density.defaultVisualBehaviourRadius': 5
            },
            transforms: [
                // These are the controls that are available in the UI. Removing any of them wont break anything, but the user 
                // be able to create a particular thing if he deletes something.
                // Root transforms -- things that load data.
                { transformer: LiteMol.Viewer.PDBe.Data.DownloadMolecule, view: Views.Transform.Data.WithIdField },
                { transformer: LiteMol.Viewer.PDBe.Data.DownloadDensity, view: Views.Transform.Data.WithIdField },
                { transformer: LiteMol.Viewer.DataSources.DownloadMolecule, view: Views.Transform.Data.WithUrlIdField },
                { transformer: Transformer.Molecule.OpenMoleculeFromFile, view: Views.Transform.Molecule.OpenFile },
                { transformer: Transformer.Data.Download, view: Views.Transform.Data.Download },
                { transformer: Transformer.Data.OpenFile, view: Views.Transform.Data.OpenFile },
                // this uses the custom view defined in the CustomTransformView.tsx
                //{ transformer: Transformer.Molecule.CoordinateStreaming.InitStreaming, view: Views.Transform.Molecule.InitCoordinateStreaming },
                { transformer: Transformer.Molecule.CoordinateStreaming.InitStreaming, view: LiteMol.Example.CoordianteStreamingCustomView },
                // Raw data transforms
                { transformer: Transformer.Data.ParseCif, view: Views.Transform.Empty },
                { transformer: Transformer.Density.ParseData, view: Views.Transform.Density.ParseData },
                // Molecule(model) transforms
                { transformer: Transformer.Molecule.CreateFromMmCif, view: Views.Transform.Molecule.CreateFromMmCif },
                { transformer: Transformer.Molecule.CreateModel, view: Views.Transform.Molecule.CreateModel },
                { transformer: Transformer.Molecule.CreateSelection, view: Views.Transform.Molecule.CreateSelection },
                { transformer: Transformer.Molecule.CreateAssembly, view: Views.Transform.Molecule.CreateAssembly },
                { transformer: Transformer.Molecule.CreateSymmetryMates, view: Views.Transform.Molecule.CreateSymmetryMates },
                { transformer: Transformer.Molecule.CreateMacromoleculeVisual, view: Views.Transform.Empty },
                { transformer: Transformer.Molecule.CreateVisual, view: Views.Transform.Molecule.CreateVisual },
                // density transforms
                { transformer: Transformer.Density.CreateVisual, view: Views.Transform.Density.CreateVisual },
                { transformer: Transformer.Density.CreateVisualBehaviour, view: Views.Transform.Density.CreateVisualBehaviour },
                // Coordinate streaming            
                { transformer: Transformer.Molecule.CoordinateStreaming.CreateBehaviour, view: Views.Transform.Empty },
                // Validation report
                { transformer: LiteMol.Viewer.PDBe.Validation.DownloadAndCreate, view: Views.Transform.Empty },
                { transformer: LiteMol.Viewer.PDBe.Validation.ApplyTheme, view: Views.Transform.Empty }
            ],
            behaviours: [
                // you will find the source of all behaviours in the Bootstrap/Behaviour directory
                // keep these 2
                Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
                Bootstrap.Behaviour.FocusCameraOnSelect,
                // this colors the visual when a selection is created on it.
                Bootstrap.Behaviour.ApplySelectionToVisual,
                // you will most likely not want this as this could cause trouble
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
                // this tracks what is downloaded and some basic actions. Does not send any private data etc.
                // While it is not required for any functionality, we as authors are very much interested in basic 
                // usage statistics of the application and would appriciate if this behaviour is used.
                Bootstrap.Behaviour.GoogleAnalytics('UA-77062725-1')
            ],
            components: [
                // Pretty much dont touch this :)
                Plugin.Components.Visualization.HighlightInfo(LayoutRegion.Main, true),
                Plugin.Components.Entity.Current('LiteMol', Plugin.VERSION.number)(LayoutRegion.Right, true),
                Plugin.Components.Transform.View(LayoutRegion.Right),
                Plugin.Components.Context.Log(LayoutRegion.Bottom, true),
                Plugin.Components.Context.Overlay(LayoutRegion.Root),
                Plugin.Components.Context.BackgroundTasks(LayoutRegion.Main, true)
            ],
            viewport: {
                // dont touch this either 
                view: Views.Visualization.Viewport,
                controlsView: Views.Visualization.ViewportControls
            },
            layoutView: Views.Layout,
            tree: {
                // or this 
                region: LayoutRegion.Left,
                view: Views.Entity.Tree
            }
        };
        var plugin = new Plugin.Instance(spec, target);
        plugin.context.logger.message("LiteMol Viewer " + Plugin.VERSION.number);
        return plugin;
    }
    LiteMolPluginInstance.create = create;
})(LiteMolPluginInstance || (LiteMolPluginInstance = {}));
