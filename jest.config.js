module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/frontend/myjeansfinder/src/setup-jest.ts'],
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/frontend/myjeansfinder/src'],
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  transform: {
    '^.+\\.(ts|js|html)$': 'jest-preset-angular',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/frontend/myjeansfinder/src/$1',
  },
  transformIgnorePatterns: ['node_modules/(?!(@angular|rxjs|zone\\.js)/)'],
};
