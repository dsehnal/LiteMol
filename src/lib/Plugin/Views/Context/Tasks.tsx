/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Plugin.Views.Context {
    "use strict";

    class TaskState extends React.Component<{ info: Bootstrap.Components.Context.TaskInfo, isSmall?: boolean }, {}> {
                
        render() {
            let info = this.props.info;
            return <div className='lm-task-state'>
                <div>
                    { info.abort ? <Controls.Button onClick={() => info.abort!.call(null) } style='remove' 
                        icon='abort' title='Abort' customClass='lm-btn-icon'
                    /> : void 0 }
                    <div>
                        {info.name}: {info.message}
                    </div>
                </div>
            </div>;                 
        }
        
    }

    export class Overlay extends View<Bootstrap.Components.Context.TaskWatcher, {}, {}> {

       render() {
            let state = this.controller.latestState;
            
            if (!state.tasks!.count()) return <div className='lm-empty-control' />
                        
             let tasks: any[] = [];
             state.tasks!.forEach((t, k) => tasks.push(<TaskState key={k} info={t!} />));
            
        //    tasks.push(<span><TaskState key={-1} info={{ message: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Ut te', name: 'occaecat ', abort: () => {} }} /><br/></span>)
        //    tasks.push(<br/>)
        //    tasks.push(<TaskState key={-2} info={{ message: 'uam metus. Duis risus. F', name: 'dsads' }} />)
        //   tasks.push(<TaskState key={-3} info={{ message: 'm dapibus fermentum ipsum. Lorem ipsum dolor', name: 'bibendum ', abort: () => {} }} />)          
           
            return <div className='lm-overlay'>
                <div className='lm-overlay-background' />
                <div className='lm-overlay-content-wrap'>
                    <div className='lm-overlay-content'>
                        <div>
                            {tasks}
                        </div>
                    </div>
                </div>
            </div>;
        }
    }
    
    export class BackgroundTasks extends View<Bootstrap.Components.Context.TaskWatcher, {}, {}> {

       render() {
            let state = this.controller.latestState;
            
            if (!state.tasks!.count()) return <div className='lm-empty-control' />
                        
            let tasks: any[] = [];
            state.tasks!.forEach((t, k) => tasks.push(<TaskState key={k} info={t!} isSmall={true} />));
           
        //    tasks.push(<TaskState key={-1} isSmall={true} info={{ message: 's diam. Vivamus luctus egestas l', name: 'bibendum ', abort: () => {} }} />)
        //    tasks.push(<TaskState key={-3} isSmall={true} info={{ message: 'ccaecat cupidatat non proid', name: 'dsadsad', abort: () => {} }} />)
        //    tasks.push(<TaskState key={-2} isSmall={true} info={{ message: 'modo dui eget wisi. Nullam sap', name: 'dsads' }} />)
           
            return <div className='lm-background-tasks'>
                {tasks}
            </div>;
        }
    }
}