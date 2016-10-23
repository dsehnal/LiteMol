var modularity = require('../../helpers/modularity');

function build(gulp, plugins) {
    return modularity('./src/Bootstrap', { 
        name: 'Bootstrap', 
        dependencies: ['Core', 'Visualization'] 
    }, gulp, plugins);
} 

module.exports = build;