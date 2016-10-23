var modularity = require('../../helpers/modularity');

function build(gulp, plugins) {
    return modularity('./src/Visualization', { name: 'Visualization', dependencies: ['Core'] }, gulp, plugins); 
} 

module.exports = build;