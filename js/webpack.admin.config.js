const base = require('flarum-webpack-config')();

module.exports = {
  ...base,
  entry: ['./admin.js', './src/admin/legacy-wrapper.js'],
  output: {
    ...base.output,
    filename: 'admin.js',
  },
};
