/* eslint-disable */
module.exports = {
  displayName: 'sevenx-api',
  testEnvironment: 'node',
  transform: {
    // isolatedModules = transpile-only. Types are enforced by `npm run check`
    // (tsc), not here, which also lets test-first specs reference modules that
    // are not wired up yet without failing the whole run on type errors.
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: { module: 'commonjs', esModuleInterop: true },
        isolatedModules: true,
        diagnostics: false,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/modules/$1',
  },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
};
