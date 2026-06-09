import React, { useState, useEffect, useCallback, useRef } from 'react'

const ipc = window.electron

const PRODUCT_TYPES = [
  { key: 'display', label: 'Display (Booster Box)' },
  { key: 'etb', label: 'Elite Trainer Box (ETB)' },
  { key: 'blister', label: 'Blister Pack' },
  { key: 'tin', label: 'Tin' },
  { key: 'coffret', label: 'Coffret / Collection Box' },
  { key: 'bundle', label: 'Bundle' },
]

function buildProductName(setName, typeKey) {
  const labels = {
    display: 'Display',
    etb: 'Elite Trainer Box',
    blister: 'Blister',
    tin: 'Tin',
    coffret: 'Coffret',
    bundle: 'Bundle',
  }
  return `${setName} — ${labels[typeKey] || typeKey}`
}

function StepIndicator({ step }) {
  const steps = ['Set', 'Type', 'Prix']
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`flex items-center gap-1.5 ${i + 1 <= step ? 'text-accent' : 'text-text-muted'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold border
              ${i + 1 < step ? 'bg-accent border-accent text-white' :
                i + 1 === step ? 'border-accent text-accent bg-accent/10' :
                'border-border text-text-muted'}`}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <span className="text-xs font-medium">{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px ${i + 1 < step ? 'bg-accent/50' : 'bg-border'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// Virtual-scroll-friendly set search
function SetSelector({ sets, selected, onSelect, offline }) {
  const [search, setSearch] = useState('')

  const filtered = sets.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-3">
      {offline && (
        <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          Catalogue hors ligne — données en cache
        </div>
      )}
      <input
        type="text"
        placeholder="Rechercher un set..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input-base"
        autoFocus
      />
      <div className="overflow-y-auto max-h-64 flex flex-col gap-1 pr-1">
        {filtered.length === 0 && (
          <p className="text-text-muted text-sm text-center py-8">Aucun set trouvé</p>
        )}
        {filtered.map((set) => (
          <button
            key={set.id}
            onClick={() => onSelect(set)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left border
              ${selected?.id === set.id
                ? 'bg-accent/10 border-accent/40 text-text-primary'
                : 'bg-bg-tertiary border-border hover:bg-bg-hover hover:border-border-light text-text-secondary'}`}
          >
            {set.logoUrl ? (
              <img
                src={set.logoUrl}
                alt={set.name}
                className="h-7 w-auto max-w-[56px] object-contain opacity-90 shrink-0"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            ) : (
              <div className="w-10 h-7 bg-bg-secondary rounded flex items-center justify-center text-xs text-text-muted shrink-0">
                {set.name?.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{set.name}</p>
              <p className="text-xs text-text-muted">{set.releaseDate || '—'} · {set.cardCount} cartes</p>
            </div>
            {selected?.id === set.id && (
              <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function TypeSelector({ selectedType, onSelect, setDetail }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PRODUCT_TYPES.map((type) => (
        <button
          key={type.key}
          onClick={() => onSelect(type)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left
            ${selectedType?.key === type.key
              ? 'bg-accent/10 border-accent/40 text-text-primary'
              : 'bg-bg-tertiary border-border hover:bg-bg-hover text-text-secondary'}`}
        >
          <span className="text-lg">{
            { display: '📦', etb: '🎁', blister: '🫧', tin: '🥫', coffret: '📫', bundle: '🎀' }[type.key]
          }</span>
          <span className="text-sm font-medium">{type.label}</span>
        </button>
      ))}
    </div>
  )
}

export function AddProductModal({ onClose, onAdd, toast }) {
  const [step, setStep] = useState(1)
  const [sets, setSets] = useState([])
  const [setsLoading, setSetsLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [selectedSet, setSelectedSet] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    ipc.fetchSets().then((result) => {
      setSets(result.data || [])
      setOffline(result.offline || false)
      setSetsLoading(false)
    })
  }, [])

  const handleSelectSet = (set) => {
    setSelectedSet(set)
  }

  const handleSelectType = (type) => {
    setSelectedType(type)
  }

  const handleNext = () => setStep((s) => s + 1)
  const handleBack = () => setStep((s) => s - 1)

  const handleSubmit = async () => {
    if (!selectedSet || !selectedType) return
    setSubmitting(true)
    try {
      const parsedPrice = parseFloat(price.replace(',', '.')) || 0
      const product = {
        set_id: selectedSet.id,
        set_name: selectedSet.name,
        set_logo_url: selectedSet.logoUrl || null,
        product_type: selectedType.key,
        product_name: buildProductName(selectedSet.name, selectedType.key),
        image_url: selectedSet.logoUrl || null,
        unit_price: parsedPrice,
        price_manual: 1,
        quantity,
      }
      await onAdd(product)
      toast('Produit ajouté avec succès', 'success')
      onClose()
    } catch (err) {
      toast('Erreur lors de l\'ajout du produit', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-50 bg-bg-card border border-border rounded-2xl shadow-card w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-text-primary font-semibold text-base">Ajouter un produit</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1 overflow-y-auto">
          <StepIndicator step={step} />

          {/* Step 1: Set */}
          {step === 1 && (
            <div>
              <h3 className="text-text-primary font-medium mb-3">Sélectionner un set</h3>
              {setsLoading ? (
                <div className="flex items-center justify-center h-40 gap-3 text-text-muted">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Chargement du catalogue...
                </div>
              ) : (
                <SetSelector
                  sets={sets}
                  selected={selectedSet}
                  onSelect={handleSelectSet}
                  offline={offline}
                />
              )}
            </div>
          )}

          {/* Step 2: Type */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                {selectedSet?.logoUrl && (
                  <img src={selectedSet.logoUrl} alt={selectedSet.name} className="h-6 w-auto object-contain" onError={(e) => e.target.style.display='none'} />
                )}
                <span className="text-text-secondary text-sm">{selectedSet?.name}</span>
              </div>
              <h3 className="text-text-primary font-medium mb-3">Type de produit</h3>
              <TypeSelector
                selectedType={selectedType}
                onSelect={handleSelectType}
              />
            </div>
          )}

          {/* Step 3: Price + Qty */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              {/* Summary */}
              <div className="bg-bg-tertiary border border-border rounded-xl p-4 flex items-center gap-3">
                {selectedSet?.logoUrl && (
                  <img src={selectedSet.logoUrl} alt={selectedSet.name} className="h-8 w-auto object-contain" onError={(e) => e.target.style.display='none'} />
                )}
                <div>
                  <p className="text-text-primary text-sm font-medium">{buildProductName(selectedSet?.name, selectedType?.key)}</p>
                  <p className="text-text-muted text-xs">{selectedSet?.name} · {selectedType?.label}</p>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-1.5 uppercase tracking-wider">
                  Prix unitaire (€)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ex. 149,99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input-base pr-8"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">€</span>
                </div>
                <p className="text-text-muted text-xs mt-1">Laissez vide pour renseigner plus tard</p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-1.5 uppercase tracking-wider">
                  Quantité
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-lg bg-bg-tertiary border border-border hover:bg-bg-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors text-lg"
                  >−</button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input-base text-center w-20 font-mono"
                  />
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-lg bg-bg-tertiary border border-border hover:bg-bg-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors text-lg"
                  >+</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0 gap-3">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="btn-ghost"
          >
            {step === 1 ? 'Annuler' : '← Retour'}
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && !selectedSet) ||
                (step === 2 && !selectedType)
              }
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Ajout en cours...
                </>
              ) : '✓ Ajouter à la collection'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
