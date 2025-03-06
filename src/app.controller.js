import cors from 'cors'
import dbConnection from './DB/connection.js'
import authController from './modules/auth/auth.controller.js'
import userController from './modules/user/user.controller.js'
import companyController from './modules/company/company.controller.js'
import jobController from './modules/job/job.controller.js'
import chatController from './modules/chat/chat.controller.js'
import { globalErrorHandling } from './utilies/response/error.response.js'
import { createHandler } from 'graphql-http/lib/use/express'
import { schema } from './modules/app.graph.js'
import helmet from "helmet"
import rateLimit from "express-rate-limit"

const bootstrap = (app, express) => {

    // const limiter = rateLimit({
    // windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) , 
    // limit: parseInt(process.env.RATE_LIMIT_MAX) ,
    // standardHeaders: 'draft-8', 
    // legacyHeaders: false, 
    // message:{error:"to many Requests"}
    //     })


    app.use(cors())
    // app.use(helmet())
    // app.use(limiter)

    //convert buffer data
    app.use(express.json())

    //app routing
    app.use('/graphql', createHandler({ schema: schema }))
    app.use('/auth', authController)
    app.use('/user', userController)
    app.use('/company', companyController)
    app.use('/job', jobController)
    app.use('/chat', chatController)






    app.use("*", (req, res, next) => {
        return res.status(404).json({ message: "in valid routing" })
    })


    //db connection 
    dbConnection()
    app.use(globalErrorHandling)

}



export default bootstrap