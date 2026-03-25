const initSqlJs = require('sql.js')
const path = require('path')
const fs = require('fs')

const DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || path.join(__dirname, 'data')
const DB_PATH = path.join(DB_DIR, 'gastos.db')

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

let db = null

async function initDb() {
  const SQL = await initSqlJs()
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH))
  } else {
    db = new SQL.Database()
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      savings_rate REAL NOT NULL DEFAULT 20,
      savings_goal REAL NOT NULL DEFAULT 300,
      currency TEXT NOT NULL DEFAULT 'S/'
    );
    CREATE TABLE IF NOT EXISTS days (
      date TEXT PRIMARY KEY,
      income REAL NOT NULL DEFAULT 0,
      manual_savings REAL NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_date TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL DEFAULT 'Gasto',
      time TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );
    INSERT OR IGNORE INTO settings (id, savings_rate, savings_goal, currency) VALUES (1, 20, 300, 'S/');
  `)

  // Migration: add manual_savings column if it doesn't exist yet
  try {
    db.run(`ALTER TABLE days ADD COLUMN manual_savings REAL NOT NULL DEFAULT 0`)
  } catch(e) { /* column already exists, ignore */ }

  persist()
  console.log('✅ Base de datos lista en', DB_PATH)
  return db
}

function persist() {
  if (!db) return
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()))
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const rows = []
  while (stmt.step()) rows.push(stmt.getAsObject())
  stmt.free()
  return rows
}

function queryOne(sql, params = []) {
  return queryAll(sql, params)[0] || null
}

function run(sql, params = []) {
  db.run(sql, params)
  persist()
}

function getSettings() {
  const row = queryOne('SELECT * FROM settings WHERE id = 1')
  return { savingsRate: row.savings_rate, savingsGoal: row.savings_goal, currency: row.currency }
}

function updateSettings(s) {
  run('UPDATE settings SET savings_rate=?, savings_goal=?, currency=? WHERE id=1',
    [s.savingsRate, s.savingsGoal, s.currency || 'S/'])
  return getSettings()
}

function getFullState() {
  const settings = getSettings()
  const dayRows = queryAll('SELECT * FROM days ORDER BY date DESC LIMIT 90')
  const allExpenses = queryAll('SELECT * FROM expenses ORDER BY created_at ASC')
  const days = {}
  for (const day of dayRows) {
    days[day.date] = {
      income: day.income,
      manualSavings: day.manual_savings || 0,
      expenses: allExpenses
        .filter(e => e.day_date === day.date)
        .map(e => ({ id: e.id, amount: e.amount, description: e.description, time: e.time })),
      date: day.date,
    }
  }
  return { settings, days }
}

function setIncome(date, income) {
  run('INSERT INTO days (date,income,manual_savings) VALUES (?,?,0) ON CONFLICT(date) DO UPDATE SET income=?', [date, income, income])
  const day = queryOne('SELECT * FROM days WHERE date=?', [date])
  const expenses = queryAll('SELECT * FROM expenses WHERE day_date=? ORDER BY created_at ASC', [date])
    .map(e => ({ id: e.id, amount: e.amount, description: e.description, time: e.time }))
  return { income: day.income, manualSavings: day.manual_savings || 0, expenses, date }
}

function addExpense(date, amount, description, time) {
  run('INSERT OR IGNORE INTO days (date,income,manual_savings) VALUES (?,0,0)', [date])
  run('INSERT INTO expenses (day_date,amount,description,time) VALUES (?,?,?,?)',
    [date, amount, description || 'Gasto', time])
  const expense = queryOne('SELECT * FROM expenses WHERE day_date=? ORDER BY created_at DESC LIMIT 1', [date])
  return { id: expense.id, amount: expense.amount, description: expense.description, time: expense.time }
}

function deleteExpense(id) {
  run('DELETE FROM expenses WHERE id=?', [id])
}

// Save surplus manually — adds to manual_savings for that day
function saveSurplus(date, amount) {
  run('INSERT OR IGNORE INTO days (date,income,manual_savings) VALUES (?,0,0)', [date])
  run('UPDATE days SET manual_savings = manual_savings + ? WHERE date=?', [amount, date])
  const day = queryOne('SELECT * FROM days WHERE date=?', [date])
  return { manualSavings: day.manual_savings || 0 }
}

function resetDay(date) {
  run('DELETE FROM expenses WHERE day_date=?', [date])
  run('UPDATE days SET income=0, manual_savings=0 WHERE date=?', [date])
}

module.exports = {
  initDb, getSettings, updateSettings, getFullState,
  setIncome, addExpense, deleteExpense, saveSurplus, resetDay
}
