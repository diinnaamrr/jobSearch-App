import mongoose,{Schema ,Types,model}  from "mongoose"
import {jobModel} from './Job.model.js'
import * as DbServices from '../dbServices.js'

const companySchema=new Schema({
companyName:{
    type:String,
    required:true,
    unique:true,
    minLength:5,
    maxLength:20,
    trim:true
},
description:String,

industry:String,

address:{
    type:String,
    required:true
},

numberOfEmployees:{
    type:Number,
    enum:["11-20"]
},

companyEmail:{
    type:String,
    rqeuired:true,
    unique:true

},
createdBy:{
    type:Types.ObjectId,
    ref:"User",
    required:true
},

logo:{
    secure_url:String,
    public_id:String
},

coverPic:{
    secure_url:String,
    public_id:String
} ,
HRs :[{type:Types.ObjectId,ref:"User"}],
bannedAt: Date,
deletedAt: Date,
deletedBy:{type:Types.ObjectId,ref:"User"},
 legalAttachments:{
    secure_url:String,
    public_id:String
},
approvedByAdmin : Boolean


},{timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})


    

companySchema.post('findOneAndUpdate', async function(doc,next){
    if (this?.options?.context === "deleteCompany") {
    await DbServices.updateMany({model:jobModel,
     filter:{
        companyId:doc?._id,
        deletedAt:{$exists:false}
    },
   
     data:{
        deletedAt:new Date()
     }
 })
}
    return next()
     })






companySchema.virtual("jobs",{
    localField:"_id",
    foreignField:"companyId",
    ref:"Job",  
})



export const companyModel= mongoose.models.Company||model("Company",companySchema)