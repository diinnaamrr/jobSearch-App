import { userModel } from "../../DB/models/User.model.js";
import { tokenTypes, verifyToken } from "../../utilies/security/token.security.js";
import * as DbServices from '../../DB/dbServices.js'

export const authentication = async ({ authorization, tokenType = tokenTypes.access, accessRoles = [], checkAuthorization = false } = {}) => {
    const [bearer, token] = authorization?.split(" ") || []
    if (!bearer || !token) {
        throw new Error("missing token componenet")
    }

    let access_signture = ""
    let refresh_signture = ""
    switch (bearer) {
        case "system":
            access_signture = process.env.ADMIN_ACCESS_TOKEN
            refresh_signture = process.env.ADMIN_REFRESH_TOKEN
            break;
        case "Bearer":
            access_signture = process.env.USER_ACCESS_TOKEN
            refresh_signture = process.env.USER_REFRESH_TOKEN
            break;

    }
    const decoded = verifyToken({ token, signture: tokenType === tokenTypes.access ? access_signture : refresh_signture })
    if (!decoded?.id) {
        throw new Error("in valid decoded")
    }

    const user = await DbServices.findOne({ model: userModel, filter: { _id: decoded.id, isDeleted: { $exists: false } } })
    if (!user) {
        throw new Error("user not found")
    }
    if (user.changeCredintialsTime?.getTime() >= decoded.iat * 1000) {
        throw new Error("invalid credentials")
    }
    if (checkAuthorization && !accessRoles.includes(user.role)) {
        throw new Error("you are not authorized")
    }
    return user
}
