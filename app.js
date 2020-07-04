const FormData = require('form-data')
const cheerio = require('cheerio')
const request = require('superagent')
const fs = require("fs");

const log = console.log

const baseUrl = "http://mis.sse.ustc.edu.cn/"

const pattern = /ValidateCode\.aspx(.*?)[0-9]\\/g

/**
 * @param {string} username 
 * @param {string} password 
 */
module.exports = function (username, password) {

    const agent = request.agent()

    const pro = agent
        .get(baseUrl)
        .then(res => {
            const content = res.text
            const $ = cheerio.load(content)
            view_state = $("#__VIEWSTATE").val() //view state字段
            const imgUrl = content.match(pattern) || [""]
            const url = baseUrl + imgUrl[0].replace("&amp;", "&"); //验证码url
            return agent.get(url)
        })
        .then(() => {
            const code = agent.jar.getCookie('CheckCode', {
                path: '/'
            }).value
            log('check code is', code)
            const sum = code.split('').reduce((pre, next) => pre + Number(next), 0) //求和
            log('sum is', sum)
            return sum
        }).then(sum => {
            return agent
                .type('form')
                .post(baseUrl + 'default.aspx')
                .field("__EVENTTARGET", "winLogin$sfLogin$ContentPanel1$btnLogin")
                .field("__VIEWSTATE", view_state)
                .field("winLogin$sfLogin$txtUserLoginID", username)
                .field('winLogin$sfLogin$txtPassword', password)
                .field('winLogin$sfLogin$txtValidate', sum + "")
        }).then(() => {

            const iflysse = agent.jar.getCookie('iflyssesse', {
                path: '/'
            })
            console.log(username, password, iflysse);
            if (!iflysse) {
                return false
            } else {
                fs.writeFile('result.json', {
                    username,
                    password
                })
                return true
            }
        }).catch(e => {
            log(e)
            return Promise.resolve() //忽略部分网络问题导致的错误
        })
    return pro
}