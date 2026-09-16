const base = require('flarum-webpack-config')();

module.exports = {
  ...base,
  entry: ['./dist/forum.js', './dist/forum-fix.js'],
  output: {
    ...base.output,
    filename: 'forum-combined.js',
  },
};
