const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  // Sets
  fetchSets: () => ipcRenderer.invoke('fetch-sets'),
  fetchSetDetail: (setId) => ipcRenderer.invoke('fetch-set-detail', setId),

  // Collection CRUD
  getCollection: () => ipcRenderer.invoke('get-collection'),
  addProduct: (product) => ipcRenderer.invoke('add-product', product),
  updateQuantity: (id, quantity) => ipcRenderer.invoke('update-quantity', { id, quantity }),
  updatePrice: (id, price, manual) => ipcRenderer.invoke('update-price', { id, price, manual }),
  updateProduct: (id, fields) => ipcRenderer.invoke('update-product', { id, ...fields }),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
})
