import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";


export const connections = [
      // will contain objects containing {ws_connection, userId}
]


// Route Imports
import room from "./routes/room.js";
import { joinRoom, rooms, exitRoom } from "./controllers/roomController.js"
import * as constants from "./constants/constants.js"

const app = express();
const httpServer = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors({
      origin: ['http://localhost:3000', "https://webrtc-inehjc2xt-sandeepshr1s-projects-e47c0dda.vercel.app", "https://webrtc-phi-ashy.vercel.app"],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
}));

const io = new Server(httpServer, {
      cors: {
            origin: ['http://localhost:3000', "https://webrtc-inehjc2xt-sandeepshr1s-projects-e47c0dda.vercel.app", "https://webrtc-phi-ashy.vercel.app"],
            methods: ['GET', 'POST'],
      },
});

const port = 5000;

function addConnection(ws, userId) {
      connections.push({
            wsConnection: ws,
            userId
      })
      console.log("Total connected users:" + connections.length)
}

// Handle Socket.IO connections
io.on('connection', (socket) => {
      const userId = Number(socket.handshake.query.userId);   // ✅ read userId from query
      console.log(`User connected | userId: ${userId} | socketId: ${socket.id}`);
      addConnection(socket, userId)

      socket.on("message", (data) => handleMessage(data))
      // ✅ handle join-room
      socket.on('join-room', ({ data }) => {

            joinRoom(data)
            // ✅ notify others in the room
            // socket.to(roomName).emit('user-joined', { userId, socketId: socket.id });
      });
      // offer
      socket.on("send-offer", ({ data }) => {
            signalMessageToOtherUser(data, "send-offer")
            console.log("offer send to", data)
      })
      socket.on("send-answer", ({ data }) => {
            signalMessageToOtherUser(data, "send-answer")
            console.log("answer send to", data)
      })
      socket.on("send-iceCandidates", ({ data }) => {
            signalMessageToOtherUser(data, "send-iceCandidates")
            console.log("send-iceCandidates send to", data)
      })
      socket.on("exit-room", ({ data }) => exitRoom(data))
      socket.on('disconnect', () => {
            console.log("discommected")
            handleDisconnection(userId)
      });
});

// >>>>> WEBSOCKET SERVER Generic FUNCTIONS

function signalMessageToOtherUser(data, type) {
      const { otherUserId } = data;
      const message = {
            label: constants.labels.WEBRTC_PROCESS,
            data: data
      }
      sendWebSocketMessageToUser(otherUserId, "message", message);
}


// send a message to a specific user
export function sendWebSocketMessageToUser(sendToUserId, type, message) {

      const userConnection = connections.find(connObj => connObj.userId == sendToUserId);
      if (userConnection && userConnection.wsConnection) {
            userConnection.wsConnection.emit(type, message);
            console.log(`Message sent to ${sendToUserId}`, type)
      } else {
            console.log(`User ${sendToUserId} not found.`)
      }
}

function handleDisconnection(userId) {
      const connectionIndex = connections.findIndex(conn => conn.userId === userId);
      if (connectionIndex === -1) {
            console.log(`User: ${userId} not found in connections`)
            return
      }
      connections.splice(connectionIndex, 1);
      console.log(`User ${userId} removed from connections`)
      console.log(`Total users: ${connections.length}`)

      // removing rooms
      rooms.forEach(rm => {
            const otherUserId = (rm.peer1 === userId) ? rm.peer2 : rm.peer1;
            const notificationMessage = {
                  label: constants.labels.NORMAL_SERVER_PROCESS,
                  data: {
                        type: constants.type.ROOM_DISCONNECTION.NOTIFY,
                        message: `User ${userId} has been disconnected.`
                  }
            }
            if (otherUserId) {
                  console.log({ otherUserId }, "otherUserId")
                  sendWebSocketMessageToUser(otherUserId, "exit-room", notificationMessage)
            } if (rm.peer1 === userId) {
                  rm.peer1 = null
            }
            if (rm.peer2 === userId) {
                  rm.peer2 = null
            }
            if (rm.peer1 === null & rm.peer2 === null) {
                  const roomIndex = rooms.findIndex(r => {
                        return r.roomName === rm.roomName
                  })
                  if (roomIndex !== -1) {
                        rooms.splice(roomIndex, 1)
                        console.log(`Room ${rm.roomName} has been removed as its empty`)
                  }
            }
      })
      console.log("rooms", rooms)
}

function handleMessage(data) {
      try {
            let message = data;
            console.log({ data })
      } catch (error) {

      }
}

app.get('/', (req, res) => {
      res.send('Hello World!');
});

app.use('/api/v1', room);

// ✅ httpServer.listen — not app.listen
httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
});