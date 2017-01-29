import modularity from './Modularity'

function build(gulp, plugins) {
    return modularity({ 
        name: 'Plugin', 
        tsconfig: './tsconfig.json',
        root: './src/lib/',
        libs: [
            './Core/lib/promise',
            './Core/lib/rx-lite',
            './Core/lib/CIFTools',

            './Visualization/lib/three',

            './Bootstrap/lib/immutable',
            './Bootstrap/lib/zlib',

            './Plugin/lib/react',
            './Plugin/lib/react-dom',
            './Plugin/lib/color-picker'
        ],
        isPlugin: true,
        createDist: true
    }, gulp, plugins);
} 

export = build