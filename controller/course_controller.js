import cloudinary from 'cloudinary'
import { catchAsyncError } from '../catchAsyncError.js'
import ErrorHandler from '../ErrorHandler.js'
import { createCourse, getAllCoursesService } from '../services/course_service.js';
import cloundinary from 'cloudinary';
import courseModel from '../models/Course.js';
import { redis } from '../utils/redis.js';
import mongoose from 'mongoose';
import sendMail from '../utils/sendMail.js';
import { notificationModel } from '../models/Notification.js';
import axios from 'axios'
export const  uploadCourse=catchAsyncError(async(req,res,next)=>{
    

    try {
        const data=req.body;
        const thumbnail=data.thumbnail;
         let mycloud= await cloudinary.v2.uploader.upload(thumbnail,{
                folder:"courses"
            }) 
            data.thumbnail={
                public_id:mycloud.public_id,
                url:mycloud.secure_url
            }
            createCourse(data,res,next);


    } catch (error) {
        return next(new ErrorHandler(error.message,500))
    }
    
}) 
//edit course
export const editCourse=catchAsyncError(async(req,res,next)=>{
    try {
        const data=req.body;
        const thumbnail=data.thumbnail;

        const oldcourse=await courseModel.findById({_id:req.params.id})
            
        const oldthumbnail=oldcourse.thumbnail;
        if(thumbnail && !thumbnail.startsWith('https')){
            await cloundinary.v2.uploader.destroy(oldthumbnail.public_id);
            
            const myclound= await cloundinary.v2.uploader.upload(thumbnail ,{
                folder:"courses",

            });
            data.thumbnail={
                public_id:myclound.public_id,
                url:myclound.secure_url
            }

        }
        if(thumbnail.startsWith('https')){
            data.thumbnail={
                public_id:oldthumbnail.public_id,
                url:oldthumbnail.url
            }

        }
          
        const courseId=req.params.id;
        const course=await courseModel.findByIdAndUpdate(courseId,{$set:data},{new:true});
        res.status(201).json({
            success:true,
            course
        })




    } catch (error) {
        return next(new ErrorHandler(error.message,500))
        
    }
})

//get single course ---without purchasing

export const getSingleCourse=catchAsyncError(async(req,res,next)=>{
  
    try {
        const courseId=req.params.id;
  const isCacheExist=await redis.get(courseId);
  if(isCacheExist){
      const course=JSON.parse(isCacheExist);
    res.status(200).json({
        success:true,
        course
        
    })
  }
  else{
    const course=await courseModel.findById({_id:courseId}).select(
        "-courseData.videoUrl -courseData.suggestion -courseData.links -courseData.questions")
    await redis.set(courseId,JSON.stringify(course),'Ex',604800);
       
    res.status(200).json({
        success:true,
        course
    })
  }
       
    } catch (error) {
        return next(new ErrorHandler(error.message,500))
        
    }
})

//get all course ---without purchasing
export const getAllCourse=catchAsyncError(async(req,res,next)=>{
    try {
    //     const isCacheExist=await redis.get('allCourses');
    //     if (isCacheExist) {
                
    //     const courses=JSON.parse(isCacheExist);
    //     res.status(200).json({
    //         success:true,
    //         courses
    //     })


        
    //    } else {
        
        const courses=await courseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.link -courseData.questions");
            await redis.set('allCourses',JSON.stringify(courses));

        res.status(200).json({
            success:true,
            courses
        })
    //    }
    } catch (error) {
        return next(new ErrorHandler(error.message,500))
        
    }
})
//get course content ---only for valid user
export const getCourseByUser=catchAsyncError(async(req,res,next)=>{
    try {
        const userCourseList=req.user.courses;
        const courseId=req.params.id;
        const courseExist=userCourseList.find((course)=>course._id.toString()===courseId);
        if(!courseExist){
            return next(new ErrorHandler('you are not eligible to acces this course',404))
        }
        let  course=await courseModel.findById(courseExist)
        let content=course.courseData
        res.status(200).json({
            success:true,
            content

        })

    } catch (error) {
        return next(new ErrorHandler(error.message,500))
        
    }
})

//add question in course

export const addQuestion=catchAsyncError(async(req,res,next)=>{
    
    try {
        const {question,courseId,contentId}=req.body;
        const course=await courseModel.findById({_id:courseId})
        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler('invalid content id',400));

        }
        const courseContent =course.courseData.find((course)=>course._id.toString()===contentId);
        if(!courseContent){
            return next(new ErrorHandler('invalid content id',400));
        }
        const newQuestion={
            user:req.user,
            question,
            questionReplies:[]
        }
        courseContent.questions.push(newQuestion);

        await notificationModel.create({
            user:req.user._id,
            title:"New Question Recieved",
            message:`You have a new question  from ${courseContent.title}`
        });
        
        await course.save();
        res.status(200).json({
            success:true,
            course
        })
    } catch (error) {
        
    return next(new ErrorHandler(error.message,500))
}
}) 

