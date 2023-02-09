/*
import {describe, expect, test} from '@jest/globals';
import {Metric, LicenseMetric, ResponsiveMetric} from '../src/metric';
import {GithubRepository} from '../src/github_repository';

describe('License Metric Module', () => {
    // prelimnary tests, unrun due to relying on functionality not merged yet
    test('MIT license should be compatible', () => {
        var repo:GithubRepository = new GithubRepository("Test", "https://github.com/lodash/lodash");
        var met:LicenseMetric = new LicenseMetric();
        expect(met.get_metric(repo)).toBe(1);
    })
    test('License referenced in Readme accepted', () => {
        var repo:GithubRepository = new GithubRepository("Test", "https://github.com/cloudinary/cloudinary_npm");
        var met:LicenseMetric = new LicenseMetric();
        expect(met.get_metric(repo)).toBe(1);
    })
})

describe('Responsive Metric Module', () => {
    test('Repo with weeks between issue responsive', () => {
        var repo:GithubRepository = new GithubRepository("Test", "https://github.com/lodash/lodash");
        var met:ResponsiveMetric = new ResponsiveMetric();
        expect(met.get_metric(repo)).toBe(null); // unsure of specific value, should be closer to 0 than 1
    })
})

*/