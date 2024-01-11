import express from 'express'
import {  getCoursesAnalytics, getOrdersAnalytics, getUsersAnalytics } from '../controller/analytics_controller.js';
import { authorizRoles, isAuthenticated } from '../middleware/auth.js';
const analyticsRouter=express.Router();
import { updateAccessToken } from '../controller/user_controller.js';
analyticsRouter.get('/get-users-analytics',updateAccessToken,isAuthenticated,authorizRoles('admin'),getUsersAnalytics)

analyticsRouter.get('/get-courses-analytics',updateAccessToken,isAuthenticated,authorizRoles('admin'),getCoursesAnalytics)

analyticsRouter.get('/get-orders-analytics',updateAccessToken,isAuthenticated,authorizRoles('admin'),getOrdersAnalytics)


export default  analyticsRouter;