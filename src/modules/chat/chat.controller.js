import {Router} from 'express'
import { authentication, authorization } from '../../middelware/auth.middelware.js'
import { roleTypes } from '../../utilies/shared/enumTypes.js'
import * as chatServices from './services/chat.services.js'
import { validation } from '../../middelware/validation.middelware.js'
import * as validators from './chat.validation.js'


const router=Router()

router.get('/getChat/:userId',authentication(),authorization([roleTypes.user,roleTypes.Hr]),validation(validators.getChat),chatServices.getChat)







export default router