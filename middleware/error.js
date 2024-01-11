import  ErrorHandler  from "../ErrorHandler.js";

export const ErrorMiddleware= (err,req,res,next)=>{

  
    err.statusCode=err.statusCode||500;
    err.message=err.message||'Internal server error';
        

   //Wrong mongodb id error

if(err.name==='CastError'){
    const message= `Resourse not found invalid: ${err.path}`;
 return new ErrorHandler(message,400);   
}

//Duplicate key error

if(err.code===11000){
    const message= `Duplicate ${Object.keys(err.keyValue)} entered`
   return  new ErrorHandler(message,400);
}

//Wrong jwt error

if(err.name==='JsonWebTokenError'){
    const message= `Json web token is invalid ,try againg`
   return new ErrorHandler(message,400);
}

//jwt expired error

if(err.name==='TokenExpiredError'){
    const message= `Json web token is expired ,try again`
  return new ErrorHandler(message,400);
}

res.status(err.statusCode).json({
    success:false,
    message:err.message
})

}
