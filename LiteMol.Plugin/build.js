var modularity = require('../helpers/modularity');

function build(gulp, plugins) {
    return modularity('./LiteMol.Plugin', { 
        name: 'Plugin', 
        include: ['Core', 'Visualization', 'Bootstrap'],
        priorityLib: ['react', 'react.min'],
        isPlugin: true
    }, gulp, plugins);
} 

module.exports = build;