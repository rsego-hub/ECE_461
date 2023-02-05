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

        var title:string = "";
		for await (const { data: issues } of iterator) {
            // possibly instead this line since it works on a group of issues, rather than a single one
            /* for (const event of issues.listEvents()) {
            *      responsetime = new Date(event.time) - prevdate
            *      prevdate = event.time
            */
			for(const issue of issues) {
                console.log("Issue #%d: %s", issue.listEvents());
				title = issue.title;
            }
		}

        return 0
    }
}