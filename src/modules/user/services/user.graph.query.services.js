import * as DbServices from '../../../DB/dbServices.js'
import { userModel } from '../../../DB/models/User.model.js'
import { validation } from '../../../middelware/graphql/validation.graph.middelware.js'
import { getAllUsersGraph } from '../user.validation.js'
import { roleTypes } from '../../../utilies/shared/enumTypes.js'
import { authentication } from '../../../middelware/graphql/auth.graph.middelware.js'

export const getAllUsers = async (parent, args) => {
    const { authorization } = args
    await validation(getAllUsersGraph, args)
    const user = await authentication({ authorization, checkAuthorization: true, accessRoles: [roleTypes.admin] })
    const users = await DbServices.find({
        model: userModel
    })


    return { message: "this are all users", status: 200, data: users }

}