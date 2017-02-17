/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Example.Channels.UI {
    import React = LiteMol.Plugin.React

    export function render(plugin: Plugin.Controller, target: Element) {
        LiteMol.Plugin.ReactDOM.render(<App plugin={plugin} />, target);
    }

    export class App extends React.Component<{ plugin: Plugin.Controller }, { isLoading?: boolean, error?: string, data?: any }> {

        state = { isLoading: false, data: void 0, error: void 0 };

        componentDidMount() {
            this.load();
        }

        load() {
            this.setState({ isLoading: true, error: void 0 });
            State.loadData(this.props.plugin, '1tqn', 'data.json')
                .then(data => this.setState({ isLoading: false, data }))
                .catch(e => this.setState({ isLoading: false, error: '' + e }));
        }

        render() {
            if (this.state.data) {
                return <Data data={this.state.data} plugin={this.props.plugin} />
            } else {
                let controls: any[] = [];

                if (this.state.isLoading) {
                    controls.push(<h1>Loading...</h1>);
                } else {
                    controls.push(<button onClick={() => this.load()}>Load Data</button>);
                    if (this.state.error) {
                        controls.push(<div style={{ color: 'red', fontSize: '18px' }}>Error: {this.state.error}</div>);
                    }
                }

                return <div>{controls}</div>;
            }
        }
    }
    
    export interface State {
        plugin: Plugin.Controller,

        /**
         * This represents the JSON data returned by MOLE.
         * 
         * In a production environment (when using TypeScript),
         * it would be a good idea to write type interfaces for the
         * data to avoid bugs.
         */
        data: any
    }

    export class Data extends React.Component<State, {}> {
        render() {
            return <div>
                <Selection {...this.props} />

                <h2>Channels</h2>
                <Channels channels={this.props.data.Channels.Tunnels} {...this.props}  header='Tunnels' />
                <Channels channels={this.props.data.Channels.MergedPores} {...this.props}  header='Merged Pores' />
                <Channels channels={this.props.data.Channels.Pores} {...this.props}  header='Pores' />
                <Channels channels={this.props.data.Channels.Paths} {...this.props}  header='Paths' />
                
                <h2>Empty Space</h2>
                <Cavities cavities={[this.props.data.Cavities.Surface]} {...this.props} header='Surface' />
                <Cavities cavities={this.props.data.Cavities.Cavities} {...this.props} header='Cavities' />
                <Cavities cavities={this.props.data.Cavities.Voids} {...this.props} header='Voids' />
                
                <h2>Origins</h2>
                <Origins origins={this.props.data.Origins.User} {...this.props} label='User Specifed (optimized)' />
                <Origins origins={this.props.data.Origins.InputOrigins} {...this.props} label='User Specifed' />                
                <Origins origins={this.props.data.Origins.Computed} {...this.props} label='Computed' />
                <Origins origins={this.props.data.Origins.Database} {...this.props} label='Database' />
            </div>;
        }
    }

    export class Selection extends React.Component<State, { label?: string }> {
        state = { label: void 0 }

        private observer: Bootstrap.Rx.IDisposable | undefined = void 0;
        componentWillMount() {
            this.observer = this.props.plugin.subscribe(Bootstrap.Event.Molecule.ModelSelect, e => {
                if (!e.data) {
                    this.setState({ label: void 0})
                } else {
                    let r = e.data.residues[0];
                    this.setState({ label: `${r.name} ${r.authSeqNumber} ${r.chain.authAsymId}` });
                }
            });
        }

        componentWillUnmount() {
            if (this.observer) {
                this.observer.dispose();
                this.observer = void 0;
            }
        }

        render() {
            return <div>
                <h3>Selection</h3>  
                { !this.state.label 
                    ? <div><i>Click on atom or residue</i></div>
                    : <div>{this.state.label}</div> }
            </div>
        }
    }

    export class Section extends React.Component<{ header: string, count: number }, { isExpanded: boolean }> {
        state = { isExpanded: false }

        private toggle(e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            this.setState({ isExpanded: !this.state.isExpanded });
        }

        render() {
            return <div style={{ position: 'relative' }}>
                <h3><a href='#' onClick={e => this.toggle(e)} className='section-header'><div style={{ width: '15px', display: 'inline-block', textAlign: 'center' }}>{this.state.isExpanded ?  '-' : '+'}</div> {this.props.header} ({this.props.count})</a></h3>
                <div style={{ display: this.state.isExpanded ? 'block' : 'none' }}>{this.props.children}</div>
            </div>
        }
    }

    export class Renderable extends React.Component<{ label: string | JSX.Element, element: any, toggle: (plugin: Plugin.Controller, elements: any[], visible: boolean) => Promise<any> } & State, { }> {
        private toggle() {
            this.props.element.__isBusy = true;
            this.forceUpdate(() =>
                this.props.toggle(this.props.plugin, [this.props.element], !this.props.element.__isVisible)
                    .then(() => this.forceUpdate()).catch(() => this.forceUpdate()));
        }

        private highlight(isOn: boolean) {
            this.props.plugin.command(Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.element.__id), isOn });
        }

        render() {
            return <div>
                <label onMouseEnter={() => this.highlight(true)} onMouseLeave={() => this.highlight(false)} >
                    <input type='checkbox' checked={!!this.props.element.__isVisible} onChange={() => this.toggle()} disabled={!!this.props.element.__isBusy} /> {this.props.label}
                </label>
            </div>
        }
    }

    export class Channels extends React.Component<State & { channels: any[], header: string }, { isBusy: boolean }> {
        state = { isBusy: false }
        private show(visible: boolean) {
            for (let element of this.props.channels) { element.__isBusy = true; }
            this.setState({ isBusy: true }, () => 
                State.showChannelVisuals(this.props.plugin, this.props.channels, visible)
                    .then(() => this.setState({ isBusy: false })).catch(() => this.setState({ isBusy: false })));
        }

        render() {
            return <Section header={this.props.header} count={(this.props.channels || '').length}>
                <div className='show-all'><button onClick={() => this.show(true)} disabled={this.state.isBusy}>All</button><button onClick={() => this.show(false)} disabled={this.state.isBusy}>None</button></div>
                { this.props.channels && this.props.channels.length > 0
                    ? this.props.channels.map((c, i) => <Channel key={i} channel={c} {...this.props} />)
                    : 'None'}
            </Section>
        }
    }

    export class Channel extends React.Component<State & { channel: any }, { isVisible: boolean }> {
        state = { isVisible: false };

        render() {
            let c = this.props.channel;
            let len = c.Profile[c.Profile.length - 1].Distance;
            let bneck = c.Profile.reduce((b: number, n: any) => Math.min(b, n.Radius), Number.POSITIVE_INFINITY);
            return <Renderable label={<span><b>{c.Id + 1}</b>, {`Length: ${len} Å, Bottleneck: ${bneck} Å`}</span>} element={c} toggle={State.showChannelVisuals} {...this.props} />
        }
    }

    export class Cavities extends React.Component<State & { cavities: any[], header: string }, { isBusy: boolean }> {
        state = { isBusy: false }
        private show(visible: boolean) {
            for (let element of this.props.cavities) { element.__isBusy = true; }
            this.setState({ isBusy: true }, () => 
                State.showCavityVisuals(this.props.plugin, this.props.cavities, visible)
                    .then(() => this.setState({ isBusy: false })).catch(() => this.setState({ isBusy: false })));
        }

        render() {
            return <Section header={this.props.header} count={(this.props.cavities || '').length}>
                <div className='show-all'><button onClick={() => this.show(true)} disabled={this.state.isBusy}>All</button><button onClick={() => this.show(false)} disabled={this.state.isBusy}>None</button></div>
                { this.props.cavities && this.props.cavities.length > 0
                    ? this.props.cavities.map((c, i) => <Cavity key={i} cavity={c} {...this.props} />)
                    : 'None'}
            </Section>
        }
    }

    export class Cavity extends React.Component<State & { cavity: any }, { isVisible: boolean }> {
        state = { isVisible: false };

        render() {
            let c = this.props.cavity;
            return <div>
                <Renderable label={<span><b>{c.Id}</b>, {`Volume: ${c.Volume | 0} Å`}<sup>3</sup></span>} element={c} toggle={State.showCavityVisuals} {...this.props} />
            </div>
        }
    }

     export class Origins extends React.Component<{ label: string | JSX.Element, origins: any } & State, { }> {
        private toggle() {
            this.props.origins.__isBusy = true;
            this.forceUpdate(() =>
                State.showOriginsSurface(this.props.plugin, this.props.origins, !this.props.origins.__isVisible)
                    .then(() => this.forceUpdate()).catch(() => this.forceUpdate()));
        }

        private highlight(isOn: boolean) {
            this.props.plugin.command(Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.origins.__id), isOn });
        }

        render() {
            if (!this.props.origins.Points.length) {
                return <div style={{ display: 'none' }} />
            }

            return <div>
                <label onMouseEnter={() => this.highlight(true)} onMouseLeave={() => this.highlight(false)} >
                    <input type='checkbox' checked={!!this.props.origins.__isVisible} onChange={() => this.toggle()} disabled={!!this.props.origins.__isBusy} /> {this.props.label}
                </label>
            </div>
        }
    }

}