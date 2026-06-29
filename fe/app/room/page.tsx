"use client";

import { api } from "@/lib/api-client";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation"; // ✅ import router
import { useEffect, useState } from "react";
import * as ws from "@/hooks/useWS";
import { useWsRegister } from "@/hooks/useWSRegister";
import Image from "next/image";

export default function Room() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter(); // ✅ init router

  const userId = useAppStore((state) => state.userId);
  const roomName = useAppStore((state) => state.roomName);
  const email = useAppStore((state) => state.email);
  const setRoomName = useAppStore((state) => state.setRoomName);
  const setEmail = useAppStore((state) => state.setEmail);
  const setRoomId = useAppStore((state) => state.setRoomId);
  const setUserId = useAppStore((state) => state.setUserId);
  const setOtherUserId = useAppStore((state) => state.setOtherUserId);
  const setShouldStartCall = useAppStore((state) => state.setShouldStartCall);

  const { socket } = useWsRegister({
    onJoinSuccess: (data) => {
      setRoomId(data.roomName);
      setOtherUserId(data.creatorId);
      setShouldStartCall(true);
      console.log({ data });
      alert(data.message);
      router.push(`/room/${data.roomName}`);
    },
  }); // ✅ this triggers the WS connection when component mounts

  useEffect(() => {
    // ✅ generate userId on client only — no hydration mismatch
    const userID = localStorage.getItem("userID");
    const email = localStorage.getItem("email");
    if (userId) {
      setUserId(Number(userID));
    }
    if (email) {
      setEmail(email);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!roomName) {
      return alert("You have to join room with a valid name");
    }

    try {
      const data = await api.createRoom({ userId: userId, roomName });
      setRoomId(roomName); // ✅ store roomId

      router.push(`/room/${roomName}`); // ✅ redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleJoinRoom() {
    if (!roomName) {
      return alert("You have to join room with a valid name");
    }
    ws.joinRoom(socket!, roomName, userId);
  }

  return (
    <div className="flex justify-center items-center my-6 flex-col">
      <Image
        src={"/images/Group.png"}
        alt=""
        width={30}
        height={30}
        className="mx-auto my-3"
        autoFocus
      />
      <p className="text-2xl font-bold text-orange-300 my-4">
        Welcome {email}!
      </p>
      <div className="mb-4">
        <button
          className=" bg-orange-800 py-1 font-semibold px-1.5 rounded-md cursor-pointer hover:opacity-85"
          onClick={(e) => {
            e.preventDefault();
            setEmail("");
            setUserId(0);
            localStorage.clear();
            router.push("/");
          }}
        >
          Logout
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-3.5">
        <input
          className="bg-gray-800 py-2 px-4 rounded-md w-full"
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className=" bg-green-800 py-1  font-semibold px-1.5 rounded-2xl cursor-pointer hover:opacity-85"
          >
            {loading ? "Creating..." : "Create"}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleJoinRoom();
            }}
            className=" bg-orange-800 py-1 font-semibold px-1.5 rounded-2xl cursor-pointer hover:opacity-85"
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </div>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
