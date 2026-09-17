const base = require('flarum-webpack-config')();

module.exports = {
  ...base,
  entry: ['./dist/forum.js', './dist/forum-fix.js'],
  output: {
    ...base.output,
    clean: false,
    filename: 'forum-combined.js',
  },
};
