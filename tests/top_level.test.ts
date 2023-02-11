import { describe, expect, test } from '@jest/globals';
import { process_urls } from '../src/index'
import { GroupMetric } from '../src/metric';
jest.useFakeTimers()

const localLogger = {
  format: {
    printf: jest.fn(),
    timestamp: jest.fn(),
    simple: jest.fn(),
    colorize: jest.fn(),
    combine: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  },
  createLogger: jest.fn().mockImplementation(function(creationOpts) {
    return {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
    };
  })
};

const logger = localLogger.createLogger();
global.logger = logger;

describe('Top level test', () => {
    test('Process URLS valid', async () => {
		function handle_results(metrics_array:GroupMetric[]) {
			const json_arr = JSON.parse(`[
    {
        "url": "https://github.com/cloudinary/cloudinary_npm",
        "metric_name": "LICENSE_SCORE",
        "metric_val": 0
    },
    {
        "url": "https://github.com/cloudinary/cloudinary_npm",
        "metric_name": "RAMP_UP_SCORE",
        "metric_val": null
    },
    {
        "url": "https://github.com/cloudinary/cloudinary_npm",
        "metric_name": "BUS_FACTOR_SCORE",
        "metric_val": null
    },
    {
        "url": "https://github.com/cloudinary/cloudinary_npm",
        "metric_name": "CORRECTNESS_SCORE",
        "metric_val": null
    },
    {
        "url": "https://www.npmjs.com/package/express",
        "metric_name": "LICENSE_SCORE",
        "metric_val": 0
    },
    {
        "url": "https://www.npmjs.com/package/express",
        "metric_name": "RAMP_UP_SCORE",
        "metric_val": null
    },
    {
        "url": "https://www.npmjs.com/package/express",
        "metric_name": "BUS_FACTOR_SCORE",
        "metric_val": null
    },
    {
        "url": "https://www.npmjs.com/package/express",
        "metric_name": "CORRECTNESS_SCORE",
        "metric_val": null
    },
    {
        "url": "https://github.com/nullivex/nodist",
        "metric_name": "LICENSE_SCORE",
        "metric_val": 0
    },
    {
        "url": "https://github.com/nullivex/nodist",
        "metric_name": "RAMP_UP_SCORE",
        "metric_val": null
    },
    {
        "url": "https://github.com/nullivex/nodist",
        "metric_name": "BUS_FACTOR_SCORE",
        "metric_val": null
    },
    {
        "url": "https://github.com/nullivex/nodist",
        "metric_name": "CORRECTNESS_SCORE",
        "metric_val": null
    },
    {
        "url": "https://github.com/lodash/lodash",
        "metric_name": "LICENSE_SCORE",
        "metric_val": 0
    },
    {
        "url": "https://github.com/lodash/lodash",
        "metric_name": "RAMP_UP_SCORE",
        "metric_val": null
    },
    {
        "url": "https://github.com/lodash/lodash",
        "metric_name": "BUS_FACTOR_SCORE",
        "metric_val": null
    },
    {
        "url": "https://github.com/lodash/lodash",
        "metric_name": "CORRECTNESS_SCORE",
        "metric_val": null
    },
    {
        "url": "https://www.npmjs.com/package/browserify",
        "metric_name": "LICENSE_SCORE",
        "metric_val": 0
    },
    {
        "url": "https://www.npmjs.com/package/browserify",
        "metric_name": "RAMP_UP_SCORE",
        "metric_val": null
    },
    {
        "url": "https://www.npmjs.com/package/browserify",
        "metric_name": "BUS_FACTOR_SCORE",
        "metric_val": null
    },
    {
        "url": "https://www.npmjs.com/package/browserify",
        "metric_name": "CORRECTNESS_SCORE",
        "metric_val": null
    }
]`);
			expect(metrics_array).toStrictEqual(json_arr)
		}
		await process_urls("sample_url_file.txt", handle_results);
    });
})



