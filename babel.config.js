module.exports = {
  plugins: ['dynamic-import-webpack'],
  presets: [
    ['@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
};
