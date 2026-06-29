"use client";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useAppStore } from "@/store/useAppStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { connectSocket } = useWebRTC();

  const router = useRouter();
  const setUserId = useAppStore((state) => state.setUserId);
  const setEmailInStore = useAppStore((state) => state.setEmail);

  const loginHandler = (e) => {
    e.preventDefault();
    const userID = Math.round(Math.random() * 1000000);
    setEmailInStore(email);
    localStorage.setItem("email", email);
    setUserId(userID);
    localStorage.setItem("userId", String(userID));
    connectSocket();

    router.push("/room");
  };
  return (
    <div className="flex justify-center items-center h-full">
      <div className="border border-gray-400 rounded-xl w-[600px] h-[600px] flex items-center justify-center">
        <form action="">
          <Image
            src={"/images/Group.png"}
            alt=""
            width={30}
            height={30}
            className="mx-auto my-4"
            autoFocus
          />
          <p className="text-2xl font-bold pb-4">Welcome to WebRTC demo app</p>
          <div className="my-3.5 mx-3.5">
            <p className="font-normal text-xl ">Email</p>
            <input
              type="email"
              placeholder="enter your email"
              className="bg-gray-800 py-2 px-4 rounded-md w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="my-3.5 mx-3.5">
            <p className="font-normal text-xl">Password</p>
            <input
              type="password"
              placeholder="enter your password"
              className="bg-gray-800 py-2 px-4 rounded-md w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            className="flex justify-center mx-auto my-4.5  w-1/2 bg-red-500 py-2.5 px-2 rounded-md cursor-pointer hover:bg-red-400"
            onClick={(e) => loginHandler(e)}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
