const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const {
  initDb, getSettings, updateSettings, getFullState,
  setIncome, addExpense, deleteExpense, saveSurplus, resetDay
} = require('./db')

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001

function broadcastState() {
  io.emit('state:sync', getFullState())
}

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.get('/api/state', (req, res) => res.json(getFullState()))
app.get('/api/settings', (req, res) => res.json(getSettings()))

app.put('/api/settings', (req, res) => {
  try { const s = updateSettings(req.body); broadcastState(); res.json(s) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/days/:date/income', (req, res) => {
  try { const d = setIncome(req.params.date, req.body.income); broadcastState(); res.json(d) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

app.post('/api/days/:date/expenses', (req, res) => {
  try {
    const { amount, description, time } = req.body
    const expense = addExpense(req.params.date, amount, description, time)
    broadcastState(); res.json(expense)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/expenses/:id', (req, res) => {
  try { deleteExpense(Number(req.params.id)); broadcastState(); res.json({ ok: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

// Save surplus to savings
app.post('/api/days/:date/surplus', (req, res) => {
  try {
    const result = saveSurplus(req.params.date, req.body.amount)
    broadcastState(); res.json(result)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/days/:date', (req, res) => {
  try { resetDay(req.params.date); broadcastState(); res.json({ ok: true }) }
  catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/export', (req, res) => {
  const state = getFullState()
  res.setHeader('Content-Disposition', `attachment; filename="gastos-${new Date().toISOString().split('T')[0]}.json"`)
  res.json({ ...state, exportedAt: new Date().toISOString() })
})

io.on('connection', (socket) => {
  console.log(`📱 Conectado: ${socket.id}`)
  socket.emit('state:sync', getFullState())
  socket.on('disconnect', () => console.log(`📴 Desconectado: ${socket.id}`))
})

initDb().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Backend en http://localhost:${PORT}`)
    console.log(`📡 Celular: usa http://TU_IP_LOCAL:${PORT}`)
    console.log(`✅ Health: http://localhost:${PORT}/api/health\n`)
  })
})
