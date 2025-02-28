import path from 'node:path'
import * as dotenv from "dotenv"
dotenv.config({path:path.resolve("./src/config/.env.dev")})
import express from 'express'
import bootstrap from './src/app.controller.js'
import { startCronJob } from './src/utilies/shared/CronJob.js'
import { runIo } from './src/modules/socket/socket.controller.js'
startCronJob()
const app=express()
bootstrap(app,express)
const httpServer=app.listen(process.env.PORT,()=>{
    console.log(`app is running on port ${process.env.PORT}`)
})

runIo(httpServer)