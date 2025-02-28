import joi from "joi";
import { generalFields } from "../../middelware/validation.middelware.js";


export const updateProfile=joi.object().keys({
firstName:generalFields.firstName,
lastName:generalFields.lastName,
DOB:generalFields.DOB,
mobileNumber:generalFields.mobileNumber,
gender:generalFields.gender
}).required()


export const shareProfile=joi.object().keys({
    userId:generalFields.id.required()
}).required()



export const updatePassword=joi.object().keys({
Password:generalFields.password.required(),
newPassword:generalFields.password.not(joi.ref("Password")).required(),
confirmationPassword:generalFields.confirmationPassword.valid(joi.ref("newPassword")).required()
}).required()


export const reactivateAccount=joi.object().keys({
email:generalFields.email.required(),
code:generalFields.code.required()

}).required()




export const profilePic=joi.object().keys({
file:generalFields.file.required()
}).required()
    

export const coverPic=joi.object().keys({
file:generalFields.file.required()

}).required()



export const getAllUsersGraph=joi.object().keys({
authorization:joi.string().required()
}).required()


//dashBoard


export const bannOrUnBannUser=joi.object().keys({
userId:generalFields.id.required(),
action:joi.string().valid('bann','unBann').required()

}).required()




export const bannOrUnBannCompany=joi.object().keys({
companyId:generalFields.id.required(),
action:joi.string().valid('bann','unBann').required()
     }).required()


export const approveCompany=joi.object().keys({
companyId:generalFields.id.required()
   
}).required()