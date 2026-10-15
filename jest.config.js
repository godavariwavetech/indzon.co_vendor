module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    "^axios$": "<rootDir>/node_modules/axios/dist/node/axios.cjs",
    '^react-redux$': '<rootDir>/node_modules/react-redux/dist/cjs/index.js',
  },
};
