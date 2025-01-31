import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { profile } from "node:console";
import onCall from "./socket-events/onCall.js";
import onWebrtcSignal from "./socket-events/onWebrtcSignal.js";
import onHangup from "./socket-events/onHangup.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port =process.env.PORT|| 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

export let io;

app.prepare().then(() => {
  const httpServer = createServer(handler);

  io = new Server(httpServer);
  let onlineUser=[]

  io.on("connection", (socket) => {
    socket.on('addNewUser',(clerkUser)=>{
      clerkUser&& !onlineUser.some(user=>user?.userId===clerkUser.id)&&
      onlineUser.push({
        userId:clerkUser.id,
        socketId:socket.id,
        profile:clerkUser
      })

      io.emit('getUsers',onlineUser)
    })
    socket.on('call',onCall)
    socket.on('webrtcSignal',onWebrtcSignal)
    socket.on('hangup',onHangup)

    socket.on('disconnect',()=>{
      onlineUser=onlineUser.filter(user=>user.socketId!==socket.id)

      io.emit('getUsers',onlineUser)

    })
    // ...
  });
  console.log('Running...');
  
  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});