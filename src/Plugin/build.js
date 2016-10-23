var modularity = require('../../helpers/modularity');

function build(gulp, plugins) {
    return modularity('./src/Plugin', { 
        name: 'Plugin', 
        include: ['Core', 'Visualization', 'Bootstrap'],
        priorityLib: ['react', 'react.min'],
        isPlugin: true,
        createDist: true
    }, gulp, plugins);
} 

module.exports = build;