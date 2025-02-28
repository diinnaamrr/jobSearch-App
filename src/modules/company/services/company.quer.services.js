import * as DbServices from '../../../DB/dbServices.js'
import { companyModel } from '../../../DB/models/Company.model.js'
import { validation } from '../../../middelware/graphql/validation.graph.middelware.js'
import{authentication} from '../../../middelware/graphql/auth.graph.middelware.js'
import { getAllCompaniesGraph } from '../company.validation.js'
import { roleTypes } from '../../../utilies/shared/enumTypes.js'

export const getAllCompanies=async(parent,args)=>{
const {authorization}=args
await validation(getAllCompaniesGraph,args)
const user = await authentication({authorization,checkAuthorization:true,accessRoles:[roleTypes.admin]})
const companies = await DbServices.find({model:companyModel})
return {message:"this are all companies",status:200,data:companies}

}