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
        typedoc: require('gulp-typedoc')
    };

function build(name) {
    return require(`./src/${name}/build`)(gulp, plugins);
}

function buildts(root, out) {
    var project = plugins.ts.createProject(root + '/tsconfig.json', { typescript: plugins.tsc });
    var b = project.src().pipe(project());    
    return b.js.pipe(gulp.dest(out ? out : root));
}

function buildExample(name) {
    return buildts('./examples/' + name, './build/examples/' + name);
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

function Viewer() {
    console.log('Building Viewer');
    return buildts('./src/Viewer');
}

var ExampleNames = [
    'Commands',
    'CustomControls',
    'CustomDensity',
    'SplitSurface',
    'SimpleController',
    'BinaryCIFInspect',
    'Transforms',
    'Channels'
];

function ViewerAndExamples() {       
   console.log('Building Viewer and Examples');   
   return plugins.merge([buildts('./src/Viewer', './build/Viewer')].concat(ExampleNames.map(e => buildExample(e))));    
}

function __webAssets() {
    var css = gulp.src(['./web/src/css/bootstrap.min.css', './web/src/css/style.css', './web/src/css/animate.min.css', './web/src/css/font-awesome.min.css'])
        .pipe(plugins.concat('web.css'))
        .pipe(gulp.dest('./build/web/assets/css'));

    var js = gulp.src(['./web/src/js/jquery-2.1.0.min.js', './web/src/js/bootstrap.min.js', './web/src/js/blocs.min.js', './web/src/js/chart.min.js', './web/src/js/data.js'])
        .pipe(plugins.concat('web.js'))
        .pipe(gulp.dest('./build/web/assets/js'));

    return plugins.merge([
        css,
        js
    ]);
}

function __webPluginAssets() {
    var css = gulp.src(['./dist/css/*']).pipe(gulp.dest('./build/web/assets/css'));
    var fonts = gulp.src(['./dist/fonts/*']).pipe(gulp.dest('./build/web/assets/fonts'));
    var js = gulp.src(['./dist/*.js']).pipe(gulp.dest('./build/web/assets/js'));

    return plugins.merge([css, fonts, js]);
}

function __webBase() {
    return gulp.src(['./web/**/*', '!./web/src/**/*']).pipe(gulp.dest('./build/web'));
}

function __webViewer() {
    return gulp.src(['./src/Viewer/*', './build/Viewer/*']).pipe(gulp.dest('./build/web/Viewer'));
}

function __webExample(name) {
    return gulp.src([
        './examples/' + name + '/*', 
        '!./examples/' + name + '/tsconfig.json', 
        '!./examples/' + name + '/src', 
        './build/examples/' + name + '/*']).pipe(gulp.dest('./build/web/Examples/' + name));
}

function WebAssemble() {
    return plugins.merge([
        __webBase(),
        __webPluginAssets(),
        __webAssets(),
        __webViewer(),
    ].concat(ExampleNames.map(e => __webExample(e))));
}

// this 'randomizes' the ?lmversion=X in script and css links to prevent caching of old scripts in the browser
var versionStamp = (+new Date()).toString();
function WebVersions() {
    return gulp.src(['./build/web/**/*.html'])
        .pipe(plugins.replace(/lmversion=[0-9]+/g, function (s) {
            //var v = (+s.match(/lmversion=([0-9]+)/)[1]) + 1;
            return 'lmversion=' + versionStamp;
        })) 
        .pipe(gulp.dest('./build/web'));
}

// function Tarball() {
//     console.log('Creating Tarbal');
//     var tarball = gulp.src(['./dist/*.js', './dist/css/*.css', './dist/fonts/*'], { base: './dist' } )
//         .pipe(plugins.tar('LiteMol.tar'))
//         .pipe(plugins.gzip())
//         .pipe(gulp.dest('./dist'));

//     return tarball;
// }

gulp.task('Clean', [], function () {
    return gulp
        .src([
            './dist/*.min.js', './dist/css/*.min.css',
            './build'
        ], { read: false })
        .pipe(plugins.clean());
});

gulp.task('Docs-clean', function() {
    return gulp.src('./build/docs', { read: false }).pipe(plugins.clean());
})

gulp.task('Docs-generate', ['Docs-clean'], function() {
    return gulp
        .src(['./src/**/*.ts', './src/**/*.tsx', '!./src/**/Module.ts'])
        .pipe(plugins.typedoc({
            module: 'commonjs',
            target: 'es5',
            out: './build/docs/',
            name: 'LiteMol',
            mode: 'file',
            jsx: 'react',
            readme: 'none',
            ignoreCompilerErrors: true
        }));
    ;
});

gulp.task('Docs-pack', ['Docs-generate'], function() {
    return gulp
        .src(['./build/docs/**/*'], { base: './build/docs' })
        .pipe(plugins.tar('docs.tar'))
        .pipe(plugins.gzip())
        .pipe(gulp.dest('./build/docs'));
    ;
});

gulp.task('Docs', ['Docs-pack'], function() { });

gulp.task('Viewer', [], Viewer);

gulp.task('CSS', ['Clean'], function () { return CSS(false); });
gulp.task('CSS-min', ['Clean'], function () { return CSS(true); });
gulp.task('ViewerAndExamples', [], ViewerAndExamples)
gulp.task('ViewerAndExamples-inline', ['Plugin'], ViewerAndExamples)

gulp.task('Web-assemble', [], WebAssemble);
gulp.task('Web-assemble-inline', ['Plugin', 'CSS', 'ViewerAndExamples-inline'], WebAssemble);
gulp.task('Web-inline', ['Web-assemble-inline'], WebVersions);

gulp.task('Web-assemble-plugin', ['Plugin', 'CSS'], WebAssemble);
gulp.task('Plugin-web', ['Web-assemble-plugin'], WebVersions);

gulp.task('Dist-min', [], Uglify);

gulp.task('default', [
    'Clean',
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