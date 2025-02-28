import { asyncHandller } from "../../../utilies/response/error.response.js";
import * as DbServices from '../../../DB/dbServices.js'
import {companyModel} from '../../../DB/models/Company.model.js'
import { jobModel } from "../../../DB/models/Job.model.js";
import {successResponse} from '../../../utilies/response/successReponse.js'
import {socketConnection } from "../../../DB/models/User.model.js";
import {paginate} from '../../../utilies/shared/pagination.js'
import {cloud} from '../../../utilies/multer/cloudinary.multer.js'
import { applicationModel } from "../../../DB/models/Application.model.js";
import {statusTypes} from '../../../utilies/shared/enumTypes.js'
import {emailEvent} from '../../../utilies/events/email.events.js'
import {getIo} from '../../socket/socket.controller.js'


export const addJob=asyncHandller(async(req,res,next)=>{
const{companyId}=req.params
const company=await DbServices.findOne({model:companyModel,
    filter:{
        _id:companyId,
        deletedAt:{$exists:false},
        bannedAt:{$exists:false},
        approvedByAdmin:true,

    }
})

if(!company){
    return next(new Error("company not found",{cause:404}))
}
if(!(company.HRs?.some(hrId=>hrId.toString() === req.user._id.toString()) || company.createdBy.toString() === req.user._id.toString())){
return next(new Error("you are not the owner or hr in this company so you can't add job!!"))
}
const job=await DbServices.create({
    model:jobModel,
    data:{
        ...req.body,
        companyId,
        addedBy:req.user._id
    }
})
return successResponse({res,message:"job addedd successfully",data:{job}})
})




export const updateJob=asyncHandller(async(req,res,next)=>{
const {companyId,jobId}=req.params
const company=await DbServices.findOne({model:companyModel,
    filter:{
        _id:companyId,
        deletedAt:{$exists:false},
        bannedAt:{$exists:false},
        approvedByAdmin:true,
    }
})
if(!company){
    return next(new Error("company not found",{cause:404}))
}
const job= await DbServices.findOneAndUpdate({
    model:jobModel,
    filter:{
        _id:jobId,
        deletedAt:{$exists:false},
        companyId,
        addedBy:req.user._id
    },
    data:{
        updatedBy:req.user._id,
        ...req.body
    },
    options:{new:true}
})
if(!job){
    return next(new Error("job not found or you are not authorized to update this job!!",{cause:404}))
}
return successResponse({res,message:"job updated successfully",data:{job}})
})




export const deleteJob=asyncHandller(async(req,res,next)=>{
const{companyId,jobId}=req.params
const company=await DbServices.findOne({model:companyModel,
    filter:{
        _id:companyId,
        deletedAt:{$exists:false},
        bannedAt:{$exists:false},
        approvedByAdmin:true,
    }
})
if(!company){
    return next(new Error("company not found",{cause:404}))
}
if (!company.HRs.includes(req.user._id)) {
    return next(new Error("You are not hr in this company"));
}
const job=await DbServices.findOneAndUpdate({model:jobModel,
    filter:{
        _id:jobId,
        deletedAt:{$exists:false},
        companyId,
    },
    data:{
        deletedAt:new Date(),
        deletedBy:req.user._id,
    },
    options:{new:true}
})
if(!job){
    return next( new Error("job not found",{cause:404}))
}
return successResponse({res,message:"job deleted successfully",data:{job}})
})




export const getAllJobs=asyncHandller(async(req,res,next)=>{
const {companyId,jobId}=req.params
let{page,size,companyName}=req.query

const companyNameExist=await DbServices.findOne({model:companyModel,
    filter:{
        companyName:{ $regex: new RegExp(companyName, "i") },
        deletedAt:{$exists:false},
        bannedAt:{$exists:false},
        approvedByAdmin:true
    }
})
if(!companyNameExist){
    return next(new Error("this name is not found",{casue:404}))
}

if(jobId){
    const job=await DbServices.findOne({model:jobModel,
        filter:{
            _id:jobId,
            deletedAt:{$exists:false},
            companyId
        },
        select:('-updatedAt -updatedBy'),
    })
if(!job){
    return next(new Error("job not found",{cause:404}))
}
return successResponse({res,data:{job}})
}
const company=await DbServices.findOne({model:companyModel,
    filter:{
        _id:companyId,
        deletedAt:{$exists:false},
        bannedAt:{$exists:false},
        approvedByAdmin:true,
    }
})
if(!company){
    return next(new Error("company not found",{cause:404}))
}

const jobs=await paginate({ page, size , model:jobModel,
    filter:{
        deletedAt:{$exists:false},
        companyId,
    },
    select:('-updatedAt -updatedBy'),
    
})
if (!jobs.data.length) {
    return next(new Error("No jobs found", { cause: 409 }));
  }
return successResponse({res,message:"this are all jobs related to this company",data:{jobs}})
})




