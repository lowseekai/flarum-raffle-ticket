const base = require('flarum-webpack-config')();

module.exports = {
  ...base,
  entry: './admin.js',
  output: { ...base.output, clean: false, filename: 'admin.js' },
};
