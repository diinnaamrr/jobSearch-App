import { Router } from "express";
import {authentication, authorization} from '../../middelware/auth.middelware.js'
import { roleTypes } from "../../utilies/shared/enumTypes.js";
import {validation} from '../../middelware/validation.middelware.js'
import * as validators from './job.validation.js'
import * as jobServices from './services/job.services.js'
import { fileValiadtion, uploadCloudFile } from "../../utilies/multer/cloud.multer.js";
const router=Router({
    mergeParams:true
})

router.post('/addJob',authentication(),authorization([roleTypes.user,roleTypes.Hr]),validation(validators.addJob),jobServices.addJob)
router.patch('/updateJob/:jobId',authentication(),authorization(roleTypes.user),validation(validators.updateJob),jobServices.updateJob)
router.delete('/deleteJob/:jobId',authentication(),authorization(roleTypes.Hr),validation(validators.deleteJob),jobServices.deleteJob)
router.get('/getAllJobs/:jobId?',authentication(),validation(validators.getAllJobs),jobServices.getAllJobs)
router.get('/filterJobs',authentication(),validation(validators.filterJobs),jobServices.filterJobs)

router.post('/applyToJob/:jobId',authentication(),authorization(roleTypes.user),
uploadCloudFile(fileValiadtion.document).single('attachment'),
validation(validators.applyJob),jobServices.applyToJob)


router.get('/getApplications/:jobId',authentication(),authorization([roleTypes.user,roleTypes.Hr]),validation(validators.getAllApplications),jobServices.getAllApplications)

router.patch('/acceptOrRejectApplicant/:applicationId',authentication(),authorization(roleTypes.Hr),validation(validators.acceptOrRejectApplicant),jobServices.acceptOrRejectApplicant)




export default router