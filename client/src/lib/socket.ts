import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(window.location.host, {
      path: "/socket.io",
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });
  }
  return socket;
};
