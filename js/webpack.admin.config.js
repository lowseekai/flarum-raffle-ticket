const base = require('flarum-webpack-config')();

module.exports = {
  ...base,
  entry: ['./src/admin/legacy.js', './admin.js'],
  output: {
    ...base.output,
    filename: 'admin.js',
  },
};
