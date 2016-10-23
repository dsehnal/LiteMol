var modularity = require('../../helpers/modularity');

function build(gulp, plugins) {   
    return modularity('./src/Core',  { name: 'Core', dependencies: [], priorityLib: ['promise'], createDist: true }, gulp, plugins);
} 

module.exports = build;