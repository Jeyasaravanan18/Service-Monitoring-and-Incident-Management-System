import React, { useState, useEffect } from "react";
import { BrainCircuit, Sparkles, Copy, Check } from "lucide-react";

export function AIPanel({ title = "SMIMP AI Copilot", children, status = "active", action }) {
  const [typedText, setTypedText] = useState("");
  const [copied, setCopied] = useState(false);
  const contentStr = typeof children === "string" ? children : "";

  // Smooth typing effect animation for string children
  useEffect(() => {
    if (typeof children !== "string") return;
    
    let index = 0;
    setTypedText("");
    
    const timerId = setInterval(() => {
      if (index < children.length) {
        const char = children.charAt(index);
        setTypedText((prev) => prev + char);
        index++;
      } else {
        clearInterval(timerId);
      }
    }, 15);
    
    return () => clearInterval(timerId);
  }, [children]);

  const handleCopy = () => {
    if (contentStr) {
      navigator.clipboard.writeText(contentStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className={`ai-icon ${status === "analyzing" ? "analyzing" : ""}`}>
          <BrainCircuit size={17} strokeWidth={2} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="ai-title">{title}</span>
          <span className="badge" style={{ 
            fontSize: 10,
            padding: "2px 8px"
          }}>
            <Sparkles size={11} style={{ marginRight: 4 }} />
            Grounded Model
          </span>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {contentStr && (
            <button 
              className="button" 
              style={{ padding: "4px 8px", height: "28px", fontSize: 11 }}
              onClick={handleCopy}
              title="Copy insight"
            >
              {copied ? <Check size={13} style={{ color: "var(--color-success)" }} /> : <Copy size={13} />}
            </button>
          )}
          {action}
        </div>
      </div>

      <div className="ai-content">
        {typeof children === "string" ? (
          <div style={{ whiteSpace: "pre-wrap" }}>{typedText}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
