import { asyncHandller } from "../../../utilies/response/error.response.js";
import * as DbServices from '../../../DB/dbServices.js'
import { userModel } from "../../../DB/models/User.model.js";
import { otpTypes, roleTypes } from '../../../utilies/shared/enumTypes.js'
import { generateDecryption, generateEncryption } from "../../../utilies/security/encryption.security.js";
import { successResponse } from "../../../utilies/response/successReponse.js";
import { compareHash, generateHash } from "../../../utilies/security/hash.security.js";
import { cloud } from '../../../utilies/multer/cloudinary.multer.js'
import { companyModel } from '../../../DB/models/Company.model.js'



export const getProfile = asyncHandller(async (req, res, next) => {
    const user = await DbServices.findOne({
        model: userModel,
        filter: { _id: req.user._id },
        select: ("firstName lastName userName mobileNumber gender DOB profilePic coverPic")
    })
    if (!user) {
        return next(new Error("user not found", { cause: 404 }))
    }
    return successResponse({ res, data: { user } })
})



export const updateProfile = asyncHandller(async (req, res, next) => {
    const { firstName, lastName, DOB, gender, mobileNumber } = req.body
    const user = await DbServices.findOneAndUpdate({
        model: userModel,
        filter: {
            _id: req.user._id,
            deletedAt: { $exists: false }
        },
        data: {
            firstName,
            lastName,
            DOB,
            mobileNumber: generateEncryption({ plainText: mobileNumber }),
            gender
        },
        select: ('firstName lastName userName DOB mobileNumber gender'),
        options: { new: true }
    })
    return successResponse({ res, message: "profile updated successfully", data: { user } })
})





export const shareProfile = asyncHandller(async (req, res, next) => {
    const { userId } = req.params
    const user = await DbServices.findOne({
        model: userModel,
        filter: {
            _id: userId,
            deletedAt: { $exists: false },
            isConfirmed:true
        }, select: ("firstName lastName mobileNumber profilePic coverPic")
    })
    if (!user) {
        return next(new Error("user not found", { cause: 404 }))
    }
    if (user && user.mobileNumber) {
        user.mobileNumber = generateDecryption({ cipherText: user.mobileNumber })
    }

    return successResponse({ res, data: { user } })

})



export const updatePassword = asyncHandller(async (req, res, next) => {
    const { Password, newPassword } = req.body
    if (!compareHash({ plainText: Password, hashValue: req.user.password })) {
        return next(new Error("in valid password", { cause: 409 }))
    }
    await DbServices.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
            password: generateHash({ plainText: newPassword }),
            changeCredentialTime: new Date()

        }
    })
    return successResponse({ res, message: "password updated successfully" })
})




export const freezeAccount = asyncHandller(async (req, res, next) => {
    const user = await DbServices.findOneAndUpdate({
        model: userModel,
        filter: {
            _id: req.user._id,
            deletedAt: { $exists: false }
        },
        data: {
            deletedAt: new Date()
        }
    })

    return successResponse({ res, message: "user deleted successfully" })
})




export const reactivateAccount = asyncHandller(async (req, res, next) => {
    const { email, code } = req.body
    const user = await DbServices.findOne({
        model: userModel,
        filter: {
            email,
            deletedAt: { $exists: true }
        }
    })
    if (!user) {
        return next(new Error("in valid email", { cause: 404 }))
    }
    const codeExist = user.Otp.findLast(otp => otp.type === otpTypes.reactivateAccount)
    if (!codeExist) {
        return next(new Error("no reactivate account code found", { cause: 404 }))
    }
    if (!compareHash({ plainText: code, hashValue: codeExist.code })) {
        return next(new Error(" invalid code", { cause: 409 }))
    }
    if (new Date() > codeExist.expiresIn) {
        return next(new Error(" code expired"))
    }
    await DbServices.updateOne({
        model: userModel,
        filter: {
            email,
            deletedAt: { $exists: true }
        },
        data: {
            $unset: { deletedAt: 1 }
        }
    })
    return successResponse({ res, message: "your account reactivate successfully" })
})


export const profilePic = asyncHandller(async (req, res, next) => {
    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `${process.env.APP_CLOUD_NAME}/user/${req.user._id}/profilePic` })
    const user = await DbServices.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
            profilePic: { secure_url, public_id }
        },
        options: { new: false }
    })
    if (user.profilePic?.public_id) {
        cloud.uploader.destroy(user.profilePic.public_id)
    }
    return successResponse({ res, message: "profile pic uploadaed successfully", data: { user } })
})



