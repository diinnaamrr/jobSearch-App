import { customAlphabet } from "nanoid";
import { generateHash } from '../security/hash.security.js'
import { userModel } from "../../DB/models/User.model.js"
import { sendEmail } from '../email/sendEmail.js'
import { sendCodeTemp } from '../email/templete/confirmEmailTemp.js'
import { EventEmitter } from "node:events";
import * as DbServices from '../../DB/dbServices.js'



export const emailSubject = {
    confirmEmail: "confirmEmail",
    forgetPassword: "forgetPassword",
    reactivateAccount: "reactivateAccount",
    accepted: "acceptance",
    rejected: "rejected"

}
export const sendCode = async ({ data = {}, subject = emailSubject.confirmEmail } = {}) => {
    const { email, id } = data
    const code = customAlphabet('0123456789', 4)()
    const hashCode = generateHash({ plainText: code })
    const user = await DbServices.findOne({
        model: userModel,
        filter: { _id: id }

    })
    if (!user) {
        throw new Error("User not found");
    }
    await DbServices.updateOne({
        model: userModel,
        filter: { _id: id },
        data: {
            $push: {
                Otp: {
                    code: hashCode,
                    type: subject,
                    expiresIn: new Date().setMinutes(new Date().getMinutes()+10)
                }
            },
        }
    })
    await sendEmail({ to: email, subject, html: sendCodeTemp({ code: code }) })
}



export const emailEvent = new EventEmitter
emailEvent.on("confirmEmail", async (data) => {
    await sendCode({ data })
})


emailEvent.on("forgetPassword", async (data) => {
    await sendCode({ data, subject: emailSubject.forgetPassword })
})


emailEvent.on("reactivateAccount", async (data) => {
    await sendCode({ data, subject: emailSubject.reactivateAccount })
})



emailEvent.on("acceptApplicant", async (data) => {
    const { id, email, jobTitle, companyName } = data
    const user = await DbServices.findOne({
        model: userModel,
        filter: { _id: id }

    })
    if (!user) {
        throw new Error("User not found");
    }
    await sendEmail({ to: email, subject: emailSubject.accepted, text: `your application accepted in ${jobTitle} job from company (${companyName})  !! we need to make interview immediately` })
})




emailEvent.on("rejectedApplicant", async (data) => {
    const { id, email, jobTitle, companyName } = data
    const user = await DbServices.findOne({
        model: userModel,
        filter: { _id: id }

    })
    if (!user) {
        throw new Error("User not found");
    }
    await sendEmail({ to: email, subject: emailSubject.rejected, text: `your application rejected in ${jobTitle} job from company (${companyName})  !! Good luck..` })
})