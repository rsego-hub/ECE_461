import { Octokit } from "octokit";
import {
  GetResponseTypeFromEndpointMethod,
  GetResponseDataTypeFromEndpointMethod,
} from "@octokit/types";
import Downloader from "nodejs-file-downloader";

import { Repository } from "./repository";
                                                                                        
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
		
		return new Promise((resolve) => {
			resolve(downloaded_file);
		});		
	}
	
	// @ROBERT I am still working on this - will finish asap
	async get_issues():Promise<string> {
		type IteratorResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.paginate.iterator>;
		type IteratorResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.paginate.iterator>; 
		
		type ContentResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.rest.issues.listForRepo>;
		type ContentResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.rest.issues.listForRepo>; 
		
		var cdata:IteratorResponseDataType;
		var rv:string|null = null;
		// uses octokit REST API to fetch issues list
		const iterator:IteratorResponseType = this.octokit.paginate.iterator(this.octokit.rest.issues.listForRepo, {
		  owner: this.owner,
		  repo: this.repo,
		  per_page: 100,
		});
		// iterate through each response
		var title:string = "";
		var content:ContentResponseDataType;
		for await (const { data: issues } of iterator) {
			for (const issue of issues) {
		   		console.log('debug', "Issue #%d: %s", issue.number, issue.title, );
				title = issue.title;
		  	}
		}
	
//		// uses octokit REST API to fetch issues list
//		const iterator = this.octokit.paginate.iterator(this.octokit.rest.issues.listForRepo, {
//		  owner: "octocat",
//		  repo: "hello-world",
//		  per_page: 100,
//		});
//		// iterate through each response
//		var title:string = "";
//		for await (const { data: issues } of iterator) {
//			for (const issue of issues) {
//		   		logger.log('debug', "Issue #%d: %s", issue.number, issue.title);
//				title = issue.title;
//		  	}
//		}
		return new Promise((resolve) => {
			resolve(title);
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
			logger.log('info', "Fetched license file from " + this.owner + "/" + this.repo);
		} catch (error) {
			logger.log('debug', "Could not fetch license file from " + this.owner + "/" + this.repo);
			return new Promise((resolve) => {
				resolve(rv);
			});	
		}

		// this does not work for some reason - debug
		// this is a workaround since we cannot seem to access object properties of cdata above
		var jdata = JSON.parse(JSON.stringify(cdata));
		var download_url:string = jdata.download_url;
		const downloaded_file:string|null = await this.download_file_content(download_url);		
		
		return new Promise((resolve) => {
			resolve(downloaded_file);
		});	
	}     
	
	// @ANDY Will finish this ASAP!
	async get_contributors_stats():Promise<string> {
		return new Promise((resolve) => {
			resolve("");
		});
	}                                                                                                                          
 }                                                                                            
 
 