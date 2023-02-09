import { Ranking } from "../src/ranking"
import { GithubRepository } from "../src/github_repository"

describe('Ranking Module', () => {
    // prelimnary tests, unrun due to relying on functionality not merged yet
    test('Give list of sample urls', () => {

        var repolist:GithubRepository[];
        repolist = [new GithubRepository("Test1", "https://github.com/cloudinary/cloudinary_npm"), 
                    new GithubRepository("Test2", "https://www.npmjs.com/package/express"), 
                    new GithubRepository("Test3", "https://github.com/nullivex/nodist"), 
                    new GithubRepository("Test4", "https://github.com/lodash/lodash"), 
                    new GithubRepository("Test5", "https://www.npmjs.com/package/browserify")];
        
    })
})