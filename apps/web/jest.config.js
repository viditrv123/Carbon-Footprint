const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  setupFilesAfterFrameworks: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@carbon/types$': '<rootDir>/../../packages/types/src/index.ts',
  },
  testRegex: '.*\\.(test|spec)\\.(ts|tsx)$',
};

module.exports = createJestConfig(customJestConfig);
