import { Repository } from "./repository.js"

/* Metric Class
 *
*/
abstract class Metric {
    get_metric(repo: Repository) {
    }
}


class LicenseMetric extends Metric {
    get_metric(repo: Repository) {
        var license = repo.get_license(); // @type {string}

        let regex = new RegExp("LGPL v2.1") // Very basic regex, can be expanded on in future
        if(regex.test(license)) {
            return true
        }
        return false
    }
}