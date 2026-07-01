import { io } from "socket.io-client";
import { useEffect, useRef } from "react";
import { useAppStore } from "../store/useAppStore.js";

const viteEnv = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};
const isLocalDev =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

const DEFAULT_REMOTE_SOCKET_URL = "https://smimp-backend.onrender.com";
const SOCKET_URL =
  viteEnv.VITE_SOCKET_URL || (isLocalDev ? "http://127.0.0.1:4000" : DEFAULT_REMOTE_SOCKET_URL);

let socket = null;

/**
 * Get or create the singleton Socket.IO connection.
 * Passes the access token so the server can join the correct workspace rooms.
 */
export function getSocket() {
  if (socket && socket.connected) return socket;

  const token = useAppStore.getState().token;

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.info("[socket] connected", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.info("[socket] disconnected", reason);
  });

  socket.on("connect_error", (err) => {
    console.warn("[socket] connection error", err.message);
  });

  return socket;
}

/**
 * Disconnect and clear the socket singleton.
 * Call this on logout.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * React hook to subscribe to a socket event.
 * Automatically cleans up on unmount.
 *
 * @param {string} event - Socket event name
 * @param {Function} handler - Callback function
 */
export function useSocketEvent(event, handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const sock = getSocket();
    const cb = (...args) => handlerRef.current(...args);
    sock.on(event, cb);
    return () => sock.off(event, cb);
  }, [event]);
}
