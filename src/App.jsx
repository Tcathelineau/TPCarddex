import React, { useState } from 'react'
import { Header } from './components/Header.jsx'
import { SummaryBar } from './components/SummaryBar.jsx'
import { CollectionTable } from './components/CollectionTable.jsx'
import { AddProductModal } from './components/AddProductModal.jsx'
import { ToastContainer } from './components/Toast.jsx'
import { useCollection } from './hooks/useCollection.js'
import { useToast } from './hooks/useToast.js'

export default function App() {
  const [showAddModal, setShowAddModal] = useState(false)
  const { collection, loading, stats, addProduct, updateQuantity, updatePrice, deleteProduct } = useCollection()
  const { toasts, addToast, removeToast } = useToast()

  const handleDelete = async (id) => {
    await deleteProduct(id)
    addToast('Produit supprimé', 'info')
  }

  return (
    <div className="flex flex-col h-screen bg-bg-primary overflow-hidden">
      <Header onAddProduct={() => setShowAddModal(true)} />

      <main className="flex-1 flex flex-col overflow-hidden px-6 py-4 gap-4">
        {/* Summary */}
        <SummaryBar stats={stats} />

        {/* Collection section header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-text-primary font-semibold text-sm">Ma collection</h2>
            {collection.length > 0 && (
              <span className="badge bg-bg-tertiary text-text-muted border border-border text-xs">
                {collection.length}
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="card flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center h-full gap-3 text-text-muted">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Chargement...
            </div>
          ) : (
            <CollectionTable
              collection={collection}
              onUpdateQuantity={updateQuantity}
              onUpdatePrice={updatePrice}
              onDelete={handleDelete}
              onAddProduct={() => setShowAddModal(true)}
            />
          )}
        </div>
      </main>

      {/* Modal */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onAdd={addProduct}
          toast={addToast}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
