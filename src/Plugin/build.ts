import modularity from '../modularity'

function build(gulp, plugins) {
    return modularity('./src/Plugin', { 
        name: 'Plugin', 
        include: ['Core', 'Visualization', 'Bootstrap'],
        priorityLib: ['react', 'react.min'],
        isPlugin: true,
        createDist: true
    }, gulp, plugins);
} 

export = build