import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppStore, persistSession } from "../store/useAppStore.js";
import { apiPost } from "../lib/api.js";
import { getGoogleClientId, redirectToGoogle } from "../lib/oauth.js";
import { 
  Mail, Lock, Eye, EyeOff, User, Building2, Shield, 
  ArrowRight, CheckCircle2, AlertCircle, KeyRound, Sparkles
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  workspaceName: z.string().min(2, "Workspace name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["super-admin", "admin", "viewer"])
});

function FormField({ name, placeholder, label, type = "text", error, register, autoComplete, icon: Icon, value, onChange }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="field-block">
      <label className="field-label" htmlFor={name}>
        {label || placeholder}
      </label>
      <div style={{ position: "relative" }}>
        {Icon && (
          <div style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-muted)",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none"
          }}>
            <Icon size={16} />
          </div>
        )}
        <input
          id={name}
          type={actualType}
          placeholder={placeholder}
          {...(register ? register(name) : { value, onChange })}
          autoComplete={autoComplete || "off"}
          style={{
            paddingLeft: Icon ? 38 : 14,
            paddingRight: isPassword ? 38 : 14,
            borderColor: error ? "var(--color-danger)" : undefined,
            background: "var(--color-surface-elevated)",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-muted)",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer"
            }}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <div style={{ color: "var(--color-danger)", fontSize: 12, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
          {error}
        </div>
      )}
    </div>
  );
}

function AuthShell({ children, eyebrow, title, copy, activeTab = "login" }) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* Brand Logo & Backlink */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 20 }}>
          <div className="brand-mark" style={{ width: 28, height: 28 }} />
          <span style={{ color: "#ffffff", fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em" }}>SMIMP</span>
          <span className="badge" style={{ padding: "2px 6px", fontSize: 10, background: "var(--color-brand-muted)", color: "var(--color-brand)" }}>v2.4</span>
        </Link>

        {/* Tab switcher between Sign In and Register */}
        <div style={{
          display: "flex",
          background: "var(--color-surface-elevated)",
          padding: 4,
          borderRadius: "var(--radius-sm)",
          marginBottom: 24,
          border: "1px solid var(--color-border)"
        }}>
          <Link
            to="/auth/login"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "8px 0",
              fontSize: 13,
              fontWeight: 700,
              borderRadius: "calc(var(--radius-sm) - 2px)",
              background: activeTab === "login" ? "var(--color-surface-hover)" : "transparent",
              color: activeTab === "login" ? "#ffffff" : "var(--color-muted)",
              boxShadow: activeTab === "login" ? "var(--shadow-xs)" : "none",
              transition: "all 0.2s"
            }}
          >
            Sign In
          </Link>
          <Link
            to="/auth/register"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "8px 0",
              fontSize: 13,
              fontWeight: 700,
              borderRadius: "calc(var(--radius-sm) - 2px)",
              background: activeTab === "register" ? "var(--color-surface-hover)" : "transparent",
              color: activeTab === "register" ? "#ffffff" : "var(--color-muted)",
              boxShadow: activeTab === "register" ? "var(--shadow-xs)" : "none",
              transition: "all 0.2s"
            }}
          >
            Create Account
          </Link>
        </div>

        {eyebrow && (
          <div style={{
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--color-brand)",
            marginBottom: 8,
            textAlign: "center"
          }}>
            [ {eyebrow} ]
          </div>
        )}

        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, textAlign: "center", color: "var(--color-text)" }}>
          {title}
        </h1>
        <p style={{ color: "var(--color-text-soft)", fontSize: 14, marginBottom: 28, lineHeight: 1.5, textAlign: "center" }}>
          {copy}
        </p>

        {children}
      </div>
    </div>
  );
}

