import express from 'express';
import { activateUser, deleteUser, getAllUsers, getUserInfo, loginUser, logoutUser, registrationuser, socialAuth, updateAccessToken, updatePassword, updateProfilePicture, updateUserInfo, updateUserRole } from '../controller/user_controller.js';
import { authorizRoles, isAuthenticated} from '../middleware/auth.js';
const userRouter=express.Router();

userRouter.post('/registration',registrationuser);

userRouter.post('/activate-user',activateUser);

userRouter.post('/login',loginUser);

userRouter.get('/logout',isAuthenticated,logoutUser);

userRouter.get('/refresh',updateAccessToken);

userRouter.get('/me',updateAccessToken,isAuthenticated,getUserInfo);

userRouter.post('/social-auth',socialAuth);

userRouter.put('/update-user-info',updateAccessToken,isAuthenticated,updateUserInfo);

userRouter.put('/update-user-password',updateAccessToken,isAuthenticated,updatePassword);

userRouter.put('/update-user-avatar',updateAccessToken,isAuthenticated,updateProfilePicture);

userRouter.get('/get-users',updateAccessToken,isAuthenticated,authorizRoles('admin'),getAllUsers);

userRouter.put('/update-user',updateAccessToken,isAuthenticated,authorizRoles('admin'),updateUserRole);

userRouter.delete('/delete-user/:id',updateAccessToken,isAuthenticated,authorizRoles('admin'),deleteUser);


export default userRouter;