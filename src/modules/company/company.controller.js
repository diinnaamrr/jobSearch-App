import { Router } from "express";
import { validation } from "../../middelware/validation.middelware.js";
import * as validators from './company.validation.js'
import * as companyServices from './services/company.services.js'
import { authentication, authorization } from "../../middelware/auth.middelware.js";
import { roleTypes } from "../../utilies/shared/enumTypes.js";
import { fileValiadtion, uploadCloudFile } from "../../utilies/multer/cloud.multer.js";
import jobController from '../job/job.controller.js'

const router=Router()

router.use('/:companyId/job',jobController)
router.post('/addCompany',authentication(),authorization(roleTypes.user),uploadCloudFile(fileValiadtion.document).single("attachment"),validation(validators.addCompany),companyServices.addCompany)

router.patch('/updateCompany/:companyId',authentication(),authorization(roleTypes.user),validation(validators.updateCompany),companyServices.updateCompany)

router.delete('/freezeCompany/:companyId',authentication(),authorization([roleTypes.user,roleTypes.admin]),validation(validators.freezeCompany),companyServices.freezeCompany)

router.get('/searchByName',authentication(),validation(validators.searchByName),companyServices.searchByName)
router.patch('/logo/:companyId',authentication(),authorization(roleTypes.user),uploadCloudFile(fileValiadtion.image).single('attachment'),validation(validators.logo),companyServices.logo)
router.patch('/cover/:companyId',authentication(),authorization(roleTypes.user),uploadCloudFile(fileValiadtion.image).single('attachment'),validation(validators.cover),companyServices.cover)
router.delete('/logo/:companyId',authentication(),authorization(roleTypes.user),validation(validators.deleteLogo),companyServices.deleteLogo)
router.delete('/cover/:companyId',authentication(),authorization(roleTypes.user),validation(validators.deleteCover),companyServices.deleteCover)
router.get('/getCompany/:companyId',authentication(),validation(validators.getCompany),companyServices.getCompany)


export default router