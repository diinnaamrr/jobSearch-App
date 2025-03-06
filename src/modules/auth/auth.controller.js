import { Router } from "express";
import { validation } from "../../middelware/validation.middelware.js";
import * as validators from './auth.validation.js'
import * as regestratonServices from './services/regestration.services.js'
import * as loginServices from './services/login.services.js'
const router = Router()


//Regestration
router.post('/signUp', validation(validators.signUp), regestratonServices.signUp)
router.post('/signUpWithGmail', regestratonServices.signUpWithGmail)
router.patch('/confirmEmail', validation(validators.confirmEmail), regestratonServices.confirmEmail)

//login
router.post('/login', validation(validators.login), loginServices.login)
router.post('/loginWithGmail', loginServices.loginWithGmail)
router.get('/refreshToken', loginServices.refreshToken)
router.patch('/forgetPassword', validation(validators.forgetPassword), loginServices.forgetPassword)
router.post('/resetPassword', validation(validators.resetPassword), loginServices.resetPassword)





export default router
