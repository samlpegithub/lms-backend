import mongoose,{Schema} from 'mongoose';



const notificationSchema=new Schema({
    user:{
        type:String,
        required:true
    },
title:{
    type:String,
    required:true
},
message:{
    type:String,
    required:true
},
status:{
    type:String,
    required:true,
    default:'unread'
},

},{timestamps:true})

export const notificationModel=mongoose.model('notification',notificationSchema);