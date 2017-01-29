import { exec } from 'child_process'
import * as byline from 'byline'
import * as gutil from 'gulp-util'
declare var Promise: any;

function log(isError: boolean, line: string) {
    if (line.toLowerCase().indexOf('error') > 0) isError = true;
    if (isError) gutil.log(gutil.colors.red('[tsc]'), line);
    else gutil.log(gutil.colors.green('[tsc]'), line);
}

type Config = {
    project: string,
    out?: string,
    outDir?: string
}

function execTscProject(config: Config, callback: (err: any) => void) {
    let command = config.out 
        ? `"./node_modules/.bin/tsc" -p "${config.project}" --out "${config.out}"`
        : `"./node_modules/.bin/tsc" -p "${config.project}" --outDir "${config.outDir}"`;
    let proc = exec(command);
    let stdout = byline(proc.stdout);
    let stderr = byline(proc.stderr);

    proc.on('exit', function (code) {
        if (code !== 0) {
            let err = new Error('TypeScript compile failed');
            (err as any).showStack =false;
            callback(err);
        } else {
            callback(null);
        }
    });

    proc.on('error', function (err) { log(true, '' + err); });
    stdout.on('data', function (chunk) { log(false, chunk.toString('utf8')); });
    stderr.on('data', function (chunk) { log(true, chunk.toString('utf8')); }); 
}

function compile(config: Config, out?: string) {
    return new Promise((res, rej) => {
        execTscProject(config, (err) => {
            if (err) rej(err);
            else res();
        }); 
    });
}

export default compile