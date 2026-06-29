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
      alert(data.message);
    },
  }); // ✅ this triggers the WS connection when component mounts

  console.log({ userWebSocketConnection });
  function exitRoomHandler() {
    if (!roomName) {
      return alert("You have to join room with a valid name");
    }

    ws.exitRoom(socket!, roomName, userId);
    router.replace(`/room`);
  }

  return (
    <div>
      <h1>Room: {roomName}</h1>
      <p>User ID: {userId}</p>
      <div>
        <button
          onClick={() => exitRoomHandler()}
          className=" bg-orange-800 py-1 font-semibold px-1.5 rounded-md cursor-pointer hover:opacity-85"
        >
          Exit Room
        </button>
      </div>
    </div>
  );
}
