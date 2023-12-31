const mongoose=require("mongoose");
const validator=require("validator");
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken')
const crypto=require('crypto')
const secretKey="AnandMadanRakesh"

const userSchema=new mongoose.Schema({
    name:
    {
        type:String,required:[true,"Please enter your name"],
         maxLength:[30,"Name cannot exceed 30 characters"],
         minLength:[4,"Name should have more than 4 characters"]
    },
    email:{
        type:String,
        required:[true,"Please Enter Your Email"],
        unique:true,
        validate:[validator.isEmail,"Please Enter a valid Email"]
    },
    password:{
        type:String,
        required:[true,"Please enter your password"],
        minLength:[5,"Password should be greater than 8 character"],
        select:false,
    },
    avatar:{
        public_id:{type:String,required:true},url:{type:String,required:true}
    },
    role:{
        type:String,
        default:"user"
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,

})


userSchema.pre("save",async function(next)
{
    if(!this.isModified("password"))
    {
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
})

userSchema.methods.getJwtToken=function() {
    return jwt.sign({id:this._id},secretKey,{
        expiresIn:"24h"
    });
}

userSchema.methods.comparePassword=async function(enteredPassword){
        return await bcrypt.compare(enteredPassword,this.password);
}

//generating password reset token
userSchema.methods.getResetPasswordToken=function (){

const resetToken=crypto.randomBytes(20).toString("hex");

// hashing and addin resetPasswordToken to userSchema
    this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire=Date.now()+15*60*1000;
    return resetToken;
}



const UserModel=mongoose.model('user',userSchema)
module.exports=UserModel