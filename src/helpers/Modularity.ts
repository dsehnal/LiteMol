import * as path from 'path'
import compile from './Compile'

interface ModuleSpec {
    root: string,
    tsconfig: string,
    name: string,
    dependencies?: string[],
    libs?: string[],
    isPlugin?: boolean,
    excludeDtsRefs?: boolean,
    createDist?: boolean,
}

type Plugins = { [key: string]: () => any }

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

function base(spec: ModuleSpec, gulp: any) {
     return function () {
        return compile({ project: path.join(spec.root, spec.tsconfig), out: `./build/LiteMol-${spec.name.toLowerCase()}-temp.js` });
     }
}

function assemble(spec: ModuleSpec, gulp: any, plugins: Plugins) {
    return function() {        
        let info = createInfo(spec);  
                      
        let js = gulp
            .src((spec.libs || []).map(l => path.join(spec.root, l + '.js')).concat([`./build/LiteMol-${spec.name.toLowerCase()}-temp.js`]))
            .pipe(plugins.concat()(`LiteMol-${spec.name.toLowerCase()}.js`));
            
        let jsMod = gulp
            .src((spec.libs || []).map(l => path.join(spec.root, l + '.js')).concat([`./build/LiteMol-${spec.name.toLowerCase()}-temp.js`]))
            .pipe(plugins.concat()(`LiteMol-${spec.name.toLowerCase()}.js`))
            .pipe(plugins.insert().prepend(info.pre))
            .pipe(plugins.insert().append(info.post));
            
        let dts = gulp
            .src((spec.libs || []).map(l => path.join(spec.root, l + '.d.ts')).concat([`./build/LiteMol-${spec.name.toLowerCase()}-temp.d.ts`]))
            .pipe(plugins.concat()(`LiteMol-${spec.name.toLowerCase()}.d.ts`));
        
        if (spec.isPlugin) {
            dts.pipe(plugins.insert().prepend(`/// <reference types='react' />\n/// <reference types='react-dom' />\n${info.ts}`));
        } else {
            dts.pipe(plugins.insert().prepend(info.ts));
        }
        
        if (spec.createDist) {
            return plugins.merge()([
            js.pipe(gulp.dest('./build')),
            jsMod.pipe(gulp.dest('./dist/js')),
            
            dts.pipe(gulp.dest('./dist/js')),
            dts.pipe(gulp.dest('./build'))]);
        }

        return plugins.merge()([
            js.pipe(gulp.dest('./build')),
            dts.pipe(gulp.dest('./build'))]);
    }    
}

function cleanup(spec: ModuleSpec, gulp: any, plugins: Plugins) {
    return function() {
        return gulp
            .src([`./build/LiteMol-${spec.name.toLowerCase()}-temp.*`])
            .pipe(plugins.clean()());
    }
}

function buildModule(spec: ModuleSpec, gulp: any, plugins: Plugins) {
    return {
        base: base(spec, gulp),
        assemble: assemble(spec, gulp, plugins),
        cleanup: cleanup(spec, gulp, plugins)
    };
}

function build(spec: ModuleSpec, gulp: any, plugins: Plugins) {
    if (!spec.dependencies) spec.dependencies = [];
    if (!spec.libs) spec.libs = [];
    
    var tasks = buildModule(spec, gulp, plugins);
     
    let base = `${spec.name}-base`;
    let assemble = `${spec.name}-assemble`;
    let cleanup = `${spec.name}-cleanup`;
         
    gulp.task(base, [], function() {
        console.log(`Building ${spec.name}`)
        return tasks.base();
    });
    gulp.task(assemble, [base], tasks.assemble);
    gulp.task(cleanup, [base, assemble], tasks.cleanup);
    gulp.task(spec.name, [base, assemble, cleanup], function() { console.log(`Finished ${spec.name}`) });
    
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

export default build;