import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart2, Clock, Sliders, Home, Wifi, WifiOff, Loader } from 'lucide-react'

import { useStore } from './store/useStore'
import { formatDate, getTodayKey } from './utils/helpers'

import StatusBar from './components/StatusBar'
import QuickAction from './components/QuickAction'
import SavingsCard from './components/SavingsCard'
import ExpenseList from './components/ExpenseList'
import WeeklyChart from './components/WeeklyChart'
import HistoryView from './components/HistoryView'
import SettingsPanel from './components/SettingsPanel'
import BlockedOverlay from './components/BlockedOverlay'
import SurplusCard from './components/SurplusCard'

const NAV_ITEMS = [
  { id: 'today', icon: Home, label: 'Hoy' },
  { id: 'stats', icon: BarChart2, label: 'Semana' },
  { id: 'history', icon: Clock, label: 'Historial' },
  { id: 'settings', icon: Sliders, label: 'Ajustes' },
]

export default function App() {
  const {
    settings, days, darkMode, activeTab,
    connected, loading, error,
    init, setActiveTab, setIncome, addExpense, deleteExpense,
    updateSettings, toggleDarkMode, exportData, resetToday, saveSurplus,
    getTodayStats, getSavingsProgress, getWeeklyData, getDayStats,
  } = useStore()

  useEffect(() => { init() }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.content = darkMode ? '#0a0a0a' : '#f8f6f1'
  }, [darkMode])

  const stats = getTodayStats()
  const progress = getSavingsProgress()
  const weekData = getWeeklyData()
  const currency = settings.currency

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-ink gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Loader size={28} className="text-paper-soft/30" />
        </motion.div>
        <p className="text-paper-soft/30 text-sm font-body">Conectando al servidor...</p>
      </div>
    )
  }

  // Error / no connection
  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-ink gap-4 px-8 text-center">
        <WifiOff size={40} className="text-accent-red/40" />
        <p className="font-display font-700 text-paper-DEFAULT text-lg">Sin conexión</p>
        <p className="text-paper-soft/40 text-sm font-body">{error}</p>
        <p className="text-paper-soft/20 text-xs font-mono mt-2">
          Asegúrate que el backend está corriendo en localhost:3001
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-3 bg-paper-DEFAULT text-ink rounded-xl font-display font-700 text-sm"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className={`min-h-dvh flex flex-col ${darkMode ? 'bg-ink text-paper-DEFAULT' : 'bg-paper-DEFAULT text-ink'}`}>

      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4">
        <div>
          <h1 className="font-display font-800 text-xl tracking-tight">Gastos Diarios</h1>
          <p className="text-paper-soft/30 text-xs font-body capitalize mt-0.5">
            {formatDate(getTodayKey())}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection indicator */}
          <div className="flex items-center gap-1.5">
            {connected
              ? <Wifi size={13} className="text-accent-green" />
              : <WifiOff size={13} className="text-accent-red" />}
            <span className={`text-xs font-mono ${connected ? 'text-accent-green' : 'text-accent-red'}`}>
              {connected ? 'Sync' : 'Off'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-paper-soft/30 text-xs font-body mb-0.5">Ahorro</p>
            <p className="font-mono font-700 text-accent-blue text-base">{settings.savingsRate}%</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-4 pb-28">
        <AnimatePresence mode="wait">

          {activeTab === 'today' && (
            <motion.div key="today"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <BlockedOverlay show={stats.status === 'blocked'} overspent={stats.remaining} currency={currency} />
              <StatusBar stats={stats} currency={currency} />
              <QuickAction onAddIncome={setIncome} onAddExpense={addExpense} currentIncome={stats.income} currency={currency} />
              <SavingsCard stats={stats} progress={progress} currency={currency} />
              <SurplusCard stats={stats} onSaveSurplus={saveSurplus} currency={currency} />
              <div className={`rounded-2xl p-4 ${darkMode ? 'bg-ink-soft' : 'bg-paper-soft'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-600 text-xs uppercase tracking-widest text-paper-soft/40">
                    Gastos de hoy
                  </span>
                  {stats.expenses.length > 0 && (
                    <span className="font-mono text-xs text-paper-soft/30">
                      {stats.expenses.length} {stats.expenses.length === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </div>
                <ExpenseList expenses={stats.expenses} onDelete={deleteExpense} currency={currency} />
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div key="stats"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className={`rounded-2xl p-5 ${darkMode ? 'bg-ink-soft' : 'bg-paper-soft'}`}>
                <p className="font-display font-600 text-xs uppercase tracking-widest text-paper-soft/40 mb-4">Esta semana</p>
                <WeeklyChart data={weekData} currency={currency} />
                <div className="flex gap-4 mt-3 justify-center">
                  {[{color:'bg-accent-green',label:'Ingresos'},{color:'bg-accent-red',label:'Gastos'},{color:'bg-accent-blue',label:'Ahorro'}].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${l.color} opacity-70`} />
                      <span className="text-xs text-paper-soft/30 font-body">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Ingresos', value: weekData.reduce((s,d) => s+d.ingresos, 0), color: 'text-accent-green' },
                  { label: 'Gastos', value: weekData.reduce((s,d) => s+d.gastos, 0), color: 'text-accent-red' },
                  { label: 'Ahorro', value: weekData.reduce((s,d) => s+d.ahorro, 0), color: 'text-accent-blue' },
                ].map(item => (
                  <div key={item.label} className={`rounded-2xl p-3 ${darkMode ? 'bg-ink-soft' : 'bg-paper-soft'}`}>
                    <p className="text-paper-soft/30 text-xs font-body mb-1">{item.label}</p>
                    <p className={`font-mono font-700 text-sm ${item.color}`}>{currency} {item.value.toFixed(0)}</p>
                  </div>
                ))}
              </div>
              <SavingsCard stats={stats} progress={progress} currency={currency} />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div key="history"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
            >
              <HistoryView days={days} getDayStats={getDayStats} currency={currency} />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
            >
              <SettingsPanel
                settings={settings} darkMode={darkMode}
                onUpdate={updateSettings} onToggleDark={toggleDarkMode}
                onExport={exportData} onReset={resetToday} currency={currency}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <nav className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-ink/90' : 'bg-paper-DEFAULT/90'} backdrop-blur-xl border-t ${darkMode ? 'border-white/6' : 'border-black/6'}`}>
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const active = activeTab === id
            return (
              <motion.button key={id} onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-colors ${active ? (darkMode ? 'text-paper-DEFAULT' : 'text-ink') : 'text-paper-soft/30'}`}
                whileTap={{ scale: 0.9 }}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                  {active && (
                    <motion.div layoutId="nav-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-blue"
                    />
                  )}
                </div>
                <span className={`text-xs font-body ${active ? 'font-500' : 'font-400'}`}>{label}</span>
              </motion.button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
