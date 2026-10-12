import { create } from "zustand";

/**
 * In-memory store for auth state.
 * Access token is NEVER written to localStorage (XSS protection).
 * Only non-sensitive session metadata (user info, workspaceId) is persisted.
 */
export const useAppStore = create((set, get) => ({
  user: null,
  token: null,        // access token — memory only, never persisted
  workspaceId: null,
  sidebarOpen: false,
  toasts: [], // Global toast notifications array

  addToast: (message, type = "info") => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  setSession: (session) =>
    set({
      user: session?.user || null,
      token: session?.accessToken || null,
      workspaceId:
        session?.workspaceId ||
        session?.user?.workspaceIds?.[0] ||
        null,
    }),

  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),

  setToken: (accessToken) => set({ token: accessToken }),

  setWorkspaceId: (workspaceId) => set({ workspaceId }),

  logout: () => {
    // Remove only non-sensitive persisted data
    localStorage.removeItem("smimp-user");
    set({ user: null, token: null, workspaceId: null });
  },
}));

/**
 * Hydrate session from localStorage on app boot.
 * Only restores user metadata + workspaceId — access token stays empty.
 * The token will be refreshed automatically on first API call.
 */
export function hydrateSession() {
  try {
    const raw = localStorage.getItem("smimp-user");
    if (!raw) return null;
    const saved = JSON.parse(raw);
    useAppStore.getState().setSession({
      user: saved?.user || null,
      accessToken: saved?.accessToken || null,
      refreshToken: saved?.refreshToken || null,
      workspaceId: saved?.workspaceId || null,
    });
    return saved;
  } catch {
    return null;
  }
}

/**
 * Persist session metadata and tokens to localStorage for cross-origin continuity.
 */
export function persistSession(session) {
  try {
    const prev = JSON.parse(localStorage.getItem("smimp-user") || "{}");
    localStorage.setItem(
      "smimp-user",
      JSON.stringify({
        user: session?.user ?? prev?.user ?? null,
        workspaceId:
          session?.workspaceId ||
          session?.user?.workspaceIds?.[0] ||
          prev?.workspaceId ||
          null,
        accessToken: session?.accessToken ?? prev?.accessToken ?? null,
        refreshToken: session?.refreshToken ?? prev?.refreshToken ?? null,
      })
    );
    // Also update the in-memory store with the full session
    useAppStore.getState().setSession(session);
  } catch {
    // localStorage unavailable — continue with memory-only session
  }
}
