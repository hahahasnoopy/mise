import xlsx = require("xlsx")
import fs = require("fs")
import { worker } from "./app"

interface Item{
  A:string
}

const workbook = xlsx.readFile("source.xls")
const sheet = workbook.Sheets["符合不符合校内导师条件学生名单"]
const arr  = xlsx.utils.sheet_to_json<Item>(sheet,{header:"A"}).map(a=>a.A)

async function loop(){
  for(let i=1;i<arr.length;i++){
    try {
      const res = await worker(arr[i])
      fs.appendFile("result.txt",res,err=>{
        console.log(err)
      })
    } catch (error) {
      fs.appendFile("result.txt",error,err=>{
        console.log(err)
      })
    }
  }
}

loop()
