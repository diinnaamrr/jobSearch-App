import jwt from "jsonwebtoken";
import * as DbServices from '../../DB/dbServices.js'
import { userModel } from '../../DB/models/User.model.js'

export const tokenTypes = {
    access: "access",
    refresh: "refresh"
}

export const tokenDecoded = async ({ authorization, tokenType = tokenTypes.access, next } = {}) => {
    const [bearer, token] = authorization?.split(" ") || []
    if (!bearer || !token) {
        return next(new Error("missing token componenet", { cause: 400 }))
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
        return next(new Error("in valid decoded", { cause: 400 }))
    }

    const user = await DbServices.findOne({ model: userModel, filter: { _id: decoded.id, deletedAt: { $exists: false } } })
    if (!user) {
        return next(new Error("user not found", { cause: 404 }))
    }
    if (user.changeCredentialTime?.getTime() >= decoded.iat * 1000) {
        return next(new Error("invalid credentials", { cause: 403 }))
    }
    return user
}



export const generateToken = ({ payload = {}, signture = process.env.USER_ACCESS_TOKEN, expiresIn = process.env.TOKEN_ACCESS_EXPIREIN } = {}) => {
    const token = jwt.sign(payload, signture, { expiresIn: parseInt(expiresIn) })
    return token

}


export const verifyToken = ({ token = "", signture = process.env.USER_ACCESS_TOKEN } = {}) => {
    const decoded = jwt.verify(token, signture)
    return decoded

}


