// hooks/useWS.ts

import type { Socket } from "socket.io-client";
import * as constants from "@/constants/constants"
import { useAppStore } from "@/store/useAppStore";

type SocketHandlers = {
      onJoinSuccess?: (data: any) => void;
      onJoinFailure?: (data: any) => void;
      onRoomDisconnect?: (data: any) => void;
};

function handleMessage(incomingMessage: any, handlers: SocketHandlers = {}) {
      const message = incomingMessage;
      console.log(message, "message")

      if (!message) {
            return;
      }

      switch (message.label) {
            case constants.labels.NORMAL_SERVER_PROCESS:
                  normalServerProcessing(message.data, handlers)
                  break;
            case constants.labels.WEBRTC_PROCESS:
                  webRTCServerProcessing(message.data, handlers)
                  break;
            default:
                  console.log(`Unknown server processing label`, message.label)
                  break;
      }
}

function handleDisconnect(reason: string) {
      console.log("Socket disconnected:", reason);
}

function handleConnectError(error: Error) {
      console.error("Socket connection error:", error);
}

export function registerSocketEvents(
      socket: Socket,
      setWsConnection: (ws: Socket) => void,
      handlers: SocketHandlers = {}
) {
      socket.on("connect", () => {
            console.log("You have connected with our socket.io server");
            setWsConnection(socket);
      });
      // socket.on("join-room", (data) => handleMessage(data, handlers))
      // socket.on("exit-room", (data) => handleMessage(data, handlers))

      socket.on("message", (data) => handleMessage(data, handlers));
      socket.on("disconnect", handleDisconnect);
      socket.on("connect_error", handleConnectError);
}

export function bindSocketHandlers(socket: Socket, handlers: SocketHandlers = {}) {
      socket.off("join-room");
      socket.on("join-room", (data) => handleMessage(data, handlers));
      socket.on("exit-room", (data) => handleMessage(data, handlers));
      socket.on("disconnect", (data) => handleMessage(data, handlers));

      socket.off("message");
      socket.on("message", (data) => handleMessage(data, handlers));
}

function normalServerProcessing(data: any, handlers: SocketHandlers = {}) {
      console.log(data, "dara")
      switch (data.type) {
            case constants.type.ROOM_JOIN.RESPONSE_SUCCESS:
                  joinSuccessHandler(data, handlers)

                  break;

            case constants.type.ROOM_EXIT.NOTIFY:
                  exitSuccessHandler(data, handlers)

                  break;
            case constants.type.ROOM_DISCONNECTION.NOTIFY:
                  exitSuccessHandler(data, handlers)

                  break;
            case constants.type.ROOM_JOIN.NOTIFY:
                  alert(data.message)

                  break;

            default:
                  break;
      }
}
function webRTCServerProcessing(data: any, handlers: SocketHandlers = {}) {

}

function joinSuccessHandler(data: any, handlers: SocketHandlers = {}) {
      useAppStore.getState().setOtherUserId(data.creatorId)
      console.log("first", data, handlers)
      handlers.onJoinSuccess?.(data)
}

function exitSuccessHandler(data: any, handlers: SocketHandlers = {}) {
      useAppStore.getState().setOtherUserId(null)
      console.log("first", data, handlers)
      handlers.onRoomDisconnect?.(data)
}
export function joinRoom(socket: Socket, roomName: string, userId: number) {
      if (!socket) {
            console.log("❌ socket is null");
            return;
      }
      if (!socket.connected) {
            console.log("❌ socket not connected yet");
            return;
      }
      const message = {
            label: constants.labels.NORMAL_SERVER_PROCESS,
            data: {
                  type: constants.type.ROOM_JOIN.REQUEST,
                  roomName,
                  userId
            }

      }
      console.log("✅ joining room:", roomName, "as userId:", userId);

      socket.emit('join-room', message)

}
export function exitRoom(socket: Socket, roomName: string, userId: number) {
      if (!socket) {
            console.log("❌ socket is null");
            return;
      }
      if (!socket.connected) {
            console.log("❌ socket not connected yet");
            return;
      }
      const message = {
            label: constants.labels.NORMAL_SERVER_PROCESS,
            data: {
                  type: constants.type.ROOM_EXIT.REQUEST,
                  roomName,
                  userId
            }

      }
      console.log("✅ exiting room:", roomName, "as userId:", userId);

      socket.emit('exit-room', message);
}