import { Repository } from "./repository"
import { Octokit, App } from "octokit";

/* Metric Class
 * Abstract class to be extendedd for all current and future metric subclass
 * 
 * Subclasses:
 * License, BusFactor, RampUp, ResponsiveMaintainer, Correctness
*/
export abstract class Metric {
    abstract get_metric(repo: Repository):Promise<number>;
}

/* License Metric Class
 * Finds compatibility of repository license with GNU Lesser General Public License v2.1
 *
*/
export class LicenseMetric extends Metric {
    async get_metric(repo: Repository):Promise<number> {
        const license: string = await repo.get_license();

        let regex = new RegExp("LGPL v2.1") // Very basic regex, can be expanded on in future
        if(regex.test(license)) {
            return 1
        }
        return 0
    }
}

/* Responsive Maintenance Metric Class
 * Get average amount of time before an issue or bug is resolved
 *
*/
export class ResponsiveMetric extends Metric {
    async get_metric(repo: Repository):Promise<number> {

        const iterator = await repo.get_issues() // get all issues

        var tot_response_time = 0; // time measured in ms
        var num_events = 0;
        var prevdate;

        // for each issue
		for await (const { data: issues } of iterator) {

            // get the first event for the issue
            const event_iter = issues.listEvents();
            prevdate = event_iter.next().time.getTime();

            // for each event in the list
            for await (const event of event_iter) {
                tot_response_time += new Date(event.time).getTime() - prevdate; // increase response_time
                prevdate = event.time;
                num_events += 1;
            }
		}

        // if there were no events, responsiveness is ambiguous, return medium value
        if(num_events == 0) {
            return 0.5;
        }

        // get avg response time, then score, round to 2 digits
        return Math.round(this.sigmoid(tot_response_time / num_events) * 100); 
    }

    // Takes value in ms, numbers less than 1 hour are extremely close to 0
    // numbers greater than 1 week are extremely close to 1
    sigmoid(x: number) {
        return 1/(1 + Math.exp(0.00000001*(-x) + 6));
    }
}