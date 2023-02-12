// Portions modified from
// CITATION: https://stackoverflow.com/questions/60967561/jest-coverage-how-can-i-get-a-total-percentage-of-coverage

import { readFile } from 'fs';
import { join } from 'path';

// Gitlab Regex: Total Coverage: (\d+\.\d+ \%)
const coverage_file = join('../../coverage', 'coverage-summary.json');
const coverage = require(coverage_file);
const totalSum = ['lines']
  .map(i => coverage.total[i].pct)
  .reduce((a, b) => a + b, 0)
const avgCoverage = totalSum
console.log(`Coverage: ${avgCoverage.toFixed(2)}%`)
console.log("\n\nCoverage number appears lower than real value, if you look in coverage/lcov-report/index.html");
console.log("it shows code that definitely executes as not being covered. There is an open issue to chase this down.");
