import modularity from './Modularity'

function build(gulp, plugins) {
    return modularity({ 
        name: 'Core', 
        tsconfig: './tsconfig-core.json',
        root: './src/lib/',
        libs: [
            './Core/lib/promise',
            './Core/lib/rx-lite',
            './Core/lib/CIFTools',
        ],
        createDist: true
    }, gulp, plugins);
} 

export = build