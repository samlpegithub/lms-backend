import express from 'express';
import { authorizRoles, isAuthenticated } from '../middleware/auth.js';
import { createOrder, getAllOrders, newPayment, sendStripePublishable } from '../controller/order_controller.js';
import { updateAccessToken } from '../controller/user_controller.js';
const orderRouter=express.Router();
orderRouter.post('/create-order',updateAccessToken,isAuthenticated,createOrder);

orderRouter.get('/get-orders',updateAccessToken,isAuthenticated,authorizRoles('admin'),getAllOrders);

orderRouter.get('/payment/stripepublishablekey',sendStripePublishable);

orderRouter.post('/payment',updateAccessToken,isAuthenticated,newPayment);

export default  orderRouter