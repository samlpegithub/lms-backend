import ErrorHandler from "../ErrorHandler.js";
import { catchAsyncError } from "../catchAsyncError.js";
import courseModel from "../models/Course.js";
import { redis } from "../utils/redis.js";

export const createCourse=catchAsyncError(async(data,res,next)=>{
    const course=await courseModel.create(data);
    await redis.set(course._id,JSON.stringify(course));
    res.status(200).json({
        success:true,
        course
    })
})

//get all courses

export const getAllCoursesService=catchAsyncError(async(res)=>{
    const courses=await courseModel.find().sort({createdAt:-1});
    res.status(200).json({
        success:true,
        courses
    })
    
    })

    
   