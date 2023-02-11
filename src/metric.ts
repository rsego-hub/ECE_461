import { Repository } from "./repository"
import { Issue, Contributor, Contributions } from "./github_repository"

import { ESLint } from "eslint";

import fs from "fs"
import path from "path"

type NullNum = number|null;

export class GroupMetric {
	url:string;
	metric_name:string;
	metric_val:NullNum;
	constructor(url:string, metric_name:string, metric_val:NullNum) {
		this.url = url;
		this.metric_name = metric_name;
		this.metric_val = metric_val;
	}
}

/* Metric Class
 * Abstract class to be extended for all current and future metric subclass
 * 
 * Subclasses:
 * License, BusFactor, RampUp, ResponsiveMaintainer, Correctness
*/
export abstract class Metric {
    abstract get_metric(repo: Repository):Promise<GroupMetric>;
}

/* License Metric Class
 * Finds compatibility of repository license with GNU Lesser General Public License v2.1
 * Compatible if MIT or lgpl-v2.1 is the spdx_id IN THIS FORMAT.
 * @Robert use get_license function that returns spdx_id of license file
 * if that doesn't exist, use get_readme function to download the README
 * and parse for regex MIT or LGPL v2.1 or lgpl-v2.1
*/
export class LicenseMetric extends Metric {
    async get_metric(repo: Repository):Promise<GroupMetric> {
		var final_score:number;
        var license: string|null = await repo.get_license(); // ask for license file
        if (license == null) {
            logger.log('info', "No license file, retreiving README");
            license = await repo.get_readme(); // ask for readme
            if (license == null) {
                logger.log('info', "No license or readme found");
                final_score = 0;
            }
        }
        
        let regex = new RegExp("(GNU\s*)?L?GPL\s*v?(?:2|3)|MIT\s*(L|l)icense");
        if(regex.test(license as string)) {
            final_score = 1;
        }
        final_score = 0;
        return new Promise((resolve) => {
			resolve(new GroupMetric(repo.url, "LICENSE_SCORE", final_score));
		});
    }
}


/* Ramp Up Metric Class
	@RYAN: skeleton for how you will do your calls
*/
export class RampUpMetric extends Metric {
    async get_metric(repo: Repository):Promise<GroupMetric> {
		// returns a string filepath to the clone location (directory)
		// or null if it failed
		var cloned_dir:string|null = await repo.get_local_clone("RampUp");
		var final_score:NullNum = null;

		if (cloned_dir != null) {
			// do clone work here
		}

		// do your calculation

        return new Promise((resolve) => {
			resolve(new GroupMetric(repo.url, "RAMP_UP_SCORE", final_score));
		});
    }
}

/* Bus Factor Metric Class
	@ANDY skeleton for how you will do your calls
*/
export class BusFactorMetric extends Metric {
    async get_metric(repo: Repository):Promise<GroupMetric> {
		// returns a string filepath to the clone location (directory)
		var contributions:Contributions = await repo.get_contributors_stats();
		var final_score:NullNum = null;
		
		var contributors:Contributor[] = contributions.contributors;
		var total_commits_1yr:NullNum = contributions.total_commits_1yr;
		var last_pushed_date:string|null = contributions.last_pushed_date;
		var last_release_date:string|null = contributions.last_release_date;
		
		// do null checking for every data point
		// do an empty check for contributors.length == 0
		

		// do your calculation
		// final_score = whatever;
        return new Promise((resolve) => {
			resolve(new GroupMetric(repo.url, "BUS_FACTOR_SCORE", final_score));
		});
    }
}

class LintResults {
	fileCount:NullNum;
	lineCount:NullNum;
	errorCount:NullNum;
	fixableErrorCount:NullNum;
	fatalErrorCount:NullNum;
	constructor(fileCount:NullNum, lineCount:NullNum, errorCount:NullNum, fixableErrorCount:NullNum, fatalErrorCount:NullNum) {
		this.fileCount = fileCount;
		this.lineCount = lineCount;
		this.errorCount = errorCount;
		this.fixableErrorCount = fixableErrorCount;
		this.fatalErrorCount = fatalErrorCount;
	}
}

const getAllFiles = function(dirPath:string, arrayOfFiles:string[]) {
	const files = fs.readdirSync(dirPath)
	var arrayOfFiles = arrayOfFiles || []
	
	files.forEach(function(file) {
		if (fs.statSync(dirPath + "/" + file).isDirectory()) {
			arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
		} else {
			arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
		}
	})
	
	return arrayOfFiles
}


export class CorrectnessMetric extends Metric {
	
