import React from "react";
import { useEffect, useState } from "react";
import { apiGet } from "../lib/api.js";
import { HealthPill } from "./HealthPill.jsx";
import { Panel, PageHeader, Topbar } from "./Layout.jsx";

function formatValue(value) {
  if (value == null) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function LiveListPage({ title, copy, endpoint, columns, badgeField }) {
  const [state, setState] = useState({ loading: true, error: "", data: [] });

  useEffect(() => {
    let mounted = true;
    apiGet(endpoint)
      .then((res) => {
        if (!mounted) return;
        setState({ loading: false, error: "", data: res.data || [] });
      })
      .catch((error) => {
        if (!mounted) return;
        setState({ loading: false, error: error.message, data: [] });
      });
    return () => {
      mounted = false;
    };
  }, [endpoint]);

  return (
    <>
      <Topbar />
      <PageHeader title={title} copy={copy} action={<button className="button primary">New {title}</button>} />
      <Panel title={`${title} records`}>
        {state.loading ? <div className="subtle">Loading workspace data...</div> : null}
        {state.error ? <div className="subtle">{state.error}</div> : null}
        {!state.loading && !state.error ? (
          <table className="table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.data.map((row) => (
                <tr key={row._id || row.id || JSON.stringify(row)}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.key === badgeField ? <HealthPill value={row[column.key]} /> : column.render ? column.render(row) : formatValue(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </Panel>
    </>
  );
}
