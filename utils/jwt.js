import { config } from "dotenv";
config();
import { redis } from './redis.js'


 const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || 300 , 10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || 1200, 10);
  
    export  const accessTokenOptions = {
        expires: new Date(Date.now() + accessTokenExpire * 60 * 1000),
        maxAge: accessTokenExpire * 60 * 1000,
        httpOnly: true,
        sameSite: "lax"
    }
    // console.log(new Date(new Date() + accessTokenExpire * 60 * 60 * 1000),);
    export  const refreshTokenOptions = {
        expires: new Date(Date.now()  + refreshTokenExpire * 24 * 60 * 60 * 1000),
        maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax"
    }

export const sendToken = async (user, statusCode, res) => {

    const accessToken = user.SignAccessToken({id:user._id});
    const refreshToken = user.SignRefreshToken({id:user._id});

    // load session to redis

     await redis.set(user._id, JSON.stringify(user));

    // parse enviroment varible to integrates with falback values
    

    //application production

    // if (process.env.NODE_ENV === 'production') {
    //     accessTokenOptions.secure = true;

    // }

    res.cookie('access_token', accessToken,accessTokenOptions)
    res.cookie('refresh_token', refreshToken, refreshTokenOptions);

     
    res.status(statusCode).json({
        success:true,
        user,
        accessToken
    })

}
