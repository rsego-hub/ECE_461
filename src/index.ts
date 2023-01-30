import { Metric, LicenseMetric } from "./metric"
import { GithubRepository } from "./github_repository"
import { Repository } from "./repository"

var git_repo:Repository = new GithubRepository("octocat", "hello-world");
var metric:Metric = new LicenseMetric();
metric.get_metric(git_repo).then(result => {console.log(result)});