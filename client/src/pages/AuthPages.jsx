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
  ArrowRight, CheckCircle2, AlertCircle, KeyRound, Sparkles,
  ShieldCheck, Activity, Terminal
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid work email address."),
  password: z.string().min(1, "Password is required."),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  workspaceName: z.string().min(2, "Workspace name must be at least 2 characters."),
  email: z.string().email("Please enter a valid work email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["super-admin", "admin", "viewer"])
});

function FormField({ name, placeholder, label, type = "text", error, register, autoComplete, icon: Icon, value, onChange }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="field-block" style={{ width: "100%" }}>
      <label className="field-label" htmlFor={name} style={{ color: "var(--color-dark-blue)", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>
        {label || placeholder}
      </label>
      <div style={{ position: "relative" }}>
        {Icon && (
          <div style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-text-soft)",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none"
          }}>
            <Icon size={16} strokeWidth={2} />
          </div>
        )}
        <input
          id={name}
          type={actualType}
          placeholder={placeholder}
          {...(register ? register(name) : { value, onChange })}
          autoComplete={autoComplete || "off"}
          style={{
            width: "100%",
            paddingLeft: Icon ? 38 : 14,
            paddingRight: isPassword ? 38 : 14,
            borderColor: error ? "var(--color-danger)" : "var(--color-border)",
            background: "#ffffff",
            color: "var(--color-text)",
            fontSize: 14,
            height: 42,
            borderRadius: "var(--radius-sm)",
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
              color: "var(--color-text-soft)",
              background: "none",
              border: "none",
              padding: 4,
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <div style={{ color: "var(--color-danger)", fontSize: 12, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function AuthShell({ children, eyebrow, title, copy, activeTab = "login" }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 20px",
      background: "#ffffff",
      position: "relative"
    }}>
      {/* Subtle hairline geometric grid background */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        opacity: 0.6,
        pointerEvents: "none"
      }} />

      {/* Main Container Card */}
      <div style={{
        width: "100%",
        maxWidth: 460,
        background: "#ffffff",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "40px 36px",
        boxShadow: "0 10px 25px -5px rgba(15, 43, 92, 0.08), 0 8px 10px -6px rgba(15, 43, 92, 0.04)",
        position: "relative",
        zIndex: 1
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 14 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-xs)",
              background: "var(--color-dark-blue)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Activity size={18} color="#ffffff" strokeWidth={2.5} />
            </div>
            <span style={{ color: "var(--color-dark-blue)", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>
              SMIMP
            </span>
            <span className="badge" style={{ padding: "2px 7px", fontSize: 10 }}>
              ENTERPRISE
            </span>
          </Link>

          {/* Live Operational Status Pill */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div className="system-status-indicator">
              <span className="status-dot pulse" />
              <span>All Systems Operational • 99.99% SLA</span>
            </div>
          </div>

          {/* Tab Switcher: Sign In vs Create Account */}
          <div style={{
            display: "flex",
            background: "var(--color-surface-elevated)",
            padding: 4,
            borderRadius: "var(--radius-sm)",
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
                background: activeTab === "login" ? "var(--color-black)" : "transparent",
                color: activeTab === "login" ? "#ffffff" : "var(--color-text)",
                boxShadow: activeTab === "login" ? "var(--shadow-xs)" : "none",
                textDecoration: "none",
                transition: "all 0.15s ease"
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
                background: activeTab === "register" ? "var(--color-black)" : "transparent",
                color: activeTab === "register" ? "#ffffff" : "var(--color-text)",
                boxShadow: activeTab === "register" ? "var(--shadow-xs)" : "none",
                textDecoration: "none",
                transition: "all 0.15s ease"
              }}
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {eyebrow && (
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-dark-green)",
              marginBottom: 6
            }}>
              {eyebrow}
            </div>
          )}
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--color-dark-blue)", marginBottom: 6 }}>
            {title}
          </h1>
          <p style={{ color: "var(--color-text-body)", fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>
            {copy}
          </p>
        </div>

        {/* Form Body */}
        {children}
      </div>

      {/* Security & Compliance Footer */}
      <div style={{
        marginTop: 28,
        display: "flex",
        alignItems: "center",
        gap: 16,
        fontSize: 12,
        color: "var(--color-text-soft)",
        zIndex: 1,
        flexWrap: "wrap",
        justifyContent: "center"
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-dark-green)", fontWeight: 600 }}>
          <ShieldCheck size={15} />
          SOC 2 Type II Certified
        </span>
        <span>•</span>
        <span>End-to-End Encrypted Telemetry</span>
        <span>•</span>
        <Link to="/status/demo" style={{ color: "var(--color-text-body)" }}>
          Public Status
        </Link>
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

  // Preset demo account credentials for easy evaluation
  const setDemoCredentials = (role) => {
    if (role === "admin") {
      setValue("email", "admin@smimp.io");
      setValue("password", "AdminPassword123!");
    } else if (role === "super-admin") {
      setValue("email", "superadmin@smimp.io");
      setValue("password", "SuperAdmin123!");
    } else {
      setValue("email", "viewer@smimp.io");
      setValue("password", "ViewerPassword123!");
    }
  };

  return (
    <AuthShell
      activeTab="login"
      eyebrow="Console Authentication"
      title="Operator Sign In"
      copy="Monitor telemetry, triage incident war-rooms, and audit service SLO health."
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
          placeholder="operator@company.com"
          type="email"
          icon={Mail}
          register={register}
          error={errors.email?.message}
          autoComplete="email"
        />
        
        <FormField
          name="password"
          label="Password"
          placeholder="Enter operator password"
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
          className="button black" 
          type="submit" 
          disabled={loading} 
          style={{ width: "100%", height: 44, fontSize: 14, fontWeight: 700 }}
        >
          {loading ? "Authenticating Operator..." : "Sign In to Workspace"}
        </button>

        {googleClientId && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
              <span style={{ fontSize: 11, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
            </div>

            <button 
              className="button" 
              type="button" 
              onClick={() => redirectToGoogle(googleClientId, "login")}
              style={{ width: "100%", height: 42, justifyContent: "center", gap: 10, background: "#ffffff", borderColor: "var(--color-border)" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "block" }}>
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.439 15.986 5.503 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.549 0 9s.347 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.896 11.426 0 9 0 5.503 0 2.439 2.014.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginTop: 4 }}>
          <Link to="/auth/forgot-password" style={{ color: "var(--color-text-body)" }}>
            Forgot password?
          </Link>
          <Link to="/auth/register" style={{ color: "var(--color-dark-blue)", fontWeight: 700 }}>
            Create account &rarr;
          </Link>
        </div>

        {/* Demo Fast-Fill Tray */}
        <div style={{
          marginTop: 12,
          padding: "12px 14px",
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-sm)"
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-dark-green)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={13} />
            <span>Evaluation Quick Fill:</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              type="button"
              className="button"
              onClick={() => setDemoCredentials("admin")}
              style={{ fontSize: 11, padding: "4px 8px", height: "auto" }}
            >
              Demo Admin
            </button>
            <button
              type="button"
              className="button"
              onClick={() => setDemoCredentials("super-admin")}
              style={{ fontSize: 11, padding: "4px 8px", height: "auto" }}
            >
              Demo Super Admin
            </button>
            <button
              type="button"
              className="button"
              onClick={() => setDemoCredentials("viewer")}
              style={{ fontSize: 11, padding: "4px 8px", height: "auto" }}
            >
              Demo Viewer
            </button>
          </div>
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
      title="Create Workspace"
      copy="Deploy your isolated SRE command center and onboard the primary workspace admin."
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
          placeholder="Alex Rivera"
          icon={User}
          register={register}
          error={errors.name?.message}
        />

        <FormField
          name="workspaceName"
          label="Workspace Name"
          placeholder="Acme SRE Operations"
          icon={Building2}
          register={register}
          error={errors.workspaceName?.message}
        />

        <FormField
          name="email"
          label="Work Email"
          placeholder="operator@acme.com"
          type="email"
          icon={Mail}
          register={register}
          error={errors.email?.message}
          autoComplete="email"
        />

        <FormField
          name="password"
          label="Password (min 6 characters)"
          placeholder="Create a strong passphrase"
          type="password"
          icon={Lock}
          register={register}
          error={errors.password?.message}
          autoComplete="new-password"
        />
        
        <div className="field-block">
          <label className="field-label" htmlFor="role" style={{ color: "var(--color-dark-blue)", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>
            Initial Role
          </label>
          <div style={{ position: "relative" }}>
            <select
              id="role"
              {...register("role")}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "#ffffff",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                borderColor: errors.role ? "var(--color-danger)" : undefined,
                fontSize: 13.5
              }}
            >
              <option value="super-admin">Super Admin (Full Workspace & Member Control)</option>
              <option value="admin">Admin (Operational & Rule Management)</option>
              <option value="viewer">Viewer (Read-Only Telemetry)</option>
            </select>
          </div>
          {errors.role && (
            <div style={{ color: "var(--color-danger)", fontSize: 12, marginTop: 4 }}>
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
          className="button black" 
          type="submit" 
          disabled={loading} 
          style={{ width: "100%", height: 44, fontSize: 14, fontWeight: 700 }}
        >
          {loading ? "Deploying Workspace..." : "Create SRE Workspace"}
        </button>

        {googleClientId && (
          <button 
            className="button" 
            type="button" 
            onClick={() => redirectToGoogle(googleClientId, "register")}
            style={{ width: "100%", height: 42, justifyContent: "center", gap: 10, background: "#ffffff" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: "block" }}>
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.439 15.986 5.503 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.549 0 9s.347 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.896 11.426 0 9 0 5.503 0 2.439 2.014.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            <span>Sign up with Google</span>
          </button>
        )}

        <div style={{ textAlign: "center", fontSize: 13, marginTop: 4 }}>
          <span style={{ color: "var(--color-text-body)" }}>Already have an account? </span>
          <Link to="/auth/login" style={{ color: "var(--color-dark-blue)", fontWeight: 700 }}>
            Sign in &rarr;
          </Link>
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
      copy="Enter your registered work email and we will dispatch a secure recovery token."
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
          placeholder="operator@company.com"
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
          className="button black" 
          type="submit" 
          disabled={loading} 
          style={{ width: "100%", height: 44, fontSize: 14, fontWeight: 700 }}
        >
          {loading ? "Sending Token..." : "Send Reset Token"}
        </button>

        <div style={{ textAlign: "center", fontSize: 13 }}>
          <Link to="/auth/login" style={{ color: "var(--color-text-body)" }}>
            &larr; Back to sign in
          </Link>
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
      copy="Confirm ownership of your work email to activate your incident responder credentials."
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
          placeholder="Paste security token here"
          icon={KeyRound}
          value={form.token}
          onChange={(e) => setForm({ token: e.target.value })}
        />

        {message && (
          <div className={`alert-banner ${message.includes("successfully") ? "alert-banner--success" : "alert-banner--error"}`}>
            {message.includes("successfully") ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message}</span>
          </div>
        )}

        <button 
          className="button black" 
          type="submit" 
          disabled={loading} 
          style={{ width: "100%", height: 44, fontSize: 14, fontWeight: 700 }}
        >
          {loading ? "Verifying..." : "Verify Work Email"}
        </button>

        <div style={{ textAlign: "center", fontSize: 13 }}>
          <Link to="/auth/login" style={{ color: "var(--color-text-body)" }}>
            &larr; Back to sign in
          </Link>
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
      copy="Create a strong, unique passphrase to secure your operator credentials."
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
          placeholder="Enter new passphrase"
          type="password"
          icon={Lock}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
        />

        <FormField
          name="confirm-password"
          label="Confirm Password"
          placeholder="Re-enter passphrase"
          type="password"
          icon={Lock}
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          autoComplete="new-password"
        />

        {message && (
          <div className={`alert-banner ${message.includes("successfully") ? "alert-banner--success" : "alert-banner--error"}`}>
            {message.includes("successfully") ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message}</span>
          </div>
        )}

        <button 
          className="button black" 
          type="submit" 
          disabled={loading} 
          style={{ width: "100%", height: 44, fontSize: 14, fontWeight: 700 }}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        <div style={{ textAlign: "center", fontSize: 13 }}>
          <Link to="/auth/login" style={{ color: "var(--color-text-body)" }}>
            &larr; Back to sign in
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