function useAuthSubmit(onSuccess) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (endpoint, form) => {
    setError("");
    setLoading(true);
    try {
      const response = await apiPost(endpoint, form);
      onSuccess(response.data);
      persistSession(response.data);
      navigate("/app");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { error, loading, submit };
}

export function LoginPage() {
  const setSession = useAppStore((state) => state.setSession);
  const { error: apiError, loading, submit } = useAuthSubmit(setSession);
  const [googleClientId, setGoogleClientId] = useState(null);

  useEffect(() => {
    getGoogleClientId().then(setGoogleClientId);
  }, []);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  return (
    <AuthShell
      activeTab="login"
      eyebrow="Console Access"
      title="Welcome back"
      copy="Monitor telemetry, triage incidents, and audit service stability in your workspace."
    >
      <form
        className="grid"
        style={{ gap: 16 }}
        onSubmit={handleSubmit((data) => submit("/auth/login", data))}
        autoComplete="off"
      >
        <FormField
          name="email"
          label="Work Email"
          placeholder="name@company.com"
          type="email"
          icon={Mail}
          register={register}
          error={errors.email?.message}
          autoComplete="email"
        />
        <FormField
          name="password"
          label="Password"
          placeholder="Enter your password"
          type="password"
          icon={Lock}
          register={register}
          error={errors.password?.message}
          autoComplete="current-password"
        />

        {apiError && (
          <div className="alert-banner alert-banner--error">
            <AlertCircle size={16} />
            <span>{apiError}</span>
          </div>
        )}

        <button 
          className="button primary" 
          type="submit" 
          disabled={loading} 
          style={{ width: "100%", height: 42, fontSize: 14 }}
        >
          {loading ? "Authenticating..." : "Sign in to Console"}
        </button>

        {googleClientId && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
              <span style={{ fontSize: 12, color: "var(--color-muted)", textTransform: "uppercase" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
            </div>

            <button 
              className="button" 
              type="button" 
              onClick={() => redirectToGoogle(googleClientId, "login")}
              style={{ width: "100%", height: 42, justifyContent: "center", gap: 10 }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "block" }}>
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.439 15.986 5.503 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.549 0 9s.347 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.896 11.426 0 9 0 5.503 0 2.439 2.014.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
          <Link to="/auth/forgot-password" style={{ color: "var(--color-muted)" }}>
            Forgot password?
          </Link>
          <Link to="/auth/register" style={{ fontWeight: 600 }}>
            Create account &rarr;
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const setSession = useAppStore((state) => state.setSession);
  const { error: apiError, loading, submit } = useAuthSubmit(setSession);
  const [googleClientId, setGoogleClientId] = useState(null);

  useEffect(() => {
    getGoogleClientId().then(setGoogleClientId);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", workspaceName: "", email: "", password: "", role: "admin" }
  });

  return (
    <AuthShell
      activeTab="register"
      eyebrow="Initial Deployment"
      title="Create workspace"
      copy="Configure your SRE command center and onboard your primary administrator."
    >
      <form
        className="grid"
        style={{ gap: 14 }}
        onSubmit={handleSubmit((data) => submit("/auth/register", data))}
        autoComplete="off"
      >
        <FormField
          name="name"
          label="Full Name"
          placeholder="Linus Torvalds"
          icon={User}
          register={register}
          error={errors.name?.message}
        />
        <FormField
          name="workspaceName"
          label="Workspace Name"
          placeholder="Acme Operations"
          icon={Building2}
          register={register}
          error={errors.workspaceName?.message}
        />
        <FormField
          name="email"
          label="Work Email"
          placeholder="name@company.com"
          type="email"
          icon={Mail}
          register={register}
          error={errors.email?.message}
          autoComplete="email"
        />
        <FormField
          name="password"
          label="Password (min 6 chars)"
          placeholder="Create a secure password"
          type="password"
          icon={Lock}
          register={register}
          error={errors.password?.message}
          autoComplete="new-password"
        />
        
        <div className="field-block">
          <label className="field-label" htmlFor="role">Initial Access Role</label>
          <div style={{ position: "relative" }}>
            <select
              id="role"
              className="search"
              {...register("role")}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--color-surface-elevated)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                borderColor: errors.role ? "var(--color-danger)" : undefined
              }}
            >
              <option value="super-admin">Super Admin (Full Platform Control)</option>
              <option value="admin">Admin (Operational Management)</option>
              <option value="viewer">Viewer (Read-only Telemetry)</option>
            </select>
          </div>
          {errors.role && (
            <div style={{ color: "var(--color-danger)", fontSize: 12, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
              {errors.role.message}
            </div>
          )}
        </div>

        {apiError && (
          <div className="alert-banner alert-banner--error">
            <AlertCircle size={16} />
            <span>{apiError}</span>
          </div>
        )}

        <button 
          className="button primary" 
          type="submit" 
          disabled={loading} 
          style={{ width: "100%", height: 42, fontSize: 14 }}
        >
          {loading ? "Creating workspace..." : "Launch SRE Workspace"}
        </button>

        {googleClientId && (
          <button 
            className="button" 
            type="button" 
            onClick={() => redirectToGoogle(googleClientId, "register")}
            style={{ width: "100%", height: 42, justifyContent: "center", gap: 10 }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "block" }}>
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.439 15.986 5.503 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.549 0 9s.347 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.896 11.426 0 9 0 5.503 0 2.439 2.014.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>
        )}

        <div className="subtle" style={{ textAlign: "center", fontSize: 13 }}>
          Already have an account? <Link to="/auth/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </div>
      </form>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const [form, setForm] = useState({ email: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <AuthShell
      activeTab="login"
      eyebrow="Account Recovery"
      title="Reset Password"
      copy="Enter your registered email address and we'll send you an authentication recovery token."
    >
      <form
        className="grid"
        style={{ gap: 16 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
            const response = await apiPost("/auth/forgot-password", form);
            setMessage(response.data?.message || "If your email is registered, a reset link has been dispatched.");
          } catch {
            setMessage("If your email is registered, a reset link has been dispatched.");
          } finally {
            setLoading(false);
          }
        }}
      >
        <FormField
          name="email"
          label="Registered Work Email"
          placeholder="name@company.com"
          type="email"
          icon={Mail}
          value={form.email}
          onChange={(e) => setForm({ email: e.target.value })}
          autoComplete="email"
        />

        {message && (
          <div className="alert-banner alert-banner--success">
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        <button 
          className="button primary" 
          type="submit" 
          disabled={loading} 
          style={{ width: "100%", height: 42, fontSize: 14 }}
        >
          {loading ? "Sending link..." : "Send Reset Link"}
        </button>

        <div className="subtle" style={{ textAlign: "center", fontSize: 13 }}>
          <Link to="/auth/login">&larr; Back to sign in</Link>
        </div>
      </form>
    </AuthShell>
  );
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ token: searchParams.get("token") || "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token") || "";
    if (token) {
      setForm({ token });
    }
  }, [searchParams]);

  return (
    <AuthShell
      activeTab="login"
      eyebrow="Identity Verification"
      title="Verify Work Email"
      copy="Confirm ownership of your email address to activate your incident responder access."
    >
      <form
        className="grid"
        style={{ gap: 16 }}
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          try {
            await apiPost("/auth/verify-email", form);
            setMessage("Email verified successfully! You can now access your workspace.");
          } catch (err) {
            setMessage(err.message || "Verification failed. The token may have expired.");
          } finally {
            setLoading(false);
          }
        }}
      >
        <FormField
          name="token"
          label="Verification Security Token"
          placeholder="Paste verification token here"
          icon={KeyRound}
          value={form.token}
          onChange={(e) => setForm({ token: e.target.value })}
        />

        {message && (
          <div className={`alert-banner ${message.includes("success") ? "alert-banner--success" : "alert-banner--error"}`}>
            {message.includes("success") ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message}</span>
          </div>
        )}

        <button 
          className="button primary" 
          type="submit" 
          disabled={loading} 
          style={{ width: "100%", height: 42, fontSize: 14 }}
        >
          {loading ? "Verifying..." : "Verify Email Address"}
        </button>

        <div className="subtle" style={{ textAlign: "center", fontSize: 13 }}>
          <Link to="/auth/login">&larr; Back to sign in</Link>
        </div>
      </form>
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    token: searchParams.get("token") || "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const token = searchParams.get("token") || "";
    if (token) setForm((f) => ({ ...f, token }));
  }, [searchParams]);

  return (
    <AuthShell
      activeTab="login"
      eyebrow="Credential Update"
      title="Set New Password"
      copy="Create a strong, unique password to secure your operator credentials."
    >
      <form
        className="grid"
        style={{ gap: 16 }}
        onSubmit={async (e) => {
          e.preventDefault();
          if (form.password !== form.confirmPassword) {
            setMessage("Passwords do not match.");
            return;
          }
          setLoading(true);
          try {
            await apiPost("/auth/reset-password", { token: form.token, password: form.password });
            setMessage("Password updated successfully. You can now sign in.");
          } catch (err) {
            setMessage(err.message || "Reset failed. The token link may have expired.");
          } finally {
            setLoading(false);
          }
        }}
      >
        <FormField
          name="token"
          label="Reset Security Token"
          placeholder="Security token"
          icon={KeyRound}
          value={form.token}
          onChange={(e) => setForm({ ...form, token: e.target.value })}
        />
        <FormField
          name="new-password"
          label="New Password"
          placeholder="Enter new password"
          type="password"
          icon={Lock}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
        />
        <FormField
          name="confirm-password"
          label="Confirm Password"
          placeholder="Re-enter password"
          type="password"
          icon={Lock}
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          autoComplete="new-password"
        />

        {message && (
          <div className={`alert-banner ${message.includes("success") ? "alert-banner--success" : "alert-banner--error"}`}>
            {message.includes("success") ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message}</span>
          </div>
        )}

        <button 
          className="button primary" 
          type="submit" 
          disabled={loading} 
          style={{ width: "100%", height: 42, fontSize: 14 }}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        <div className="subtle" style={{ textAlign: "center", fontSize: 13 }}>
          <Link to="/auth/login">&larr; Back to sign in</Link>
        </div>
      </form>
    </AuthShell>
  );
}
