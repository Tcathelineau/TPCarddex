import React, { useState, useMemo } from 'react'
import { PriceCell } from './PriceCell.jsx'

const PRODUCT_TYPE_LABELS = {
  display: 'Display',
  etb: 'ETB',
  blister: 'Blister',
  tin: 'Tin',
  coffret: 'Coffret',
  bundle: 'Bundle',
}

const SORT_FIELDS = [
  { key: 'set_name', label: 'Set' },
  { key: 'product_type', label: 'Type' },
  { key: 'unit_price', label: 'Prix unit.' },
  { key: 'total', label: 'Total' },
  { key: 'added_at', label: 'Ajouté' },
]

function SortIcon({ direction }) {
  if (!direction) return <svg className="w-3 h-3 text-text-muted opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
  if (direction === 'asc') return <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
  return <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
}

function QuantityControl({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-5 h-5 rounded bg-bg-hover border border-border text-text-secondary hover:text-text-primary hover:border-border-light transition-colors flex items-center justify-center text-xs"
      >−</button>
      <span className="w-7 text-center font-mono text-sm text-text-primary">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-5 h-5 rounded bg-bg-hover border border-border text-text-secondary hover:text-text-primary hover:border-border-light transition-colors flex items-center justify-center text-xs"
      >+</button>
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-bg-tertiary border border-border flex items-center justify-center text-3xl">
        📦
      </div>
      <div>
        <p className="text-text-primary font-medium mb-1">Aucun produit dans la collection</p>
        <p className="text-text-muted text-sm">Commencez par ajouter votre premier article scellé</p>
      </div>
      <button onClick={onAdd} className="btn-primary">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Ajouter un produit
      </button>
    </div>
  )
}

export function CollectionTable({ collection, onUpdateQuantity, onUpdatePrice, onDelete, onAddProduct }) {
  const [sortField, setSortField] = useState('added_at')
  const [sortDir, setSortDir] = useState('desc')

  const formatEur = (v) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v || 0)

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  const toggleSort = (key) => {
    if (sortField === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(key)
      setSortDir('asc')
    }
  }

  const sorted = useMemo(() => {
    return [...collection].sort((a, b) => {
      let av = sortField === 'total' ? a.unit_price * a.quantity : a[sortField]
      let bv = sortField === 'total' ? b.unit_price * b.quantity : b[sortField]
      if (typeof av === 'string') av = av?.toLowerCase()
      if (typeof bv === 'string') bv = bv?.toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [collection, sortField, sortDir])

  if (collection.length === 0) {
    return <EmptyState onAdd={onAddProduct} />
  }

  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 z-10 bg-bg-secondary">
          <tr className="border-b border-border">
            <th className="text-left px-4 py-2.5 text-text-muted text-xs font-medium uppercase tracking-wider w-10">#</th>
            <th className="text-left px-4 py-2.5 text-text-muted text-xs font-medium uppercase tracking-wider">Set</th>
            <th className="text-left px-4 py-2.5 text-text-muted text-xs font-medium uppercase tracking-wider">Produit</th>
            {SORT_FIELDS.filter((f) => ['product_type', 'unit_price', 'total'].includes(f.key)).map((f) => (
              <th
                key={f.key}
                className="text-left px-4 py-2.5 text-text-muted text-xs font-medium uppercase tracking-wider cursor-pointer hover:text-text-secondary transition-colors"
                onClick={() => toggleSort(f.key)}
              >
                <span className="flex items-center gap-1.5">
                  {f.label}
                  <SortIcon direction={sortField === f.key ? sortDir : null} />
                </span>
              </th>
            ))}
            <th className="text-left px-4 py-2.5 text-text-muted text-xs font-medium uppercase tracking-wider">Qté</th>
            <th className="text-left px-4 py-2.5 text-text-muted text-xs font-medium uppercase tracking-wider cursor-pointer hover:text-text-secondary transition-colors" onClick={() => toggleSort('added_at')}>
              <span className="flex items-center gap-1.5">
                Ajouté
                <SortIcon direction={sortField === 'added_at' ? sortDir : null} />
              </span>
            </th>
            <th className="px-4 py-2.5 w-20"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((product, idx) => (
            <tr
              key={product.id}
              className="border-b border-border/50 hover:bg-bg-hover/50 transition-colors group"
            >
              {/* Index */}
              <td className="px-4 py-2.5 text-text-muted font-mono text-xs">{idx + 1}</td>

              {/* Set */}
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  {product.set_logo_url ? (
                    <img
                      src={product.set_logo_url}
                      alt={product.set_name}
                      className="h-6 w-auto max-w-[48px] object-contain opacity-90"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-8 h-6 bg-bg-tertiary rounded flex items-center justify-center text-xs text-text-muted">
                      {product.set_name?.charAt(0)}
                    </div>
                  )}
                  <span className="text-text-secondary text-xs truncate max-w-[100px]" title={product.set_name}>
                    {product.set_name}
                  </span>
                </div>
              </td>

              {/* Product name */}
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="h-8 w-auto object-contain rounded"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}
                  <span className="text-text-primary font-medium truncate max-w-[180px]" title={product.product_name}>
                    {product.product_name}
                  </span>
                </div>
              </td>

              {/* Type */}
              <td className="px-4 py-2.5">
                <span className="badge bg-bg-tertiary text-text-secondary border border-border">
                  {PRODUCT_TYPE_LABELS[product.product_type] || product.product_type}
                </span>
              </td>

              {/* Unit price */}
              <td className="px-4 py-2.5">
                <PriceCell product={product} onUpdate={onUpdatePrice} />
              </td>

              {/* Total */}
              <td className="px-4 py-2.5">
                <span className="font-mono text-sm text-text-primary">
                  {product.unit_price ? formatEur(product.unit_price * product.quantity) : '—'}
                </span>
              </td>

              {/* Quantity */}
              <td className="px-4 py-2.5">
                <QuantityControl
                  value={product.quantity}
                  onChange={(q) => onUpdateQuantity(product.id, q)}
                />
              </td>

              {/* Date */}
              <td className="px-4 py-2.5 text-text-muted text-xs font-mono">
                {formatDate(product.added_at)}
              </td>

              {/* Actions */}
              <td className="px-4 py-2.5">
                <button
                  onClick={() => onDelete(product.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-red-400 p-1 rounded hover:bg-red-400/10"
                  title="Supprimer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
