/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Bootstrap.Tree.Transform {
    "use strict";
    
    import Node = Tree.Node.Any;
            
    export function build() {
        return new Builder.Impl(void 0, []) as Builder;
    }
        
    export interface Builder {        
        add<A extends Node, B extends Node, P>(s: Selector<A>, t: Transformer<A, B, P>, params: P, props?: Transform.Props): Builder        
        then<C extends Node, Q>(t: Transformer<Node, C, Q>, params: Q, props?:Transform.Props): Builder
        compile(): Instance[]
    } 
    
    export namespace Builder {
        export class Impl<To extends Node> implements Builder {                                    
            add<A extends Node, B extends Node, P>(s: Selector<A>, t: Transformer<A, B, P>, params: P, props?: Transform.Props): Builder {
                let i = { selector: s, transform: t.create(params, props) };
                this.transforms.push(i);
                this.last = i;
                return new Impl<To>(i, this.transforms);
            }
            
            then<C extends Node, Q>(t: Transformer<To, C, Q>, params: Q, props?:Transform.Props): Builder {                
                if (!this.last) throw `Cannot 'then' on an empty builder`;
                let transform = t.create(params, props);
                let i = <Instance>{ selector: this.last.transform.props.ref, transform };
                this.transforms.push(i);
                return new Impl<To>(i, this.transforms);
            }
            
            compile() {
                return this.transforms;
            }
            
            constructor(public last: Instance | undefined, public transforms: Instance[]) {                
            }
        }          
    }       
}