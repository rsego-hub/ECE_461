import { Octokit } from "octokit";
import {
  GetResponseTypeFromEndpointMethod,
  GetResponseDataTypeFromEndpointMethod,
} from "@octokit/types";
import Downloader from "nodejs-file-downloader";

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
	
	private async download_file_content(url:string):Promise<string | null> {
  		// Wrapping the code with an async function, just for the sake of example.
		const downloader = new Downloader({
		  url: url, //If the file name already exists, a new file with the name 200MB1.zip is created.
		  directory: "./downloads/" + this.repo, //This folder will be created, if it doesn't exist.
		});
		try {
		  const {filePath,downloadStatus} = await downloader.download(); //Downloader.download() resolves with some useful properties.
		    console.log("All done" + filePath);	
		    return filePath;
		} catch (error) {
		  //IMPORTANT: Handle a possible error. An error is thrown in case of network errors, or status codes of 400 and above.
		  //Note that if the maxAttempts is set to higher than 1, the error is thrown only if all attempts fail.
		  console.log("Download failed", error);
		}
		return null;
	}
	
	// Must input pathname - if in main directory of repo, just put filename.
	// For example, pathname arg could be README.md or README
	async get_file_content(pathname: string):Promise<string | null> {
		type ContentResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.getContent>;
		type ContentResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.getContent>; 
		
		// uses octokit REST API to fetch README
		var content:ContentResponseType = await this.octokit.rest.repos.getContent({
		  owner: this.owner,
		  repo: this.repo,
		  path: pathname,
		});
		
		var cdata:ContentResponseDataType = content.data;

		// this does not work for some reason - debug
		// this is a workaround since we cannot seem to access object properties of cdata above
		var jdata = JSON.parse(JSON.stringify(cdata));
		var download_url:string = jdata.download_url;
		const downloaded_file:string|null = await this.download_file_content(download_url);		
		
		return new Promise((resolve) => {
			resolve(downloaded_file);
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

	async get_license():Promise<string> {
		type ContentResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.rest.licenses.getForRepo>;
		type ContentResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.rest.licenses.getForRepo>; 
		
		// uses octokit REST API to fetch README
		var content:ContentResponseType = await this.octokit.rest.licenses.getForRepo({
		  owner: this.owner,
		  repo: this.repo,
		});
		
		var cdata:ContentResponseDataType = content.data;

		// this does not work for some reason - debug
		// 	console.log(cdata.name)
		// this is a workaround since we cannot seem to access object properties of cdata above
		var jdata = JSON.parse(JSON.stringify(cdata));
		console.log(jdata);
		
		return new Promise((resolve) => {
			resolve("");
		});
	}   
	
	async get_readme():Promise<string> {
		return new Promise((resolve) => {
			resolve("");
		});
	}     
	
	async get_contributors_stats():Promise<string> {
		return new Promise((resolve) => {
			resolve("");
		});
	}                                                                                                                          
 }                                                                                            
 
 