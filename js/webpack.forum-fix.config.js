const base = require('flarum-webpack-config')();

module.exports = {
  ...base,
  entry: './src/forum-fix.js',
  output: {
    ...base.output,
    clean: false,
    filename: 'forum-fix.js',
  },
};
