import React, { useState, useRef, useEffect } from 'react'

export function PriceCell({ product, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  const formatEur = (v) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v || 0)

  const startEdit = () => {
    setValue(product.unit_price?.toString() || '0')
    setEditing(true)
  }

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  const commit = () => {
    const parsed = parseFloat(value.replace(',', '.'))
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdate(product.id, parsed, true)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') setEditing(false)
          }}
          className="w-24 bg-bg-tertiary border border-accent text-text-primary rounded px-2 py-0.5 text-sm focus:outline-none font-mono"
        />
        <span className="text-text-muted text-xs">€</span>
      </div>
    )
  }

  return (
    <button
      onClick={startEdit}
      className="group flex items-center gap-1.5 text-left hover:text-text-primary transition-colors"
      title="Cliquer pour modifier le prix"
    >
      <span className={`font-mono text-sm ${product.unit_price ? 'text-text-primary' : 'text-text-muted italic'}`}>
        {product.unit_price ? formatEur(product.unit_price) : '—'}
      </span>
      {product.price_manual === 1 && product.unit_price > 0 && (
        <span className="badge bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px]">
          manuel
        </span>
      )}
      <svg
        className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </button>
  )
}
