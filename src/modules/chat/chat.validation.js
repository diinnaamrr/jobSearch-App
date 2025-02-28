import joi from "joi";
import { generalFields } from "../../middelware/validation.middelware.js";


export const getChat= joi.object().keys({
    userId:generalFields.id.required()
}).required()