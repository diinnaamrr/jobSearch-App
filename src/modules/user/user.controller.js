import { Router } from "express";
import { validation } from "../../middelware/validation.middelware.js";
import * as validators from '../user/user.validation.js'
import * as userServices from '../user/services/user.services.js'
import { authentication, authorization } from "../../middelware/auth.middelware.js";
import { roleTypes } from "../../utilies/shared/enumTypes.js";
import { fileValiadtion, uploadCloudFile } from "../../utilies/multer/cloud.multer.js";
const router = Router()


router.get('/profile', authentication(), userServices.getProfile)
router.patch('/updateProfile', validation(validators.updateProfile), authentication(), authorization(roleTypes.user), userServices.updateProfile)
router.get('/shareProfile/:userId', validation(validators.shareProfile), authentication(), userServices.shareProfile)
router.patch('/updatePassword', validation(validators.updatePassword), authentication(), userServices.updatePassword)
router.delete('/freezeAccount', authentication(), userServices.freezeAccount)
router.post('/reactivateAccount', validation(validators.reactivateAccount), userServices.reactivateAccount)
router.patch('/profilePic', authentication(), uploadCloudFile(fileValiadtion.image).single("attachment"), validation(validators.profilePic), userServices.profilePic)
router.patch('/coverPic', authentication(), uploadCloudFile(fileValiadtion.image).single("attachment"), validation(validators.coverPic), userServices.coverPic)
router.delete('/profilePic', authentication(), userServices.deleteProfilePic)
router.delete('/coverPic', authentication(), userServices.deleteCoverPic)

//dashBoard
router.patch('/bannOrUnBannUser/:userId', authentication(), authorization(roleTypes.admin), validation(validators.bannOrUnBannUser), userServices.bannOrUnBannUser)
router.patch('/bannOrUnBannCompany/:companyId', authentication(), authorization(roleTypes.admin), validation(validators.bannOrUnBannCompany), userServices.bannOrUnBannCompany)
router.patch('/approveCompany/:companyId', authentication(), authorization(roleTypes.admin), validation(validators.approveCompany), userServices.approveCompany)


export default router