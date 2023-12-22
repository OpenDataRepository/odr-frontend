console.log('Custom Webpack configuration is being used');
module.exports = {
  module: {
    rules: [
      {
        test: /\.ya?ml$/,
        use: 'yaml-loader',
      },
    ],
  },
};
