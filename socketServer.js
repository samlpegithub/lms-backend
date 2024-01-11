import { Server } from "socket.io"


 export const initSocketServer=(server)=>{
const io=new Server(server);

io.on('connection',(socket)=>{
    console.log('A User connected!');

    //listen for notification event from the frontend
    
    socket.on('notification',(data)=>{

      //Broadcast the notification data to all connected clients (admin dashboard)  
    
      io.emit('newNotification',data);
    })

    socket.on('disconnect',()=>{
      console.log('A User Disconnected!');  
    })
})


}