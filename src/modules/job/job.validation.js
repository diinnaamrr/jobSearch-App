import joi from "joi";
import { jobLocationTypes, seniorityLevelTypes, workingTimeTypes } from "../../utilies/shared/enumTypes.js";
import { generalFields } from "../../middelware/validation.middelware.js";


export const addJob=joi.object().keys({
companyId:generalFields.id.required(),
jobTitle:joi.string().required(),
jobLocation:joi.string().valid(...Object.values(jobLocationTypes)),
workingTime:joi.string().valid(...Object.values(workingTimeTypes)),
seniorityLevel:joi.string().valid(...Object.values(seniorityLevelTypes)),
jobDescription:joi.string().required(),
technicalSkills:joi.array()

}).required()



export const updateJob=joi.object().keys({
companyId:generalFields.id.required(),
jobId:generalFields.id.required(),
jobTitle:joi.string(),
jobLocation:joi.string().valid(...Object.values(jobLocationTypes)),
workingTime:joi.string().valid(...Object.values(workingTimeTypes)),
seniorityLevel:joi.string().valid(...Object.values(seniorityLevelTypes)),
jobDescription:joi.string(),
}).required()


export const deleteJob=joi.object().keys({
companyId:generalFields.id.required(),
jobId:generalFields.id.required()
}).required()


export const getAllJobs=joi.object().keys({
 companyId:generalFields.id.required(),
 jobId:generalFields.id,
 companyName:joi.string(),
 page:joi.number(),
 size:joi.number()
}).required()



export const filterJobs=joi.object().keys({
page:joi.number().required(),
size:joi.number().required(),
jobTitle:joi.string(),
jobLocation:joi.string(),
workingTime:joi.string(),
seniorityLevel:joi.string(),
technicalSkills:joi.string()

}).required()



export const applyJob=joi.object().keys({
jobId:generalFields.id.required(),
file:generalFields.file.required()

}).required()


export const getAllApplications=joi.object().keys({
    companyId:generalFields.id.required(),
    jobId:generalFields.id.required(),
    page:joi.number().required(),
    limit:joi.number().required(),
}).required()



export const acceptOrRejectApplicant=joi.object().keys({
    applicationId:generalFields.id.required(),
    action:joi.string().valid('accept','reject').required()
    
    }).required()