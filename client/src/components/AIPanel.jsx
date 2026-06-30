import React, { useState, useEffect } from "react";
import { BrainCircuit } from "lucide-react";

export function AIPanel({ title = "SMIMP AI", children, status = "active", action }) {
  const [typedText, setTypedText] = useState("");
  const contentStr = typeof children === "string" ? children : "";

  // Typing effect animation for string children
  useEffect(() => {
    if (typeof children !== "string") return;
    let index = 0;
    setTypedText("");
    
    let timerId = null;
    
    const typeNextChar = () => {
      if (index < children.length) {
        setTypedText((prev) => prev + children.charAt(index));
        index++;
        // Organic typing speed: between 10ms and 35ms per character
        const delay = Math.random() * 25 + 10;
        timerId = setTimeout(typeNextChar, delay);
      }
    };
    
    typeNextChar();
    
    return () => clearTimeout(timerId);
  }, [children]);

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className={`ai-icon ${status === "analyzing" ? "analyzing" : ""}`} style={{ color: "var(--color-brand)" }}>
          <BrainCircuit size={16} strokeWidth={1.5} className={status === "analyzing" ? "pulse-glow" : ""} />
        </div>
        <div className="ai-title">{title}</div>
        {status === "analyzing" && <div className="badge" style={{ marginLeft: "auto" }}>Analyzing...</div>}
        {action && <div style={{ marginLeft: "auto" }}>{action}</div>}
      </div>
      <div className={`ai-content ${typeof children === "string" && typedText.length < children.length ? "ai-typing" : ""}`}>
        {typeof children === "string" ? typedText : children}
      </div>
    </div>
  );
}
