import React from 'react';

const PageHeader = ({ eyebrow, title, subtitle, action }) => (
  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/80">{eyebrow}</p>}
      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default PageHeader;
