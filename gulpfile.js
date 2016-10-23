var gulp = require('gulp'),
    plugins = {
        concat: require('gulp-concat'),
        rename: require('gulp-rename'),
        replace: require('gulp-replace'),
        ts: require('gulp-typescript'),
        merge: require('merge2'),
        clean: require('gulp-clean'),
        insert: require('gulp-insert'),
        unique: require('gulp-unique-files'),
        sass: require('gulp-sass'),
        uglify: require('gulp-uglify'),
        tsc: require('typescript')
    };

function build(name) {
    return require(`./src/${name}/build`)(gulp, plugins);
}

function buildts(root) {
    var project = plugins.ts.createProject(root + '/tsconfig.json', { typescript: plugins.tsc });
    var b = project.src().pipe(plugins.ts(project));    
    return b.js.pipe(gulp.dest(root));
}

function CSS(minify) {
    var affixes = ['', '-light', '-blue'];

    return affixes.map(f => gulp.src(['./src/Plugin/Skin/LiteMol-plugin' + f + '.scss'])
        .pipe(plugins.sass({ outputStyle: minify ? 'compressed' : void 0 }).on('error', plugins.sass.logError))
        .pipe(plugins.rename('LiteMol-plugin' + f + (minify ? '.min' : '') + '.css'))
        .pipe(gulp.dest('./dist/css')));
}

function Uglify() {
    var plugin =  gulp.src(['./dist/LiteMol-plugin.js'])
        .pipe(plugins.uglify())
        .pipe(plugins.rename('LiteMol-plugin.min.js'))
        .pipe(gulp.dest('./dist'));

    var core = gulp.src(['./dist/LiteMol-core.js'])
        .pipe(plugins.uglify())
        .pipe(plugins.rename('LiteMol-core.min.js'))
        .pipe(gulp.dest('./dist'));

   
    return plugins.merge(CSS(true).concat([plugin, core]));
}

function ViewerAndExamples() {       
   console.log('Building Viewer and Examples');
   
   return plugins.merge([
      buildts('./src/Viewer'),
      buildts('./examples/Commands'),
      buildts('./examples/CustomControls'),
      buildts('./examples/CustomDensity'),
      buildts('./examples/SplitSurface'),
      buildts('./examples/BinaryCIFInspect'),
   ]);    
}

function Web() {
    console.log('Building Web');

    var viewer = gulp.src(['./src/Viewer/**/*']).pipe(gulp.dest('./web/Viewer'));
    var examples = gulp.src(['./examples/**/*']).pipe(gulp.dest('./web/Examples'));
    var css = gulp.src(['./dist/css/*']).pipe(gulp.dest('./web/assets/css'));
    var fonts = gulp.src(['./dist/fonts/*']).pipe(gulp.dest('./web/assets/fonts'));
    var js = gulp.src(['./dist/*.js']).pipe(gulp.dest('./web/assets/js'));

    return plugins.merge([
        viewer,
        examples,
        css,
        fonts,
        js
    ]);
}

function WebAssets() {
    var css = gulp.src(['./web/src/css/bootstrap.min.css', './web/src/css/style.css', './web/src/css/animate.min.css', './web/src/css/font-awesome.min.css'])
        .pipe(plugins.concat('web.css'))
        .pipe(gulp.dest('./web/assets/css'));

    var js = gulp.src(['./web/src/js/jquery-2.1.0.min.js', './web/src/js/bootstrap.min.js', './web/src/js/blocs.min.js', './web/src/js/chart.min.js', './web/src/js/data.js'])
        .pipe(plugins.concat('web.js'))
        .pipe(gulp.dest('./web/assets/js'));

    return plugins.merge([
        css,
        js
    ]);
}

gulp.task('Asset-versions', [], function() {
    var viewer = gulp.src(['./src/Viewer/**/*.html'])
        .pipe(plugins.replace(/lmversion=[0-9]+/g, function (s) {
            var v = (+s.match(/lmversion=([0-9]+)/)[1]) + 1;
            return 'lmversion=' + v;
        })) 
        .pipe(gulp.dest('./src/Viewer'));

    var examples = gulp.src(['./examples/**/*.html'])
        .pipe(plugins.replace(/lmversion=[0-9]+/g, function (s) {
            var v = (+s.match(/lmversion=([0-9]+)/)[1]) + 1;
            return 'lmversion=' + v;
        })) 
        .pipe(gulp.dest('./examples'));

    var web = gulp.src(['./web/index.html'])
        .pipe(plugins.replace(/lmversion=[0-9]+/g, function (s) {
            var v = (+s.match(/lmversion=([0-9]+)/)[1]) + 1;
            return 'lmversion=' + v;
        })) 
        .pipe(gulp.dest('./web'))
    
    return plugins.merge([
        viewer,
        examples,
        web
    ]);
});

gulp.task('Clean-min', [], function () {
    return gulp.src(['./dist/*.min.js', './dist/css/*.min.css']).pipe(plugins.clean());
})

gulp.task('CSS', [], function () { return CSS(false); });
gulp.task('CSS-min', [], function () { return CSS(true); });
gulp.task('ViewerAndExamples', [], ViewerAndExamples)
gulp.task('ViewerAndExamples-inline', ['Plugin'], ViewerAndExamples)

gulp.task('Web-assets', [], WebAssets)
gulp.task('Web', ['Web-assets'], Web);
gulp.task('Web-inline', ['ViewerAndExamples-inline', 'ViewerAndExamples-inline', 'Asset-versions', 'CSS', 'Web-assets'], Web);

gulp.task('Dist-min', [], Uglify);

gulp.task('default', [
    'Clean-min',
    build('Core'), 
    build('Visualization'),
    build('Bootstrap'),
    build('Plugin'),
    'ViewerAndExamples-inline',
    'Asset-versions',
    'CSS',
    'Web-inline'
], function () {
    console.log('Done');
});