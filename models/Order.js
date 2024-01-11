import mongoose,{Schema} from 'mongoose';

//courseId
//userId
//payment_info
const orderSchema=new Schema({
courseId:{
    type:String,
    required:true
},
userId:{
    type:String,
    required:true
},
payment_info:{
    type:Object,
    // required:true
},

},{timestamps:true})

export const orderModel=mongoose.model('order',orderSchema);