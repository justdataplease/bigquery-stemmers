const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'stemmers.js',
        library: 'utils'
    },
    mode: 'production',
    devtool: 'sourceMap'
};
