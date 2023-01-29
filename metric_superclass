//Metric superclass with get_weighted_sum and get _metric metric methods

abstract class metric{
    private repo: Repository;

    abstract get_metric(repo: Repository);

    get_weigted_sum(license:number,BusFactor:number,Correctness:number,RampUp :number,ResponsiveMaintainer:number): number{
        return license * (0.4 * BusFactor + 0.2 * Correctness + 0.2 * RampUp + 0.2 * ResponsiveMaintainer);
    }
}   