type Room = {
      roomName: string;
      userId: number | null;
      otherUserId?: number | null;

}
const EXPRESS_URL = process.env.NEXT_PUBLIC_EXPRESS_URL ?? "https://webrtc-cz0b.onrender.com";

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
      const res = await fetch(`${EXPRESS_URL}${endpoint}`, {
            ...options,
            headers: {
                  "Content-Type": "application/json",
                  ...options?.headers,
            },
      });

      if (!res.ok) {
            const error = await res.json();                          // ✅ parse the error body
            throw new Error(error.data?.message ?? "Something went wrong");  // ✅ extract message
      }
      return res.json();
}

export const api = {
      createRoom: (payload: Room) =>
            apiFetch("/api/v1/room/new", {
                  method: "POST",
                  body: JSON.stringify(payload),
            }),
};