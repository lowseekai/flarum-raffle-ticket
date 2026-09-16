const base = require('flarum-webpack-config')();

module.exports = {
  ...base,
  entry: './src/forum-fix.js',
  output: {
    ...base.output,
    filename: 'forum-fix.js',
  },
};
