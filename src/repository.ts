import { Issue } from "./github_repository"

/* Repository Class
 * Abstract class to be extendedd for all current and future Repository subclass
 * 
 * Subclasses:
 * GithubRepository, NpmRepository
*/

export abstract class Repository {
	owner: string; // for use in github APIs
	repo: string; // for use in github APIs
	/*
	url_type: string; // 'npm' or 'git' or "" if invalid
	url_obj: URL;
	*/
	// @PRIYANKA: change constructor to take in string url as 
	// parameter and set member variables owner, repo, and
	// type (npm/git) based on URL parsing
	constructor(owner:string, repo:string) {
		this.owner = owner;
		this.repo = repo;
	}
	/*
	constructor(url_val:string) {
		var url_obj:URL;
		try {
			url_obj = new URL(url_val);
		} catch(error) {
			throw "Invalid URL input!";
		}

		this.url_obj = url_obj;
		var host:string = this.url_obj.host;
		var pathname:string = this.url_obj.pathname;

		if (host == "github.com") {
			this.url_type = "git";
			if (pathname )
		}
		else if (host == "www.npmjs.com") {
			this.url_type = "npm";
		}
		else {
			this.url_type = "";
		}

		this.owner = ;
		this.repo = ;
	}
	*/
	/* get_license() function
		returns license file spdx_id as string or null
		a valid spdx-id will be lgpl-2.1 or MIT
		make sure to error check for null string return.
		Some repositories don't have a license file!!
		Should also call get_readme and regex for license
		MIT and LGPL in the readme in the license metric.
	*/
    abstract get_license():Promise<string | null>;
    abstract get_issues():Promise<Issue[]>;
	/* get_file_content() function
		input argument is name of requested file in the source repo
		returns absolute filepath of downloaded requested file in this project
		make sure to error check for null string return.
	*/
    abstract get_file_content(pathname: string):Promise<string | null>;
	/* get_readme() function
		returns absolute filepath of downloaded readme in this project
		make sure to error check for null string return.
		Some will download readme as txt files, but if readme.md in
		the source, the downloaded file will be in markdown.
		Suggest the use of a markdown parsing library
	*/
    abstract get_readme():Promise<string | null>;
    abstract get_contributors_stats():Promise<string>;
}
