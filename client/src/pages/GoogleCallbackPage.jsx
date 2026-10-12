import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiPost } from "../lib/api.js";
import { useAppStore, persistSession } from "../store/useAppStore.js";
import { ShieldCheck, RefreshCw } from "lucide-react";

export function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addToast = useAppStore((state) => state.addToast);
  const setSession = useAppStore((state) => state.setSession);
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state") || "login";
    const redirectUri = window.location.origin + "/auth/google/callback";

    if (!code) {
      addToast("Google authorization code is missing.", "error");
      navigate(state === "link" ? "/app/profile" : "/auth/login");
      return;
    }

    const processOAuth = async () => {
      try {
        if (state === "link") {
          await apiPost("/auth/google/link", { code, redirectUri });
          
          const activeSession = JSON.parse(localStorage.getItem("smimp-user") || "null");
          if (activeSession && activeSession.user) {
            activeSession.user.googleId = "linked";
            persistSession(activeSession);
            setSession(activeSession);
          }
          
          addToast("Google Account successfully linked to your profile!", "success");
          navigate("/app/profile");
        } else {
          const response = await apiPost("/auth/google", { code, redirectUri });
          const sessionData = response.data;
          
          persistSession(sessionData);
          setSession(sessionData);
          
          addToast(`Welcome back, ${sessionData.user.name}!`, "success");
          navigate("/app");
        }
      } catch (err) {
        console.error("Google OAuth Callback Error:", err);
        addToast(err.message || "Failed to complete Google authentication.", "error");
        navigate(state === "link" ? "/app/profile" : "/auth/login");
      }
    };

    processOAuth();
  }, [searchParams, navigate, addToast, setSession]);

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ maxWidth: 400, textAlign: "center" }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--color-brand-muted)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          color: "var(--color-brand)"
        }}>
          <RefreshCw size={26} className="spin" />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "var(--color-text)" }}>
          Authenticating with Google
        </h2>
        <p style={{ color: "var(--color-text-soft)", fontSize: 13.5, marginBottom: 0 }}>
          Verifying security handshake and initializing operational session...
        </p>
      </div>
    </div>
  );
}
