import React from "react";
import { AlertOctagon } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          minHeight: "400px",
          padding: "40px",
          textAlign: "center",
          fontFamily: "'JetBrains Mono', monospace",
          color: "var(--color-danger)"
        }}>
          <div style={{ marginBottom: 16 }}>
            <AlertOctagon size={64} strokeWidth={1} />
          </div>
          <h1 style={{ fontSize: 24, marginBottom: 12, color: "var(--color-text)", textTransform: "uppercase", letterSpacing: "0.1em" }}>System Error Detected</h1>
          <p style={{ color: "var(--color-text-soft)", maxWidth: "500px", marginBottom: 32, lineHeight: 1.6 }}>
            The platform interface encountered an unexpected rendering anomaly. The intelligence layer has halted rendering to prevent data corruption.
          </p>
          <div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--color-danger)", borderRadius: "4px", marginBottom: 32, textAlign: "left", width: "100%", maxWidth: "600px", overflow: "auto" }}>
            <code>{this.state.error?.toString() || "Unknown error"}</code>
          </div>
          <button 
            className="button primary" 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Initiate System Reboot
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
