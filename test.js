"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import delay from "delay"
const app_1 = require("./app");
// const queue = new pQueue({concurrency:2})
// queue.add(()=>
//   delay(3000)
// ).then(res=>{
//   console.log(res,111)
// })
// queue.add(() => Promise.resolve());
// queue.add(() => delay(2000));
// queue.add(() => Promise.resolve());
// queue.add(() => Promise.reject(222));
// queue.add(() => Promise.resolve());
// queue.add(() => delay(500));
// queue.on("active",()=>{
//   console.log(queue.size,queue.pending,queue.isPaused)
// })
app_1.worker("SA17225252");
