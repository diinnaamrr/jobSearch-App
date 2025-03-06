import { asyncHandller } from "../../../utilies/response/error.response.js";
import * as DbServices from '../../../DB/dbServices.js'
import { userModel } from "../../../DB/models/User.model.js";
import { otpTypes, providerTypes } from '../../../utilies/shared/enumTypes.js'
import { compareHash } from "../../../utilies/security/hash.security.js";
import { emailEvent } from "../../../utilies/events/email.events.js";
import { successResponse } from '../../../utilies/response/successReponse.js'
import { verifyGoogleToken } from "../../../utilies/shared/googleServices.js";


export const signUp = asyncHandller(async (req, res, next) => {
    const { userName ,email, password, mobileNumber, gender, DOB } = req.body
    const isUser = await DbServices.findOne({ model: userModel, filter: { email } })
    if (isUser) {
        return next(new Error(" email is already exist", { cause: 409 }))
    }
    const user = await DbServices.create({
        model: userModel,
        data: {
           userName,
            email,
            password,
            mobileNumber,
            DOB,
            gender
        }
    })
    emailEvent.emit("confirmEmail", { id: user._id, email })
    return successResponse({ res, message: "please check your email to confirm it", status: 201 })
})


export const signUpWithGmail = asyncHandller(async (req, res, next) => {
    const { idToken } = req.body
    const payload = await verifyGoogleToken({ idToken, next })
    let user = await DbServices.findOne({
        model: userModel,
        filter: { email: payload.email, deletedAt: { $exists: false } }
    })
    if (user) {
        return next(new Error("email is alrady exist login with that!!", { cause: 409 }))
    }
    if (!user) {
        user = await DbServices.create({
            model: userModel,
            data: {
                firstName: payload.given_name,
                lastName: payload.family_name,
                email: payload.email,
                isConfirmed: payload.email_verified,
                profilePic: payload.picture,
                provider: providerTypes.google
            }
        })

    }
    return successResponse({ res, message: "signed up with gmail successfully", status: 201, data: { user } })
})



export const confirmEmail = asyncHandller(async (req, res, next) => {
    const { email, code } = req.body
    const user = await DbServices.findOne({
        model: userModel,
        filter: { email, isConfirmed: { $exists: false } }
    })
    if (!user) {
        return next(new Error("invalid email", { cause: 404 }))
    }
    const codeExist = user.Otp.findLast(otp => otp.type === otpTypes.confirmEmail)
    if (!codeExist) {
        return next(new Error("no confirmaEmail code found", { cause: 404 }))
    }
    if (!compareHash({ plainText: code, hashValue: codeExist.code })) {
        return next(new Error("invalid code", { cause: 409 }))
    }
    if (new Date() > codeExist.expiresIn) {
        return next(new Error("code expired", { cause: 401 }))
    }
    await DbServices.updateOne({
        model: userModel,
        filter: { email },
        data: { isConfirmed: true }



    })
    return successResponse({ res, message: "email confirmed successfully go to login" })
})