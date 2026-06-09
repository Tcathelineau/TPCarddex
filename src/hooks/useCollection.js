import { useState, useEffect, useCallback } from 'react'

const ipc = window.electron

export function useCollection() {
  const [collection, setCollection] = useState([])
  const [loading, setLoading] = useState(true)

  const loadCollection = useCallback(async () => {
    const rows = await ipc.getCollection()
    setCollection(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadCollection()
  }, [loadCollection])

  // Summary stats
  const stats = {
    uniqueLines: collection.length,
    totalItems: collection.reduce((acc, p) => acc + p.quantity, 0),
    totalValue: collection.reduce((acc, p) => acc + p.unit_price * p.quantity, 0),
  }

  const addProduct = useCallback(async (product) => {
    const newRow = await ipc.addProduct(product)
    setCollection((prev) => [newRow, ...prev])
    return newRow
  }, [])

  const updateQuantity = useCallback(async (id, quantity) => {
    await ipc.updateQuantity(id, quantity)
    setCollection((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity, updated_at: new Date().toISOString() } : p))
    )
  }, [])

  const updatePrice = useCallback(async (id, price, manual = true) => {
    await ipc.updatePrice(id, price, manual)
    setCollection((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, unit_price: price, price_manual: manual ? 1 : 0, updated_at: new Date().toISOString() } : p
      )
    )
  }, [])

  const deleteProduct = useCallback(async (id) => {
    await ipc.deleteProduct(id)
    setCollection((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const updateProduct = useCallback(async (id, fields) => {
    const updated = await ipc.updateProduct(id, fields)
    setCollection((prev) => prev.map((p) => (p.id === id ? updated : p)))
    return updated
  }, [])

  return {
    collection,
    loading,
    stats,
    addProduct,
    updateQuantity,
    updatePrice,
    deleteProduct,
    updateProduct,
    reload: loadCollection,
  }
}
