import ErrorHandler from "../ErrorHandler.js";
import { catchAsyncError } from "../catchAsyncError.js";
import { notificationModel } from "../models/Notification.js";
import cron from 'node-cron'

//get all notifications
export const getNotification=catchAsyncError(async(req,res,next)=>{
    try {
        const notification=await notificationModel.find().sort({createdAt:-1});

        res.status(200).json({
            success:true,
            notification
        })
        
    } catch (error) {
        return next(new ErrorHandler(error.message,500))
    }
})

//update notification status --only admin
export const updateNotification=catchAsyncError(async(req,res,next)=>{
try {
    
const notification=await notificationModel.findById({_id:req.params.id});
if(!notification){
    return next(new ErrorHandler("Notification not found",404))

}else{
    notification.status ? notification.status='read' : notification.status;
}
await notification.save();
const notifications=await notificationModel.find().sort({createdAt:-1});

res.status(200).json({
    success:true,
    notifications

})


} catch (error) {
    return next(new ErrorHandler(error.message,500))
    
}

})

//delete notification --only admin
cron.schedule('0 0 0 * * *',async()=>{
const thirtyDayAgo=new Date(new Date().now() -30 * 60 * 60 *1000);
await notificationModel.deleteMany({status:"read",createdAt:{$lt:thirtyDayAgo}})

})
