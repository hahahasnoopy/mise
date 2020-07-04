const xlsx = require("xlsx")
const fs = require("fs")

const workbook = xlsx.readFile("source.xls")
const sheet = workbook.Sheets["符合不符合校内导师条件学生名单"]
const arr = xlsx.utils.sheet_to_json(sheet, { header: "A" }).map(a => a.A)

arr.shift()//remove the first line

fs.writeFileSync('source.json', JSON.stringify(arr))
