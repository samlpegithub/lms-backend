
import { catchAsyncError } from "../catchAsyncError.js";
import { redis } from "../utils/redis.js"
import {userModel} from '../models/User.js'
import ErrorHandler from "../ErrorHandler.js";
//get user by id 
export const getUserById=async(id,res)=>{
        const user=await redis.get(id);
        if(user){
            res.status(200).json({
                success:true,
                user:JSON.parse(user)
            })}
        }





//get all users
export const getAllUsersService=catchAsyncError(async(res)=>{
const users=await userModel.find().sort({createdAt:-1});
res.status(200).json({
    success:true,
    users
})

})
// update user role -- only for admin
export const updateUserRoleService=catchAsyncError(async(res,email,role)=>{
    const user=await userModel.findOne({email});
    if(user){
        user.role=role
        await user.save()
        res.status(200).json({
            success:true,
            user
        })

    }else{
        new ErrorHandler('user not found',404)
    }
   
})


