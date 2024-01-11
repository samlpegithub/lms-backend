import express from 'express'
import { getNotification, updateNotification } from '../controller/notification_controller.js';
import { authorizRoles, isAuthenticated } from '../middleware/auth.js';
import { updateAccessToken } from '../controller/user_controller.js';
const notificationRouter=express.Router();

notificationRouter.get('/get-all-notifications',updateAccessToken,isAuthenticated,authorizRoles('admin'),getNotification)

notificationRouter.put('/update-notification/:id',updateAccessToken,isAuthenticated,authorizRoles('admin'),updateNotification)



export default notificationRouter;