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
        tsc: require('typescript'),
        tar: require('gulp-tar'),
        gzip: require('gulp-gzip'),
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

function Tarball() {
    var pjson = require('./package.json');
    var version = pjson.version;
    var archive = `LiteMol-dist-${version}.tar`;
    console.log(`Creating Tarball './dist/${archive}.gz'`);
    var tarball = gulp.src(['./dist/*.js', './dist/css/*.css', './dist/fonts/*'], { base: './dist' } )
        .pipe(plugins.tar(archive))
        .pipe(plugins.gzip())
        .pipe(gulp.dest('./dist'));

    return tarball;
}

function ViewerAndExamples() {
   console.log('Building Viewer and Examples');

   return plugins.merge([
      buildts('./src/Viewer'),
      buildts('./examples/Commands'),
      buildts('./examples/CustomControls'),
      buildts('./examples/CustomDensity'),
      buildts('./examples/SplitSurface'),
      buildts('./examples/SimpleController'),
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

// this "randomizes" the ?lmversion=X in script and css links to prevent caching of old scripts in the browser
var versionStamp = (+new Date()).toString();
function WebVersions() {
    return gulp.src(['./web/**/*.html'])
        .pipe(plugins.replace(/lmversion=[0-9]+/g, function (s) {
            //var v = (+s.match(/lmversion=([0-9]+)/)[1]) + 1;
            return 'lmversion=' + versionStamp;
        }))
        .pipe(gulp.dest('./web'));
}

gulp.task('Clean-min', [], function () {
    return gulp.src(['./dist/*.min.js', './dist/css/*.min.css']).pipe(plugins.clean());
})

gulp.task('CSS', [], function () { return CSS(false); });
gulp.task('CSS-min', [], function () { return CSS(true); });
gulp.task('ViewerAndExamples', [], ViewerAndExamples)
gulp.task('ViewerAndExamples-inline', ['Plugin'], ViewerAndExamples)

gulp.task('Web-assets', [], WebAssets)
gulp.task('Web-base', [], Web);
gulp.task('Web-base-inline', ['Plugin'], Web);

gulp.task('Web', ['Web-assets', 'Web-base'], WebVersions);
gulp.task('Web-inline', ['ViewerAndExamples-inline', 'CSS', 'Web-assets', 'Web-base-inline'], WebVersions);

gulp.task('Dist-min', [], Uglify);

gulp.task('Dist-tarball', ['Dist-min'], Tarball);

gulp.task('default', [
    'Clean-min',
    build('Core'),
    build('Visualization'),
    build('Bootstrap'),
    build('Plugin'),
    'ViewerAndExamples-inline',
    'CSS',
    'Web-inline'
], function () {
    console.log('Done');
});
