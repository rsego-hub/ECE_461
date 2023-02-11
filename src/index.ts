/* eslint-disable no-var */
import { createLogger, format, transports } from "winston";
import { GroupMetric, Metric, LicenseMetric, RampUpMetric, BusFactorMetric, CorrectnessMetric } from "./metric"
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

async function get_file_lines(filename:string):Promise<string[]> {
	// error check open file
	const file = await open(filename);
	var rv:string[] = [];
	for await (const line of file.readLines()) {
		rv.push(line);
	}

	return new Promise((resolve) => {
		resolve(rv);
	});
}

export class OwnerAndRepo {
	url:string;
	owner:string;
	repo:string;
	cloning_url:string;
	constructor(url:string, owner:string, repo:string, cloning_url:string) {
		this.url = url;
		this.owner = owner;
		this.repo = repo;
		this.cloning_url = cloning_url;
	}
}

export async function fetch_npm_registry_data(registry_url:string):Promise<string[]> {
	var url_obj:URL;
	var git_url:string
	var owner_repo:string[] = [];
	try {
		url_obj = new URL(registry_url);
	} catch(error) {
		// @Priyanka does this need to be changed?
		logger.log('info', "Invalid registry URL input!");
		return new Promise((reject) => {
			reject(owner_repo);
		});
	}
	
	if (registry_url != null) {
		try {
			const endpoint = registry_url;
			const res = await fetch(endpoint);
			const data = await res.json();
			git_url = data.repository.url;
			try {
				url_obj = new URL(git_url);
			} catch(error) {
				// @Priyanka does this need to be changed?
				logger.log('error', "Invalid repository url from npm registry!");
				return new Promise((reject) => {
					reject(owner_repo);
				});
			}
			var hostname:string = url_obj.host;
			if (hostname != "github.com") {
				logger.log('error', "Repository url from npm registry not on github!");
				return new Promise((reject) => {
					reject(owner_repo);
				});
			}
			var pathname:string = url_obj.pathname;
			if (pathname.startsWith("/")) {
				pathname = pathname.slice(1);
			}
			var url_owner:string = pathname.slice(0, pathname.indexOf("/"));
			var url_repo:string = pathname.slice(pathname.indexOf("/") + 1);
			
			if (url_repo.endsWith(".git")) {
				url_repo = url_repo.split(".git")[0];
			}
			owner_repo.push(url_owner);
			owner_repo.push(url_repo);
			
			var protocol:string = git_url.slice(0, git_url.indexOf(":"));
			// handle cloning url (form exactly like sample github urls)
			if (protocol.startsWith("https")) {
				owner_repo.push(git_url);
			}
			else if (protocol.startsWith("git+https")) {
				// remove git+ from beginning
				var new_url = git_url.slice(git_url.indexOf("+") + 1);
				owner_repo.push(new_url);
				// remove .git from end
				// @priyanka come back if needed
			}
			else if (protocol.startsWith("git+ssh")) {
				// remove until :, replace with https:
				var new_url = "https:" + git_url.slice(git_url.indexOf(":") + 1);
				// remove git@
				new_url = new_url.replace("git@", "");
				owner_repo.push(new_url);
			}
			else {
				logger.log('error', "invalid repo URL from npm registry " + registry_url);
				return new Promise((reject) => {
					reject(owner_repo);
				});
			}
		} catch(error) {
			logger.log('error', "Could not fetch repo URL from npm registry " + registry_url);
			owner_repo = [];
			return new Promise((reject) => {
				reject(owner_repo);
			});
		}
	}
	return new Promise((resolve) => {
		resolve(owner_repo);
	});
}

export async function get_real_owner_and_repo(url_val:string):Promise<OwnerAndRepo|null> {
	var url_obj:URL;
	try {
		url_obj = new URL(url_val);
	} catch(error) {
		// @Priyanka does this need to be changed?
		logger.log('info', "Invalid URL input!");
		return null;
	}

	var host:string = url_obj.host;
	var pathname:string = url_obj.pathname;
	if (host == "github.com") {
		if (pathname.startsWith("/")) {
			pathname = pathname.slice(1);
		}
		var url_owner:string = pathname.slice(0, pathname.indexOf("/"));
		var url_repo:string = pathname.slice(pathname.indexOf("/") + 1);
		return new OwnerAndRepo(url_val, url_owner, url_repo, url_val);
	}
	else if (host == "www.npmjs.com") {
		var package_name:string = pathname.slice(pathname.lastIndexOf("/"));
		var registry_url:string = "https://registry.npmjs.org" + package_name;
		try {
			var owner_and_repo:string[] = [];
			try {
				owner_and_repo = await fetch_npm_registry_data(registry_url);
			} catch (error) {
				return null;
			}
			if (owner_and_repo.length != 0) {
				return new OwnerAndRepo(url_val, owner_and_repo[0], owner_and_repo[1], owner_and_repo[2]);
			}
		} catch (error) {
			return null;
		}
		return null;
	}
	else {
		return null;
	}
}

