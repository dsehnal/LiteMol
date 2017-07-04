import * as fs from 'fs'
import * as gulp from 'gulp'
import compilets from './src/helpers/Compile'

function plugin(name: string) {
    let cached: any;
    return function() {
        if (cached) return cached;
        cached = require(name);
        return cached;
    }
}

const plugins = {
    concat: plugin('gulp-concat'),
    rename: plugin('gulp-rename'),
    replace: plugin('gulp-replace'),
    merge: plugin('merge2'),
    clean: plugin('gulp-clean'),
    insert: plugin('gulp-insert'),
    sass: plugin('gulp-sass'),
    uglify: plugin('gulp-uglify'),
    tar: plugin('gulp-tar'),
    gzip: plugin('gulp-gzip'),
    typedoc: plugin('gulp-typedoc')
};

const PluginTask = require(`./src/helpers/build-plugin`)(gulp, plugins);
const CoreTask = require(`./src/helpers/build-core`)(gulp, plugins);

function buildExample(name) {
    return compilets({ project: `./examples/${name}/tsconfig.json`, out: `./build/examples/${name}/LiteMol-example.js` });
}

function BuildCSS(minify: boolean) {
    var affixes = ['', '-light', '-blue'];

    return affixes.map(f => gulp.src(['./src/lib/Plugin/Skin/LiteMol-plugin' + f + '.scss'])
        .pipe(plugins.sass()({ outputStyle: minify ? 'compressed' : void 0 }).on('error', plugins.sass().logError))
        .pipe(plugins.rename()('LiteMol-plugin' + f + (minify ? '.min' : '') + '.css'))
        .pipe(gulp.dest('./dist/css')));
}

function Uglify() {
    var plugin =  gulp.src(['./dist/js/LiteMol-plugin.js'])
        .pipe(plugins.uglify()({compress: false, preserveComments: 'license' }))
        .pipe(plugins.rename()('LiteMol-plugin.min.js'))
        .pipe(gulp.dest('./dist/js'));

    var core = gulp.src(['./dist/js/LiteMol-core.js'])
        .pipe(plugins.uglify()({compress: false, preserveComments: 'license' }))
        .pipe(plugins.rename()('LiteMol-core.min.js'))
        .pipe(gulp.dest('./dist/js'));

    var viewer = gulp.src(['./build/Viewer/LiteMol-viewer.js'])
        .pipe(plugins.uglify()({compress: false, preserveComments: 'license' }))
        .pipe(plugins.rename()('LiteMol-viewer.min.js'))
        .pipe(gulp.dest('./build/web/Viewer'))
        .pipe(gulp.dest('./dist/js'));

    var viewerCopy = gulp.src(['./build/Viewer/LiteMol-viewer.js', './build/Viewer/LiteMol-viewer.d.ts'])
        .pipe(gulp.dest('./dist/js'));

    return plugins.merge()(BuildCSS(true).concat([plugin, core, viewer, viewerCopy]));
}

function MinAssets() {
    var assetsJs = gulp.src(['./dist/js/*.min.js']).pipe(gulp.dest('./build/web/assets/js'));
    var assetsCss = gulp.src(['./dist/css/*.min.css']).pipe(gulp.dest('./build/web/assets/css'));
    return plugins.merge()([assetsJs, assetsCss]);
}

var ExampleNames = [
    'Commands',
    'CustomControls',
    'CustomDensity',
    'SplitSurface',
    'SimpleController',
    'BinaryCIFInspect',
    'Transforms',
    'Channels',
    'PrimitivesAndLabels',
    'AngularExample'
];

var ViewerAndExamplesTasks = [];

gulp.task('Start-ExamplesAndViewer', [], function() { console.log('Building Viewer and Examples'); });
gulp.task('Start-ExamplesAndViewer-inline', ['Plugin'], function() { console.log('Building Viewer and Examples'); });
gulp.task('Viewer', ['Start-ExamplesAndViewer'], function() { return compilets({ project: `./src/Viewer/tsconfig.json`, out: `./build/Viewer/LiteMol-viewer.js` }); });
gulp.task('Viewer-inline', ['Start-ExamplesAndViewer-inline', 'Plugin'], function() { return compilets({ project: `./src/Viewer/tsconfig.json`, out: `./build/Viewer/LiteMol-viewer.js` }); });
gulp.task('Example-BasicNode', ['Start-ExamplesAndViewer'], function() { return compilets({ project: `./examples/BasicNode/tsconfig.json`, outDir: `./build/examples/BasicNode` }); });
gulp.task('Example-BasicNode-inline', ['Start-ExamplesAndViewer-inline', 'Plugin'], function() { return compilets({ project: `./examples/BasicNode/tsconfig.json`, outDir: `./build/examples/BasicNode` }); });

ViewerAndExamplesTasks.push('Viewer', 'Example-BasicNode');

