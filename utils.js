"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    increse() {
    }
    static getCookie(res) {
        return (res.headers.get("set-cookie") || "").split(";")[0];
    }
}
exports.default = Utils;
