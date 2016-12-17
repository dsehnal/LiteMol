var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Example;
    (function (Example) {
        var Channels;
        (function (Channels) {
            var State;
            (function (State) {
                var Transformer = LiteMol.Bootstrap.Entity.Transformer;
                function showDefaultVisuals(plugin, data, channelCount) {
                    return new LiteMol.Promise(function (res) {
                        return showChannelVisuals(plugin, data.Channels.Tunnels.slice(0, channelCount), true).then(function () {
                            var cavity = data.Cavities.Cavities[0];
                            if (cavity) {
                                showCavityVisuals(plugin, [], true).then(function () { return res(); });
                            }
                        });
                    });
                }
                function loadData(plugin, pdbId, url) {
                    return new LiteMol.Promise(function (res, rej) {
                        plugin.clear();
                        var model = plugin.createTransform()
                            .add(plugin.root, Transformer.Data.Download, { url: "https://www.ebi.ac.uk/pdbe/static/entry/" + pdbId + "_updated.cif", type: 'String', id: pdbId })
                            .then(Transformer.Molecule.CreateFromData, { format: LiteMol.Core.Formats.Molecule.SupportedFormats.mmCIF }, { isBinding: true })
                            .then(Transformer.Molecule.CreateModel, { modelIndex: 0 })
                            .then(Transformer.Molecule.CreateMacromoleculeVisual, { polymer: true, polymerRef: 'polymer-visual', het: true });
                        var data = plugin.createTransform().add(plugin.root, Transformer.Data.Download, { url: url, type: 'String', id: 'MOLE Data' }, { isHidden: true })
                            .then(Transformer.Data.ParseJson, { id: 'MOLE Data' }, { ref: 'mole-data' });
                        plugin.applyTransform(model)
                            .then(function () {
                            plugin.command(LiteMol.Bootstrap.Command.Entity.Focus, plugin.context.select('polymer-visual'));
                        });
                        plugin.applyTransform(data)
                            .then(function () {
                            var data = plugin.context.select('mole-data')[0];
                            if (!data)
                                rej('Data not available.');
                            else {
                                showDefaultVisuals(plugin, data.props.data, 2).then(function () { return res(data.props.data); });
                            }
                        })
                            .catch(function (e) { return rej(e); });
                    });
                }
                State.loadData = loadData;
                function createSurface(mesh) {
                    // wrap the vertices in typed arrays
                    if (!(mesh.Vertices instanceof Float32Array)) {
                        mesh.Vertices = new Float32Array(mesh.Vertices);
                    }
                    if (!(mesh.Vertices instanceof Uint32Array)) {
                        mesh.Triangles = new Uint32Array(mesh.Triangles);
                    }
                    var surface = {
                        vertices: mesh.Vertices,
                        vertexCount: (mesh.Vertices.length / 3) | 0,
                        triangleIndices: new Uint32Array(mesh.Triangles),
                        triangleCount: (mesh.Triangles.length / 3) | 0,
                    };
                    return surface;
                }
                var colorIndex = LiteMol.Visualization.Molecule.Colors.DefaultPallete.length - 1;
                function nextColor() {
                    return LiteMol.Visualization.Color.random();
                    // can use the build in palette for example like this:
                    // let color = Visualization.Molecule.Colors.DefaultPallete[colorIndex];
                    // colorIndex--;
                    // if (colorIndex < 0) colorIndex = Visualization.Molecule.Colors.DefaultPallete.length - 1;
                    // return color;
                }
                function showSurfaceVisuals(plugin, elements, visible, type, label, alpha) {
                    // I am modifying the original JSON response. In general this is not a very good
                    // idea and should be avoided in "real" apps.
                    var t = plugin.createTransform();
                    var needsApply = false;
                    for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
                        var element = elements_1[_i];
                        if (!element.__id)
                            element.__id = LiteMol.Bootstrap.Utils.generateUUID();
                        if (!!element.__isVisible === visible)
                            continue;
                        element.__isVisible = visible;
                        if (!element.__color) {
                            // the colors should probably be initialized when the data is loaded
                            // so that they are deterministic...
                            element.__color = nextColor();
                        }
                        if (!visible) {
                            plugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, element.__id);
                        }
                        else {
                            var surface = createSurface(element.Mesh);
                            t.add('mole-data', State.CreateSurface, {
                                label: label(element),
                                tag: { type: type, element: element },
                                surface: surface,
                                color: element.__color,
                                isInteractive: true,
                                transparency: { alpha: alpha }
                            }, { ref: element.__id, isHidden: true });
                            needsApply = true;
                        }
                    }
                    if (needsApply) {
                        return new LiteMol.Promise(function (res, rej) {
                            plugin.applyTransform(t).then(function () {
                                for (var _i = 0, elements_2 = elements; _i < elements_2.length; _i++) {
                                    var element = elements_2[_i];
                                    element.__isBusy = false;
                                }
                                res();
                            }).catch(function (e) { return rej(e); });
                        });
                    }
                    else {
                        return new LiteMol.Promise(function (res, rej) {
                            for (var _i = 0, elements_3 = elements; _i < elements_3.length; _i++) {
                                var element = elements_3[_i];
                                element.__isBusy = false;
                            }
                            res();
                        });
                    }
                }
                function showCavityVisuals(plugin, cavities, visible) {
                    return showSurfaceVisuals(plugin, cavities, visible, 'Cavity', function (cavity) { return cavity.Type + " " + cavity.Id; }, 0.33);
                }
                State.showCavityVisuals = showCavityVisuals;
                function showChannelVisuals(plugin, channels, visible) {
                    return showSurfaceVisuals(plugin, channels, visible, 'Channel', function (channel) { return channel.Type + " " + (channel.Id + 1); }, 1.0);
                }
                State.showChannelVisuals = showChannelVisuals;
                function createOriginsSurface(origins) {
                    if (origins.__surface)
                        return LiteMol.Promise.resolve(origins.__surface);
                    var s = LiteMol.Visualization.Primitive.Builder.create();
                    var id = 0;
                    for (var _i = 0, _a = origins.Points; _i < _a.length; _i++) {
                        var p = _a[_i];
                        s.add({ type: 'Sphere', id: id++, radius: 1.69, center: { x: p.X, y: p.Y, z: p.Z } });
                    }
                    return s.buildSurface().run().result;
                }
                function showOriginsSurface(plugin, origins, visible) {
                    if (!origins.__id)
                        origins.__id = LiteMol.Bootstrap.Utils.generateUUID();
                    if (!origins.Points.length || !!origins.__isVisible === visible)
                        return LiteMol.Promise.resolve();
                    origins.__isVisible = visible;
                    if (!visible) {
                        plugin.command(LiteMol.Bootstrap.Command.Tree.RemoveNode, origins.__id);
                        origins.__isBusy = false;
                        return LiteMol.Promise.resolve();
                    }
                    if (!origins.__color) {
                        // the colors should probably be initialized when the data is loaded
                        // so that they are deterministic...
                        origins.__color = nextColor();
                    }
                    return new LiteMol.Promise(function (res, rej) {
                        createOriginsSurface(origins).then(function (surface) {
                            var t = plugin.createTransform()
                                .add('mole-data', State.CreateSurface, {
                                label: 'Origins ' + origins.Type,
                                tag: { type: 'Origins', element: origins },
                                surface: surface,
                                isInteractive: true,
                                color: origins.__color
                            }, { ref: origins.__id, isHidden: true });
                            plugin.applyTransform(t).then(function () {
                                origins.__isBusy = false;
                                res();
                            }).catch(rej);
                        }).catch(rej);
                    });
                }
                State.showOriginsSurface = showOriginsSurface;
                State.CreateSurface = LiteMol.Bootstrap.Tree.Transformer.create({
                    id: 'mole-example-create-surface',
                    name: 'Create Surface',
                    description: 'Create a surface entity.',
                    from: [LiteMol.Bootstrap.Entity.Data.Json],
                    to: [LiteMol.Bootstrap.Entity.Visual.Surface],
                    defaultParams: function () { return ({}); },
                    isUpdatable: false
                }, function (context, a, t) {
                    var theme = LiteMol.Visualization.Theme.createUniform({ colors: new Map([['Uniform', t.params.color]]), interactive: t.params.isInteractive, transparency: t.params.transparency });
                    var style = {
                        type: 'Surface',
                        taskType: 'Silent',
                        //isNotSelectable: false,
                        params: {},
                        theme: void 0
                    };
                    return LiteMol.Bootstrap.Task.create("Create Surface", 'Silent', function (ctx) {
                        LiteMol.Visualization.Surface.Model.create(t.params.tag, { surface: t.params.surface, theme: theme, parameters: { isWireframe: t.params.isWireframe } }).run().result
                            .then(function (model) {
                            var e = LiteMol.Bootstrap.Entity.Visual.Surface.create(t, { label: t.params.label, model: model, style: style, isSelectable: true, tag: t.params.tag });
                            ctx.resolve(e);
                        })
                            .catch(function (e) { return ctx.reject(e); });
                    });
                });
            })(State = Channels.State || (Channels.State = {}));
        })(Channels = Example.Channels || (Example.Channels = {}));
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Example;
    (function (Example) {
        var Channels;
        (function (Channels_1) {
            var UI;
            (function (UI) {
                var React = LiteMol.Plugin.React;
                function render(plugin, target) {
                    LiteMol.Plugin.ReactDOM.render(React.createElement(App, { plugin: plugin }), target);
                }
                UI.render = render;
                var App = (function (_super) {
                    __extends(App, _super);
                    function App() {
                        var _this = _super.apply(this, arguments) || this;
                        _this.state = { isLoading: false, data: void 0, error: void 0 };
                        return _this;
                    }
                    App.prototype.componentDidMount = function () {
                        this.load();
                    };
                    App.prototype.load = function () {
                        var _this = this;
                        this.setState({ isLoading: true, error: void 0 });
                        Channels_1.State.loadData(this.props.plugin, '1tqn', 'data.json')
                            .then(function (data) { return _this.setState({ isLoading: false, data: data }); })
                            .catch(function (e) { return _this.setState({ isLoading: false, error: '' + e }); });
                    };
                    App.prototype.render = function () {
                        var _this = this;
                        if (this.state.data) {
                            return React.createElement(Data, { data: this.state.data, plugin: this.props.plugin });
                        }
                        else {
                            var controls = [];
                            if (this.state.isLoading) {
                                controls.push(React.createElement("h1", null, "Loading..."));
                            }
                            else {
                                controls.push(React.createElement("button", { onClick: function () { return _this.load(); } }, "Load Data"));
                                if (this.state.error) {
                                    controls.push(React.createElement("div", { style: { color: 'red', fontSize: '18px' } },
                                        "Error: ",
                                        this.state.error));
                                }
                            }
                            return React.createElement("div", null, controls);
                        }
                    };
                    return App;
                }(React.Component));
                UI.App = App;
                var Data = (function (_super) {
                    __extends(Data, _super);
                    function Data() {
                        return _super.apply(this, arguments) || this;
                    }
                    Data.prototype.render = function () {
                        return React.createElement("div", null,
                            React.createElement(Selection, __assign({}, this.props)),
                            React.createElement("h2", null, "Channels"),
                            React.createElement(Channels, __assign({ channels: this.props.data.Channels.Tunnels }, this.props, { header: 'Tunnels' })),
                            React.createElement(Channels, __assign({ channels: this.props.data.Channels.MergedPores }, this.props, { header: 'Merged Pores' })),
                            React.createElement(Channels, __assign({ channels: this.props.data.Channels.Pores }, this.props, { header: 'Pores' })),
                            React.createElement(Channels, __assign({ channels: this.props.data.Channels.Paths }, this.props, { header: 'Paths' })),
                            React.createElement("h2", null, "Empty Space"),
                            React.createElement(Cavities, __assign({ cavities: [this.props.data.Cavities.Surface] }, this.props, { header: 'Surface' })),
                            React.createElement(Cavities, __assign({ cavities: this.props.data.Cavities.Cavities }, this.props, { header: 'Cavities' })),
                            React.createElement(Cavities, __assign({ cavities: this.props.data.Cavities.Voids }, this.props, { header: 'Voids' })),
                            React.createElement("h2", null, "Origins"),
                            React.createElement(Origins, __assign({ origins: this.props.data.Origins.User }, this.props, { label: 'User Specifed (optimized)' })),
                            React.createElement(Origins, __assign({ origins: this.props.data.Origins.InputOrigins }, this.props, { label: 'User Specifed' })),
                            React.createElement(Origins, __assign({ origins: this.props.data.Origins.Computed }, this.props, { label: 'Computed' })),
                            React.createElement(Origins, __assign({ origins: this.props.data.Origins.Database }, this.props, { label: 'Database' })));
                    };
                    return Data;
                }(React.Component));
                UI.Data = Data;
                var Selection = (function (_super) {
                    __extends(Selection, _super);
                    function Selection() {
                        var _this = _super.apply(this, arguments) || this;
                        _this.state = { label: void 0 };
                        _this.observer = void 0;
                        return _this;
                    }
                    Selection.prototype.componentWillMount = function () {
                        var _this = this;
                        this.observer = this.props.plugin.subscribe(LiteMol.Bootstrap.Event.Molecule.ModelSelect, function (e) {
                            if (!e.data) {
                                _this.setState({ label: void 0 });
                            }
                            else {
                                var r = e.data.residues[0];
                                _this.setState({ label: r.name + " " + r.authSeqNumber + " " + r.chain.authAsymId });
                            }
                        });
                    };
                    Selection.prototype.componentWillUnmount = function () {
                        if (this.observer) {
                            this.observer.dispose();
                            this.observer = void 0;
                        }
                    };
                    Selection.prototype.render = function () {
                        return React.createElement("div", null,
                            React.createElement("h3", null, "Selection"),
                            !this.state.label
                                ? React.createElement("div", null,
                                    React.createElement("i", null, "Click on atom or residue"))
                                : React.createElement("div", null, this.state.label));
                    };
                    return Selection;
                }(React.Component));
                UI.Selection = Selection;
                var Section = (function (_super) {
                    __extends(Section, _super);
                    function Section() {
                        var _this = _super.apply(this, arguments) || this;
                        _this.state = { isExpanded: false };
                        return _this;
                    }
                    Section.prototype.toggle = function (e) {
                        e.preventDefault();
                        this.setState({ isExpanded: !this.state.isExpanded });
                    };
                    Section.prototype.render = function () {
                        var _this = this;
                        return React.createElement("div", { style: { position: 'relative' } },
                            React.createElement("h3", null,
                                React.createElement("a", { href: '#', onClick: function (e) { return _this.toggle(e); }, className: 'section-header' },
                                    React.createElement("div", { style: { width: '15px', display: 'inline-block', textAlign: 'center' } }, this.state.isExpanded ? '-' : '+'),
                                    " ",
                                    this.props.header,
                                    " (",
                                    this.props.count,
                                    ")")),
                            React.createElement("div", { style: { display: this.state.isExpanded ? 'block' : 'none' } }, this.props.children));
                    };
                    return Section;
                }(React.Component));
                UI.Section = Section;
                var Renderable = (function (_super) {
                    __extends(Renderable, _super);
                    function Renderable() {
                        return _super.apply(this, arguments) || this;
                    }
                    Renderable.prototype.toggle = function () {
                        var _this = this;
                        this.props.element.__isBusy = true;
                        this.forceUpdate(function () {
                            return _this.props.toggle(_this.props.plugin, [_this.props.element], !_this.props.element.__isVisible)
                                .then(function () { return _this.forceUpdate(); }).catch(function () { return _this.forceUpdate(); });
                        });
                    };
                    Renderable.prototype.highlight = function (isOn) {
                        this.props.plugin.command(LiteMol.Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.element.__id), isOn: isOn });
                    };
                    Renderable.prototype.render = function () {
                        var _this = this;
                        return React.createElement("div", null,
                            React.createElement("label", { onMouseEnter: function () { return _this.highlight(true); }, onMouseLeave: function () { return _this.highlight(false); } },
                                React.createElement("input", { type: 'checkbox', checked: !!this.props.element.__isVisible, onChange: function () { return _this.toggle(); }, disabled: !!this.props.element.__isBusy }),
                                " ",
                                this.props.label));
                    };
                    return Renderable;
                }(React.Component));
                UI.Renderable = Renderable;
                var Channels = (function (_super) {
                    __extends(Channels, _super);
                    function Channels() {
                        var _this = _super.apply(this, arguments) || this;
                        _this.state = { isBusy: false };
                        return _this;
                    }
                    Channels.prototype.show = function (visible) {
                        var _this = this;
                        for (var _i = 0, _a = this.props.channels; _i < _a.length; _i++) {
                            var element = _a[_i];
                            element.__isBusy = true;
                        }
                        this.setState({ isBusy: true }, function () {
                            return Channels_1.State.showChannelVisuals(_this.props.plugin, _this.props.channels, visible)
                                .then(function () { return _this.setState({ isBusy: false }); }).catch(function () { return _this.setState({ isBusy: false }); });
                        });
                    };
                    Channels.prototype.render = function () {
                        var _this = this;
                        return React.createElement(Section, { header: this.props.header, count: (this.props.channels || '').length },
                            React.createElement("div", { className: 'show-all' },
                                React.createElement("button", { onClick: function () { return _this.show(true); }, disabled: this.state.isBusy }, "All"),
                                React.createElement("button", { onClick: function () { return _this.show(false); }, disabled: this.state.isBusy }, "None")),
                            this.props.channels && this.props.channels.length > 0
                                ? this.props.channels.map(function (c, i) { return React.createElement(Channel, __assign({ key: i, channel: c }, _this.props)); })
                                : 'None');
                    };
                    return Channels;
                }(React.Component));
                UI.Channels = Channels;
                var Channel = (function (_super) {
                    __extends(Channel, _super);
                    function Channel() {
                        var _this = _super.apply(this, arguments) || this;
                        _this.state = { isVisible: false };
                        return _this;
                    }
                    Channel.prototype.render = function () {
                        var c = this.props.channel;
                        var len = c.Profile[c.Profile.length - 1].Distance;
                        var bneck = c.Profile.reduce(function (b, n) { return Math.min(b, n.Radius); }, Number.POSITIVE_INFINITY);
                        return React.createElement(Renderable, __assign({ label: React.createElement("span", null,
                                React.createElement("b", null, c.Id + 1),
                                ", ", "Length: " + len + " \u00C5, Bottleneck: " + bneck + " \u00C5"), element: c, toggle: Channels_1.State.showChannelVisuals }, this.props));
                    };
                    return Channel;
                }(React.Component));
                UI.Channel = Channel;
                var Cavities = (function (_super) {
                    __extends(Cavities, _super);
                    function Cavities() {
                        var _this = _super.apply(this, arguments) || this;
                        _this.state = { isBusy: false };
                        return _this;
                    }
                    Cavities.prototype.show = function (visible) {
                        var _this = this;
                        for (var _i = 0, _a = this.props.cavities; _i < _a.length; _i++) {
                            var element = _a[_i];
                            element.__isBusy = true;
                        }
                        this.setState({ isBusy: true }, function () {
                            return Channels_1.State.showCavityVisuals(_this.props.plugin, _this.props.cavities, visible)
                                .then(function () { return _this.setState({ isBusy: false }); }).catch(function () { return _this.setState({ isBusy: false }); });
                        });
                    };
                    Cavities.prototype.render = function () {
                        var _this = this;
                        return React.createElement(Section, { header: this.props.header, count: (this.props.cavities || '').length },
                            React.createElement("div", { className: 'show-all' },
                                React.createElement("button", { onClick: function () { return _this.show(true); }, disabled: this.state.isBusy }, "All"),
                                React.createElement("button", { onClick: function () { return _this.show(false); }, disabled: this.state.isBusy }, "None")),
                            this.props.cavities && this.props.cavities.length > 0
                                ? this.props.cavities.map(function (c, i) { return React.createElement(Cavity, __assign({ key: i, cavity: c }, _this.props)); })
                                : 'None');
                    };
                    return Cavities;
                }(React.Component));
                UI.Cavities = Cavities;
                var Cavity = (function (_super) {
                    __extends(Cavity, _super);
                    function Cavity() {
                        var _this = _super.apply(this, arguments) || this;
                        _this.state = { isVisible: false };
                        return _this;
                    }
                    Cavity.prototype.render = function () {
                        var c = this.props.cavity;
                        return React.createElement("div", null,
                            React.createElement(Renderable, __assign({ label: React.createElement("span", null,
                                    React.createElement("b", null, c.Id),
                                    ", ", "Volume: " + (c.Volume | 0) + " \u00C5",
                                    React.createElement("sup", null, "3")), element: c, toggle: Channels_1.State.showCavityVisuals }, this.props)));
                    };
                    return Cavity;
                }(React.Component));
                UI.Cavity = Cavity;
                var Origins = (function (_super) {
                    __extends(Origins, _super);
                    function Origins() {
                        return _super.apply(this, arguments) || this;
                    }
                    Origins.prototype.toggle = function () {
                        var _this = this;
                        this.props.origins.__isBusy = true;
                        this.forceUpdate(function () {
                            return Channels_1.State.showOriginsSurface(_this.props.plugin, _this.props.origins, !_this.props.origins.__isVisible)
                                .then(function () { return _this.forceUpdate(); }).catch(function () { return _this.forceUpdate(); });
                        });
                    };
                    Origins.prototype.highlight = function (isOn) {
                        this.props.plugin.command(LiteMol.Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.origins.__id), isOn: isOn });
                    };
                    Origins.prototype.render = function () {
                        var _this = this;
                        if (!this.props.origins.Points.length) {
                            return React.createElement("div", { style: { display: 'none' } });
                        }
                        return React.createElement("div", null,
                            React.createElement("label", { onMouseEnter: function () { return _this.highlight(true); }, onMouseLeave: function () { return _this.highlight(false); } },
                                React.createElement("input", { type: 'checkbox', checked: !!this.props.origins.__isVisible, onChange: function () { return _this.toggle(); }, disabled: !!this.props.origins.__isBusy }),
                                " ",
                                this.props.label));
                    };
                    return Origins;
                }(React.Component));
                UI.Origins = Origins;
            })(UI = Channels_1.UI || (Channels_1.UI = {}));
        })(Channels = Example.Channels || (Example.Channels = {}));
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Example;
    (function (Example) {
        var Channels;
        (function (Channels) {
            /**
             * We don't want the default behaviour of the plugin for our example.
             */
            var Views = LiteMol.Plugin.Views;
            var Bootstrap = LiteMol.Bootstrap;
            var Interactivity = Bootstrap.Interactivity;
            var Transformer = Bootstrap.Entity.Transformer;
            var LayoutRegion = Bootstrap.Components.LayoutRegion;
            /**
             * Support for custom highlight tooltips.
             */
            function HighlightCustomElements(context) {
                context.highlight.addProvider(function (info) {
                    if (Interactivity.isEmpty(info) || info.source.type !== Bootstrap.Entity.Visual.Surface)
                        return void 0;
                    var tag = info.source.props.tag;
                    var e = tag.element;
                    switch (tag.type) {
                        case 'Cavity': return "<b>" + e.Type + " " + e.Id + "</b>, Volume: " + (e.Volume | 0) + " \u00C5";
                        case 'Channel': {
                            var len = e.Profile[e.Profile.length - 1].Distance;
                            var bneck = e.Profile.reduce(function (b, n) { return Math.min(b, n.Radius); }, Number.POSITIVE_INFINITY);
                            return "<b>" + e.Type + " " + (e.Id + 1) + "</b>, Length: " + len + " \u00C5, Bottleneck: " + bneck + " \u00C5";
                        }
                        case 'Origins': {
                            var o = e.Points[info.elements[0]];
                            return "<b>Origin</b> (" + e.Type + ") at (" + o.X + ", " + o.Y + ", " + o.Z + ")";
                        }
                        default: return void 0;
                    }
                });
            }
            Channels.HighlightCustomElements = HighlightCustomElements;
            Channels.PluginSpec = {
                settings: {
                    'molecule.model.defaultQuery': "residuesByName('GLY', 'ALA')",
                    'molecule.model.defaultAssemblyName': '1'
                },
                transforms: [
                    // Molecule(model) transforms
                    { transformer: Transformer.Molecule.CreateModel, view: Views.Transform.Molecule.CreateModel, initiallyCollapsed: true },
                    { transformer: Transformer.Molecule.CreateSelection, view: Views.Transform.Molecule.CreateSelection, initiallyCollapsed: true },
                    { transformer: Transformer.Molecule.CreateAssembly, view: Views.Transform.Molecule.CreateAssembly, initiallyCollapsed: true },
                    { transformer: Transformer.Molecule.CreateSymmetryMates, view: Views.Transform.Molecule.CreateSymmetryMates, initiallyCollapsed: true },
                    { transformer: Transformer.Molecule.CreateMacromoleculeVisual, view: Views.Transform.Empty },
                    { transformer: Transformer.Molecule.CreateVisual, view: Views.Transform.Molecule.CreateVisual }
                ],
                behaviours: [
                    // you will find the source of all behaviours in the Bootstrap/Behaviour directory
                    Bootstrap.Behaviour.SetEntityToCurrentWhenAdded,
                    Bootstrap.Behaviour.FocusCameraOnSelect,
                    // this colors the visual when a selection is created on it.
                    Bootstrap.Behaviour.ApplySelectionToVisual,
                    // this colors the visual when it's selected by mouse or touch
                    Bootstrap.Behaviour.ApplyInteractivitySelection,
                    // this shows what atom/residue is the pointer currently over
                    Bootstrap.Behaviour.Molecule.HighlightElementInfo,
                    // when the same element is clicked twice in a row, the selection is emptied
                    Bootstrap.Behaviour.UnselectElementOnRepeatedClick,
                    // distance to the last "clicked" element
                    Bootstrap.Behaviour.Molecule.DistanceToLastClickedElement,
                    // this tracks what is downloaded and some basic actions. Does not send any private data etc. Source in Bootstrap/Behaviour/Analytics 
                    Bootstrap.Behaviour.GoogleAnalytics('UA-77062725-1'),
                    HighlightCustomElements
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
        })(Channels = Example.Channels || (Example.Channels = {}));
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
/*
 * Copyright (c) 2016 David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
var LiteMol;
(function (LiteMol) {
    var Example;
    (function (Example) {
        var Channels;
        (function (Channels) {
            (function () {
                var plugin = LiteMol.Plugin.create({
                    target: '#plugin',
                    viewportBackground: '#333',
                    layoutState: {
                        hideControls: true,
                        isExpanded: false,
                        collapsedControlsLayout: LiteMol.Bootstrap.Components.CollapsedControlsLayout.Landscape
                    },
                    customSpecification: Channels.PluginSpec
                });
                Channels.UI.render(plugin, document.getElementById('ui'));
            })();
        })(Channels = Example.Channels || (Example.Channels = {}));
    })(Example = LiteMol.Example || (LiteMol.Example = {}));
})(LiteMol || (LiteMol = {}));
