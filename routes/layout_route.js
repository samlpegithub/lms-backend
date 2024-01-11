import express from 'express';
import { createLayout, editLayout, getLayout } from '../controller/layout_controller.js';
import { authorizRoles, isAuthenticated } from '../middleware/auth.js';
import { updateAccessToken } from '../controller/user_controller.js';
const layoutRouter=express.Router();

layoutRouter.post('/create-layout',updateAccessToken,isAuthenticated,authorizRoles('admin'),createLayout);

layoutRouter.put('/edit-layout',updateAccessToken,isAuthenticated,authorizRoles('admin'),editLayout);

layoutRouter.get('/get-layout/:type',getLayout);


export default layoutRouter;
