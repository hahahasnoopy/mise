import pQueue from "p-queue"
// import delay from "delay"

import { worker } from "./app";



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
worker("SA17225252")