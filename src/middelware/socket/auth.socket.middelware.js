import { userModel } from "../../DB/models/User.model.js";
import { tokenTypes, verifyToken } from "../../utilies/security/token.security.js";
import * as DbServices from '../../DB/dbServices.js'

export const authentication=async ({socket={},tokenType=tokenTypes.access,accessRoles=[],checkAuthorization=false}={})=>{
const [bearer,token]=socket?.handshake?.auth?.authorization?.split(" ")||[]
if(!bearer || !token){
    return{data:{message:"missing token componenet",status:400}}
}

let access_signture=""
let refresh_signture=""
    switch (bearer) {   
    case "system":
    access_signture=process.env.ADMIN_ACCESS_TOKEN
     refresh_signture=process.env.ADMIN_REFRESH_TOKEN
    break;
    case "Bearer":
     access_signture=process.env.USER_ACCESS_TOKEN
     refresh_signture=process.env.USER_REFRESH_TOKEN
     break;
    
    }
const decoded= verifyToken({token,signture:tokenType===tokenTypes.access?access_signture:refresh_signture})
if(!decoded?.id){
return{data:{message:"in valid decoded",status:401}}
    }
    
const user= await DbServices.findOne({model:userModel,filter:{_id:decoded.id,isDeleted:{$exists:false}}})
if(!user){
return{data:{message:"user not found",status:404}}
}
if(user.changeCredintialsTime?.getTime()>=decoded.iat*1000){
return{data:{message:"invalid credentials",status:400}}
}
if(checkAuthorization && !accessRoles.includes(user.role)){
    return{data:{message:"you are not authorized",status:403}}
    }
return {data:{message:"Done",user},valid:true}
}
