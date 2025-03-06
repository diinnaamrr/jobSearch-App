import { asyncHandller } from "../../../utilies/response/error.response.js";
import * as DbServices from '../../../DB/dbServices.js'
import { userModel } from "../../../DB/models/User.model.js";
import { chatModel } from '../../../DB/models/Chat.model.js'
import { successResponse } from "../../../utilies/response/successReponse.js";

export const getChat = asyncHandller(async (req, res, next) => {
    const { userId } = req.params
    const user = await DbServices.findOne({
        model: userModel,
        filter: {
            _id: userId,
            deletedAt: { $exists: false }
        }
    })
    if (!user) {
        return next(new Error("user not found", { cause: 404 }))
    }
    if (userId.toString() === req.user._id.toString()) {
        return next(new Error("you don't have chat of youself!!"))
    }
    const chat = await DbServices.findOne({
        model: chatModel,
        filter: {
            $or: [
                {
                    senderId: userId,
                    receiverId: req.user._id

                },
                {
                    receiverId: userId,
                    senderId: req.user._id

                },

            ]
        },
        populate: [
            {
                path: "senderId",
                select: " firstName lastName userName image"
            },
            {
                path: "receiverId",
                select: " firstName lastName userName image"
            },
        ]
    })
    return successResponse({ res, data: { chat } })

})