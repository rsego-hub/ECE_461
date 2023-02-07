// Portions modified from
// CITATION: https://stackoverflow.com/questions/60967561/jest-coverage-how-can-i-get-a-total-percentage-of-coverage

import { readFile } from 'fs';
import { join } from 'path';
import { Reporter, TestContext } from '@jest/reporters';
import type { Config } from '@jest/types'

// Gitlab Regex: Total Coverage: (\d+\.\d+ \%)
export default class CoverageReporter implements Pick<Reporter, 'onRunComplete'> {
  private readonly _globalConfig:Config.GlobalConfig;
  private readonly _jsonSummary:string;
  constructor(globalConfig:Config.GlobalConfig) {
    this._globalConfig = globalConfig;
    this._jsonSummary = join(this._globalConfig.coverageDirectory, 'coverage-summary.json');
  }
  async onRunComplete() {
    const coverage = require(this._jsonSummary);
    const totalSum = ['lines', 'statements', 'functions', 'branches']
      .map(i => coverage.total[i].pct)
      .reduce((a, b) => a + b, 0)
    const avgCoverage = totalSum / 4
    console.log(`Coverage: ${avgCoverage.toFixed(2)}%`)
  }
}