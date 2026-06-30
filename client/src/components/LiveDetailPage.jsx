import React from "react";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api.js";
import { MetricCard } from "./MetricCard.jsx";
import { HealthPill } from "./HealthPill.jsx";
import { Panel, PageHeader, Topbar } from "./Layout.jsx";
import { AIPanel } from "./AIPanel.jsx";

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export function LiveDetailPage({
  title,
  copy,
  endpoint,
  summaryFields = [],
  detailFields = [],
  tables = [],
  actions = null,
  badgeField = null,
  badgeValue = null,
  aiAnalysis = null,
}) {
  const [state, setState] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    let mounted = true;
    setState({ loading: true, error: "", data: null });
    apiGet(endpoint)
      .then((response) => {
        if (!mounted) return;
        setState({ loading: false, error: "", data: response.data || null });
      })
      .catch((error) => {
        if (!mounted) return;
        setState({ loading: false, error: error.message, data: null });
      });
    return () => {
      mounted = false;
    };
  }, [endpoint]);

  const summaryCards = useMemo(() => {
    if (!state.data) return [];
    return summaryFields
      .map((field) => ({
        label: field.label,
        value: field.render ? field.render(state.data) : formatValue(state.data[field.key]),
        trend: field.trend ? field.trend(state.data) : "",
      }))
      .filter(Boolean);
  }, [state.data, summaryFields]);

  return (
    <>
      <Topbar />
      <PageHeader
        title={title}
        copy={copy}
        action={
          <div className="button-row" style={{ alignItems: "center" }}>
            {badgeField ? <HealthPill value={badgeValue ?? state.data?.[badgeField]} /> : null}
            {actions}
          </div>
        }
      />
      {state.error ? <Panel title="Load error">{state.error}</Panel> : null}
      {state.loading ? <Panel title="Loading">{`Loading ${title.toLowerCase()}...`}</Panel> : null}
      {!state.loading && state.data ? (
        <>
          {aiAnalysis ? (
            <AIPanel title={`SMIMP AI - ${title} Analysis`} status="active">
              {typeof aiAnalysis === "function" ? aiAnalysis(state.data) : aiAnalysis}
            </AIPanel>
          ) : null}
          {summaryCards.length ? (
            <div className="grid cols-4" style={{ marginBottom: 16 }}>
              {summaryCards.map((card) => (
                <MetricCard key={card.label} label={card.label} value={card.value} trend={card.trend} />
              ))}
            </div>
          ) : null}
          <div className="grid cols-2" style={{ alignItems: "start" }}>
            <Panel title={`${title} details`}>
              <div className="grid" style={{ gap: 10 }}>
                {detailFields.map((field) => (
                  <div key={field.key} className="panel" style={{ background: "rgba(255,255,255,0.03)", boxShadow: "none" }}>
                    <div className="metric-label">{field.label}</div>
                    <div>{field.render ? field.render(state.data) : formatValue(state.data[field.key])}</div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Raw payload">
              <div style={{ position: "relative" }}>
                <button
                  className="button subtle"
                  style={{ position: "absolute", top: 0, right: 0, padding: "4px 8px", fontSize: 11 }}
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(state.data, null, 2))}
                >
                  Copy JSON
                </button>
                <pre 
                  style={{ whiteSpace: "pre-wrap", margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, maxHeight: 720, overflow: "auto", background: "var(--color-surface)", padding: 16, borderRadius: "var(--radius-md)" }}
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      let json = JSON.stringify(state.data, null, 2) || "";
                      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                        let cls = 'var(--color-brand)';
                        if (/^"/.test(match)) {
                            if (/:$/.test(match)) {
                                cls = 'var(--color-text)';
                            } else {
                                cls = '#a3be8c'; // string
                            }
                        } else if (/true|false/.test(match)) {
                            cls = '#bf616a'; // boolean
                        } else if (/null/.test(match)) {
                            cls = 'var(--color-text-soft)'; // null
                        }
                        return '<span style="color:' + cls + '">' + match + '</span>';
                      });
                    })()
                  }}
                />
              </div>
            </Panel>
          </div>
          {tables.map((table) => (
            <Panel key={table.title} title={table.title} className="panel-strong">
              {table.dataKey && Array.isArray(state.data[table.dataKey]) && state.data[table.dataKey].length ? (
                <table className="table">
                  <thead>
                    <tr>
                      {table.columns.map((column) => (
                        <th key={column.key}>{column.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {state.data[table.dataKey].map((row) => (
                      <tr key={row._id || row.id || JSON.stringify(row)}>
                        {table.columns.map((column) => (
                          <td key={column.key}>
                            {column.key === table.badgeField ? (
                              <HealthPill value={row[column.key]} />
                            ) : column.render ? (
                              column.render(row)
                            ) : (
                              formatValue(row[column.key])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="subtle">{table.emptyText || "No records yet."}</div>
              )}
            </Panel>
          ))}
        </>
      ) : null}
    </>
  );
}
