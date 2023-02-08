import { createLogger, format, transports } from "winston";
import { Metric, LicenseMetric } from "./metric"
import { GithubRepository } from "./github_repository"
import { Repository } from "./repository"

import { open } from 'node:fs/promises';

// read environment variable LOG_LEVEL to set up logging
function get_log_level():string {
	if (process.env.LOG_LEVEL == undefined) {
		console.log("LOG_LEVEL undefined, default emerg");
		return 'emerg';
	}
	else {
		var log_level:string|undefined = process.env.LOG_LEVEL;
		var int_level:number = parseInt(log_level);
		if (int_level == 0) {
			return 'emerg';
		}
		else if (int_level == 1) {
			return 'info';
		}
		else if (int_level == 2) {
			return 'debug';
		}
		else {
			return 'emerg';
		}
	}
}

// read environment variable LOG_FILE to set up logging
function get_log_file():string {
	if (process.env.LOG_FILE == undefined) {
		console.log("LOG_FILE undefined, default ./logs/default.log");
		return './logs/default.log';
	}
	else {
		var log_file:string|undefined = process.env.LOG_FILE;
		if (log_file == "") {
			console.log("LOG_FILE empty, default ./logs/default.log");
			return './logs/default.log';
		}
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

// set the global variable logger to be this instance of a winston logger
// so that all files can log using logger.log('level', "message");
global.logger = logger;


async function get_file_lines(filename:string):Promise<string[]> {
	const file = await open(filename);
	var rv:string[] = [];
	for await (const line of file.readLines()) {
		rv.push(line);
	}

	return new Promise((resolve) => {
		resolve(rv);
	});
}

class OwnerAndRepo {
	owner:string;
	repo:string;
	constructor(owner:string, repo:string) {
		this.owner = owner;
		this.repo = repo;
	}
}

function get_real_owner_and_repo(url_val:string):OwnerAndRepo|null {
	var url_obj:URL;
	try {
		url_obj = new URL(url_val);
	} catch(error) {
		throw "Invalid URL input!";
	}

	var host:string = url_obj.host;
	var pathname:string = url_obj.pathname;

	if (host == "github.com") {
		return new OwnerAndRepo("cloudinary", "cloudinary_npm");
	}
	else if (host == "www.npmjs.com") {
		console.log("npm not supported yet");
		return null;
	}
	else {
		return null;
	}
}

class MetricsCollection {
	owner_and_repo:OwnerAndRepo;
	private git_repo:Repository;
	license_metric:LicenseMetric;
	//add more here as they are completed @everyone
	private promises_of_metrics:Promise<number>[];
	
	constructor(owner_and_repo:OwnerAndRepo, license_metric:LicenseMetric) {
		this.owner_and_repo = owner_and_repo;
		this.git_repo = new GithubRepository(owner_and_repo.owner, owner_and_repo.repo);
		this.license_metric = license_metric;
	}

	async get_metrics():Promise<number[]> {
		var curr_promise:Promise<number>;
		await this.license_metric.get_metric(this.git_repo);
	}
}

async function process_urls(filename:string) {
	var url_vals:string[] = await get_file_lines(filename);
	var metrics_array:MetricsCollection[] = [];

	var owner_and_repo:OwnerAndRepo|null;
	for (const url_val of url_vals) {
		owner_and_repo = get_real_owner_and_repo(url_val);
		if (owner_and_repo != null) {
			// testing code for accessors temporary
			var metrics_collection:MetricsCollection = new MetricsCollection(owner_and_repo, new LicenseMetric());
			// metric.get_metric(git_repo).then(result => {console.log('info', result)});
		}
	}
}


// MAIN IS AND SHOULD BE JUST THIS, since process_urls is the "asynchronous main"
const filename:string = process.argv[2];
process_urls(filename);








