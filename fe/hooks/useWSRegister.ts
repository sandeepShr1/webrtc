'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Socket, io } from 'socket.io-client';
import * as ws from './useWS';

type UseWebRTCOptions = {
      onJoinSuccess?: (data: any) => void;
      onJoinFailure?: (data: any) => void;
      onRoomDisconnect?: (data: any) => void;
      onOffer?: (offer: RTCSessionDescriptionInit) => void;
      onAnswer?: (answer: RTCSessionDescriptionInit) => void;
      onHandleIceCandidates?: (candidate: RTCIceCandidate) => void;
      onJoinNotify?: (data: any) => void;
};

export function useWsRegister(options: UseWebRTCOptions = {}) {
      const userId = useAppStore((state) => state.userId);
      const setUserId = useAppStore((state) => state.setUserId);
      const setWsConnection = useAppStore((state) => state.setWsConnection);
      const wsConnection = useAppStore((state) => state.userWebSocketConnection);
      const hasRoomHandlers = Boolean(
            options.onJoinSuccess || options.onJoinFailure || options.onRoomDisconnect
      );

      // ✅ Bug 1 fix — stabilize options reference
      const optionsRef = useRef(options);
      useEffect(() => {
            optionsRef.current = options;
      }, [options]);

      // ✅ bind handlers when socket becomes available
      useEffect(() => {
            if (!wsConnection || !hasRoomHandlers) return;
            ws.bindSocketHandlers(wsConnection, optionsRef.current);
      }, [wsConnection, hasRoomHandlers]);

      // ✅ Bug 2 fix — stable function reference
      const connectSocket = useCallback(() => {
            if (wsConnection?.connected) {
                  console.log("✅ already connected");
                  return;
            }

            // ✅ Bug 4 fix — persist userId
            const savedUserId = Number(localStorage.getItem('userId'));
            const clientUserId = userId || savedUserId || Math.round(Math.random() * 1000000);
            if (!userId) {
                  setUserId(clientUserId);
                  localStorage.setItem('userId', String(clientUserId));
            }

            const socket = io('https://webrtc-cz0b.onrender.com', {
                  query: { userId: clientUserId },
                  transports: ['polling', 'websocket'],
                  autoConnect: false,
            });

            // ✅ Bug 5 fix — handle connection error
            socket.on('connect_error', (err) => {
                  console.error("❌ connection failed:", err.message);
                  setWsConnection(null);
            });

            ws.registerSocketEvents(socket, setWsConnection, optionsRef.current);
            socket.connect();
            console.log("✅ socket connecting...");
      }, [userId, wsConnection]);

      // ✅ Bug 3 fix — no null as any
      const disconnectSocket = useCallback(() => {
            wsConnection?.disconnect();
            setWsConnection(null);
      }, [wsConnection]);

      return { connectSocket, disconnectSocket, socket: wsConnection };
}