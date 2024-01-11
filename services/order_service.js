import { catchAsyncError } from "../catchAsyncError.js";
import { orderModel } from "../models/Order.js";



//create new order
export const newOrder=catchAsyncError(async(data,res)=>{
    const order=await orderModel.create(data);
    res.status(201).json({
        success:true,
        order
    
    })
})

//get all orders

export const getAllOrdersService=catchAsyncError(async(res)=>{
    const orders=await orderModel.find().sort({createdAt:-1});
    res.status(200).json({
        success:true,
        orders
    })
    
    })