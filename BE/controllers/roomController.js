import * as constants from "../constants/constants.js"
import { connections, sendWebSocketMessageToUser } from "../index.js";
// define states for our rooms
export const rooms = [
      // will contain objects containing {ws_connection, userId}

]

export function createRoom(req, res, next) {
      console.log(req.body, "req.body")
      const { roomName, userId } = req.body;
      const existingRoom = rooms.find(room => {
            return room.roomName === roomName
      })
      if (existingRoom) {
            const failureMessage = {
                  data: {
                        type: "CREATE_ROOM_FAIL",
                        message: `The room already exist. Please try with new room name`
                  }
            }
            res.status(400).json(failureMessage)
      } else {
            rooms.push({ roomName, peer1: userId, peer2: null });
            const successMessage = {
                  data: {
                        type: "CREATE_ROOM_SUCCESS",
                        message: `Room create successfully`
                  }
            }
            res.status(200).json(successMessage)
      }
}

export function joinRoom(data) {
      const { roomName, userId } = data

      const existingRoom = rooms.find(room => room.roomName === roomName)
      let otherUserId = null;

      console.log("existingRoom", existingRoom)

      if (!existingRoom) {
            console.log("Room does not exist.")

            const failureMessage = {
                  label: constants.labels.NORMAL_SERVER_PROCESS,
                  data: {
                        type: constants.type.ROOM_JOIN.RESPONSE_FAILURE,
                        message: "A room of that name, does not exist. Please provide valid name"
                  }

            }
            sendWebSocketMessageToUser(userId, roomName, failureMessage)
            return
      }
      if (existingRoom.peer1 && existingRoom.peer2) {
            console.log("Room is full");
            const failureMessage = {
                  label: constants.labels.NORMAL_SERVER_PROCESS,
                  data: {
                        type: constants.type.ROOM_JOIN.RESPONSE_FAILURE,
                        message: "This room already has two participants"
                  }
            }
            sendWebSocketMessageToUser(userId, roomName, failureMessage)
            return
      }

      console.log("A user is attempting to join a room")
      if (!existingRoom.peer1) {
            existingRoom.peer1 = userId;
            otherUserId = existingRoom.peer2;
            console.log(`added user ${userId} as peer1`)
      } else {
            existingRoom.peer2 = userId;
            otherUserId = existingRoom.peer1
            console.log(`added user ${userId} as peer2`)
      }
      console.log(connections, "connections")

      const successMessage = {
            label: constants.labels.NORMAL_SERVER_PROCESS,
            data: {
                  type: constants.type.ROOM_JOIN.RESPONSE_SUCCESS,
                  message: `you have successfully joined room ${existingRoom.roomName}`,
                  creatorId: otherUserId,
                  roomName: existingRoom.roomName
            }
      }
      sendWebSocketMessageToUser(userId, "join-room", successMessage)

      const NotificationMessage = {

            label: constants.labels.NORMAL_SERVER_PROCESS,
            data: {
                  type: constants.type.ROOM_JOIN.NOTIFY,
                  message: `User ${userId} has joined your room ${existingRoom.roomName}`,
                  joinedId: userId,
                  roomName: existingRoom.roomName
            }
      }
      sendWebSocketMessageToUser(otherUserId, "join-room", NotificationMessage)
      return
}

export function exitRoom(data) {
      const { roomName, userId } = data;
      const existingRoom = rooms.find((room) => room.roomName === roomName);
      const otherUserId = (existingRoom.peer1 === userId) ? existingRoom.peer2 : existingRoom.peer1;

      if (!existingRoom) {
            console.log(`Room ${roomName} does not exits.`)
      }

      // remove user from room
      if (existingRoom.peer1 === userId) {
            existingRoom.peer1 = null;
            console.log(`Removed peer1 from the room object:${existingRoom}`)
      } else {
            existingRoom.peer2 = null;
            console.log(`Removed peer2 from the room object`, existingRoom)
      }
      // clean up and remove empty rooms
      if (existingRoom.peer1 === null & existingRoom.peer2 === null) {
            // delete room
            const roomIndex = rooms.findIndex(rm => {
                  return rm.roomName === rm.roomName
            })
            if (roomIndex !== -1) {
                  rooms.splice(roomIndex, 1);
                  console.log(`Room ${roomName} has been removed as its empty`);
                  return
            }
      }
      // notify the other user that a peer has left a room
      const notificationMessage = {
            label: constants.labels.NORMAL_SERVER_PROCESS,
            data: {
                  type: constants.type.ROOM_EXIT.NOTIFY,
                  message: `User ${userId} has left your room ${existingRoom.roomName}`,
                  joinedId: userId,
                  roomName: existingRoom.roomName
            }
      }
      sendWebSocketMessageToUser(otherUserId, "exit-room", notificationMessage)
      return
}