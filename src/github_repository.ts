import { Octokit } from "octokit";
import {
  GetResponseTypeFromEndpointMethod,
  GetResponseDataTypeFromEndpointMethod,
} from "@octokit/types";
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
		type ContentResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.getContent>;
		type ContentResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.getContent>; 
		
		// uses octokit REST API to fetch README
		var content:ContentResponseType = await this.octokit.rest.repos.getContent({
		  owner: "octocat",
		  repo: "hello-world",
		  path: "README",
		});
		
		console.log(content);
		console.log("********************************************");
		var cdata:ContentResponseDataType = content.data;
		console.log(cdata);
		console.log("********************************************");
		console.log(typeof(cdata));
		
		// this does not work for some reason - debug
		// 	console.log(cdata.name)
		// this is a workaround since we cannot seem to access object properties of cdata above
		var jdata = JSON.parse(JSON.stringify(cdata));
		console.log(jdata.name);
		
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
 
 