//@ts-check

'use strict';

const path = require('path');
const maven = require('maven');
const CopyPlugin = require("copy-webpack-plugin");
        

/**@type {import('webpack').Configuration}*/
const config = {
    target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/

    plugins: [
        {
            apply: (compiler) => {
                compiler.hooks.beforeCompile.tapPromise('MavenPlugin', (compilation) => {
                    const mvn = maven.create({ cwd: '../nbcode-graalvm' });
                    return mvn.execute(['clean', 'install'], {'skipTests': true});}
                );
            }
        },
        new CopyPlugin({
            patterns: [
                {
                    from: "../nbcode-graalvm/nbcode-graalvm-ojdbc/target/nbm/netbeans/nbcodegraalvm/",
                    to: "../nbcode/graalvmextra/"
                }
            ],
        }),
    ],

    entry: {
        extension: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
        debug: './src/graalVMDebugAdapter.ts'
    },
    output: { // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: "commonjs2",
        devtoolModuleFilenameTemplate: "../[resource-path]",
    },
    devtool: 'source-map',
    externals: {
        vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
        bufferutil: "bufferutil",
        "utf-8-validate": "utf-8-validate",
    },
    resolve: { // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: ['.ts', '.js'],
        symlinks: false
    },
    module: {
        rules: [{
            test: /\.ts$/,
            exclude: /node_modules/,
            include: path.resolve(__dirname, 'src'),
            use: [{
                loader: 'ts-loader',
            }]
        }]
    },
}

module.exports = config;
