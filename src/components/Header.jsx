import React from 'react'

export function Header({ onAddProduct }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-secondary shrink-0">
      {/* Logo / title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pokemon.red to-pokemon.yellow flex items-center justify-center border border-accent/20 shadow-accent-sm">
          {/* Pokéball SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" fill="#fff" stroke="#000" strokeWidth="0.8" />
            <path d="M3 12h18" stroke="#000" strokeWidth="1" />
            <circle cx="12" cy="12" r="3" fill="#fff" stroke="#000" strokeWidth="0.8" />
            <path d="M12 3a9 9 0 019 9" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
          className="btn-primary px-4 py-2 rounded-full flex items-center gap-2"
          aria-label="Ajouter un produit"
        >
          <span className="text-lg">🎴</span>
          <span>Ajouter un produit</span>
        </button>
      </div>
    </header>
  )
}
