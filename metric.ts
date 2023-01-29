import { Repository } from "./repository.js"

/* Metric Class
 * Abstract class to be extendedd for all current and future metric subclass
 * 
 * Subclasses:
 * License, BusFactor, RampUp, ResponsiveMaintainer, Correctness
*/
abstract class Metric {
    get_metric(repo: Repository) {
    }
}

/* License Class
 * Finds compatibility of repository license with GNU Lesser General Public License v2.1
 *
*/
class LicenseMetric extends Metric {
    get_metric(repo: Repository) {
        var license: string = repo.get_license();

        let regex = new RegExp("LGPL v2.1") // Very basic regex, can be expanded on in future
        if(regex.test(license)) {
            return true
        }
        return false
    }
}