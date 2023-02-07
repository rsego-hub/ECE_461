/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "collectCoverageFrom": ["./src/**"],
  roots: ['./tests', './src'],
  coverageReporters: ['json-summary'],
  reporters: ['./build/tests/jest_reporter.js', './build/tests/jest_coverage_reporter.js']
};