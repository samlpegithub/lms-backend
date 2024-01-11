import {app} from './app.js';
import  {handle}  from './utils/db.js';
import  {config} from 'dotenv'
import {v2 as cloundinary} from 'cloudinary';
import  { initSocketServer } from'./socketServer.js';
import http from 'http'

config()
handle()
const server=http.createServer(app);
initSocketServer(server);
cloundinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_SECRET_KEY
  });
server.listen(process.env.PORT,()=>{
console.log(`server running on port:${process.env.PORT }`);
})