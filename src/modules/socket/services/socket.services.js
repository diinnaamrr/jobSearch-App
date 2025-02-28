import { authentication } from "../../../middelware/socket/auth.socket.middelware.js"
import * as DbServices from '../../../DB/dbServices.js'
import { chatModel } from "../../../DB/models/Chat.model.js"
import {  socketConnection } from "../../../DB/models/User.model.js"
import {roleTypes} from '../../../utilies/shared/enumTypes.js'
import { companyModel } from "../../../DB/models/Company.model.js"


export const sendMessage =( socket)=>{

 return socket.on("sendMessage",async(messageData)=>{
const {data,valid} = await authentication({socket,checkAuthorization:true,accessRoles:[roleTypes.Hr,roleTypes.user]})
if(!valid){
return socket.emit("socket_Error",data)
    }
const userId= data.user._id // user that send message (sender)
const{message,destId}=messageData
const userRole=data.user.role
console.log({userId,message,destId})

const company=await DbServices.findOne({model:companyModel,
    filter:{
        createdBy:userId
    },
    select:("_id")
})

const isCompanyOwner= company !== null

let chat = await DbServices.findOne({
    model: chatModel,
    filter: {
      $or: [
        { senderId: userId, recieverId: destId },
        { senderId: destId, recieverId: userId },
      ],
    },
  });

  if (!chat) {
    if (!(userRole === roleTypes.Hr || isCompanyOwner)) {
      return socket.emit("socket_Error", { message: "Only HR or company owner can start the conversation" });
    }

    chat = await DbServices.create({
      model: chatModel,
      data: {
        senderId: userId,
        recieverId: destId,
        messages: [{ message, senderId: userId }],
      },
    });
  }
   else {
    chat = await DbServices.findOneAndUpdate({
      model: chatModel,
      filter: { _id: chat._id },
      data: { $push: { messages: { message, senderId: userId } } },
      populate: [
        { path: "senderId", select: "firstName lastName userName image" },
        { path: "recieverId", select: "firstName lastName userName image" },
      ],
    });
  }


socket.emit("successMessage",{chat,message})
socket.to(socketConnection.get(destId)).emit("receiveMessage",{chat,message})
return "Done"
})

}