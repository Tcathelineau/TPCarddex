import React from 'react'

export function Header({ onAddProduct }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-secondary shrink-0">
      {/* Logo / title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
          <span className="text-base">⚡</span>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-text-primary leading-none">Pokémon Collection</h1>
          <p className="text-xs text-text-muted mt-0.5">Gestionnaire de scellé</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAddProduct}
          className="btn-primary"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un produit
        </button>
      </div>
    </header>
  )
}
