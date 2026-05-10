// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

module.exports = createJestConfig({
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  collectCoverageFrom: [
    "src/features/**/*.{ts,tsx}",
    "src/lib/**/*.{ts,tsx}",
    "!src/lib/currencies.ts",
    "!src/**/*.d.ts",
  ],
  coverageProvider: "v8",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
});