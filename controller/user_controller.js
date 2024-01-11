
import ErrorHandler from "../ErrorHandler.js";
import { catchAsyncError } from '../catchAsyncError.js'
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
import bcrypt from 'bcryptjs';
import { userModel } from '../models/User.js'
import sendMail from "../utils/sendMail.js";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt.js";
import { redis } from '../utils/redis.js'
import {  getAllUsersService, getUserById, updateUserRoleService } from "../services/user_service.js";
import cloundinary from 'cloudinary';
config();

export const registrationuser = catchAsyncError(async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const isEmailExist = await userModel.findOne({ email });


        if (isEmailExist) {

            return next(new ErrorHandler('Email is already exit', 400));

        }
        const user = {
            name,
            password,
            email
        }



        const activationToken = createActivationToken(user);
        const activationCode = activationToken.activationCode
        const data = {
            user: {
                name: user.name,
                activationCode
            }
        }

        try {

           await sendMail({
                email: user.email,
                subject: 'Activation your account',
                template: 'activation-mail.ejs',
                data
            })
            res.status(201).json({
                success: true,
                message: `please check your email: ${user.email} to activate your account`,
                activationToken: activationToken.token

            })


        }
        catch (error) {

            return next(new ErrorHandler(error.message, 400));
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }

})

export const createActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SERCET, { expiresIn: "5m" })
    
    return { token, activationCode }
}



//activate user

export const activateUser = catchAsyncError(async (req, res, next) => {
    const { activation_token, activation_code } = req.body;

    try {
        let newUser = jwt.verify(activation_token, process.env.ACTIVATION_SERCET);

        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler('invalid activation code', 400))

        }


        const { name, password, email } = newUser.user;

        const existUser = await userModel.findOne({ email });
        if (existUser) {
            return next(new ErrorHandler('Email already exist', 400));

        }


        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);


        const user = await userModel.create({
            name,
            email,
            password: hashPassword
        })
        res.status(200).json({
            success: true


        })





    } catch (error) {
        return next(new ErrorHandler(error.message, 400));

    }
})

//login user
export const loginUser = catchAsyncError(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler('invalid email or password', 400));
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return next(new ErrorHandler('invalid email or password', 400));

        }
        sendToken(user, 200, res);



    } catch (error) {
        return next(new ErrorHandler(error.message, 400));

    }

})
// logout user
export const logoutUser = catchAsyncError(async (req, res, next) => {
    try {
        

        res.cookie('access_token',"", { maxAge: 1 });
        res.cookie('refresh_token', "", { maxAge: 1 });
     
        const userid = req.user._id
        await redis.del(userid)
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        })


    } catch (error) {
        return next(new ErrorHandler(error.message, 400));

    }

})
//update access  token
export const updateAccessToken = catchAsyncError(async (req,res, next) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN);
        if (!decoded) {
            return next(new ErrorHandler('Could not refresh token', 400));

        }
        const session = await redis.get(decoded.id);
        if (!session) {
            return next(new ErrorHandler('Please login for access this resources', 400));

        }
        const user=JSON.parse(session);
        
      const accessToken =jwt.sign({id:user._id},process.env.ACCESS_TOKEN,{expiresIn:"600s"});

      const refreshToken =jwt.sign({id:user._id},process.env.REFRESH_TOKEN,{expiresIn:"3d"});
    
    
      res.cookie('access_token',accessToken,accessTokenOptions);
      res.cookie('refresh_token',refreshToken,refreshTokenOptions);
      await redis.set(user._id,JSON.stringify(user),'EX',604800);
      next();
    // res.status(200).json({
    //     success:true,
    //     accessToken

    // })



    } catch (error) {

        return next(new ErrorHandler(error.message, 400));
    }
    
    
})

//get user  info
export const getUserInfo=catchAsyncError((req,res,next)=>{
   
    try {
        const userId=req.user._id;

getUserById(userId,res)

} catch (error) {
    return next(new ErrorHandler(error.message, 400));
    
}

})

