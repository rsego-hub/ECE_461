import { Octokit } from "octokit";
import {
  GetResponseTypeFromEndpointMethod,
  GetResponseDataTypeFromEndpointMethod,
} from "@octokit/types";
import Downloader from "nodejs-file-downloader";

import { Repository } from "./repository";
import { cp } from "fs";

 /* Issue Class
 */
export class Issue {
	created_at:string|null;
	updated_at:string|null;
	closed_at:string|null;
	total_events:number|null;
	constructor(created_at: string|null, updated_at: string|null, closed_at: string|null, total_events: number|null) {
		this.created_at = created_at;
		this.updated_at = updated_at;
		this.closed_at = closed_at;
		this.total_events = total_events;
	}
}

 /* Contributor Class
 */
export class Contributor {
	login:string;
	total_contributions:number;
	constructor(login:string, total_contributions:number) {
		this.login = login;
		this.total_contributions = total_contributions;
	}
}

export class Contributions {
	total_commit_conts:number;
	total_issue_conts:number;
	total_pr_conts:number;
	contributors:Contributor[];
	constructor(total_commit_conts:number, total_issue_conts:number, total_pr_conts:number, contributors:Contributor[]) {
		this.total_commit_conts = total_commit_conts;
		this.total_issue_conts = total_issue_conts;
		this.total_pr_conts = total_pr_conts;
		this.contributors = contributors;
	}
}

 /* GithubRepository Class
 */
export class GithubRepository extends Repository {
	private octokit = new Octokit({
    	auth: process.env.GITHUB_TOKEN,
	});                                
     
	constructor(owner: string, repo: string) {
		super(owner, repo);
	}
	
