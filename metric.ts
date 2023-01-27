let message: string = 'Hello, World!';
console.log(message);

// Metric class itself should never be created, only subclasses which have 
// specific metric calculations
abstract class Metric {
    get_metric(repo: Repository) {
    }
}


class LicenseMetric extends Metric {
    get_metric(repo: Repository) {

    }
}