import joi from "joi"
import { Types } from "mongoose"
import {genderTypes}from '../utilies/shared/enumTypes.js'

export const isValidObjectId=(value,helper)=>{
    return Types.ObjectId.isValid(value)?true:helper.message("invalid object Id")

}



 export const minDate = new Date();
minDate.setFullYear(minDate.getFullYear() - 18);

export const validation=(schema)=>{
return(req,res,next)=>{
    const input={...req.body,...req.params,...req.query}
    if(req.file||req.files?.length){
        input.file=req.file||req.files
    }
    if (input.Hrs && !Array.isArray(input.Hrs)) {
        input.Hrs = [input.Hrs]; // here because when i take Hrs from (form data) there read it as string but it is array of objectId
        // so i say if it will come not array so >> input.Hrs = [input.Hrs]  >>make it array because i will write it in form data sperated
        //like >> Hrs >>  67befe5a54dbefd54e1ef1cd
        //Hrs >>67befe5a54dbefd54e1ef1cd
    }
    const validationResult=schema.validate(input,{abortEarly:false})
    if(validationResult.error){
        return res.status(400).json({message:"validation error",validationResult:validationResult.error.details})
    }
    return next()
}

}

const fileObj={
    fieldname:joi.string().valid("attachment"),
    originalname: joi.string(),
    encoding: joi.string(),
    mimetype: joi.string(),
    finalPath: joi.string(),
    destination:joi.string(),
    filename: joi.string(),
    path: joi.string(),
    size: joi.number(),
  }




export const generalFields={
    firstName:joi.string().min(3).max(20).trim(),
    lastName:joi.string().min(3).max(20).trim(),
    email:joi.string().email({minDomainSegments:2,maxDomainSegments:3,tlds:{allow:['com','net']}}),
    password:joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)),
    confirmationPassword:joi.string(),
    mobileNumber:joi.string().pattern(new RegExp(/^(\+2|002)?01[0125][0-9]{8}$/)),
    id:joi.string().custom(isValidObjectId),
    gender:joi.string().valid(...Object.values(genderTypes)),
    DOB:joi.date().less("now").max(minDate),
    code:joi.string().pattern(new RegExp(/^\d{4}$/)),
    fileObj,
    file:joi.object().keys(fileObj)
}