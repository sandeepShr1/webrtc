// fe/app/room/[room]/page.tsx
"use client";

import { useWsRegister } from "@/hooks/useWSRegister";
import { useAppStore } from "@/store/useAppStore";
import { useParams, useRouter } from "next/navigation";
import * as ws from "@/hooks/useWS";
import { usePeerConnection } from "@/hooks/useWebRTCHandler";
import { useWebRTCStore } from "@/store/useWebRTCStore";
import { useEffect, useRef } from "react";

export default function RoomPage() {
  const params = useParams();
  const roomName = params.room as string;
  const router = useRouter(); // ✅ init router

  const userId = useAppStore((state) => state.userId);
  const shouldStartCall = useAppStore((state) => state.shouldStartCall);
  const setRoomId = useAppStore((state) => state.setRoomId);
  const setShouldStartCall = useAppStore((state) => state.setShouldStartCall);
  const isConnected = useWebRTCStore((state) => state.isConnected);
  const localStream = useWebRTCStore((state) => state.localStream);
  const remoteStream = useWebRTCStore((state) => state.remoteStream);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const userWebSocketConnection = useAppStore(
    (state) => state.userWebSocketConnection,
  );
  const setOtherUserId = useAppStore((state) => state.setOtherUserId);

  const { startCall, handleAnswer, handleOffer, handleIceCandidates, cleanup } =
    usePeerConnection();

  const { socket } = useWsRegister({
    onJoinNotify: (data) => {
      setOtherUserId(data.joinedId);
    },
    onRoomDisconnect: (data) => {
      alert(data.message);
    },
    onOffer: (data) => {
      handleOffer(data);
    },
    onAnswer: (data) => {
      console.log(data, "data");
      handleAnswer(data);
    },
    onHandleIceCandidates: (data) => {
      console.log(data, "data");
      handleIceCandidates(data.candidatesArray);
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

  // ✅ attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!shouldStartCall) {
      return;
    }

    setShouldStartCall(false);
    startCall();
  }, [shouldStartCall, setShouldStartCall, startCall]);

  // ✅ cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Room: {roomName}</h1>
      <h1 className="text-2xl font-bold mb-2">UserId: {userId}</h1>
      <p className="mb-4">
        Status: {isConnected ? "🟢 Connected" : "🔴 Waiting..."}
      </p>

      {/* Video Streams */}
      <div className="flex gap-4 mb-4">
        <div>
          <p className="text-sm mb-1">You</p>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-64 h-48 bg-black rounded-md"
          />
        </div>
        <div>
          <p className="text-sm mb-1">Remote</p>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-64 h-48 bg-black rounded-md"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {/* <button
          onClick={startCall} // ✅ offeror clicks this
          className="bg-green-700 py-2 px-4 rounded-md"
        >
          Start Call
        </button> */}
        <button onClick={cleanup} className="bg-red-700 py-2 px-4 rounded-md">
          Leave Room
        </button>
      </div>
    </div>
  );
}