//add answer in coures question
export const addAnswer=catchAsyncError(async(req,res,next)=>{
    try {
        const {answer,questionId,courseId,contentId}=req.body;

        const course=await courseModel.findById({_id:courseId})
        
        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler('invalid conntent id',400));

        }
        const courseContent =course.courseData.find((course)=>course._id.toString()===contentId);
        if(!courseContent){
            return next(new ErrorHandler('invalid content id',400));
        }
        const question=courseContent.questions.find((item)=>item._id.toString()===questionId)
        if(!question){
                return next(new ErrorHandler('invalid question id',400));

            }
            const newAnswer={
                user:req.user,
                answer
            }
            question.questionReplies.push(newAnswer);
            await course.save();
            if(req.user===question.user){
                //add notification

                await notificationModel.create({
                    user:req.user._id,
                    title:"New Question Reply Recieved",
                    message:`You have a new question reply from ${courseContent.title}`
                });

            }else{
             let data={
                name:question.user.name,
                title:courseContent.title
             }
             try {
                await sendMail({
                    email: question.user.email,
                    subject: 'Question Reply',
                    template: 'question-reply.ejs',
                    data
                })
             } catch (error) {
                
                 return next(new ErrorHandler(error.message,500))
             }
             res.status(200).json({
                success:true,
                course
             })
            }
    } catch (error) {
return next(new ErrorHandler(error.message,500))
        
    }
})
// add review in course
export const addReview=catchAsyncError(async(req,res,next)=>{
try {
    const courseId=req.params.id;
const userCouresList=req.user.courses;

const courseExit=userCouresList.find((course)=>course._id.toString()===courseId);

if(!courseExit){
    return next(new ErrorHandler("you are not eligible to access this course",400));
}

const course=await courseModel.findById({_id:courseId});
if(!course){
    return next(new ErrorHandler('course not found',404));
}

const {review,rating}=req.body;

let reviewData={
    user:req.user,
    comment:review,
    rating


}

course.reviews.push(reviewData);
let svg=0
course.reviews.forEach((rev)=>{svg+=rev.rating});
if(course){
    course.ratings=svg / course.reviews.length;
}

await redis.set(course._id,JSON.stringify(course),'Ex',604800);
await course.save();

// let notification={
//     title:"New Review Recieved",
//     message:`${req.user.name} has given review in ${course.name}`
// }

//create notification in course
await notificationModel.create({
    user:req.user?._id,
    title:"New Review Recieved",
    message:`${req.user.name} has given review in ${course.name}`

})

res.status(200).json({
    success:true,
    course
})



} catch (error) {
    return next(new ErrorHandler(error.message,500));
}

})

//add reply iN review
export const addReplyToReview=catchAsyncError(async(req,res,next)=>{
try {
    const {comment,courseId,reviewId}=req.body;
    const course=await courseModel.findById({_id:courseId});
    if(!course){
        return next(new ErrorHandler('Course not found',404));
    }
    
    const review=course.reviews.find((rev)=>rev._id.toString()===reviewId);
    
    if(!review){
        return next(new ErrorHandler('Review not found',404));
    }
    let replyData={
        user:req.user,
        comment
    };
    if(!review.commentReplies){
        review.commentReplies=[];
    }

    review.commentReplies.push(replyData);
    await redis.set(course._id,JSON.stringify(course),'Ex',604800);
    await course.save();
    res.status(200).json({
        success:true,
        course
    })

    

} catch (error) {
    
    return next(new ErrorHandler(error.message,500));
}


})

//get all courses --only for admin

export const getAllCourses=catchAsyncError((req,res,next)=>{
    try {
        const {id}=req.body;
            getAllCoursesService(res,id);

    } catch (error) {
        
        return next(new ErrorHandler(error.message, 400));
    }
})


// delete course --only for admin
export const deleteCourse=catchAsyncError(async(req,res,next)=>{
    try {
        const id=req.params.id;
        const course=await courseModel.findById({_id:id});
        if(!course){
          return next(new ErrorHandler('Course not found',404));
          
        }
        else{
            await  course.deleteOne({id});
            await redis.del(id);
            res.status(200).json({
                success:true,
                message:"Course deleted successfully"
            })
    
        }

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
        
    }
})

//generate video url
export const generateVideoUrl=catchAsyncError(async(req,res,next)=>{
    try {
        const {videoId}=req.body;
        const response=await axios.post(`https://dev.vdocipher.com/api/videos/${videoId}/otp`,{
            ttl:300
        },{
            headers:{
                Accept:"application/json",
                'Content-Type':"application/json",
                Authorization:`Apisecret ${process.env.VDOCIPHER_API_SECRET}`

            }
        }
        
        )
        res.json(response.data)


    } catch (error) {
        
        return next(new ErrorHandler(error.message, 400));
    }
})