import mongoose from "mongoose";
import {Schema} from 'mongoose';
const answer=new Schema({
    user:Object,
    answer:String,
},{timestamps:true})

const reply=new Schema({
    user:Object,
    comment:String,
},{timestamps:true})

const reviewSchema=new Schema({
user:Object,
comment:String,
rating:{
    type:Number,
    default:0
},
commentReplies:[reply]
},{timestamps:true}) 

const linkSchema=new Schema({
    title:String,
    url:String
})

const commentSchema=new Schema({
    user:Object,
    question:String,
    questionReplies:[answer]
},{timestamps:true})

const courseDataSchema=new Schema({
title:String,
description:String,
videoLength:Number,
videoSection:String,
videoUrl:String,
videoPlayer:String,
link:[linkSchema],
suggestion:String,
questions:[commentSchema]

})
const courseSchema=new Schema({
name:{
    type:String,
    required:true
},
description:{
    type:String,
    required:true
},
categories:{
    type:String,
    required:true
},
price:{
    type:Number,
    required:true
},
estimatedPrice:{
type:Number
},
thumbnail:{
public_id:{
    type:String,
},
url:{
    type:String,

}
},
tags:{
    type:String,
    required:true
},
level:{
    type:String,
    required:true

},
demoUrl:{
    type:String,
    required:true
},
benefits:[{
    title:String,
}],
prerequisites:[{
    title:String
}],
reviews:[reviewSchema],
courseData:[courseDataSchema],
ratings:{
    type:Number,
    default:0

},
purchased:{
    type:Number,
    default:0

}

    




},{timestamps:true})
 const courseModel=mongoose.model('course',courseSchema)
 export default courseModel;