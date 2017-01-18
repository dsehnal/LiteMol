/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Views.Entity {
    "use strict";
    
    export const Remove = (props: {entity: Bootstrap.Entity.Any, onRemove: () => void }) => <Controls.Button
            onClick={() => { Bootstrap.Command.Tree.RemoveNode.dispatch(props.entity.tree!.context, props.entity); props.onRemove.call(null) } } 
            style='link' icon='remove' customClass='lm-remove-entity lm-btn-icon' />
    
    export class Badge extends React.Component<{ type: Bootstrap.Entity.TypeInfo }, {}> { 
        
        shouldComponentUpdate(nextProps: { type: Bootstrap.Entity.TypeInfo }, nextState: {}, nextContext: any) {
            return this.props.type !== nextProps.type;
        }
        
        private part(name: string, i: number, t:number, ret: any[]) {
            switch (t) {
                case 0: ret.push(<span>{name.substr(0, i)}</span>); return ret;
                case 1: ret.push(<sub>{name.substr(0, i)}</sub>); return ret;
                default: ret.push(<sup>{name.substr(0, i)}</sup>); return ret;
            }
        }
        
        private split(name: string, type: number, ret: any[]) {
            
            if (!name.length) return;            
            for (let i = 0; i < name.length; i++) {
                if (name[i] === '_') {
                    this.split(name.substr(i + 1), 1, this.part(name, i, type, ret));
                    return;
                } else if (name[i] === '^') {
                    this.split(name.substr(i + 1), 2, this.part(name, i, type, ret));
                    return;
                }
            }
            this.part(name, name.length, type, ret);
        }
        
        private createBadge(name: string): any {
            let b:any[] = [];
            this.split(name, 0, b);
            return b;
        } 
                 
        render() {
            
            let type = this.props.type;            
            return <div className={'lm-entity-badge lm-entity-badge-' + this.props.type.typeClass} title={type.name}>
                <div>
                    {type === Bootstrap.Entity.Root.info ? void 0 : this.createBadge(type.shortName)}
                </div>
            </div>;
        }
    }
    
    export class CurrentEntityControl extends View<Plugin.Components.AppInfo, { current?: Bootstrap.Entity.Any }, {}> {
        
        state: { current?: Bootstrap.Entity.Any } = { current: void 0 }
        
        componentWillMount() {
            super.componentWillMount();
            this.state.current = this.controller.context.currentEntity;
            this.subscribe(Bootstrap.Event.Entity.CurrentChanged.getStream(this.controller.context), e => {
                this.setState({ current: e.data })
            });
        }
                
        render() {
            if (!this.state.current) {
                return <div className='lm-entity-info'>
                    <div><span>{this.controller.appName}</span></div>
                </div>;
            }
                    //<div>{this.controller.appVersion}</div> 
                        
            let entity = this.state.current;
                        
            return <div className='lm-entity-info' title={`${entity.props.label} ${entity.props.description ? entity.props.description : '' }`}>
                <div><Badge type={entity.type.info} /> 
                    <span>{entity.props.label}<span>{entity.props.description}</span></span>
                    {  entity.parent === entity && !entity.children.length ? void 0 : <Remove entity={entity} onRemove={() => this.forceUpdate()} /> }
                </div>
            </div>;
                //<div>{entity.props.label}<span>{entity.props.description}</span></div>             
        }
    }
    
    export namespace SplashInfo {
    
        export const General = () =>
            <div className='lm-entity-splash-general'>
                <div />
                <span className='lm-icon lm-icon-info'/>
                The application operates on an entity tree structure that can be manipulated using the controls on the panel to the right.  
            </div>     
            
        
        class ClassInfo extends React.Component<{ cls: string, desc: string }, { isExpanded: boolean }> { 
        
            state = { isExpanded: false }
        //onClick={() => this.setState({isExpanded: !this.state.isExpanded} )}
        //onMouseEnter={() => this.setState({isExpanded: true} )} onMouseLeave={() => this.setState({isExpanded: false} )}
            render() {
                return <div className={'lm-entity-splash-class lm-entity-splash-class-' + (this.state.isExpanded ? 'expanded' : 'collapsed' ) }>
                    <div onClick={() => this.setState({isExpanded: !this.state.isExpanded} )} ><div /><div className={'lm-entity-badge-' + this.props.cls } /> <span>{this.props.cls}</span></div>
                    <div>{this.props.desc}</div>
                </div>
            }
        }
            
        export const Info = () => 
            <div className='lm-entity-splash'>
                <General />                
                <ClassInfo cls='Root'       desc='The root entity represents the starting point of all actions.' />
                <ClassInfo cls='Action'     desc='Represents a composition of one of more changes to the entity tree.' />
                <ClassInfo cls='Data'       desc='Low level data, for example a string or a CIF dictionary.' />
                <ClassInfo cls='Object'     desc='A more complex structure obtained from low level data. For example a molecule.' />
                <ClassInfo cls='Visual'     desc='A visual representation of an object.' />
                <ClassInfo cls='Selection'  desc='A description of a substructure of an object or a visual.' />
                <ClassInfo cls='Behaviour'  desc='Represents a dynamic behavior of the program. For example creating electron density surface when the selection changes.' />
                <ClassInfo cls='Group'      desc='A collection of related entities.' />
            </div>
    }    

    
}
