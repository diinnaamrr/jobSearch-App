import { asyncHandller } from "../../../utilies/response/error.response.js";
import * as DbServices from '../../../DB/dbServices.js'
import { companyModel } from "../../../DB/models/Company.model.js";
import { successResponse } from "../../../utilies/response/successReponse.js";
import { roleTypes } from '../../../utilies/shared/enumTypes.js'
import { cloud } from '../../../utilies/multer/cloudinary.multer.js'
import { userModel } from "../../../DB/models/User.model.js";


export const addCompany = asyncHandller(async (req, res, next) => {
    const { companyName, companyEmail, address, HRs } = req.body
    const isCompanyName = await DbServices.findOne({
        model: companyModel,
        filter: { companyName }
    })
    if (isCompanyName) {
        return next(new Error("this name is already exist", { cause: 409 }))
    }
    const isCompanyEmail = await DbServices.findOne({
        model: companyModel,
        filter: { companyEmail }
    })
    if (isCompanyEmail) {
        return next(new Error("this email is already exist", { cause: 409 }))
    }

    if (HRs?.includes(req.user._id.toString())) {
        return next(new Error('you can not add yourself as Hr you are the owner!!', { cause: 403 }))
    }

    const conflictingCompany = await DbServices.findOne({
        model: companyModel,
        filter: {
            companyName: { $ne: companyName }, // استبعاد نفس الشركة من البحث
            HRs: { $in: HRs } // البحث عن أي شركة أخرى تحتوي على نفس HRs
        }
    });

    if (conflictingCompany) {
        return next(new Error("One or more HRs are already assigned to another company", { cause: 409 }));
    }

    const users = await DbServices.countDocuments({
        model: userModel,
        filter: {
            _id: { $in: HRs },
            deletedAt: { $exists: false },
            isConfirmed: true
        }
    });

    if (users !== HRs.length) {
        return next(new Error("One or more HRs are invalid or deleted", { cause: 404 }));
    }

    let legalAttachments = null

    if (req.file) {
        const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `${process.env.APP_CLOUD_NAME}/company/${companyName}/legalAttachment` })
        legalAttachments = { secure_url, public_id }
    }
    const company = await DbServices.create({
        model: companyModel,
        data: {
            companyEmail,
            companyName,
            address,
            HRs,
            createdBy: req.user._id,
            legalAttachments,
        }
    })
    return successResponse({ res, status: 201, data: { company } })
})




export const updateCompany = asyncHandller(async (req, res, next) => {
    const { companyId } = req.params
    const { companyName, address, description } = req.body
    const companyExist = await DbServices.findOne({
        model: companyModel,
        filter: {
            _id: companyId,
            deletedAt: { $exists: false },
            approvedByAdmin: true,
            bannedAt: { $exists: false }
        }
    })
    if (!companyExist) {
        return next(new Error("invalid company id", { cause: 404 }))
    }

    if (await DbServices.findOne({ model: companyModel, filter: { companyName } })) {
        return next(new Error("this name is already exist", { cause: 409 }))
    }

    const company = await DbServices.findOneAndUpdate({
        model: companyModel,
        filter: {
            _id: companyId,
            deletedAt: { $exists: false },
            approvedByAdmin: true,
            bannedAt: { $exists: false },
            createdBy: req.user._id
        },
        data: {
            companyName,
            address,
            description
        },
        options: { new: true }
    })
    if (!company) {
        return next(new Error("the owner only who can update data!!"))
    }
    return successResponse({ res, message: "company updated successfully", data: { company } })
})



export const freezeCompany = asyncHandller(async (req, res, next) => {
    const { companyId } = req.params
    const owner = req.user.role === roleTypes.admin ? {} : { createdBy: req.user._id }
    const company = await DbServices.findOneAndUpdate({
        model: companyModel,
        filter: {
            _id: companyId,
            deletedAt: { $exists: false },
            bannedAt: { $exists: false },
            approvedByAdmin: true,
            ...owner
        },
        data: {
            deletedAt: new Date(),
            deletedBy: req.user._id
        },
        options: { new: true, context: "deleteCompany" }
    })
    if (!company) {
        return next(new Error("invalid company id or you are not authorized"))
    }
    return successResponse({ res, message: "company deleted successfully" })

})



export const searchByName = asyncHandller(async (req, res, next) => {
    const { name } = req.query
    const company = await DbServices.findOne({
        model: companyModel,
        filter: {
            companyName: { $regex: `^${name}$`, $options: "i" }, //search unsensetive
            deletedAt: { $exists: false },
            bannedAt: { $exists: false },
            approvedByAdmin: true
        },
        select: ("-approvedByAdmin")
    })
    if (!company) {
        return next(new Error("company not found", { cause: 404 }))
    }
    return successResponse({ res, data: { company } })
})




