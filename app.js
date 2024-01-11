import express from 'express';
import cors from 'cors'
import cookieParser from "cookie-parser"
import  {config} from 'dotenv'
import { ErrorMiddleware } from './middleware/error.js';
import userRouter from './routes/user_route.js';
import courseRouter from './routes/course_route.js';
import orderRouter from './routes/order_route.js';
import notificationRouter from './routes/notification_route.js';
import analyticsRouter from './routes/analytics_route.js';
import layoutRouter from './routes/layout_route.js';


config()
export const app=express();


//body-parser
app.use(express.json({limit:'50mb'}));

//cookie-parser
app.use(cookieParser());

// 
//cors =>cross origin resource sharing
app.use(cors({
    origin:['http://localhost:3000'],
    credentials:true
}))
 
//routes
app.use('/api/v1',userRouter) 

app.use('/api/v1',courseRouter)

app.use('/api/v1',orderRouter)

app.use('/api/v1',notificationRouter)

app.use('/api/v1',analyticsRouter)

app.use('/api/v1',layoutRouter)


app.get('/test',(req,res,next)=>{
    res.status(200).json({
        success:true,
        message:"API is working"
    })
})
 




app.all('*',(req,res,next)=>{
        const error=new Error(`Route ${req.originalUrl} not found`)
        error.statusCode=404;
        console.log(error);
        next(error);
})


app.use(ErrorMiddleware);