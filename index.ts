import xlsx = require("xlsx")
import fs = require("fs")
import { worker } from "./app"

interface Item{
  A:string
}

const workbook = xlsx.readFile("source.xls")
const sheet = workbook.Sheets["符合不符合校内导师条件学生名单"]
const arr  = xlsx.utils.sheet_to_json<Item>(sheet,{header:"A"}).map(a=>a.A)

let p = Promise.resolve()
arr.forEach((item,i)=>{
  p = p.then(()=>
    {
      console.log("initing",item)
      return worker(item,"000000")
    }
  ).then(res=>{
    fs.appendFile("result.txt",res,err=>{
      console.log(err)
    })
    console.log("result",res,i)
    return
  })
  }
)