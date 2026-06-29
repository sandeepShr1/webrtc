// fe/app/room/[room]/page.tsx
"use client";

import { useWebRTC } from "@/hooks/useWebRTC";
import { useAppStore } from "@/store/useAppStore";
import { useParams, useRouter } from "next/navigation";
import * as ws from "@/hooks/useWS";

export default function RoomPage() {
  const params = useParams();
  const roomName = params.room as string;
  const router = useRouter(); // ✅ init router

  const userId = useAppStore((state) => state.userId);
  const setRoomId = useAppStore((state) => state.setRoomId);

  const userWebSocketConnection = useAppStore(
    (state) => state.userWebSocketConnection,
  );
  const { socket } = useWebRTC({
    onRoomDisconnect: (data) => {
      setRoomId(null);
      console.log({ data });
      router.push(`/room`);
    },
  }); // ✅ this triggers the WS connection when component mounts

  console.log({ userWebSocketConnection });
  function exitRoomHandler() {
    if (!roomName) {
      return alert("You have to join room with a valid name");
    }
    ws.exitRoom(socket!, roomName, userId);
  }

  return (
    <div>
      <h1>Room: {roomName}</h1>
      <p>User ID: {userId}</p>
      <div>
        <button onClick={() => exitRoomHandler()} className="">
          Exit Room
        </button>
      </div>
    </div>
  );
}
