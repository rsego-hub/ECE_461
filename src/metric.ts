import { Repository } from "./repository"

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


        var license: string|null = await repo.get_license(); // ask for license file
        if (license == null) {
            logger.log('info', "No license file, retreiving README");
            license = await repo.get_file_content("README.md"); // ask for readme
            if (license == null) {
                logger.log('info', "No license or readme found");
                return 0
            }
        }
        
        let regex = new RegExp("(GNU\s*)?L?GPL\s*v?(?:2|3)");
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
