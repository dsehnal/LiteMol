import modularity from '../modularity'

function build(gulp, plugins) {
    return modularity('./src/Visualization', { name: 'Visualization', dependencies: ['Core'] }, gulp, plugins); 
} 

export = build