var modularity = require('../helpers/modularity');

function build(gulp, plugins) {
    return modularity('./LiteMol.Visualization', { name: 'Visualization', dependencies: ['Core'] }, gulp, plugins); 
    // gulp.task('Visualization-base', ['Core'], tasks.base);
    // gulp.task('Visualization-assemble', ['Visualization-base'], tasks.assemble);
    // gulp.task('Visualization-cleanup', ['Visualization-base', 'Visualization-assemble'], tasks.cleanup);
    // gulp.task('Visualization', ['Visualization-base', 'Visualization-assemble', 'Visualization-cleanup']);
    // return 'Visualization';
} 

module.exports = build;