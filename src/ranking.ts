import { Repository } from "./repository"
import { Metric } from "./metric"

class Ranking {
    public display_ranking(repolist: RepositoryList) {
        
        logger.log('debug', "Beginning repo map construction")
        var repo_score_map = new Map() // Initialize map
        for (var repo in repolist) { // fill table with weighted scores
            repo_score_map.set(repo, Metric.get_weighted_sum(repo)); 
        }

        logger.log('info', "Ranking %d repositories", repolist.length)
        // do once for every repo in list
        for (var i = 0; i < repolist.length; i++) {
            var max_score = -1; // holders for max vals
            var max_repo = null;
            
            // go through every key in map repo -> score
            for(var key in repo_score_map.keys()) {
                var new_val = repo_score_map.get(key);
                if(new_val > max_score) { // get max score and associated repo
                    max_score = new_val;
                    max_repo = key;
                }
            
            // fail if max_repo is null
            if(max_repo == null) {
                logger.log('debug', "Null repo found");
                return
            }

            // print to console
            console.log("%s with score %d", max_repo.title, max_score);
            repo_score_map.delete(max_repo)
            }
        }
        
    } 

}