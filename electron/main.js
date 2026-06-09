const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const axios = require('axios')

// ─── DB Setup ───────────────────────────────────────────────────────────────
let db

function initDB() {
  const Database = require('better-sqlite3')
  const dbPath = path.join(app.getPath('userData'), 'collection.db')
  db = new Database(dbPath)

  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      set_id TEXT NOT NULL,
      set_name TEXT NOT NULL,
      set_logo_url TEXT,
      product_type TEXT NOT NULL,
      product_name TEXT NOT NULL,
      image_url TEXT,
      unit_price REAL DEFAULT 0,
      price_manual INTEGER DEFAULT 1,
      quantity INTEGER DEFAULT 1,
      added_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sets_cache (
      id TEXT PRIMARY KEY,
      name TEXT,
      release_date TEXT,
      logo_url TEXT,
      card_count INTEGER,
      fetched_at TEXT DEFAULT (datetime('now'))
    );
  `)

  // Schema versioning
  const versionRow = db.prepare('SELECT version FROM schema_version').get()
  if (!versionRow) {
    db.prepare('INSERT INTO schema_version (version) VALUES (1)').run()
  }
}

// ─── Window ─────────────────────────────────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: '#0d0d0f',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  initDB()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ─── TCGdex Helpers ──────────────────────────────────────────────────────────
const TCGDEX_BASE = 'https://api.tcgdex.net/v2/fr'

async function fetchTCGdex(endpoint) {
  const res = await axios.get(`${TCGDEX_BASE}${endpoint}`, { timeout: 10000 })
  return res.data
}

// ─── IPC: Sets ───────────────────────────────────────────────────────────────
ipcMain.handle('fetch-sets', async () => {
  try {
    const sets = await fetchTCGdex('/sets')
    // Cache in DB
    const upsert = db.prepare(`
      INSERT OR REPLACE INTO sets_cache (id, name, release_date, logo_url, card_count, fetched_at)
      VALUES (@id, @name, @releaseDate, @logoUrl, @cardCount, datetime('now'))
    `)
    const upsertMany = db.transaction((rows) => {
      for (const s of rows) upsert.run(s)
    })

    const mapped = sets.map((s) => ({
      id: s.id,
      name: s.name,
      releaseDate: s.releaseDate || '',
      logoUrl: s.logo ? `${s.logo}.png` : null,
      cardCount: s.cardCount?.total || s.cardCount || 0,
    }))

    upsertMany(mapped)
    return { success: true, data: mapped }
  } catch (err) {
    // Fallback: return cached sets
    const cached = db.prepare('SELECT * FROM sets_cache ORDER BY release_date DESC').all()
    return {
      success: false,
      offline: true,
      data: cached.map((s) => ({
        id: s.id,
        name: s.name,
        releaseDate: s.release_date,
        logoUrl: s.logo_url,
        cardCount: s.card_count,
      })),
      error: err.message,
    }
  }
})

ipcMain.handle('fetch-set-detail', async (_, setId) => {
  try {
    const detail = await fetchTCGdex(`/sets/${setId}`)
    return { success: true, data: detail }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

// ─── IPC: Collection CRUD ────────────────────────────────────────────────────
ipcMain.handle('get-collection', () => {
  const rows = db.prepare(`
    SELECT * FROM products ORDER BY added_at DESC
  `).all()
  return rows
})

ipcMain.handle('add-product', (_, product) => {
  const stmt = db.prepare(`
    INSERT INTO products
      (set_id, set_name, set_logo_url, product_type, product_name, image_url, unit_price, price_manual, quantity)
    VALUES
      (@set_id, @set_name, @set_logo_url, @product_type, @product_name, @image_url, @unit_price, @price_manual, @quantity)
  `)
  const result = stmt.run(product)
  return db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)
})

ipcMain.handle('update-quantity', (_, { id, quantity }) => {
  db.prepare(`
    UPDATE products SET quantity = ?, updated_at = datetime('now') WHERE id = ?
  `).run(quantity, id)
  return { success: true }
})

ipcMain.handle('update-price', (_, { id, price, manual }) => {
  db.prepare(`
    UPDATE products SET unit_price = ?, price_manual = ?, updated_at = datetime('now') WHERE id = ?
  `).run(price, manual ? 1 : 0, id)
  return { success: true }
})

ipcMain.handle('delete-product', (_, id) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(id)
  return { success: true }
})

ipcMain.handle('update-product', (_, { id, ...fields }) => {
  const allowed = ['set_id', 'set_name', 'set_logo_url', 'product_type', 'product_name', 'image_url', 'unit_price', 'price_manual', 'quantity']
  const updates = Object.keys(fields)
    .filter((k) => allowed.includes(k))
    .map((k) => `${k} = @${k}`)
    .join(', ')
  if (!updates) return { success: false }
  db.prepare(`UPDATE products SET ${updates}, updated_at = datetime('now') WHERE id = @id`).run({ ...fields, id })
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id)
})
