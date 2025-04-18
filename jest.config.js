/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/vendor/',
    '<rootDir>/config/',
    '<rootDir>/log/',
    '<rootDir>/public/',
    '<rootDir>/tmp/',
  ],
  setupFilesAfterEnv: ['<rootDir>/app/javascript/truecolors/test_setup.js'],
  collectCoverageFrom: [
    'app/javascript/truecolors/**/*.{js,jsx,ts,tsx}',
    '!app/javascript/truecolors/features/emoji/emoji_compressed.js',
    '!app/javascript/truecolors/service_worker/entry.js',
    '!app/javascript/truecolors/test_setup.js',
  ],
  // Those packages are ESM, so we need them to be processed by Babel
  transformIgnorePatterns: ['/node_modules/(?!(redent|strip-indent)/)'],
  coverageDirectory: '<rootDir>/coverage',
  moduleDirectories: ['node_modules', '<rootDir>/app/javascript'],
  moduleNameMapper: {
    '\\.svg\\?react$': '<rootDir>/app/javascript/__mocks__/svg.js',
  },
};

module.exports = config;
