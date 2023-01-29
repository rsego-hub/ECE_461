/* Repository Class
 * Abstract class to be extendedd for all current and future Repository subclass
 * 
 * Subclasses:
 * GithubRepository, NpmRepository
*/

export abstract class Repository {
	owner: string;
	repo: string;
	constructor(owner: string, repo: string) {
		this.owner = owner;
		this.repo = repo;
	}
    abstract get_license():Promise<string>;
    abstract get_issues():Promise<string>;
}