/*
class EachPackageMetrics {
	owner_and_repo:OwnerAndRepo;
	scores:NulNum[];
	constructor(owner_and_repo:OwnerAndRepo, scores:NulNum[]) {
		this.owner_and_repo = owner_and_repo;
		this.scores = scores;
	}
}
*/

class MetricsCollection {
	owner_and_repo:OwnerAndRepo;
	private git_repo:Repository;
	license_metric:LicenseMetric;
	ramp_up_metric:RampUpMetric;
	bus_factor_metric:BusFactorMetric;
	correctness_metric: CorrectnessMetric;
	//add more here as they are completed @everyone
	
	constructor(owner_and_repo:OwnerAndRepo, license_metric:LicenseMetric, ramp_up_metric:RampUpMetric, 
	bus_factor_metric:BusFactorMetric, correctness_metric:CorrectnessMetric) {
		this.owner_and_repo = owner_and_repo;
		this.git_repo = new GithubRepository(owner_and_repo.url, owner_and_repo.owner, owner_and_repo.repo, owner_and_repo.cloning_url);
		this.license_metric = license_metric;
		this.ramp_up_metric = ramp_up_metric;
		this.bus_factor_metric = bus_factor_metric;
		this.correctness_metric = correctness_metric;
	}

	async get_metrics():Promise<Promise<GroupMetric>[]> {
		var promises_of_metrics:Promise<GroupMetric>[] = [];
		promises_of_metrics[0] = this.license_metric.get_metric(this.git_repo);
		promises_of_metrics[1] = this.ramp_up_metric.get_metric(this.git_repo);
		promises_of_metrics[2] = this.bus_factor_metric.get_metric(this.git_repo);
		promises_of_metrics[3] = this.correctness_metric.get_metric(this.git_repo);
		// this.promises_of_metrics.push(this.<new_metric>.get_metric(this.git_repo));
		return promises_of_metrics;
	}
}

// citation: typing union type arrays
// https://stackoverflow.com/questions/62320779/typescript-how-to-type-an-array-of-number-or-null-elements-where-the-first-elem

interface calcResults {
	(metrics_array:GroupMetric[]): void;
}

export async function process_urls(filename:string, callback:calcResults) {
	var url_vals:string[] = await get_file_lines(filename);
	var metrics_array:GroupMetric[]= [];
	var owner_and_repo:OwnerAndRepo|null;
	var promises_of_metrics:Promise<GroupMetric>[] = [];
	for (const url_val of url_vals) {
		// change this to .then and .catch for error checking
		owner_and_repo = await get_real_owner_and_repo(url_val);
		if (owner_and_repo != null) {
			// var metrics_collection:MetricsCollection = new MetricsCollection(owner_and_repo, new LicenseMetric(), new <NewMetric()>...);
			var metrics_collection:MetricsCollection = new MetricsCollection(owner_and_repo, new LicenseMetric(), 
			new RampUpMetric(), new BusFactorMetric(), new CorrectnessMetric());
			var tmp_promises:Promise<GroupMetric>[] = await metrics_collection.get_metrics();
			promises_of_metrics = promises_of_metrics.concat(tmp_promises);
		}
		else {
			logger.log('error',"Invalid URL! " + url_val);
			// @everyone add all metrics with null for bogus URLs
			metrics_array.push(new GroupMetric(url_val, "LICENSE_SCORE", null),
			new GroupMetric(url_val, "LICENSE_SCORE", null));
		}
	} 
	const allPromise = Promise.allSettled(promises_of_metrics);

	allPromise.then((value) => {
		logger.log('info', 'Resolved: ' + value);
		const jdata = JSON.parse(JSON.stringify(value));
		for (const result of jdata) {
			switch(result.status) {
				case 'fulfilled': {
					logger.log('debug', 'success => ' + result.value);
					metrics_array.push(result.value);
					break;
				}
				case 'rejected': {
					logger.log('error', 'error => ' + result.reason);
					metrics_array.push(result.value);
					break;
				}
			}
		}
	}).catch((error) => {
		logger.log('error', 'Rejected: ' + error);
	}).finally(() => {
		logger.log('info', "Finished get_metrics for all repos");
		callback(metrics_array);
		// map with keys as url with values for each metric
		// calculate net score, sort by net score, print
	});
}

function calc_final_result(metrics_array:GroupMetric[]):void {
	console.log(JSON.stringify(metrics_array, null, 4));
}

export async function async_main() {
	const filename:string = process.argv[2];
	await process_urls(filename, calc_final_result);
}

// MAIN IS AND SHOULD BE JUST THIS, since process_urls is the "asynchronous main"
if (require.main === module) {
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
	async_main();
}