export const logo = asyncHandller(async (req, res, next) => {
    const { companyId } = req.params
    const companyExist = await DbServices.findOne({
        model: companyModel,
        filter: {
            _id: companyId,
            deletedAt: { $exists: false },
            bannedAt: { $exists: false },
            approvedByAdmin: true,
        },

    })
    if (!companyExist) {
        return next(new Error("company not found", { cause: 404 }))
    }

    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `${process.env.APP_CLOUD_NAME}/company/${companyExist.companyName}/logo` })
    const company = await DbServices.findOneAndUpdate({
        model: companyModel,
        filter: {
            _id: companyId,
            deletedAt: { $exists: false },
            bannedAt: { $exists: false },
            approvedByAdmin: true,
            createdBy: req.user._id
        },
        data: {
            logo: { secure_url, public_id }
        },
        options: { new: false }
    })
    if (!company) {
        return next(new Error(" you are not authorized to upload logo", { cause: 404 }))
    }
    if (company.logo?.public_id) {
        cloud.uploader.destroy(company.logo.public_id)
    }
    return successResponse({ res, message: "logo uploadaed successfully", data: { company } })
})




export const cover = asyncHandller(async (req, res, next) => {
    const { companyId } = req.params
    const companyExist = await DbServices.findOne({
        model: companyModel,
        filter: {
            _id: companyId,
            deletedAt: { $exists: false },
            bannedAt: { $exists: false },
            approvedByAdmin: true,
        },

    })
    if (!companyExist) {
        return next(new Error("company not found", { cause: 404 }))
    }
    const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, { folder: `${process.env.APP_CLOUD_NAME}/company/${companyExist.companyName}/cover` })
    const company = await DbServices.findOneAndUpdate({
        model: companyModel,
        filter: {
            _id: companyId,
            deletedAt: { $exists: false },
            bannedAt: { $exists: false },
            approvedByAdmin: true,
            createdBy: req.user._id
        },
        data: {
            coverPic: { secure_url, public_id }
        },
        options: { new: false }
    })
    if (!company) {
        return next(new Error(" you are not authorized to upload cover", { cause: 404 }))
    }
    if (company.coverPic?.public_id) {
        cloud.uploader.destroy(company.coverPic.public_id)
    }
    return successResponse({ res, message: "coverPic uploadaed successfully", data: { company } })
})



export const deleteLogo = asyncHandller(async (req, res, next) => {
    const { companyId } = req.params
    const company = await DbServices.findOne({
        model: companyModel,
        filter: {
            _id: companyId,
            daletedAt: { $exists: false },
            bannedAt: { $exists: false },
            approvedByAdmin: true,
            createdBy: req.user._id
        }
    })
    if (!company) {
        return next(new Error("company not found or you are not authorized", { cause: 404 }))
    }
    if (!company.logo?.public_id) {
        return next(new Error("logo not found", { cause: 404 }))
    }
    await cloud.uploader.destroy(company.logo.public_id)

    await DbServices.updateOne({
        model: companyModel,
        filter: {
            _id: companyId,
            daletedAt: { $exists: false },
            bannedAt: { $exists: false },
            approvedByAdmin: true,
            createdBy: req.user._id
        },

        data: {
            $unset: { logo: 1 }
        }
    })
    return successResponse({ res, message: "logo deleted successfully" })
})





export const deleteCover = asyncHandller(async (req, res, next) => {
    const { companyId } = req.params
    const company = await DbServices.findOne({
        model: companyModel,
        filter: {
            _id: companyId,
            daletedAt: { $exists: false },
            bannedAt: { $exists: false },
            approvedByAdmin: true,
            createdBy: req.user._id
        }
    })
    if (!company) {
        return next(new Error("company not found or you are not authorized", { cause: 404 }))
    }
    if (!company.coverPic?.public_id) {
        return next(new Error("coverPic not found", { cause: 404 }))
    }
    await cloud.uploader.destroy(company.coverPic.public_id)

    await DbServices.updateOne({
        model: companyModel,
        filter: {
            _id: companyId,
            daletedAt: { $exists: false },
            bannedAt: { $exists: false },
            approvedByAdmin: true,
            createdBy: req.user._id

        },
        data: { $unset: { coverPic: 1 } }
    })
    return successResponse({ res, message: "coverPic deleted successfully" })
})





export const getCompany = asyncHandller(async (req, res, next) => {
    const { companyId } = req.params
    const company = await DbServices.findOne({
        model: companyModel,
        filter: {
            _id: companyId,
            deletedAt: { $exists: false },
            bannedAt: { $exists: false },
            approvedByAdmin: true,
        },
        select: ('-approvedByAdmin'),
        populate: [{
            path: 'jobs',
            match: { deletedAt: { $exists: false } }
        }]

    })
    if (!company) {
        return next(new Error("company not found", { cause: 404 }))
    }
    return successResponse({ res, data: { company } })

})