	private async get_eslint_on_clone():Promise<LintResults> {
		var error_count:NullNum = null;
		var fixable_error_count:NullNum = null;
		var fatal_error_count:NullNum = null;
		var file_count:NullNum = null;
		var line_count:NullNum = null;
		const eslint = new ESLint({
			overrideConfigFile: "./.eslintrc.cjs",
			errorOnUnmatchedPattern: true,
			extensions: [".js", ".ts"]
		});
		//const results = await eslint.lintFiles(["src/**/*.ts"]);
		try {
			let results = await eslint.lintFiles(["local_clones/cloudinary_npmCorrectness/lib/**/*.js"]);
			// let results = await eslint.lintFiles(array_of_files);
			var file_count_success:number = 0;
			var error_count_success:number = 0;
			var fixable_error_count_success:number = 0;
			var fatal_error_count_success:number = 0;
			var line_count_success:NullNum = 0;
			for (const result of results) {
				console.log("result " + result.filePath);
				console.log(result);
				if (result.source != undefined) {
					console.log("LINES");
					console.log(result.source.split("\n").length - 1);
					line_count_success += result.source.split("\n").length - 1;
				}
				else {
					console.log ("SOURCE UNDEFINED");
				}
				file_count_success++;
				error_count_success += result.errorCount;
				fixable_error_count_success += result.fixableErrorCount;
				fatal_error_count_success += result.fatalErrorCount;
				console.log(result.errorCount);
				console.log(result.fixableErrorCount);
				console.log(result.fatalErrorCount)
			}
			if (line_count_success == 0) {
				console.log("Could not find any source files to count lines eslint");
				line_count_success = null;
			}
			return new Promise((resolve) => {
				resolve(new LintResults(file_count_success, line_count_success, 
				error_count_success, fixable_error_count_success, fatal_error_count_success))
			});
		} catch (error) {
			console.log("error fetching eslint! " + error);
			return new Promise((resolve) => {
				resolve(new LintResults(file_count, line_count, error_count, fixable_error_count, fatal_error_count))
			});
		}
	}
	
    async get_metric(repo: Repository):Promise<GroupMetric> {
		// returns a string filepath to the clone location (directory)
		// or null if it failed
		var cloned_dir:string|null = await repo.get_local_clone("Correctness");
		var final_score:NullNum = null;
		if (cloned_dir != null) {
			// do clone work here
			// const array_of_files = getAllFiles(cloned_dir,[]);
			// const array_of_files = getAllFiles('./local_clones/cloudinary_npmCorrectness',[]);
			logger.log('info', "Get Correctness Metric");
			// console.log(array_of_files);
			//var lint_results:LintResults = await this.get_eslint_on_clone();
			//console.log(lint_results);
		}

		// do your calculation

        return new Promise((resolve) => {
			resolve(new GroupMetric(repo.url, "CORRECTNESS_SCORE", final_score));
		});
    }
}

/* Responsive Maintenance Metric Class
 * Get average amount of time before an issue or bug is resolved
 * @Robert TODO fix with new get_issues return value, make sure to error check
 * and log errors with logger.log('info', "message");
*/
/*
export class ResponsiveMetric extends Metric {
    async get_metric(repo: Repository):Promise<number> {

        let issue_arr = await repo.get_issues(); // get all issues

        var tot_response_time = 0; // time measured in ms
        var num_events = 0;

        for (var issue in issue_arr) {
            if(issue.created_at == null) {
                logger.log('info', "issue has no created date")
                return -1
            }

            logger.log('debug', "created_at: %s", issue.created_at);

            num_events += issue.total_events; // Add number of events to total count
            var created_time = new Date(issue.created_at).getTime() // Get time issue was created

            if(issue.closed_at != null) {
                tot_response_time += new Date(issue.closed_at).getTime() - created_time;
            } else if(issue.updated_at != null) {
                tot_response_time += new Date(issue.updated_at).getTime() - created_time;
            } else {
                logger.log('debug', "Issue never updated or closed");
                tot_response_time += 120000000; // add 2 weeks in time, should round to 1.0 in score
            }
            
        }

        // if there were no events, responsiveness is ambiguous, return medium value
        if(num_events == 0) {
            logger.log('info', 'No events in issue list');
            return 0.5;
        }

        logger.log('debug', "Premodified score: %d", tot_response_time / num_events);

        // get avg response time, then score, round to 2 digits
        return Math.round(this.sigmoid(tot_response_time / num_events) * 100); 
    }

    // Takes value in ms, numbers less than 1 hour are extremely close to 0
    // numbers greater than 1 week are extremely close to 1
    sigmoid(x: number) {
        return 1/(1 + Math.exp(0.00000001*(-x) + 6));
    }
}
*/

