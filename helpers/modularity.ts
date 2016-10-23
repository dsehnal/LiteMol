interface ModuleSpec {
    name: string,
    dependencies: string[],
    include: string[],
    priorityLib: string[],
    isPlugin: boolean,
    excludeDtsRefs: boolean,
    createDist: boolean
}

function createPre(spec: ModuleSpec) {
    let ret = [
        `\n; var __LiteMol_${spec.name} = function (${spec.dependencies.map(d => `__LiteMol_${d}`).join(', ')}) {`,
        `  'use strict';`    
    ];
    if (spec.dependencies.length) {
        let modules =  `var LiteMol = { ${spec.dependencies.map(d => `${d}: __LiteMol_${d}`)} };`;
        ret.push(`var LiteMol = { ${spec.dependencies.map(d => `${d}: __LiteMol_${d}`)} };`)
    }    
    return ret.join('\n') + '\n';    
}

function createPost(spec: ModuleSpec) {
    let ret: string[] = [];
    
    if (spec.isPlugin) ret.push(`  return LiteMol;`);
    else ret.push(`  return LiteMol.${spec.name};`);
    ret.push(`}`);
     
    let req = spec.dependencies.map(d => `require(LiteMol-${d.toLowerCase()})`).join(', ');
    let reqWin = spec.dependencies.map(d => `__target.LiteMol.${d}`).join(', ');
    let reqCheck = spec.dependencies.map(d => `!__target.LiteMol.${d}`).join(' || ');
    
    // commonjs
    ret.push(`if (typeof module === 'object' && typeof module.exports === 'object') {`);
    ret.push(`  module.exports = __LiteMol_${spec.name}(${req});`);
    
    // amd
    ret.push(`} else if (typeof define === 'function' && define.amd) {`);
    ret.push(`  define(['require'], function(require) { return __LiteMol_${spec.name}(${req}); })`)
    // global
    ret.push(`} else {`);
    ret.push(`  var __target = !!window ? window : this;`);
    
    if (spec.dependencies.length) {    
        ret.push(`  if (!__target.LiteMol || ${reqCheck} ) {`);
        ret.push(`    console.error("LiteMol-${spec.dependencies.map(d => d.toLowerCase()).join('/')} must be included before LiteMol-${spec.name.toLowerCase}.");`);
        ret.push(`    throw 'LiteMol loader error.';`);
        ret.push(`  }`);
    }
    
    if (spec.isPlugin) {
        ret.push(`  __target.LiteMol = __LiteMol_${spec.name}(${reqWin});`);
    } else {    
        ret.push(`  if (!__target.LiteMol) __target.LiteMol = {};`);
        ret.push(`  __target.LiteMol.${spec.name} = __LiteMol_${spec.name}(${reqWin});`);
    }
    ret.push(`}`);
    
    return ret.join('\n') + '\n\n';    
}

function createInfo(spec: ModuleSpec) {
    return {
        pre: createPre(spec),
        post: createPost(spec),
        ts: spec.excludeDtsRefs ? '' : ''//spec.dependencies.map(d => `/// <reference path="LiteMol-${d.toLowerCase()}.d.ts" />`).join('\n') + '\n'
    }
}

function base(root: string, gulp: any, plugins: any) {
     return function () {
        let project = plugins.ts.createProject(root + '/tsconfig.json', { typescript: plugins.tsc });
        let b = project.src().pipe(plugins.ts(project));
        
        return plugins.merge([
            b.js.pipe(gulp.dest('./build')),
            b.dts.pipe(gulp.dest('./build'))
        ]);
     }
}

function assemble(root: string, spec: ModuleSpec, gulp: any, plugins: any) {
    return function() {        
        let info = createInfo(spec);  
        
        let include = (spec.include || []).map(i => `./build/LiteMol-${i.toLowerCase()}`);
              
        let js = gulp
            .src((spec.priorityLib || [])
                .map(l => `${root}/lib/${l}.js`)
                .concat(include.map(i => i + '.js'))
                .concat([`${root}/lib/*.js`, `./build/LiteMol-${spec.name.toLowerCase()}-temp.js`]))
            .pipe(plugins.unique())
            .pipe(plugins.concat(`LiteMol-${spec.name.toLowerCase()}.js`));
            
        let jsMod = gulp
            .src((spec.priorityLib || [])
                .map(l => `${root}/lib/${l}.js`)
                .concat(include.map(i => i + '.js'))
                .concat([`${root}/lib/*.js`, `./build/LiteMol-${spec.name.toLowerCase()}-temp.js`]))
            .pipe(plugins.unique())
            .pipe(plugins.concat(`LiteMol-${spec.name.toLowerCase()}.js`))
            .pipe(plugins.insert.prepend(info.pre))
            .pipe(plugins.insert.append(info.post));
            
        let dts = gulp
            .src(
                [`${root}/lib/*.d.ts`, `./build/LiteMol-${spec.name.toLowerCase()}-temp.d.ts`]
                .concat(include.map(i => i + '.d.ts')))
            .pipe(plugins.concat(`LiteMol-${spec.name.toLowerCase()}.d.ts`))
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
    }    
}

function cleanup(spec: ModuleSpec, gulp: any, plugins: any) {
    return function() {
        return gulp
            .src([`./build/LiteMol-${spec.name.toLowerCase()}-temp.*`])
            .pipe(plugins.clean());
    }
}

function buildModule(root: string, spec: ModuleSpec, gulp: any, plugins: any) {
    return {
        base: base(root, gulp, plugins),
        assemble: assemble(root, spec, gulp, plugins),
        cleanup: cleanup(spec, gulp, plugins)
    };
}

function build(root: string, spec: ModuleSpec, gulp: any, plugins: any) {
    if (!spec.dependencies) spec.dependencies = [];
    if (!spec.priorityLib) spec.priorityLib = [];
    if (!spec.include) spec.include = [];
    
    var tasks = buildModule(root, spec, gulp, plugins);
     
    let base = `${spec.name}-base`;
    let assemble = `${spec.name}-assemble`;
    let cleanup = `${spec.name}-cleanup`;
    
    let deps = spec.dependencies.concat(spec.include);
     
    gulp.task(base, deps, function() {
        console.log(`Building ${spec.name}`)
        return tasks.base();
    });
    gulp.task(assemble, [base], tasks.assemble);
    gulp.task(cleanup, [base, assemble], tasks.cleanup);
    gulp.task(spec.name, deps.concat([base, assemble, cleanup]));
    
    
    gulp.task(base + '-standalone', function() {
        console.log(`Building ${spec.name}`)
        return tasks.base();
    });
    gulp.task(assemble + '-standalone', [base + '-standalone'], tasks.assemble);
    gulp.task(cleanup + '-standalone', [base + '-standalone', assemble + '-standalone'], tasks.cleanup);
    gulp.task(spec.name + '-standalone', [base + '-standalone', assemble + '-standalone', cleanup + '-standalone'], function () {
        console.log('Done.');
    });
    
    return spec.name;
} 

export = build;