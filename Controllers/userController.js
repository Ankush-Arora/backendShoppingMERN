// const ErrorHandler = require('../Utils/errorHandler');
// const ApiFeatures = require('../Utils/ApiFeatures');
// const ErrorHandler = require('../Utils/errorHandler');
const { isAuthenticatedUser, authorizeRoles } = require('../Middleware/auth');
const User = require('./../Entity/userEntity')
const express = require('express');
const router = express.Router();
const sendEmail = require('../Utils/sendEmail.js')
const bcrypt = require('bcrypt')
require('../Database/db')

router.post('/register', async (req, resp, next) => {

    try {
        const { name, email, password } = req.body;

        const checkUser = await User.findOne({ email: req.body.email })
        // console.log(checkUser.email);
        if (checkUser) {
            return resp.status(400).json({
                success: false,
                message: "User email already exist"
            })
        }
        // console.log("Executing ")

        const user = await User.create({
            name, email, password,
            avatar: {
                public_id: "this is a sample id",
                url: "profilepictureUrl",
            }
        })
        const token = user.getJwtToken()
        resp.status(201).json({
            success: true,
            user, token
        })
    }
    catch (error) {
        resp.status(201).json({
            success: false,
            message: "please enter valid credentials"
        })
    }
})

router.post('/login', async (req, resp) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) return resp.status(400).json({ success: false, message: "Please enter credentials" })

        const userData = await User.findOne({ email }).select("+password")
        // console.log("Db password",userData);
        const passwordCompare = await userData.comparePassword(password);
        if (!passwordCompare) {
            return resp.status(400).json({ errors: "Try login with correct credentials" })
        }
        const token = userData.getJwtToken();
        return resp.status(200).cookie("token", token).json({ success: true, userLogin: "Successfull", token: token, userData })
    }
    catch (error) {
        return resp.status(400).json({ success: false, message: "Internal server error occured Or user not found" });
    }

})

// exports.logout=async(req,resp,next)=>{
//     req.cookie("token",null);
// resp.status(200).json({success:true,message:"Logged Out"})
// }

router.get('/logout', async (req, resp, next) => {
    resp.cookie("token", null,
        {
            expires: new Date(Date.now()), httpOnly: true,
        });
    resp.status(200).json({ success: true, message: "Logged Out" })
})

// forget Password

router.post('/forgotPassword', async (req, resp, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return resp.status(200).json({ message: "User not found" })
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/resetPassword/${resetToken}`
    const message = `Your password reset token is : \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it`

    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        })
        resp.status(200).json({ success: true, message: `Email sent to ${user.email} successfully` })
    }
    catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });
        return resp.status(500).json({ message: "Some Error Occured" })
    }
})
// get all user details
router.get('/getAllUserDetails', isAuthenticatedUser, authorizeRoles("admin"), async (req, resp, next) => {
    try {
        const users = await User.find();
        resp.status(200).json({ success: true, users });
    }
    catch {
        resp.status(500).json({ success: false, message: "Error occured" });
    }
})

// get single user details
router.get('/getUserDetails', isAuthenticatedUser, async (req, resp, next) => {
    try {
        const user = await User.findById(req.user.id);
        resp.status(200).json({ success: true, user });
    }
    catch {
        resp.status(500).json({ success: false, message: "Error occured" });
    }
})

// change password
router.post('/changePassword', isAuthenticatedUser, async (req, resp, next) => {
    try {
        const user = await User.findById(req.user.id).select("+password");
        const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

        if (!isPasswordMatched) {
            return resp.status(500).json({ success: false, message: "Old password does not match" })
        }

        if (req.body.newPassword !== req.body.confirmPassword) {
            return resp.status(500).json({ success: false, message: "New password and Confirm password does not match" })
        }

        user.password = req.body.newPassword;
        await user.save();
        return resp.status(200).json({ success: true, message: "Password changed successfully" })
    }
    catch {
        resp.status(500).json({ success: false, message: "Some error occured" })
    }
})

// update user role
router.put('/updateUserRole/:id',isAuthenticatedUser, authorizeRoles("admin"), async (req, resp, next) => {
    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role,
        };
        const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
        if(!user)
        {
            return resp.status(200).json({ success: false, message: "User Not found " }) 
        }
        //  const user = await User.findOne(req.body.email);
        //  if(user.role==='user') user.role="admin";
        //  else if(user.role==='admin') user.role="user"
        //  user.save();
        return resp.status(200).json({ success: true, message: "Role updated successfully" })
    }
    catch {
        return resp.status(500).json({ success: false, message: "Role not updated some error occured" })
    }
})

// delete user
router.delete('/deleteUser/:id',isAuthenticatedUser, authorizeRoles("admin"),async (req, resp, next) => {

    try{
    const user = await User.findById(req.params.id);
    if(!user)
    {
     return resp.status(500).json({ success: false, message: "User not found" });
    }
    await user.deleteOne(); 
   return  resp.status(200).json({ success: true, message: "User deleted successfully" });
}
catch{
    return   resp.status(500).json({ success: false, message: "User not found error occured" });
}

})

module.exports = router

//[3,3,3,2,2,3,1,1,2,3]