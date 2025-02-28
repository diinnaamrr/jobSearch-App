import {  asyncHandller } from "../utilies/response/error.response.js";
import { tokenDecoded } from "../utilies/security/token.security.js";

export const authentication=()=>{
    return asyncHandller(async(req,res,next)=>{
        const{authorization}=req.headers
        req.user= await tokenDecoded({authorization,next})
        return next()

    })

}


export const authorization=(accessRoles=[])=>{
    return asyncHandller(async(req,res,next)=>{
    if(!accessRoles.includes(req.user.role)){
        return next(new Error("you are not authorized",{cause:403}))
    }
return next()
    })

}