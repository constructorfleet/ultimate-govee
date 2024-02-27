/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */

// eslint-disable-next-line no-undef
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '~ultimate-govee-common': '<rootDir>/lib/common',
    '~ultimate-govee-common/(.+)': '<rootDir>/lib/common/$1',
    '~ultimate-govee-data': '<rootDir>/lib/data',
    '~ultimate-govee-data/(.+)': '<rootDir>/lib/data/$1',
    '~ultimate-govee-domain': '<rootDir>/lib/domain',
    '~ultimate-govee-domain/(.+)': '<rootDir>/lib/domain/$1',
    '~ultimate-govee-persist': '<rootDir>/lib/persist',
    '~ultimate-govee-persist/(.+)': '<rootDir>/lib/persist/$1',
  },
};
