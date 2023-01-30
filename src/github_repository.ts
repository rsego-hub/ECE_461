import { Octokit } from "octokit";
import { Repository } from "./repository";
// const Octokit = require("octokit");
                                                                                             
 /* GithubRepository Class                                                                    
  *                                                                                           
 */                                                                                           
export class GithubRepository extends Repository {
	private octokit = new Octokit({
    	auth: process.env.GITHUB_TOKEN,
	});

	constructor(owner: string, repo: string) {
		super(owner, repo);
	}
	
	async get_license():Promise<string> {
		// uses octokit REST API to fetch README
		const { data } = await this.octokit.rest.repos.getContent({
		  owner: "octocat",
		  repo: "hello-world",
		  path: "README.md",
		});
		console.log(data);
		var title:string = "priyanka"
		// iterate through each response
//		const readme_content:string = { data: content };
//		for await (const { data: issues } of iterator) {
//			for (const issue of issues) {
//		   		console.log("Issue #%d: %s", issue.number, issue.title);
//				title = issue.title;
//		  	}
//		  	console.log("outer loop");
//		}
		return new Promise((resolve) => {
			resolve(title);
		});		
	}
	
	// temp get_issues from sample 
	async get_issues():Promise<string> {
		// uses octokit REST API to fetch README
		const iterator = this.octokit.paginate.iterator(this.octokit.rest.issues.listForRepo, {
		  owner: "octocat",
		  repo: "hello-world",
		  per_page: 100,
		});
		// iterate through each response
		var title:string = "";
		for await (const { data: issues } of iterator) {
			for (const issue of issues) {
		   		console.log("Issue #%d: %s", issue.number, issue.title);
				title = issue.title;
		  	}
		}
		return new Promise((resolve) => {
			resolve(title);
		});
	}                                                                                                                                     
 }                                                                                            
 
 