export const coverPic = asyncHandller(async (req, res, next) => {
    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `${process.env.APP_CLOUD_NAME}/user/${req.user._id}/coverPic` })
    const user = await DbServices.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        data: {
            coverPic: { secure_url, public_id }
        },
        options: { new: false }
    })
    if (user.coverPic?.public_id) {
        cloud.uploader.destroy(user.coverPic.public_id)
    }
    return successResponse({ res, message: "coverPic uploadaed successfully", data: { user } })
})





export const deleteProfilePic = asyncHandller(async (req, res, next) => {
    const user = await DbServices.findOne({
        model: userModel,
        filter: { _id: req.user._id }
    })
    if (!user) {
        return next(new Error("user not found", { cause: 404 }))
    }
    if (!user.profilePic?.public_id) {
        return next(new Error("profile pic not found", { cause: 404 }))
    }
    await cloud.uploader.destroy(user.profilePic.public_id)

    await DbServices.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        data: { $unset: { profilePic: 1 } }
    })
    return successResponse({ res, message: "profile pic deleted successfully" })
})



export const deleteCoverPic = asyncHandller(async (req, res, next) => {
    const user = await DbServices.findOne({
        model: userModel,
        filter: { _id: req.user._id }
    })
    if (!user) {
        return next(new Error("user not found", { cause: 404 }))
    }
    if (!user.coverPic?.public_id) {
        return next(new Error("profile pic not found", { cause: 404 }))
    }
    await cloud.uploader.destroy(user.coverPic.public_id)
    await DbServices.updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        data: { $unset: { coverPic: 1 } }
    })
    return successResponse({ res, message: "coverPic deleted successfully" })
})


//dashBoard

export const bannOrUnBannUser = asyncHandller(async (req, res, next) => {
    const { userId } = req.params
    const data = req.query.action === "bann" ? { bannedAt: new Date() } : { $unset: { bannedAt: 1 } }
    const userExist = await DbServices.findOne({
        model: userModel,
        filter: {
            _id: userId,
            deletedAt: { $exists: false }
        }
    })
    if (!userExist) {
        return next(new Error("user not found", { cause: 404 }))
    }

    if (userExist.role === roleTypes.admin) {
        return next(new Error(" you are not authorized to bann Admin!!"))
    }
    if (req.query.action === "bann" && userExist.bannedAt) {
        return next(new Error(" this user banned already", { cause: 409 }))
    }
    if (req.query.action === "unBann" && !userExist.bannedAt) {
        return next(new Error(" this user not banned already", { cause: 409 }))
    }

    const user = await DbServices.findOneAndUpdate({
        model: userModel,
        filter: {
            _id: userId,
            deletedAt: { $exists: false }
        },
        data,
        options: { new: true }

    })

    return successResponse({ res, data: { user } })
})




export const bannOrUnBannCompany = asyncHandller(async (req, res, next) => {
    const { companyId } = req.params
    const data = req.query.action === "bann" ? { bannedAt: new Date() } : { $unset: { bannedAt: 1 } }
    const companyExist = await DbServices.findOne({
        model: companyModel,
        filter: {
            _id: companyId,
            deletedAt: { $exists: false },
            approvedByAdmin: true
        }
    })
    if (!companyExist) {
        return next(new Error("company not found", { cause: 404 }))
    }

    if (req.query.action === "bann" && companyExist.bannedAt) {
        return next(new Error(" this company banned already", { cause: 409 }))
    }
    if (req.query.action === "unBann" && !companyExist.bannedAt) {
        return next(new Error(" this company not banned already", { cause: 409 }))
    }

    const company = await DbServices.findOneAndUpdate({
        model: companyModel,
        filter: {
            _id: companyId,
            deletedAt: { $exists: false }
        },
        data,
        options: { new: true }

    })
    return successResponse({ res, data: { company } })
})






export const approveCompany = asyncHandller(async (req, res, next) => {
    const { companyId } = req.params
    const companyExist = await DbServices.findOne({
        model: companyModel,
        filter: {
            _id: companyId,

        },

    })
    if (!companyExist) {
        return next(new Error("company not found", { cause: 404 }))
    }
    if (companyExist && companyExist.approvedByAdmin) {
        return next(new Error("this company take the approval arleady"))
    }

    const company = await DbServices.findOneAndUpdate({
        model: companyModel,
        filter: {
            _id: companyId,

        },
        data: {
            approvedByAdmin: true
        },
        options: { new: true }

    })

    return successResponse({ res, message: "admin approved successfully", data: { company } })
})