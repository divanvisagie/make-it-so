#!/usr/bin/env node

import * as watch from 'watch';
import * as colors from 'colors';
import { spawn } from 'child_process';
import * as path from 'path';
import { Monitor } from 'watch';

/* parse the ignore arguments */
const args: string[] = process.argv.slice(2);
const ignoreDotFiles: boolean = args.includes('--ignore-dot-files');
const ignores: string[] = args.reduce((state: { ignores: string[]; include: boolean }, arg: string) => {
    return {
        ignores: state.include ? [...state.ignores, arg] : state.ignores,
        include: arg === '--ignore'
    };
}, {
    ignores: [],
    include: false
}).ignores.map((relative: string) => {
    return path.resolve(relative);
});

console.log('watching root:', process.cwd());
if (ignores.length) {
    console.log('ignoring: ', ignores.join(','));
}

function change_handler(f: string) {
    console.log('file changed running make:', f);
    var ps = spawn('make');

    ps.stderr.on('data', function(data) {
        console.log('stderr:'.red, data.toString());
    });

    ps.stdout.on('data', function(data) {
        console.log('output:', data.toString());
    });

    ps.on('exit', function(code) {
        console.log('make exited with code:', code);
    });
}

watch.createMonitor(process.cwd(), {
    ignoreDotFiles: ignoreDotFiles,
    filter: function(path: any) {
        return ignores.indexOf(path) >= 0;
    }
}, (monitor: Monitor) => {

    monitor.on('created', function(f: string, stat: any) {
        change_handler(f);
    });
    monitor.on('changed', function(f: string) {
        change_handler(f);
    });
    monitor.on('removed', function(f: string) {
        change_handler(f);
    });
});
