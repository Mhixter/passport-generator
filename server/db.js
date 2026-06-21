import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})
export async function initializeDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      units INTEGER DEFAULT 1,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      email TEXT,
      type TEXT,
      amount NUMERIC DEFAULT 0,
      units_added INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS downloads (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      email TEXT,
      units_spent INTEGER DEFAULT 1,
      type TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Database initialized");
}

export async function query(sql, params) {
  const client = await pool.connect()
  try {
    const result = await client.query(sql, params)
    return result
  } finally {
    client.release()
  }
}

export async function findUser(email) {
  const res = await query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [email]
  )
  return res.rows[0] || null
}

export async function findUserById(id) {
  const res = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id])
  return res.rows[0] || null
}

export async function createUser(userData) {
  const id = `u_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const res = await query(
    `INSERT INTO users (id, email, password, units, is_admin)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, userData.email.toLowerCase(), userData.password, 1, false]
  )
  return res.rows[0]
}

export async function updateUserUnits(userId, delta) {
  const res = await query(
    `UPDATE users
     SET units = GREATEST(0, units + $1)
     WHERE id = $2
     RETURNING units`,
    [delta, userId]
  )
  return res.rows[0]?.units ?? 0
}

export async function setUserUnits(userId, units) {
  const res = await query(
    `UPDATE users SET units = $1 WHERE id = $2 RETURNING units`,
    [Math.max(0, units), userId]
  )
  return res.rows[0]?.units ?? 0
}

export async function setUserAdmin(email, isAdmin) {
  const res = await query(
    `UPDATE users SET is_admin = $1 WHERE LOWER(email) = LOWER($2) RETURNING *`,
    [isAdmin, email]
  )
  return res.rows[0] || null
}

export async function addTransaction(tx) {
  const id = `tx_${Date.now()}_${Math.random().toString(36).slice(2)}`
  await query(
    `INSERT INTO transactions (id, user_id, email, type, amount, units_added, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id,
      tx.user_id,
      tx.email,
      tx.package_id || tx.type || 'unknown',
      tx.amount_naira || tx.amount || 0,
      tx.units || tx.units_added || 0,
      tx.status || 'pending',
    ]
  )
  return id
}

export async function updateTransactionStatus(reference, status) {
  await query(
    `UPDATE transactions SET status = $1 WHERE id = $2`,
    [status, reference]
  )
}

export async function findTransaction(reference) {
  const res = await query(
    `SELECT * FROM transactions WHERE id = $1 LIMIT 1`,
    [reference]
  )
  return res.rows[0] || null
}

export async function addDownload(record) {
  const id = `dl_${Date.now()}_${Math.random().toString(36).slice(2)}`
  await query(
    `INSERT INTO downloads (id, user_id, email, units_spent, type)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, record.user_id, record.email, record.units_spent || 1, record.type || null]
  )
}

export async function getAdminStats() {
  const [users, transactions, downloads] = await Promise.all([
    query('SELECT id, email, units, is_admin, created_at FROM users ORDER BY created_at DESC'),
    query('SELECT * FROM transactions ORDER BY created_at DESC'),
    query('SELECT * FROM downloads ORDER BY created_at DESC'),
  ])
  return {
    users: users.rows,
    transactions: transactions.rows,
    downloads: downloads.rows,
  }
}

export async function creditUserUnits(email, units) {
  const res = await query(
    `UPDATE users SET units = units + $1 WHERE LOWER(email) = LOWER($2) RETURNING *`,
    [units, email]
  )
  return res.rows[0] || null
}
