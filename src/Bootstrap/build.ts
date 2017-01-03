import modularity from '../modularity'

function build(gulp, plugins) {
    return modularity('./src/Bootstrap', { 
        name: 'Bootstrap', 
        dependencies: ['Core', 'Visualization'] 
    }, gulp, plugins);
} 

export = build