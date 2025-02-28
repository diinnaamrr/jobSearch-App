import joi from "joi";
import { generalFields } from "../../middelware/validation.middelware.js";



export const addCompany=joi.object().keys({
companyEmail:generalFields.email.required(),
companyName:joi.string().required(),
address:joi.string().required(),
file:generalFields.file.required(),
HRs:joi.array().items(generalFields.id).required()

}).required()


export const updateCompany=joi.object().keys({
companyId:generalFields.id.required(),
companyName:joi.string(),
description:joi.string(),
address:joi.string(),

}).required()



export const freezeCompany=joi.object().keys({
companyId:generalFields.id.required()

}).required()


export const searchByName=joi.object().keys({
name:joi.string().required()

}).required()


export const logo=joi.object().keys({
companyId:generalFields.id.required(),
file:generalFields.file.required()
}).required()

export const cover=logo



export const deleteLogo=joi.object().keys({
companyId:generalFields.id.required()
}).required()

export const deleteCover=deleteLogo

export const getCompany=joi.object().keys({
companyId:generalFields.id.required()

}).required()



//graphql

export const getAllCompaniesGraph=joi.object().keys({
    authorization:joi.string().required()
}).required()