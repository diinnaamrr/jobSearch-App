import mongoose, { Schema, model, Types } from 'mongoose'
import { statusTypes } from '../../utilies/shared/enumTypes.js'


const applicationSchema = new Schema({
    jobId: {
        type: Types.ObjectId,
        ref: "Job",
        required: true
    },
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    userCv: {
        secure_url: String,
        public_id: String
    },
    status: {
        type: String,
        enum: (Object.values(statusTypes)),
        default: statusTypes.pending
    }

}, { timestamps: true })


export const applicationModel = mongoose.models.Application || model("Application", applicationSchema)