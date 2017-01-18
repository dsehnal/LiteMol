/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */


namespace LiteMol.Bootstrap.Components.Context {
    "use strict";
    
    export interface TaskInfo {
        name: string;
        message: string;
        abort?: () => void
    }

    export interface TasksState {
        tasks: Immutable.Map<number, TaskInfo>
    }

    export class TaskWatcher extends Component<TasksState> {
        
        private updated(state: Task.State) {
            let isWatched = state.type === this.type;
            let tasks = this.latestState.tasks!;
                        
            if (!isWatched) {
                if (tasks.has(state.taskId)) {
                    tasks = tasks.delete(state.taskId);
                    this.setState({ tasks });   
                }
                return;
            }
            
            tasks = tasks.set(state.taskId, {
                name: state.name,
                message: state.message,
                abort: state.abort
            });
            this.setState({ tasks });            
        }
        
        private started(task: Task.Info) {
            this.setState({
                tasks: this.latestState.tasks!.set(task.id, { name: task.name, message: 'Running...' })
            });
        }
        
        private completed(taskId: number) {
            if (!this.latestState.tasks!.has(taskId)) return;
            
            this.setState({
                tasks: this.latestState.tasks!.delete(taskId)
            });
        }

        constructor(context: Context, private type: Task.Type) {
            super(context, {
                tasks: Immutable.Map<number, TaskInfo>()
            });

            Event.Task.StateUpdated.getStream(this.context)
                .subscribe(e => this.updated(e.data));
                
            Event.Task.Started.getStream(this.context)
                .filter(e => e.data.type === type)
                .subscribe(e => this.started(e.data));
                
            Event.Task.Completed.getStream(this.context)
                .subscribe(e => this.completed(e.data));
        }
    }
}