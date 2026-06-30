import React from "react";
import { Panel, PageHeader, Topbar } from "../components/Layout.jsx";

export function DetailPage({ title, subtitle, badges = [], sections = [] }) {
  return (
    <>
      <Topbar />
      <PageHeader
        title={title}
        copy={subtitle}
        action={<div className="button-row">{badges.map((badge) => <span key={badge} className="badge">{badge}</span>)}</div>}
      />
      <div className="grid cols-2">
        {sections.map((section) => (
          <Panel key={section.title} title={section.title}>
            {section.body}
          </Panel>
        ))}
      </div>
    </>
  );
}
