import { create } from 'zustand'
import { io } from 'socket.io-client'
import { getTodayKey } from '../utils/helpers'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

let socket = null
function getSocket() {
  if (!socket) socket = io(API_URL, { transports: ['websocket', 'polling'] })
  return socket
}

async function apiFetch(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error('API ' + res.status)
  return res.json()
}

function computeDayStats(day, settings) {
  if (!day) day = { income: 0, expenses: [], manualSavings: 0, date: getTodayKey() }

  const plannedSavings = day.income * (settings.savingsRate / 100)
  const available = day.income - plannedSavings
  const totalExpenses = (day.expenses || []).reduce((s, e) => s + e.amount, 0)
  const manualSavings = day.manualSavings || 0

  // Surplus = what's left after expenses (can be negative if overspent)
  const rawSurplus = available - totalExpenses

  // If overspent, it eats into planned savings
  const overspent = Math.max(0, totalExpenses - available)
  const autoSavings = Math.max(0, plannedSavings - overspent)

  // Surplus that hasn't been manually saved yet
  const pendingSurplus = Math.max(0, rawSurplus - manualSavings)

  // Total real savings = auto savings + what user manually saved from surplus
  const totalDaySavings = autoSavings + manualSavings

  const remaining = rawSurplus - manualSavings  // what's still spendable
  const usedPercent = day.income > 0 ? Math.min((totalExpenses / day.income) * 100, 100) : 0

  let status = 'idle'
  if (day.income === 0) status = 'idle'
  else if (totalExpenses >= day.income) status = 'blocked'
  else if (totalExpenses > available) status = 'danger'
  else if (usedPercent >= 60) status = 'warning'
  else status = 'safe'

  return {
    income: day.income,
    plannedSavings,
    autoSavings,
    manualSavings,
    totalDaySavings,
    available,
    totalExpenses,
    remaining: Math.max(0, remaining),
    rawSurplus,
    pendingSurplus,
    overspent,
    usedPercent,
    status,
    expenses: day.expenses || [],
    date: day.date,
    // savingsAmount kept for compatibility with SavingsCard
    savingsAmount: totalDaySavings,
  }
}

export const useStore = create((set, get) => ({
  settings: { savingsRate: 20, savingsGoal: 300, currency: 'S/' },
  days: {},
  darkMode: true,
  activeTab: 'today',
  connected: false,
  loading: true,
  error: null,

  init: () => {
    const sock = getSocket()
    sock.on('connect', () => set({ connected: true, error: null }))
    sock.on('disconnect', () => set({ connected: false }))
    sock.on('connect_error', () => set({ connected: false, loading: false, error: 'Sin conexion al servidor' }))
    sock.on('state:sync', (state) => set({ settings: state.settings, days: state.days, loading: false, error: null }))
    const savedDark = localStorage.getItem('darkMode')
    if (savedDark !== null) set({ darkMode: savedDark === 'true' })
  },

  getDayStats: (dayKey) => computeDayStats(get().days[dayKey], get().settings),
  getTodayStats: () => computeDayStats(get().days[getTodayKey()], get().settings),

  getSavingsProgress: () => {
    const { days, settings } = get()
    const totalSaved = Object.values(days).reduce((sum, d) => {
      const planned = d.income * (settings.savingsRate / 100)
      const available = d.income - planned
      const totalExp = (d.expenses || []).reduce((a, e) => a + e.amount, 0)
      const overspent = Math.max(0, totalExp - available)
      const auto = Math.max(0, planned - overspent)
      const manual = d.manualSavings || 0
      return sum + auto + manual
    }, 0)
    const percent = settings.savingsGoal > 0 ? Math.min((totalSaved / settings.savingsGoal) * 100, 100) : 0
    return { totalSaved, goal: settings.savingsGoal, percent }
  },

  getWeeklyData: () => {
    const { days, settings } = get()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const key = d.toISOString().split('T')[0]
      const day = days[key]
      if (!day) return { day: d.toLocaleDateString('es-PE', { weekday: 'short' }), ingresos: 0, gastos: 0, ahorro: 0, key }
      const planned = day.income * (settings.savingsRate / 100)
      const available = day.income - planned
      const totalExp = (day.expenses || []).reduce((a, e) => a + e.amount, 0)
      const overspent = Math.max(0, totalExp - available)
      const auto = Math.max(0, planned - overspent)
      const manual = day.manualSavings || 0
      return {
        day: d.toLocaleDateString('es-PE', { weekday: 'short' }),
        ingresos: day.income,
        gastos: totalExp,
        ahorro: auto + manual,
        key,
      }
    })
  },

  setIncome: async (amount) => {
    try { await apiFetch('PUT', '/api/days/' + getTodayKey() + '/income', { income: amount }) }
    catch (e) { console.error(e) }
  },

  addExpense: async (amount, description) => {
    try {
      const time = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      await apiFetch('POST', '/api/days/' + getTodayKey() + '/expenses', {
        amount, description: (description || '').trim() || 'Gasto', time,
      })
    } catch (e) { console.error(e) }
  },

  deleteExpense: async (id) => {
    try { await apiFetch('DELETE', '/api/expenses/' + id) }
    catch (e) { console.error(e) }
  },

  // Save surplus amount to savings for today
  saveSurplus: async (amount) => {
    try { await apiFetch('POST', '/api/days/' + getTodayKey() + '/surplus', { amount }) }
    catch (e) { console.error(e) }
  },

  updateSettings: async (newSettings) => {
    try { await apiFetch('PUT', '/api/settings', Object.assign({}, get().settings, newSettings)) }
    catch (e) { console.error(e) }
  },

  resetToday: async () => {
    try { await apiFetch('DELETE', '/api/days/' + getTodayKey()) }
    catch (e) { console.error(e) }
  },

  resetAll: async () => {
    try { await apiFetch('DELETE', '/api/reset-all') }
    catch (e) { console.error(e) }
  },

  exportData: () => window.open(API_URL + '/api/export', '_blank'),

  toggleDarkMode: () => set((s) => {
    localStorage.setItem('darkMode', String(!s.darkMode))
    return { darkMode: !s.darkMode }
  }),

  setActiveTab: (tab) => set({ activeTab: tab }),
}))
