import { Octokit } from "octokit";
// const Octokit = require("octokit");

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

const iterator = octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
  owner: "octocat",
  repo: "hello-world",
  per_page: 100,
});

// iterate through each response
for await (const { data: issues } of iterator) {
  for (const issue of issues) {
    console.log("Issue #%d: %s", issue.number, issue.title);
  }
}