import modularity from '../modularity'

function build(gulp, plugins) {   
    return modularity('./src/Core',  { name: 'Core', dependencies: [], priorityLib: ['promise'], createDist: true }, gulp, plugins);
} 

export = build;