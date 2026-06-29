// store/useAppStore.ts
import { create } from 'zustand';

interface AppState {
      userId: number;
      otherUserId: number;
      email: string;
      roomName: string;
      roomId: string | null;
      userWebSocketConnection: any | null,


      setUserId: (id: number) => void;
      setOtherUserId: (id: number | null) => void;
      setEmail: (email: string) => void;
      setRoomName: (name: string) => void;
      setRoomId: (id: string | null) => void;
      setWsConnection: (wsConnection: any) => void;
      reset: () => void;
}

const initialState = {
      email: "",
      userId: 0,
      otherUserId: 0,
      roomName: '',
      roomId: null,
      userWebSocketConnection: null
};

export const useAppStore = create<AppState>((set) => ({
      ...initialState,
      setWsConnection: (wsConnection) => set({ userWebSocketConnection: wsConnection }),
      setUserId: (id) => set({ userId: id }),
      setOtherUserId: (id) => set({ otherUserId: id }),
      setEmail: (email) => set({ email: email }),
      setRoomName: (name) => set({ roomName: name }),
      setRoomId: (id) => set({ roomId: id }),
      reset: () => set(initialState),
}));