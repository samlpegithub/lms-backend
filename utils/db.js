import mongoose from 'mongoose'
import  {config} from 'dotenv'
config()
export const  handle=async()=>{
try {
    
 let data=await mongoose.connect(process.env.MONGOOSE_URL)
 console.log(`Database connected with ${data.connection.port}`);


} catch (error) {
console.log(error.message);    
}
 


}
