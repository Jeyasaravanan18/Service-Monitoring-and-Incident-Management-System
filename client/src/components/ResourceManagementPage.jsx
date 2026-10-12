import React from "react";
import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api.js";
import { HealthPill } from "./HealthPill.jsx";
import { Panel, PageHeader, Topbar } from "./Layout.jsx";
import { 
  Plus, Search, RefreshCw, Edit3, Trash2, X, Check, AlertCircle, 
  Layers, Filter, ArrowUpDown, Download
} from "lucide-react";

const emptyValueByType = {
  text: "",
  number: "",
  textarea: "",
  select: "",
  checkbox: false,
  array: "",
  json: "{}",
  date: "",
};

function serializeFormValue(value, type) {
  if (type === "checkbox") return Boolean(value);
  if (type === "number") return value === "" || value == null ? "" : Number(value);
  if (type === "array") {
    if (Array.isArray(value)) return value.join(", ");
    return value || "";
  }
  if (type === "json") {
    if (typeof value === "string") return value;
    return JSON.stringify(value ?? {}, null, 2);
  }
  if (type === "date") {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
  }
  return value == null ? "" : String(value);
}

function parseFormValue(value, field) {
  if (field.type === "checkbox") return Boolean(value);
  if (field.type === "number") {
    if (value === "") return "";
    const parsed = Number(value);
    return Number.isNaN(parsed) ? "" : parsed;
  }
  if (field.type === "array") {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (field.type === "json") {
    if (!String(value).trim()) return {};
    try {
      return JSON.parse(value);
    } catch {
      throw new Error(`${field.label} must be valid JSON`);
    }
  }
  if (field.type === "date") {
    return value ? new Date(value).toISOString() : "";
  }
  return value;
}

function buildInitialForm(fields, item) {
  return fields.reduce((acc, field) => {
    const raw = item?.[field.key];
    acc[field.key] = serializeFormValue(
      raw === undefined ? emptyValueByType[field.type || "text"] : raw,
      field.type || "text"
    );
    return acc;
  }, {});
}

function formatCellValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function ResourceManagementPage({
  title,
  copy,
  endpoint,
  columns = [],
  fields = [],
  createLabel,
  updateLabel,
  badgeField,
  itemLabel = "item",
  mapCreate = (payload) => payload,
  mapUpdate = (payload) => payload,
  createEndpoint = endpoint,
  updateEndpoint = (item) => `${endpoint}/${item._id}`,
  deleteEndpoint = (item) => `${endpoint}/${item._id}`,
  extraSummary,
  listFilters = [],
  disableCreate = false,
  disableEdit = false,
  disableDelete = false,
  headerAction,
}) {
  const [state, setState] = useState({ loading: true, error: "", data: [] });
  const [filterForm, setFilterForm] = useState(() => buildInitialForm(listFilters));
  const [searchTableQuery, setSearchTableQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");

  const formTitle = editing ? `${updateLabel || `Edit ${itemLabel}`}` : `${createLabel || `Create ${itemLabel}`}`;
  const buttonLabel = editing ? (updateLabel || "Save changes") : (createLabel || `Create ${itemLabel}`);

  const refresh = async (activeFilters = filterForm) => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const params = new URLSearchParams();
      for (const field of listFilters) {
        const parsed = parseFormValue(activeFilters[field.key], field);
        if (parsed === "" || parsed === null || parsed === undefined) continue;
        if (Array.isArray(parsed)) {
          if (parsed.length) params.set(field.key, parsed.join(","));
          continue;
        }
        if (typeof parsed === "object") {
          params.set(field.key, JSON.stringify(parsed));
          continue;
        }
        params.set(field.key, String(parsed));
      }
      const response = await apiGet(params.toString() ? `${endpoint}?${params.toString()}` : endpoint);
      setState({ loading: false, error: "", data: response.data || [] });
    } catch (error) {
      setState({ loading: false, error: error.message, data: [] });
    }
  };

  useEffect(() => {
    const initialFilters = buildInitialForm(listFilters);
    setFilterForm(initialFilters);
    refresh(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const summary = useMemo(() => {
    if (typeof extraSummary === "function") {
      return extraSummary(state.data);
    }
    return null;
  }, [extraSummary, state.data]);

  const startCreate = () => {
    setEditing(null);
    setSaveError("");
    setNotice("");
    setForm(buildInitialForm(fields));
    setIsModalOpen(true);
  };

  const startEdit = (item) => {
    setEditing(item);
    setSaveError("");
    setNotice("");
    setForm(buildInitialForm(fields, item));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setForm({});
    setSaveError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setSaveError("");
    setNotice("");
    try {
      const payload = fields.reduce((acc, field) => {
        acc[field.key] = parseFormValue(form[field.key], field);
        return acc;
      }, {});

      const body = editing ? mapUpdate(payload, editing) : mapCreate(payload);
      if (editing) {
        const response = await apiPatch(updateEndpoint(editing), body);
        if (response?.data?.plainKey) {
          setNotice(`New API key: ${response.data.plainKey}`);
        }
      } else {
        const response = await apiPost(createEndpoint, body);
        if (response?.data?.plainKey) {
          setNotice(`New API key: ${response.data.plainKey}`);
        } else if (response?.data?.message) {
          setNotice(response.data.message);
        }
      }
      closeModal();
      await refresh();
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemLabel}?`)) return;
    setSaveError("");
    try {
      await apiDelete(deleteEndpoint(item));
      if (editing?._id === item._id) {
        closeModal();
      }
      await refresh();
    } catch (error) {
      setSaveError(error.message);
    }
  };

  // Client-side quick search filter on table rows
  const displayRows = useMemo(() => {
    if (!searchTableQuery.trim()) return state.data;
    const q = searchTableQuery.toLowerCase();
    return state.data.filter((row) => {
      return Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [state.data, searchTableQuery]);

  return (
    <>
      <Topbar />
      <PageHeader
        title={title}
        copy={copy}
        badge={`${state.data.length} total`}
        action={
          <div className="button-row">
            {headerAction}
            <button className="button" type="button" onClick={() => refresh()}>
              <RefreshCw size={14} className={state.loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
            {!disableCreate ? (
              <button className="button primary" type="button" onClick={startCreate}>
                <Plus size={16} strokeWidth={2.5} />
                <span>New {itemLabel}</span>
              </button>
            ) : null}
          </div>
        }
      />

      {/* Extra KPI summary if defined */}
      {summary ? (
        <div className="grid cols-3" style={{ marginBottom: 20 }}>
          {summary}
        </div>
      ) : null}

      {notice && (
        <div className="alert-banner alert-banner--success" style={{ marginBottom: 20 }}>
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {saveError && (
        <div className="alert-banner alert-banner--error" style={{ marginBottom: 20 }}>
          <AlertCircle size={16} />
          <span>{saveError}</span>
        </div>
      )}

      {/* Table Container & Filter Toolbar */}
      <Panel>
        {/* Table Toolbar */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          gap: 16, 
          marginBottom: 16,
          flexWrap: "wrap" 
        }}>
          {/* Quick search input */}
          <div style={{ position: "relative", minWidth: 260, maxWidth: 360, flex: 1 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTableQuery}
              onChange={(e) => setSearchTableQuery(e.target.value)}
              style={{
                paddingLeft: 34,
                height: 38,
                fontSize: 13,
                background: "var(--color-surface-elevated)",
                borderRadius: "var(--radius-sm)",
              }}
            />
          </div>

          {/* List filters (if any) */}
          {listFilters.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {listFilters.map((field) => {
                const value = filterForm[field.key] ?? emptyValueByType[field.type || "text"];
                if (field.type === "select") {
                  return (
                    <select
                      key={field.key}
                      style={{
                        height: 38,
                        fontSize: 12.5,
                        padding: "0 12px",
                        background: "var(--color-surface-elevated)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--color-border)",
                      }}
                      value={value}
                      onChange={(e) => {
                        const updated = { ...filterForm, [field.key]: e.target.value };
                        setFilterForm(updated);
                        refresh(updated);
                      }}
                    >
                      <option value="">All {field.label}</option>
                      {(field.options || []).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  );
                }
                return null;
              })}
            </div>
          )}

          <div style={{ fontSize: 13, color: "var(--color-muted)", marginLeft: "auto" }}>
            Showing {displayRows.length} of {state.data.length} records
          </div>
        </div>

        {state.loading && (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-muted)" }}>
            <RefreshCw size={24} className="spin" style={{ margin: "0 auto 12px" }} />
            <div>Loading {title.toLowerCase()} records...</div>
          </div>
        )}

        {state.error && (
          <div className="alert-banner alert-banner--error">
            {state.error}
          </div>
        )}

        {!state.loading && !state.error && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  {!disableEdit || !disableDelete ? (
                    <th style={{ width: 110, textAlign: "right" }}>Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {displayRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} style={{ textAlign: "center", padding: "48px 20px" }}>
                      <div style={{ color: "var(--color-muted)", fontSize: 14 }}>
                        No matching {title.toLowerCase()} found.
                      </div>
                      {!disableCreate && (
                        <button 
                          className="button primary" 
                          style={{ marginTop: 14 }}
                          onClick={startCreate}
                        >
                          <Plus size={14} />
                          <span>Create First {itemLabel}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  displayRows.map((row) => (
                    <tr key={row._id || row.id || JSON.stringify(row)}>
                      {columns.map((column) => (
                        <td key={column.key}>
                          {column.key === badgeField ? (
                            <HealthPill value={row[column.key]} />
                          ) : column.render ? (
                            column.render(row)
                          ) : (
                            formatCellValue(row[column.key])
                          )}
                        </td>
                      ))}
                      {!disableEdit || !disableDelete ? (
                        <td style={{ textAlign: "right" }}>
                          <div className="button-row" style={{ justifyContent: "flex-end", flexWrap: "nowrap" }}>
                            {!disableEdit ? (
                              <button 
                                className="button" 
                                style={{ padding: "5px 10px", height: "30px" }}
                                type="button" 
                                onClick={() => startEdit(row)}
                                title="Edit"
                              >
                                <Edit3 size={13} />
                              </button>
                            ) : null}
                            {!disableDelete ? (
                              <button 
                                className="button danger" 
                                style={{ padding: "5px 10px", height: "30px" }}
                                type="button" 
                                onClick={() => handleDelete(row)}
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Slide-over / Modal for Create & Edit */}
      {isModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}>
          <div style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: "var(--radius-lg)",
            width: "100%",
            maxWidth: 620,
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "var(--shadow-xl)",
            animation: "toast-in 0.25s ease",
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--color-surface-elevated)"
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>{formTitle}</h3>
                <div style={{ fontSize: 12.5, color: "var(--color-muted)", marginTop: 2 }}>
                  Configure {itemLabel} parameters and settings
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="button"
                style={{ padding: 6, borderRadius: "50%", height: 32, width: 32 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
              <div className="grid" style={{ gap: 16 }}>
                {fields.map((field) => {
                  const value = form[field.key] ?? emptyValueByType[field.type || "text"];
                  const common = {
                    className: "search",
                    style: { maxWidth: "100%" },
                    value,
                    onChange: (event) => setForm((current) => ({ ...current, [field.key]: event.target.value })),
                    placeholder: field.placeholder || field.label,
                  };

                  if (field.type === "checkbox") {
                    return (
                      <label key={field.key} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        background: "var(--color-surface-elevated)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--color-border)",
                        cursor: "pointer"
                      }}>
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.checked }))}
                          style={{ width: 18, height: 18, accentColor: "var(--color-brand)", cursor: "pointer" }}
                        />
                        <div>
                          <strong style={{ fontSize: 14 }}>{field.label}</strong>
                          {field.help ? <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>{field.help}</div> : null}
                        </div>
                      </label>
                    );
                  }

                  if (field.type === "textarea" || field.type === "json") {
                    return (
                      <label key={field.key} className="field-block">
                        <span className="field-label">{field.label}</span>
                        <textarea 
                          {...common} 
                          rows={field.type === "json" ? 5 : 3} 
                          style={{ 
                            fontFamily: field.type === "json" ? "'JetBrains Mono', monospace" : "inherit",
                            fontSize: 13,
                            resize: "vertical" 
                          }} 
                        />
                        {field.help ? <span style={{ fontSize: 11, color: "var(--color-muted)" }}>{field.help}</span> : null}
                      </label>
                    );
                  }

                  if (field.type === "select") {
                    return (
                      <label key={field.key} className="field-block">
                        <span className="field-label">{field.label}</span>
                        <select
                          className="search"
                          style={{ maxWidth: "100%" }}
                          value={value}
                          onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                        >
                          <option value="">Select {field.label}</option>
                          {(field.options || []).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {field.help ? <span style={{ fontSize: 11, color: "var(--color-muted)" }}>{field.help}</span> : null}
                      </label>
                    );
                  }

                  return (
                    <label key={field.key} className="field-block">
                      <span className="field-label">{field.label}</span>
                      <input
                        {...common}
                        type={field.type === "number" ? "number" : field.type === "date" ? "datetime-local" : "text"}
                        step={field.step || (field.type === "number" ? "any" : undefined)}
                      />
                      {field.help ? <span style={{ fontSize: 11, color: "var(--color-muted)" }}>{field.help}</span> : null}
                    </label>
                  );
                })}
              </div>

              {saveError && (
                <div className="alert-banner alert-banner--error" style={{ marginTop: 16 }}>
                  {saveError}
                </div>
              )}

              {/* Modal Actions */}
              <div className="button-row" style={{ marginTop: 24, justifyContent: "flex-end" }}>
                <button
                  className="button"
                  type="button"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  className="button primary" 
                  type="submit" 
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : buttonLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
