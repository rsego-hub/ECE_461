import { describe, expect, test } from '@jest/globals';
import { GithubRepository } from '../src/github_repository';
import { get_real_owner_and_repo, OwnerAndRepo } from '../src/index'

describe('URL handling in main module, test', () => {
	test('valid github url', async () => {
		const url_val = "https://github.com/cloudinary/cloudinary_npm";
		const owner_and_repo = await get_real_owner_and_repo(url_val);
		expect(owner_and_repo).toEqual({url:"https://github.com/cloudinary/cloudinary_npm", 
		owner:"cloudinary", repo:"cloudinary_npm", cloning_url:"https://github.com/cloudinary/cloudinary_npm"});
	});
	test('valid npm url', async () => {
		const url_val = "https://www.npmjs.com/package/express";
		const owner_and_repo = await get_real_owner_and_repo(url_val);
		expect(owner_and_repo).toEqual({url:"https://www.npmjs.com/package/express", 
		owner:"expressjs", repo:"express", cloning_url:"https://github.com/expressjs/express.git"});
	});
});
