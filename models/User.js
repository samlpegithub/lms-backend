
import mongoose, { Schema } from 'mongoose';
import { config } from 'dotenv';
import jwt from 'jsonwebtoken';

config();
const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new Schema({

    name: {
        type: String,
        required: [true, 'please enter your name']
    },
    email: {
        type: String,
        required: [true, 'please enter yout email'],
        validate: {
            validator: (value) => {
                return emailRegexPattern.test(value)

            },
            message: "please enter a valid email"
        },
        unique: true
    },
    password: {
        type: String,
        minlength: [6, 'password must be atleast 6 characters'],
        select: false
    },
    avatar: {
        public_id: String,
        url: String
    },
    role: {
        type: String,
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    courses: [
        {
            courseId: String
        }
    ]
},
    {
        timestamps: true
    }

)
userSchema.methods.SignAccessToken=({id})=>{

    return jwt.sign({id},process.env.ACCESS_TOKEN ||"",{expiresIn:'5m'});
}
userSchema.methods.SignRefreshToken=({id})=>{

    return jwt.sign({id},process.env.REFRESH_TOKEN||"",{expiresIn:'3d'});
}

export const  userModel = mongoose.model('user', userSchema) 
 