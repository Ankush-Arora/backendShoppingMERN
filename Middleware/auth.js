const jwt=require('jsonwebtoken')
const User=require('../Entity/userEntity')


 exports.isAuthenticatedUser=async(req,resp,next)=>{

    try{
const {token}=req.cookies;
console.log('In auth file',token);
// console.log(process.env.SECRETKEY)
if(!token){
    return  resp.status(400).json({success:false,login:"Please login first you have been logged out"})
}
          const decodedData=jwt.verify(token,process.env.SECRETKEY);
          req.user=await User.findById(decodedData.id);
 next();
}
catch{
    resp.status(400).json({success:false,login:"Please login again session time out"})
}
}

exports.authorizeRoles=(...roles)=>{
    return (req,resp,next)=>{
        // console.log("User is ",req.user.email);
         if(!roles.includes(req.user.role))
         // if(req.user.role==='user')
        {
            return  resp.status(400).json({success:false,login:"Access unauthorize for normal user"})
        }
        next();
    }
}

// module.exports=isAuthenticatedUser;