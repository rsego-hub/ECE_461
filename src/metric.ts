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

/* License Class
 * Finds compatibility of repository license with GNU Lesser General Public License v2.1
 *
*/
export class LicenseMetric extends Metric {
    async get_metric(repo: Repository):Promise<number> {
        const license: string|null = await repo.get_file_content("README.md");
		if (license != null) {
	        let regex = new RegExp("LGPL v2.1"); // Very basic regex, can be expanded on in future
	        if(regex.test(license)) {
	            return 1
	        }
	    }
        return 0
    }
}
