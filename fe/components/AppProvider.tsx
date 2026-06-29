"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useWsRegister } from "@/hooks/useWSRegister";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setEmail = useAppStore((state) => state.setEmail);
  const setUserId = useAppStore((state) => state.setUserId);
  const { connectSocket } = useWsRegister();

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedUserId = localStorage.getItem("userID"); // ✅ consistent key

    if (savedEmail) {
      setEmail(savedEmail);
      if (savedUserId) setUserId(Number(savedUserId));
      connectSocket();
    }
  }, []);

  return <>{children}</>;
}
