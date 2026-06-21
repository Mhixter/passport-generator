import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'data.json')

const DEFAULTS = {
  users: [],
  transactions: [],
  downloads: [],
}

export function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULTS, null, 2))
    return { ...DEFAULTS }
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
  } catch {
    return { ...DEFAULTS }
  }
}

export function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

export function findUser(email) {
  const db = readDB()
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

export function createUser(userData) {
  const db = readDB()
  const user = {
    id: `u_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    email: userData.email.toLowerCase(),
    password: userData.password,
    units: 1,
    is_admin: false,
    created_at: new Date().toISOString(),
  }
  db.users.push(user)
  writeDB(db)
  return user
}

export function updateUserUnits(userId, delta) {
  const db = readDB()
  const user = db.users.find(u => u.id === userId)
  if (user) {
    user.units = Math.max(0, (user.units || 0) + delta)
    writeDB(db)
    return user.units
  }
  return 0
}

export function addTransaction(tx) {
  const db = readDB()
  db.transactions.push({
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    ...tx,
    created_at: new Date().toISOString(),
  })
  writeDB(db)
}

export function addDownload(record) {
  const db = readDB()
  db.downloads.push({
    id: `dl_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    ...record,
    created_at: new Date().toISOString(),
  })
  writeDB(db)
}

export function getAdminStats() {
  const db = readDB()
  return {
    users: db.users.map(u => ({ ...u, password: undefined })),
    transactions: db.transactions,
    downloads: db.downloads,
  }
}
