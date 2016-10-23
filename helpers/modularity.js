"use strict";
function createPre(spec) {
    var ret = [
        ("\n; var __LiteMol_" + spec.name + " = function (" + spec.dependencies.map(function (d) { return ("__LiteMol_" + d); }).join(', ') + ") {"),
        "  'use strict';"
    ];
    if (spec.dependencies.length) {
        var modules = "var LiteMol = { " + spec.dependencies.map(function (d) { return (d + ": __LiteMol_" + d); }) + " };";
        ret.push("var LiteMol = { " + spec.dependencies.map(function (d) { return (d + ": __LiteMol_" + d); }) + " };");
    }
    return ret.join('\n') + '\n';
}
function createPost(spec) {
    var ret = [];
    if (spec.isPlugin)
        ret.push("  return LiteMol;");
    else
        ret.push("  return LiteMol." + spec.name + ";");
    ret.push("}");
    var req = spec.dependencies.map(function (d) { return ("require(LiteMol-" + d.toLowerCase() + ")"); }).join(', ');
    var reqWin = spec.dependencies.map(function (d) { return ("__target.LiteMol." + d); }).join(', ');
    var reqCheck = spec.dependencies.map(function (d) { return ("!__target.LiteMol." + d); }).join(' || ');
    // commonjs
    ret.push("if (typeof module === 'object' && typeof module.exports === 'object') {");
    ret.push("  module.exports = __LiteMol_" + spec.name + "(" + req + ");");
    // amd
    ret.push("} else if (typeof define === 'function' && define.amd) {");
    ret.push("  define(['require'], function(require) { return __LiteMol_" + spec.name + "(" + req + "); })");
    // global
    ret.push("} else {");
    ret.push("  var __target = !!window ? window : this;");
    if (spec.dependencies.length) {
        ret.push("  if (!__target.LiteMol || " + reqCheck + " ) {");
        ret.push("    console.error(\"LiteMol-" + spec.dependencies.map(function (d) { return d.toLowerCase(); }).join('/') + " must be included before LiteMol-" + spec.name.toLowerCase + ".\");");
        ret.push("    throw 'LiteMol loader error.';");
        ret.push("  }");
    }
    if (spec.isPlugin) {
        ret.push("  __target.LiteMol = __LiteMol_" + spec.name + "(" + reqWin + ");");
    }
    else {
        ret.push("  if (!__target.LiteMol) __target.LiteMol = {};");
        ret.push("  __target.LiteMol." + spec.name + " = __LiteMol_" + spec.name + "(" + reqWin + ");");
    }
    ret.push("}");
    return ret.join('\n') + '\n\n';
}
function createInfo(spec) {
    return {
        pre: createPre(spec),
        post: createPost(spec),
        ts: spec.excludeDtsRefs ? '' : '' //spec.dependencies.map(d => `/// <reference path="LiteMol-${d.toLowerCase()}.d.ts" />`).join('\n') + '\n'
    };
}
function base(root, gulp, plugins) {
    return function () {
        var project = plugins.ts.createProject(root + '/tsconfig.json', { typescript: plugins.tsc });
        var b = project.src().pipe(plugins.ts(project));
        return plugins.merge([
            b.js.pipe(gulp.dest('./build')),
            b.dts.pipe(gulp.dest('./build'))
        ]);
    };
}
function assemble(root, spec, gulp, plugins) {
    return function () {
        var info = createInfo(spec);
        var include = (spec.include || []).map(function (i) { return ("./build/LiteMol-" + i.toLowerCase()); });
        var js = gulp
            .src((spec.priorityLib || [])
            .map(function (l) { return (root + "/lib/" + l + ".js"); })
            .concat(include.map(function (i) { return i + '.js'; }))
            .concat([(root + "/lib/*.js"), ("./build/LiteMol-" + spec.name.toLowerCase() + "-temp.js")]))
            .pipe(plugins.unique())
            .pipe(plugins.concat("LiteMol-" + spec.name.toLowerCase() + ".js"));
        var jsMod = gulp
            .src((spec.priorityLib || [])
            .map(function (l) { return (root + "/lib/" + l + ".js"); })
            .concat(include.map(function (i) { return i + '.js'; }))
            .concat([(root + "/lib/*.js"), ("./build/LiteMol-" + spec.name.toLowerCase() + "-temp.js")]))
            .pipe(plugins.unique())
            .pipe(plugins.concat("LiteMol-" + spec.name.toLowerCase() + ".js"))
            .pipe(plugins.insert.prepend(info.pre))
            .pipe(plugins.insert.append(info.post));
        var dts = gulp
            .src([(root + "/lib/*.d.ts"), ("./build/LiteMol-" + spec.name.toLowerCase() + "-temp.d.ts")]
            .concat(include.map(function (i) { return i + '.d.ts'; })))
            .pipe(plugins.concat("LiteMol-" + spec.name.toLowerCase() + ".d.ts"))
            .pipe(plugins.insert.prepend(info.ts));
        if (spec.createDist) {
            return plugins.merge([
                js.pipe(gulp.dest('./build')),
                jsMod.pipe(gulp.dest('./dist')),
                dts.pipe(gulp.dest('./dist')),
                dts.pipe(gulp.dest('./build'))]);
        }
        return plugins.merge([
            js.pipe(gulp.dest('./build')),
            dts.pipe(gulp.dest('./build'))]);
    };
}
function cleanup(spec, gulp, plugins) {
    return function () {
        return gulp
            .src([("./build/LiteMol-" + spec.name.toLowerCase() + "-temp.*")])
            .pipe(plugins.clean());
    };
}
function buildModule(root, spec, gulp, plugins) {
    return {
        base: base(root, gulp, plugins),
        assemble: assemble(root, spec, gulp, plugins),
        cleanup: cleanup(spec, gulp, plugins)
    };
}
function build(root, spec, gulp, plugins) {
    if (!spec.dependencies)
        spec.dependencies = [];
    if (!spec.priorityLib)
        spec.priorityLib = [];
    if (!spec.include)
        spec.include = [];
    var tasks = buildModule(root, spec, gulp, plugins);
    var base = spec.name + "-base";
    var assemble = spec.name + "-assemble";
    var cleanup = spec.name + "-cleanup";
    var deps = spec.dependencies.concat(spec.include);
    gulp.task(base, deps, function () {
        console.log("Building " + spec.name);
        return tasks.base();
    });
    gulp.task(assemble, [base], tasks.assemble);
    gulp.task(cleanup, [base, assemble], tasks.cleanup);
    gulp.task(spec.name, deps.concat([base, assemble, cleanup]));
    gulp.task(base + '-standalone', function () {
        console.log("Building " + spec.name);
        return tasks.base();
    });
    gulp.task(assemble + '-standalone', [base + '-standalone'], tasks.assemble);
    gulp.task(cleanup + '-standalone', [base + '-standalone', assemble + '-standalone'], tasks.cleanup);
    gulp.task(spec.name + '-standalone', [base + '-standalone', assemble + '-standalone', cleanup + '-standalone'], function () {
        console.log('Done.');
    });
    return spec.name;
}
module.exports = build;
