

export const asyncHandller=(fn)=>{
return (req,res,next)=>{
    fn(req,res,next).catch(error=>{
        error.cause=500
        return next(error)
    })
}

}


export const globalErrorHandling=(error,req,res,next)=>{
    if(process.env.MOOD==="DEV"){
        return res.status(error.cuase||400).json({message:error.message,stack:error.stack})
    }
  
        return res.status(error.cuase||400).json({message:error.message})


}