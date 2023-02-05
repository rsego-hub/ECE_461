"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
/* Metric Class
 *
*/
var Metric = /** @class */ (function () {
    function Metric() {
    }
    Metric.prototype.get_metric = function (repo) {
    };
    return Metric;
}());
var LicenseMetric = /** @class */ (function (_super) {
    __extends(LicenseMetric, _super);
    function LicenseMetric() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LicenseMetric.prototype.get_metric = function (repo) {
        var license = repo.get_license(); // @type {string}
        var regex = new RegExp("LGPL v2.1"); // Very basic regex, can be expanded on in future
        if (regex.test(license)) {
            return true;
        }
        return false;
    };
    return LicenseMetric;
}(Metric));
