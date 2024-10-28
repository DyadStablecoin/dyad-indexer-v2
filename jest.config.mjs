export default {
    testEnvironment: 'node',
    transform: {
      '^.+.tsx?$': ['ts-jest', {}],
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1',
    },
    modulePathIgnorePatterns: ['./dist/'],
    //globalSetup: './tests/globalSetup.ts',
    //globalTeardown: './tests/globalTeardown.ts',
    reporters: ['default', 'jest-junit'],
  };
  