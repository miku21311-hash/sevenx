/* eslint-disable */
module.exports = {
  displayName: 'sevenx-ui',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx', esModuleInterop: true }, isolatedModules: true, diagnostics: false }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/modules/$1',
  },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
};
