import mongoose, { Schema, model, Types } from 'mongoose'
import { jobLocationTypes, seniorityLevelTypes, workingTimeTypes } from '../../utilies/shared/enumTypes.js'


const jobSchema = new Schema({
    jobTitle: {
        type: String,
        required: true
    },
    jobLocation: {
        type: String,
        enum: (Object.values(jobLocationTypes)),
        default: jobLocationTypes.onSite
    },
    workingTime: {
        type: String,
        enum: (Object.values(workingTimeTypes)),
        default: workingTimeTypes.fullTime
    },
    seniorityLevel: {
        type: String,
        enum: (Object.values(seniorityLevelTypes)),
        default: seniorityLevelTypes.junior
    },
    jobDescription: {
        type: String,
        required: true
    },
    technicalSkills: [{ skills: String }],
    softSkills: [{ skills: String }],
    addedBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    deletedBy: { type: Types.ObjectId, ref: "User" },
    closed: Boolean,
    companyId: {
        type: Types.ObjectId,
        ref: "Company",
        required: true
    },
    deletedAt: Date




}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})



jobSchema.virtual("Applications", {
    localField: "_id",
    foreignField: "jobId",
    ref: "Application",
})

export const jobModel = mongoose.models.Job || model("Job", jobSchema)