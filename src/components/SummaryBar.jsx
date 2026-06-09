import React from 'react'

function StatCard({ label, value, accent }) {
  return (
    <div className="flex-1 bg-bg-tertiary border border-border rounded-xl px-5 py-3.5 flex flex-col gap-0.5">
      <span className="text-text-muted text-xs font-medium uppercase tracking-widest">{label}</span>
      <span className={`text-xl font-semibold ${accent ? 'text-accent' : 'text-text-primary'}`}>{value}</span>
    </div>
  )
}

export function SummaryBar({ stats }) {
  const formatEur = (v) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v)

  return (
    <div className="flex gap-3">
      <StatCard label="Références uniques" value={stats.uniqueLines} />
      <StatCard label="Total articles" value={stats.totalItems} />
      <StatCard label="Valeur estimée" value={formatEur(stats.totalValue)} accent />
    </div>
  )
}
