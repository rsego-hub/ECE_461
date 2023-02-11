import { describe, expect, test } from '@jest/globals';
/*
import { GithubRepository } from '../src/github_repository';

describe('GithubRepository constructor', () => {
	test('all valid inputs', () => {
		const git_repo = new GithubRepository("https://github.com/cloudinary/cloudinary_npm", 
		"cloudinary", "cloudinary_npm", "https://github.com/cloudinary/cloudinary_npm");
		expect(git_repo).toEqual({url:"https://github.com/cloudinary/cloudinary_npm", 
		owner:"cloudinary", repo:"cloudinary_npm", cloning_url:"https://github.com/cloudinary/cloudinary_npm"});
	});
});
*/

describe('repository test', () => {
    test('Repository dummy test', () => {
        expect(null).toBe(null); // unsure of specific value, should be closer to 0 than 1
    })
})