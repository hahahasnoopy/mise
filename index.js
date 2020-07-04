const fs = require("fs");
const source = require('./source.json');
const worker = require("./app");
const Promise = require('bluebird');

(async function () {
    for (const value of source) {
        console.log(value);

        const arr = new Array(999999)
        let succeed = false
        let num = 0
        await Promise.map(arr, () => {
            if (succeed) {
                return Promise.resolve()
            }
            num++
            return worker(value, padding(num)).then(
                res => {
                    if (res) {
                        succeed = true
                    }
                }
            )
        }, {
            concurrency: 20
        })
    }
})()

function padding(num, length) { // 给数字前面补0
    for (let len = (num + '').length; len < length; len = num.length) {
        num = '0' + num
    }
    return num
}