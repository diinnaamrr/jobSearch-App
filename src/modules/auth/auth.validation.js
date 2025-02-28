import joi from "joi";
import { generalFields } from "../../middelware/validation.middelware.js";


export const signUp=joi.object().keys({
firstName:generalFields.firstName.required(),
lastName:generalFields.lastName.required(),
email:generalFields.email.required(),
password:generalFields.password.required(),
confirmationPassword:generalFields.confirmationPassword.valid(joi.ref("password")).required(),
DOB:generalFields.DOB.required(),
gender:generalFields.gender.required(),
mobileNumber:generalFields.mobileNumber.required()
}).required()






export const confirmEmail= joi.object().keys({
email:generalFields.email.required(),
code:generalFields.code.required()

}).required()

export const login=joi.object().keys({
email:generalFields.email.required(),
password:generalFields.password.required()
}).required()



export const forgetPassword=joi.object().keys({
email:generalFields.email.required()  
}).required()


export const resetPassword=joi.object().keys({
email:generalFields.email.required(),
code:generalFields.code.required(),
password:generalFields.password.required(),
confirmationPassword:generalFields.confirmationPassword.valid(joi.ref("password")).required()
}).required()

