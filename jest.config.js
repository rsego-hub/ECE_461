/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "collectCoverageFrom": ["./src/**"],
  "collectCoverage": true,
  roots: ['./tests', './src'],
  coverageReporters: ['json-summary'],
  reporters: ['default', './build/tests/jest_reporter.js'],
};
// , , './build/tests/jest_coverage_reporter.js'
// 'text', 'json', 'text-summary', 