	// took from example code in nodejs-file-downloader
	// https://www.npmjs.com/package/nodejs-file-downloader?activeTab=readme#basic
	private async download_file_content(url:string):Promise<string | null> {
		const downloader = new Downloader({
		  url: url, 
		  directory: "./downloads/" + this.repo, //This folder will be created, if it doesn't exist.
		});
		try {
		  const {filePath,downloadStatus} = await downloader.download(); //Downloader.download() resolves with some useful properties.
		    logger.log('debug', "All done" + filePath);	
		    return filePath;
		} catch (error) {
		  //IMPORTANT: Handle a possible error. An error is thrown in case of network errors, or status codes of 400 and above.
		  //Note that if the maxAttempts is set to higher than 1, the error is thrown only if all attempts fail.
		  logger.log('debug', "Download failed", error);
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
		
		var cdata:ContentResponseDataType;
		var rv:string|null = null;
		// uses octokit REST API to fetch file content
		try {
			var content:ContentResponseType = await this.octokit.rest.repos.getContent({
			  owner: this.owner,
			  repo: this.repo,
			  path: pathname,
			});
			logger.log('info', "Fetched file " + pathname + " from " + this.owner + "/" + this.repo);
			cdata = content.data;
		} catch (error) {
			logger.log('debug', "Could not fetch file " + pathname + " from " + this.owner + "/" + this.repo);
			return new Promise((resolve) => {
				resolve(rv);
			});	
		}
		
		// this does not work for some reason - debug
		// this is a workaround since we cannot seem to access object properties of cdata above
		var jdata = JSON.parse(JSON.stringify(cdata));
		var download_url:string = jdata.download_url;
		const downloaded_file:string|null = await this.download_file_content(download_url);		
		if (downloaded_file == null) {
			logger.log('info', "Could not resolve location of downloaded file");
		}
		return new Promise((resolve) => {
			resolve(downloaded_file);
		});		
	}
	
	// @ROBERT I am still working on this - will finish asap
	async get_issues():Promise<Issue[]> {
		type IteratorResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.paginate.iterator>;
		type IteratorResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.paginate.iterator>; 
		
		type ContentResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.rest.issues.listForRepo>;
		type ContentResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.rest.issues.listForRepo>; 
		
		type EventsResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.rest.issues.listEvents>;
		type EventsResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.rest.issues.listEvents>;

		var rv:Issue[] = [];
		// uses octokit REST API to fetch issues list
		const iterator:IteratorResponseType = this.octokit.paginate.iterator(this.octokit.rest.issues.listForRepo, {
		  owner: this.owner,
		  repo: this.repo,
		  per_page: 100,
		});
		// iterate through each response and error check null response
		// MUST ERROR CHECK HERE @PRIYANKA
		for await (const { data: issues } of iterator) {
			for (const issue of issues) {
				var eventcontent:EventsResponseType = await this.octokit.rest.issues.listEvents({
					owner: this.owner,
					repo: this.repo,
					issue_number: issue.number
				});
				var eventcdata:EventsResponseDataType = eventcontent.data;
				var curr_issue = new Issue(issue.created_at, issue.updated_at, issue.closed_at, eventcdata.length);
				rv.push(curr_issue);
				logger.log('info', "Owner: %s, Repo: %s, Issue #%d: %s", this.owner, this.repo, issue.number, issue.title, );
		  	}
		}
	
		return new Promise((resolve) => {
			resolve(rv);
		});
	} 

	async get_license():Promise<string | null> {
		type ContentResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.rest.licenses.getForRepo>;
		type ContentResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.rest.licenses.getForRepo>; 
		var cdata:ContentResponseDataType;
		var rv:string|null = null;

		// uses octokit REST API to fetch license data
		try {
			var content:ContentResponseType = await this.octokit.rest.licenses.getForRepo({
			  owner: this.owner,
			  repo: this.repo,
			});
			cdata = content.data;
			logger.log('info', "Fetched license file from " + this.owner + "/" + this.repo);
		} catch (error) {
			logger.log('debug', "Could not fetch license file from " + this.owner + "/" + this.repo);
			return new Promise((resolve) => {
				resolve(rv);
			});	
		}

		// this is a workaround since we cannot seem to access object properties of cdata above
		var jdata = JSON.parse(JSON.stringify(cdata));		
		return new Promise((resolve) => {
			resolve(jdata.license.spdx_id);
		});
	}   
	
	async get_readme():Promise<string | null> {
		type ContentResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.getReadme>;
		type ContentResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.getReadme>; 
		var cdata:ContentResponseDataType;
		var rv:string|null = null;

		// uses octokit REST API to fetch license data
		try {
			var content:ContentResponseType = await this.octokit.rest.repos.getReadme({
			  owner: this.owner,
			  repo: this.repo,
			});
			cdata = content.data;
			logger.log('info', "Fetched readme file from " + this.owner + "/" + this.repo);
		} catch (error) {
			logger.log('debug', "Could not fetch readme file from " + this.owner + "/" + this.repo);
			return new Promise((resolve) => {
				resolve(rv);
			});	
		}

		// this does not work for some reason - debug
		// this is a workaround since we cannot seem to access object properties of cdata above
		var jdata = JSON.parse(JSON.stringify(cdata));
		var download_url:string = jdata.download_url;
		const downloaded_file:string|null = await this.download_file_content(download_url);		
		if (downloaded_file == null) {
			logger.log('info', "Could not resolve location of downloaded file");
		}
		return new Promise((resolve) => {
			resolve(downloaded_file);
		});	
	}     
	
	// @ANDY Will finish this ASAP!
	async get_contributors_stats():Promise<Contributions> {
		var contributors:Contributor[] = [];
		type ContentResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.listContributors>;
		type ContentResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.listContributors>;
		var cdata:ContentResponseDataType;
		var rv:Contributions;

		try {
			var content:ContentResponseType = await this.octokit.rest.repos.listContributors({
			  owner: this.owner,
			  repo: this.repo,
			  anon: "false",
			});
			cdata = content.data;
			logger.log('info', "Fetched readme file from " + this.owner + "/" + this.repo);
		} catch (error) {
			logger.log('debug', "Could not fetch readme file from " + this.owner + "/" + this.repo);
			return new Promise((resolve) => {
				resolve(rv);
			});
		}

		// this does not work for some reason - debug
		// this is a workaround since we cannot seem to access object properties of cdata above
		var jdata = JSON.parse(JSON.stringify(cdata));
		var size:number = jdata.length;
//		console.log(jdata);
//		console.log(size);
//		console.log(jdata[0].contributions);
		for (const data of jdata) {
			//console.log(data.contributions);
		}

		return new Promise((resolve) => {
			resolve(rv);
		});
	}                                                                                                                          
 }                                                                                            
 
 