export const filterJobs=asyncHandller(async(req,res,next)=>{
let{page,size,jobTitle,jobLocation,workingTime,seniorityLevel,technicalSkills}=req.query

const jobs=await paginate({ page, size , model:jobModel,
 filter:{
   deletedAt:{$exists:false},
   jobTitle:{ $regex: new RegExp(jobTitle, "i") },
   jobLocation:{ $regex: new RegExp(jobLocation, "i") },
   workingTime:{ $regex: new RegExp(workingTime, "i") },
   seniorityLevel:{ $regex: new RegExp(seniorityLevel, "i") },
   technicalSkills:{ $elemMatch: { skills: { $regex: new RegExp(technicalSkills, "i") }}},  
        },
select:('-updatedAt -updatedBy'),
 })

if (jobs.data.length > 0) {
    return successResponse({res,data:{jobs}})
    }
const alljobs=await paginate({page,size,model:jobModel,
 filter:{
 deletedAt:{$exists:false}
        }
       }) 
return successResponse({res,data:{alljobs}}) 
    })



export const applyToJob=asyncHandller(async(req,res,next)=>{
const{jobId}=req.params
const job=await DbServices.findOne({model:jobModel,
    filter:{
        _id:jobId,
        deletedAt:{$exists:false}
    }
})
if(!job){
    return next(new Error("job not found",{cause:404}))
}
const {secure_url,public_id}=await cloud.uploader.upload(req.file.path,{folder:`${process.env.APP_CLOUD_NAME}/applications/user/${req.user._id}`})

const applicationExist=await DbServices.findOne({
    model:applicationModel,
    filter:{
        jobId,
        userId:req.user._id,
    }
})
if(applicationExist){
    return next(new Error("you aplied already in this job",{cause:409}))
}


const application=await DbServices.create({model:applicationModel,
    data:{
        jobId,
        userId:req.user._id,
        userCv:{secure_url,public_id},

    }
})

const hrSocketId = socketConnection.get(job.addedBy); 
if (hrSocketId) {    //check the connection ,he is not loggeout
  getIo().to(hrSocketId).emit("submitApplication", {
    cvUrl: secure_url,
    userId: req.user._id,
  });
}

return successResponse({res,message:"your application send successfully",data:{application}})

    })






export const getAllApplications=asyncHandller(async(req,res,next)=>{
const{companyId,jobId}=req.params
let{page,limit}=req.query
page=parseInt(page < 1 ? process.env.PAGE : page)
limit=parseInt(limit<1 ? process.env.SIZE : limit)
const company=await DbServices.findOne({
    model:companyModel,
    filter:{
        _id:companyId,
        deletedAt:{$exists:false},
        bannedAt:{$exists:false},
        approvedByAdmin:true

    }
})
if(!company){
    return next(new Error("company not found",{cause:404}))
}
if (! company.HRs.includes(req.user._id) || company.createdBy.toString()===req.user._id.toString()) {
    return next(new Error("You are not the owner or hr in this company"));
}
const job=await DbServices.findOne({model:jobModel,
    filter:{
        _id:jobId,
        companyId,
        deletedAt:{$exists:false},
    },
    populate:[{
         path:"Applications",
         options:{
            skip: (page - 1) * limit,   
            limit: parseInt(limit) ,
             sort:{createdAt:1}
         },
         populate:[{
            path:"userId",
            select:"firstName lastName userName"
         }]
    }],
})
if(!job){
    return next(new Error("job not found",{cause:404}))
}

const totalApplications = await DbServices.countDocuments({
    model:applicationModel,
    filter:{jobId}
})

return successResponse({res,data:{job,totalApplications}})

})









export const acceptOrRejectApplicant=asyncHandller(async(req,res,next)=>{
const{applicationId}=req.params
const action = req.query.action;
const newStatus = action === "accept" ? statusTypes.accepted : statusTypes.rejected;
const data= req.query.action === "accept" ? {status:statusTypes.accepted} :{status:statusTypes.rejected}
const application = await DbServices.findOne({model:applicationModel,
    filter:{_id:applicationId},
    data,
    populate:[
        {
         path:"userId",
        select:"email"
        },
        {
            path:"jobId",
            select:"addedBy jobTitle companyId",
            populate:[{
                path:"companyId",
                select:"companyName"
            }]

        }
]
  
})
if(!application){
    return next(new Error("application not found",{cause:404}))
}
if(application.jobId.addedBy.toString() !=req.user._id.toString()){
    return next(new Error("you are not the Hr on this job!!"))
}
if (application.status === newStatus) {
    return next(new Error(`this application ${newStatus} alraedy`))

}
await DbServices.updateOne({model:applicationModel,
    filter:{_id:applicationId },
    data:{status:newStatus},

})


if( req.query.action === "accept"){
emailEvent.emit("acceptApplicant",{
    id:application.userId,
    email:application.userId.email,
    jobTitle:application.jobId.jobTitle,
    companyName:application.jobId.companyId.companyName
})
}else{
 emailEvent.emit("rejectedApplicant",{
    id:application.userId,
    email:application.userId.email,
    jobTitle:application.jobId.jobTitle,
    companyName:application.jobId.companyId.companyName
})   
}

return successResponse({res,data:{application}})

})