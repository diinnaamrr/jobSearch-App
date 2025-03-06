import { asyncHandller } from "../../../utilies/response/error.response.js";
import * as DbServices from '../../../DB/dbServices.js'
import { userModel } from "../../../DB/models/User.model.js";
import { otpTypes, providerTypes, roleTypes } from '../../../utilies/shared/enumTypes.js'
import { compareHash, generateHash } from "../../../utilies/security/hash.security.js";
import { generateToken, tokenDecoded, tokenTypes } from "../../../utilies/security/token.security.js";
import { successResponse } from '../../../utilies/response/successReponse.js'
import { emailEvent } from "../../../utilies/events/email.events.js";
import { verifyGoogleToken } from "../../../utilies/shared/googleServices.js";



export const login = asyncHandller(async (req, res, next) => {
    const { email, password } = req.body
    const user = await DbServices.findOne({
        model: userModel,
        filter: { email }
    })
    console.log({ user });

    if (!user) {
        return next(new Error("invalid login data", { cause: 404 }))
    }
    if (!user.isConfirmed) {
        return next(new Error("please confirm your email first", { cause: 400 }))
    }
    if (user.provider != providerTypes.system) {
        return next(new Error("invalid provider", { cause: 400 }))
    }
  

    if (!compareHash({ plainText: password, hashValue: user.password })) {
        return next(new Error("invalid login data hu", { cause: 404 }))
    }
    if (user.deletedAt) {
        emailEvent.emit("reactivateAccount", { id: user._id, email })
        return next(new Error("please check you email to reactivate your account", { cause: 400 }))
    }
    const access_Token = generateToken({
        payload: { id: user._id },
        signture: user.role === roleTypes.admin ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN
    }
    )
    const refresh_Token = generateToken({
        payload: { id: user._id },
        signture: user.role === roleTypes.admin ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        expiresIn: process.env.TOKEN_REFRESH_EXPIREIN
    }
    )
    return successResponse({ res, message: "logged in successfully", data: { token: { access_Token, refresh_Token } } })
})






export const loginWithGmail = asyncHandller(async (req, res, next) => {
    const { idToken } = req.body
    const payload = await verifyGoogleToken({ idToken, next })
    const user = await DbServices.findOne({
        model: userModel,
        filter: {
            email: payload.email,
            deletedAt: { $exists: false }

        }
    })
    if (!user) {
        return next(new Error("sign up first!", { cause: 404 }))
    }

    if (user.provider != providerTypes.google) {
        return next(new Error("invalid provider", { cause: 401 }))
    }
    const access_Token = generateToken({
        payload: { id: user._id },
        signture: roleTypes.admin ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN
    }
    )
    const refresh_Token = generateToken({
        payload: { id: user._id },
        signture: roleTypes.admin ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        expiresIn: process.env.TOKEN_REFRESH_EXPIREIN
    }
    )

    return successResponse({ res, data: { token: { access_Token, refresh_Token } } })
})





export const refreshToken = asyncHandller(async (req, res, next) => {
    const { authorization } = req.headers
    const user = await tokenDecoded({ authorization, tokenType: tokenTypes.refresh, next })
    const access_Token = generateToken({
        payload: { id: user._id },
        signture: roleTypes.admin ? process.env.ADMIN_ACCESS_TOKEN : process.env.USER_ACCESS_TOKEN
    }
    )
    const refresh_Token = generateToken({
        payload: { id: user._id },
        signture: roleTypes.admin ? process.env.ADMIN_REFRESH_TOKEN : process.env.USER_REFRESH_TOKEN,
        expiresIn: process.env.TOKEN_REFRESH_EXPIREIN
    }
    )
    return successResponse({ res, data: { token: { access_Token, refresh_Token } } })
})






export const forgetPassword = asyncHandller(async (req, res, next) => {
    const { email } = req.body
    const user = await DbServices.findOne({
        model: userModel,
        filter: {
            email,
            deletedAt: { $exists: false },
        }
    })
    if (!user) {
        return next(new Error("invalid email", { cause: 404 }))
    }
    emailEvent.emit("forgetPassword", { id: user._id, email })
    return successResponse({ res, message: "please check your email" })
})




export const resetPassword = asyncHandller(async (req, res, next) => {
    const { email, code, password } = req.body
    const user = await DbServices.findOne({
        model: userModel,
        filter: {
            email,
            deletedAt: { $exists: false },

        }
    })
    if (!user) {
        return next(new Error("invalid email", { cause: 409 }))
    }
    const codeExist = user.Otp.findLast(otp => otp.type === otpTypes.forgetPassword)
    if (!codeExist) {
        return next(new Error("no forgetPassword code found"))
    }
    if (!compareHash({ plainText: code, hashValue: codeExist.code })) {
        return next(new Error("invalid code", { cause: 409 }))
    }
    if (new Date() > codeExist.expiresIn) {
        return next(new Error("code expired", { cause: 401 }))
    }
    await DbServices.updateOne({
        model: userModel,
        filter: {
            email,
            deletedAt: { $exists: false },
        },
        data: {
            password: generateHash({ plainText: password }),
            changeCredentialTime: new Date(),
            isConfirmed: true
        }
    })
    return successResponse({ res, message: "password updated successfully", status: 201 })
})