import { createLogger, format, transports } from "winston";
import { Metric, LicenseMetric } from "./metric"
import { GithubRepository } from "./github_repository"
import { Repository } from "./repository"

function get_log_level():string {
	if (process.env.LOG_LEVEL == undefined) {
		console.log("LOG_LEVEL undefined, default emerg");
		return 'emerg';
	}
	else {
		var log_level:string|undefined = process.env.LOG_LEVEL;
		var int_level:number = parseInt(log_level);
		if (int_level == 0) {
			console.log("LOG_LEVEL emerg/silence");
			return 'emerg';
		}
		else if (int_level == 1) {
			console.log("LOG_LEVEL info");
			return 'info';
		}
		else if (int_level == 2) {
			console.log("LOG_LEVEL debug");
			return 'debug';
		}
		else {
			console.log("LOG_LEVEL emerg/silence");
			return 'emerg';
		}
	}
}

function get_log_file():string {
	if (process.env.LOG_FILE == undefined) {
		console.log("LOG_FILE undefined, default ./logs/default.log");
		return './logs/default.log';
	}
	else {
		var log_file:string|undefined = process.env.LOG_FILE;
		console.log("Found LOG_FILE in environment: " + log_file);

		return log_file;
	}
}

// used example code from winston repo to set up:
// https://github.com/winstonjs/winston#usage 
const logger = createLogger({
  level: get_log_level(),
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.simple()
  ),
  defaultMeta: { service: '461 Project 1' },
  transports: [
    new transports.File({ filename: get_log_file(), level: get_log_level() })
  ]
});

global.logger = logger;

var git_repo:Repository = new GithubRepository("octokit", "octokit.js");
var metric:Metric = new LicenseMetric();
logger.log('info', 'TEST LOG INFO');
metric.get_metric(git_repo).then(result => {logger.log('info', result)});