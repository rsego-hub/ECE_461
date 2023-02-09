import { Repository } from "./repository"
import { Issue, Contributor, Contributions } from "./github_repository"
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
		// remove PRIYANKA
		// const conts:Contributions = await repo.get_contributors_stats();
		// end removal
		var final_score:number;
        const license: string|null = await repo.get_file_content("README.md");
		if (license != null) {
	        let regex = new RegExp("LGPL v2.1"); // Very basic regex, can be expanded on in future
	        if(regex.test(license)) {
	            final_score = 1
	        }
	    }
	    
        final_score = 0;
        
        return new Promise((resolve) => {
			resolve(new GroupMetric(repo.url, "LICENSE_SCORE", final_score));
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
    async get_metric(repo: Repository):Promise<GroupMetric> {

        const iterator = await repo.get_issues() // get all issues

        var tot_response_time = 0; // time measured in ms
        var num_events = 0;
        var prevdate;
        
        var final_score:number;
        
        // for each issue
		for await (const { data: issues } of iterator) {

            // get the first event for the issue
            const event_iter = issues.listEvents();
            prevdate = event_iter.next().time.getTime();

            // for each event in the list
            for await (const event of event_iter) {
                tot_response_time += new Date(event.time).getTime() - prevdate; // add time since last event to total response time
                prevdate = event.time;
                num_events += 1;
            }
		}

        // if there were no events, responsiveness is ambiguous, return medium value
        if(num_events == 0) {
            final_score = 0.5;
        }

        // get avg response time, then score, round to 2 digits
        final_score = Math.round(this.sigmoid(tot_response_time / num_events) * 100);
        return new Promise((resolve) => {
			resolve(new GroupMetric(repo.url, "RESPONSIVE_MAINTAINER_SCORE", final_score));
		}); 
    }

    // Takes value in ms, numbers less than 1 hour are extremely close to 0
    // numbers greater than 1 week are extremely close to 1
    sigmoid(x: number) {
        return 1/(1 + Math.exp(0.00000001*(-x) + 6));
    }
}
*/
