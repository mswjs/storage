export default {
  preset: 'ts-jest',
  testMatch: ['**/*.browser.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFilesAfterEnv: ['./jest.browser.setup.ts'],
}
