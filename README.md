# Pokémon Collection — Gestionnaire de scellé

Application desktop Electron + React pour gérer votre collection de produits Pokémon scellés (displays, ETB, blisters, etc.). Entièrement offline pour la gestion, avec récupération du catalogue via TCGdex.

## Prérequis

- **Node.js** ≥ 18.x (LTS recommandé)
- **npm** ≥ 9.x

## Installation

```bash
# Cloner le repo ou extraire l'archive
cd pokemon-collection

# Installer les dépendances
npm install
```

> `better-sqlite3` compile un module natif. Sur certains systèmes vous aurez besoin de `node-gyp` et des build tools :
> - **Windows** : `npm install --global windows-build-tools`
> - **macOS** : `xcode-select --install`
> - **Linux** : `sudo apt install build-essential python3`

## Lancement en développement

```bash
npm run dev
```

Cela lance Vite (port 5173) et Electron simultanément.

## Build de production

```bash
npm run build
```

L'exécutable sera dans `dist-electron/`.

## Architecture

```
pokemon-collection/
├── electron/
│   ├── main.js        # Processus principal : IPC, SQLite, TCGdex API
│   └── preload.js     # contextBridge (exposition sécurisée de l'API)
├── src/
│   ├── App.jsx        # Layout principal
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── SummaryBar.jsx
│   │   ├── CollectionTable.jsx
│   │   ├── AddProductModal.jsx
│   │   ├── PriceCell.jsx
│   │   └── Toast.jsx
│   └── hooks/
│       ├── useCollection.js
│       └── useToast.js
└── package.json
```

## Fonctionnalités

- **Catalogue sets** : chargé depuis TCGdex (fr), mis en cache en SQLite pour le mode hors ligne
- **Ajout de produits** : sélection set → type → prix (manuel) en 3 étapes
- **Tableau de collection** : tri multi-colonnes, quantité +/−, prix modifiable inline
- **Barre de résumé** : références uniques, total articles, valeur estimée
- **Persistance** : SQLite local dans `AppData/Roaming/pokemon-collection/` (Windows) ou équivalent macOS/Linux

## Données

La base de données est stockée dans le dossier userData d'Electron :
- **Windows** : `%APPDATA%\pokemon-collection\collection.db`
- **macOS** : `~/Library/Application Support/pokemon-collection/collection.db`
- **Linux** : `~/.config/pokemon-collection/collection.db`
