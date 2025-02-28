import { Server } from 'socket.io'
import {registerSocket,logOutSocketId} from '../../modules/socket/services/auth.socket.services.js'
import { sendMessage } from './services/socket.services.js'

let io=undefined
export const runIo=(httpServer)=>{
 io= new Server(httpServer,{cors:"*"})
io.on("connection", async (socket)=>{
    await registerSocket(socket)
    await logOutSocketId(socket)
    await sendMessage(socket)
})
}

export const getIo=()=>{
return io
}