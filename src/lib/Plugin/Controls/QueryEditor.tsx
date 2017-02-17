/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Controls {
    "use strict";
    
    
    export function QueryEditor(props: {
        value: string,
        onChange: (v: string) => void,
        onEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    }) {
        return <div className='lm-control-row'>
            <TextBox placeholder='Enter query...' onChange={props.onChange} value={props.value} onKeyPress={(e) => {
                if (isEnter(e) && props.onEnter) props.onEnter.call(null, e)  
            } }  />
        </div>;
    }
}