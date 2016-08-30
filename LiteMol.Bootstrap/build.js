var modularity = require('../helpers/modularity');

function build(gulp, plugins) {
    return modularity('./LiteMol.Bootstrap', { 
        name: 'Bootstrap', 
        dependencies: ['Core', 'Visualization'] 
    }, gulp, plugins);
     
    // // gulp.task('Bootstrap-base', ['Core', 'Visualization'], tasks.base);
    // // gulp.task('Bootstrap-assemble', ['Bootstrap-base'], tasks.assemble);
    // // gulp.task('Bootstrap-cleanup', ['Bootstrap-base', 'Bootstrap-assemble'], tasks.cleanup);
    // // gulp.task('Bootstrap', ['Bootstrap-base', 'Bootstrap-assemble', 'Bootstrap-cleanup']);
    // // return 'Bootstrap';
} 

module.exports = build;