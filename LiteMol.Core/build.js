var modularity = require('../helpers/modularity');

function build(gulp, plugins) {
    
    
    return modularity('./LiteMol.Core',  { name: 'Core', dependencies: [], priorityLib: ['promise'] }, gulp, plugins);
    
    // var tasks = modularity('./LiteMol.Core', { name: 'Core', dependencies: [] }, gulp, plugins); 
    // gulp.task('Core-base', tasks.base);
    // gulp.task('Core-assemble', ['Core-base'], tasks.assemble);
    // gulp.task('Core-cleanup', ['Core-base', 'Core-assemble'], tasks.cleanup);
    // gulp.task('Core', ['Core-base', 'Core-assemble', 'Core-cleanup']);
    // return 'Core';
} 

module.exports = build;