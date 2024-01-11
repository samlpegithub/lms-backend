import ErrorHandler from "../ErrorHandler.js";
import { catchAsyncError } from "../catchAsyncError.js";
import { generateLast12MonthData } from "../utils/analytics.generator.js";
import {userModel} from '../models/User.js'
import courseModel from "../models/Course.js";
import { orderModel } from "../models/Order.js";

//get user analytics --only for admin
export const getUsersAnalytics=catchAsyncError(async(req,res,next)=>{
    try {
        const users=await generateLast12MonthData(userModel)
        res.status(200).json({
            success:true,
            users
        })
    } catch (error) {
     return next(new ErrorHandler(error.message,500));   
    }
})
 // get courses analytics --only for admin
export const getCoursesAnalytics=catchAsyncError(async(req,res,next)=>{
    try {
        const courses=await generateLast12MonthData(courseModel);
        res.status(200).json({
            success:true,
            courses
        })
    } catch (error) {
     return next(new ErrorHandler(error.message,500));   
    }
})
export const getOrdersAnalytics=catchAsyncError(async(req,res,next)=>{
    try {
        const orders=await generateLast12MonthData(orderModel)
        res.status(200).json({
            success:true,
            orders
        })
    } catch (error) {
     return next(new ErrorHandler(error.message,500));   
    }
})