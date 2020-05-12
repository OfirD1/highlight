const path = require('path');
module.exports = {
    entry: './index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    externals: {
      jquery: 'jQuery'
   },
   optimization:{
        minimize: false, // <---- disables uglify.
   }
};