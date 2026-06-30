let io = null;

export function setRealtimeServer(server) {
  io = server;
}

/**
 * Emit an event to ALL clients in a specific workspace room.
 * Room name convention: "workspace:{workspaceId}"
 */
export function emitToWorkspace(workspaceId, event, payload) {
  if (!io || !workspaceId) return;
  io.to(`workspace:${workspaceId}`).emit(event, payload);
}

/**
 * Emit to all connected clients (for system-level events).
 * Prefer emitToWorkspace for workspace-specific data.
 */
export function emitRealtime(event, payload) {
  if (!io) return;
  // If payload has workspaceId, scope to that workspace automatically
  const workspaceId = payload?.workspaceId;
  if (workspaceId) {
    io.to(`workspace:${workspaceId}`).emit(event, payload);
  } else {
    io.emit(event, payload);
  }
}

export function getRealtimeServer() {
  return io;
}