//social authentication
export const socialAuth = catchAsyncError(async (req, res, next) => {

    try {

        const { name, email, avatar } = req.body;
        const user = await userModel.findOne({email});

        if (!user) {
            const newuser = await userModel.create({ name, email, avatar })
            sendToken(newuser,200,res)

        }
        else {
            sendToken(user,200,res)

        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
        
    }})
    //update user info
    export const updateUserInfo=catchAsyncError(async(req,res,next)=>{
        try {
            const {name,email}=req.body;
            const userId=req.user._id;
            
            let user= await userModel.findById(userId);

             if(name && user){
                user.name=name

             }
             user=await user.save();
            await redis.set(userId,JSON.stringify(user))
            res.status(201).json({
                success:true,
                user
            })




        } catch (error) {
                return next(new ErrorHandler(error.message, 400));
                
            }
            
        })
        
        // update user password
        export const updatePassword=catchAsyncError(async(req,res,next)=>{
            try {
                const {oldPassword,newPassword}=req.body;

                const userId=req.user._id;
                let user= await userModel.findById(userId).select('+password');
                if(!oldPassword || !newPassword){

                    return next(new ErrorHandler('please enter oldPassword and newPassword',400))
                }
                if(user.password===undefined){
                    return next(new ErrorHandler('Invalid user',400))
                    
                }
                     let passwordMatch= bcrypt.compare(oldPassword,user.password);
                     if(!passwordMatch){
                        return next(new ErrorHandler('Invalid old password',400))
                     }
                     if(passwordMatch && user){
                        
                     const salt = await bcrypt.genSalt(10);
                    const hashPassword = await bcrypt.hash(newPassword, salt);
                        user.password=hashPassword;
                        user=await user.save();
                        
                        await redis.set(userId,JSON.stringify(user))
                        res.status(201).json({
                            success:true,
                            user
                        })

                     }
            } catch (error) {
     return next(new ErrorHandler(error.message, 400));
     
    }
})
//update user profile picture
export const updateProfilePicture=catchAsyncError(async(req,res,next)=>{
const {avatar}=req.body;
const userId=req.user._id;
const user=await userModel.findById(userId)
if(avatar && user){
if(user.avatar.public_id){
    await cloundinary.v2.uploader.destroy(user.avatar.public_id);
        
const myclound= await cloundinary.v2.uploader.upload(avatar ,{
    folder:"avatars",
    width:150        
});
user.avatar={
    public_id:myclound.public_id,
    url:myclound.secure_url
}
    
}else{
    
const myclound= await cloundinary.v2.uploader.upload(avatar ,{
        folder:"avatars",
        width:150        
    });
    user.avatar={
        public_id:myclound.public_id,
        url:myclound.secure_url
    }
    
}
    await user.save();
    await redis.set(userId,JSON.stringify(user));
    
    res.status(200).json({
        success:true,
        user
    })

}

try {
    
} catch (error) {
    return next(new ErrorHandler(error.message, 400));
    
}

})


//get all users
export const getAllUsers=catchAsyncError((req,res,next)=>{
    try {
        
            getAllUsersService(res);

    } catch (error) {
        
        
        return next(new ErrorHandler(error.message, 400));
    }
})
// update user role -- only for admin
export const updateUserRole=catchAsyncError((req,res,next)=>{
    try {
    const {email,role}=req.body;
   if(!email || !role){
       return next(new ErrorHandler("email & role is required for updating user role", 400));

   }
   updateUserRoleService(res,email,role)

    } catch (error) {
    return next(new ErrorHandler(error.message, 400));
    
}
})

// delete user --only for admin
export const deleteUser=catchAsyncError(async(req,res,next)=>{

    try {
        const id=req.params.id;
        const user=await userModel.findById({_id:id});
        if(!user){
          return next(new ErrorHandler('User not found',404));
          
        }
        else{
            await  user.deleteOne({id});
            await redis.del(id);
            res.status(200).json({
                success:true,
                message:"User deleted successfully"
            })
    
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
        
    }
})

