import { Octokit } from "octokit";
import {
  GetResponseTypeFromEndpointMethod,
  GetResponseDataTypeFromEndpointMethod,
} from "@octokit/types";
import Downloader from "nodejs-file-downloader";
import { graphql, GraphqlResponseError,  } from "@octokit/graphql"
import type { GraphQlQueryResponseData } from "@octokit/graphql";

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
	total_commits_1yr:number|null;
	last_release_date:string|null;
	last_pushed_date:string|null;
	contributors:Contributor[];
	constructor(total_commits_1yr:number|null, last_release_date:string|null, last_pushed_date:string|null, contributors:Contributor[]) {
		this.total_commits_1yr = total_commits_1yr;
		this.last_release_date = last_release_date;
		this.last_pushed_date = last_pushed_date;
		this.contributors = contributors;
	}
}

 /* GithubRepository Class
 */
export class GithubRepository extends Repository {
	private octokit = new Octokit({
    	auth: process.env.GITHUB_TOKEN,
	});
  
	constructor(url:string, owner: string, repo: string) {
		super(url, owner, repo);
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
	
	async get_contributors_stats():Promise<Contributions> {
		var contributors:Contributor[] = [];
		type ContentResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.listContributors>;
		type ContentResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.listContributors>;
		var cdata:ContentResponseDataType|null = null;
		var rv:Contributions;

		try {
			var content:ContentResponseType = await this.octokit.rest.repos.listContributors({
			  owner: this.owner,
			  repo: this.repo,
			  anon: "false",
			});
			cdata = content.data;
			logger.log('info', "Fetched contributors list from " + this.owner + "/" + this.repo);
		} catch (error) {
			logger.log('debug', "Could not fetch contributors list from " + this.owner + "/" + this.repo);
		}

		// this does not work for some reason - debug
		// this is a workaround since we cannot seem to access object properties of cdata above
		if (cdata != null) {
			var jdata = JSON.parse(JSON.stringify(cdata));
			for (const data of jdata) {
				contributors.push(new Contributor(data.login, data.contributions));
			}
		}
		
		
		// GRAPHQL CALLS
		// get the string Date of 1 year ago
		let set_date = new Date();
		set_date.setMonth(set_date.getMonth() - 12);
		var lastContributions:GraphQlQueryResponseData|null = null;
		try {
			lastContributions = await graphql({
				query: `query ContributionsQuery($owner: String!, $repo: String!, $since: GitTimestamp!) {
				  repository(owner: $owner, name: $repo) {
				    object(expression: "master") {
				      ... on Commit {
				        history(since: $since) {
				          totalCount
				        }
				      }
				    }
				    latestRelease {
				      publishedAt
				    }
				    pushedAt
				  }
				}`,
				owner: this.owner,
				repo: this.repo,
				since: set_date,
				headers: {
			    authorization: 'bearer ' + process.env.GITHUB_TOKEN,
			  },
			});
		} catch (error) {
			if (error instanceof GraphqlResponseError) {
				logger.log('info', "GraphQL call failed: " + error.message);
			}
			else {
				logger.log('info', "GraphQL call failed for reason unknown!");
			}
		}
		
		if (lastContributions != null) {
			jdata = JSON.parse(JSON.stringify(lastContributions));
			rv = new Contributions(jdata.repository.object.history.totalCount, jdata.repository.latestRelease.publishedAt,
			jdata.repository.pushedAt, contributors);
		}
		else {
			rv = new Contributions(null, null, null, contributors);
		}

		return new Promise((resolve) => {
			resolve(rv);
		});
	}                                                                                                                          
 }                                                                                            
 
 