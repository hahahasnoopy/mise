import sqlite3 from "sqlite3"

const db = new sqlite3.Database("./progress.db")

db.serialize(function(){
  
})
