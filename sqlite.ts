import sqlite from "sqlite3"

const db = new sqlite.Database("./progress.db")
db.exec("SHOW DATABASES")