ExampleNames.forEach(e => {
    gulp.task('Example-' + e, ['Start-ExamplesAndViewer'], function() { return buildExample(e) });
    gulp.task('Example-' + e + '-inline', ['Start-ExamplesAndViewer-inline', 'Plugin'], function() { return buildExample(e) });
    ViewerAndExamplesTasks.push('Example-' + e);
});

function __webAssets() {
    var css = gulp.src(['./web/src/css/bootstrap.min.css', './web/src/css/style.css', './web/src/css/animate.min.css', './web/src/css/font-awesome.min.css'])
        .pipe(plugins.concat()('web.css'))
        .pipe(gulp.dest('./build/web/assets/css'));

    var js = gulp.src(['./web/src/js/jquery-2.1.0.min.js', './web/src/js/bootstrap.min.js', './web/src/js/blocs.min.js', './web/src/js/chart.min.js', './web/src/js/data.js'])
        .pipe(plugins.concat()('web.js'))
        .pipe(gulp.dest('./build/web/assets/js'));

    return plugins.merge()([
        css,
        js
    ]);
}

function __webPluginAssets() {
    var css = gulp.src(['./dist/css/*']).pipe(gulp.dest('./build/web/assets/css'));
    var fonts = gulp.src(['./dist/fonts/*']).pipe(gulp.dest('./build/web/assets/fonts'));
    var js = gulp.src(['./dist/js/*.js']).pipe(gulp.dest('./build/web/assets/js'));

    return plugins.merge()([css, fonts, js]);
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
    return plugins.merge()([
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
        .pipe(plugins.replace()(/lmversion=[0-9]+/g, function (s) {
            //var v = (+s.match(/lmversion=([0-9]+)/)[1]) + 1;
            return 'lmversion=' + versionStamp;
        })) 
        .pipe(gulp.dest('./build/web'));
}

function PackageVersion() {
    var version = fs.readFileSync('VERSION', 'UTF-8');
    var json = JSON.parse(fs.readFileSync('package.json', 'UTF-8'));
    json.version = version;
    fs.writeFileSync('package.json', JSON.stringify(json, null, 2), { encoding: 'UTF-8' });

    var readme = fs.readFileSync('README.md', 'UTF-8');
    var regex = /\!\[Version\]\(([^\(\)]+)\)/;
    var rmVer = '![Version](https://img.shields.io/badge/Version-' + version.replace('-', '_') + '-blue.svg?style=flat)';
    readme = readme.replace(regex, rmVer);
    fs.writeFileSync('README.md', readme, { encoding: 'UTF-8' });
}

gulp.task('PackageVersion', [], PackageVersion);

gulp.task('Clean', [], function () {
    return gulp
        .src([
            './dist/js/*.js', './dist/js/*.d.ts', './dist/css/*.css',
            './build'
        ], { read: false })
        .pipe(plugins.clean()());
});

gulp.task('Docs-clean', function() {
    return gulp.src('./build/docs', { read: false }).pipe(plugins.clean()());
})

gulp.task('Docs-generate', ['Docs-clean'], function() {
    return gulp
        .src(['./src/lib/**/*.ts', './src/lib/**/*.tsx',
            '!./src/lib/Core/Module.ts', '!./src/lib/Plugin/Module.ts'])
        .pipe(plugins.typedoc()({
            module: 'commonjs',
            target: 'es6',
            out: './build/docs/',
            name: 'LiteMol',
            mode: 'file',
            jsx: 'react',
            readme: 'none',
            ignoreCompilerErrors: true,
            suppressExcessPropertyErrors: true
        }));
    ;
});

gulp.task('Docs-pack', ['Docs-generate'], function() {
    return gulp
        .src(['./build/docs/**/*'], { base: './build/docs' })
        .pipe(plugins.tar()('docs.tar'))
        .pipe(plugins.gzip()())
        .pipe(gulp.dest('./build/docs'));
    ;
});

gulp.task('Docs', ['Docs-pack'], function() { });

gulp.task('CSS', ['Clean'], function () { return BuildCSS(false); });
gulp.task('CSS-min', ['Clean'], function () { return BuildCSS(true); });
gulp.task('ViewerAndExamples', ViewerAndExamplesTasks, function() { })
gulp.task('ViewerAndExamples-inline', ViewerAndExamplesTasks.map(t => t + '-inline'), function() { })

gulp.task('Web-assemble', [], WebAssemble);
gulp.task('Web-assemble-inline', ['Plugin', 'CSS', 'ViewerAndExamples-inline'], WebAssemble);
gulp.task('Web-inline', ['Web-assemble-inline'], WebVersions);

gulp.task('Dist-uglify', [], Uglify);
gulp.task('Dist-min', ['Dist-uglify'], MinAssets);

gulp.task('No-examples', [
    'Clean',
    CoreTask,
    PluginTask,
    'Viewer-inline',
    'CSS',
    'Web-inline',
    'PackageVersion'
], function () {
    console.log('Done');
});

gulp.task('default', [
    'Clean',
    CoreTask,
    PluginTask,
    'ViewerAndExamples-inline',
    'CSS',
    'Web-inline',
    'PackageVersion'
], function () {
    console.log('Done');
});