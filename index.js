"use strict";
exports.__esModule = true;
var xlsx_1 = require("xlsx");
var app_1 = require("./app");
var workbook = xlsx_1["default"].readFile("source.xls");
var sheet = workbook.Sheets["符合不符合校内导师条件学生名单"];
var arr = xlsx_1["default"].utils.sheet_to_json(sheet, { header: "A" }).map(function (a) { return a.A; });
var _loop_1 = function (i, p) {
    p = p.then(function (_) {
        app_1.worker(arr[i]);
    });
    out_p_1 = p;
};
var out_p_1;
for (var i = 1, p = Promise.resolve(); i < arr.length; i++) {
    _loop_1(i, p);
    p = out_p_1;
}
