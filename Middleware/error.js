const ErrorHandler= require('./../Utils/errorHandler');

module.exports=(err,req,resp,next)=>{

    console.log("In middleware error")
    err.statusCode=err.statusCode || 500;
    err.message=err.message || "Internal Server Error";

    resp.status(err.statusCode).json({
        success:false,
        error:err,
    });
}