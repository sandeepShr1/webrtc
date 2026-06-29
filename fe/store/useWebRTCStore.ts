// store/useWebRTCStore.ts
import { create } from 'zustand';
import { Socket } from 'socket.io-client';

interface WebRTCState {
      // socket
      wsConnection: Socket | null;

      // webrtc
      localStream: MediaStream | null;
      remoteStream: MediaStream | null;
      peerConnection: RTCPeerConnection | null;
      isConnected: boolean;
      isMuted: boolean;
      isCameraOff: boolean;
      offer: RTCSessionDescription | null;

      // setters
      setWsConnection: (ws: Socket | null) => void;
      setLocalStream: (stream: MediaStream | null) => void;
      setRemoteStream: (stream: MediaStream | null) => void;
      setPeerConnection: (pc: RTCPeerConnection | null) => void;
      setIsConnected: (val: boolean) => void;
      setIsMuted: (val: boolean) => void;
      setIsCameraOff: (val: boolean) => void;
      reset: () => void;
}
type UseWebRTCOptions = {
      onJoinSuccess?: (data: any) => void;
      onOffer?: (offer: RTCSessionDescriptionInit) => void;      // ✅ add
      onAnswer?: (answer: RTCSessionDescriptionInit) => void;    // ✅ add
      onIceCandidates?: (candidates: RTCIceCandidate[]) => void; // ✅ add
};
const initialState = {
      wsConnection: null,
      offer: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      isConnected: false,
      isMuted: false,
      isCameraOff: false,
};

export const useWebRTCStore = create<WebRTCState>((set) => ({
      ...initialState,
      setWsConnection: (ws) => set({ wsConnection: ws }),
      setLocalStream: (stream) => set({ localStream: stream }),
      setRemoteStream: (stream) => set({ remoteStream: stream }),
      setPeerConnection: (pc) => set({ peerConnection: pc }),
      setIsConnected: (val) => set({ isConnected: val }),
      setIsMuted: (val) => set({ isMuted: val }),
      setIsCameraOff: (val) => set({ isCameraOff: val }),
      reset: () => set(initialState),
}));