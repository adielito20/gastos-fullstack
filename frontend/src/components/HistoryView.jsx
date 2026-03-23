import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatDateShort, getStatusConfig } from '../utils/helpers'

function DayRow({ dayKey, stats, currency }) {
  const [open, setOpen] = useState(false)
  const config = getStatusConfig(stats.status)

  return (
    <motion.div
      layout
      className="bg-ink-soft rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${config.bar}`} />
          <div className="text-left">
            <p className="font-display font-600 text-sm text-paper-DEFAULT capitalize">
              {formatDateShort(dayKey)}
            </p>
            <p className="text-paper-soft/30 text-xs font-mono">{dayKey}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-mono font-600 text-sm text-paper-DEFAULT">
              {currency} {stats.income.toFixed(0)}
            </p>
            <p className={`font-mono text-xs ${stats.totalExpenses > stats.available ? 'text-accent-red' : 'text-paper-soft/30'}`}>
              − {currency} {stats.totalExpenses.toFixed(0)}
            </p>
          </div>
          {open ? <ChevronUp size={14} className="text-paper-soft/30" /> : <ChevronDown size={14} className="text-paper-soft/30" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-ink-muted/50 rounded-xl p-2.5 text-center">
                  <p className="text-paper-soft/30 text-xs">Ingreso</p>
                  <p className="font-mono font-600 text-xs text-accent-green mt-0.5">
                    {currency} {stats.income.toFixed(2)}
                  </p>
                </div>
                <div className="bg-ink-muted/50 rounded-xl p-2.5 text-center">
                  <p className="text-paper-soft/30 text-xs">Gasto</p>
                  <p className="font-mono font-600 text-xs text-accent-red mt-0.5">
                    {currency} {stats.totalExpenses.toFixed(2)}
                  </p>
                </div>
                <div className="bg-ink-muted/50 rounded-xl p-2.5 text-center">
                  <p className="text-paper-soft/30 text-xs">Ahorro</p>
                  <p className="font-mono font-600 text-xs text-accent-blue mt-0.5">
                    {currency} {stats.savingsAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              {stats.expenses.map(e => (
                <div key={e.id} className="flex justify-between items-center text-xs py-1">
                  <span className="text-paper-soft/40 font-body">{e.description}</span>
                  <span className="font-mono text-accent-red/70">− {currency} {e.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function HistoryView({ days, getDayStats, currency }) {
  const sortedDays = Object.keys(days)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 30)

  if (sortedDays.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-paper-soft/20 text-sm font-body">Sin historial aún</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="font-display font-600 text-xs uppercase tracking-widest text-paper-soft/30 mb-4">
        Últimos {sortedDays.length} días
      </p>
      <AnimatePresence>
        {sortedDays.map(key => (
          <DayRow
            key={key}
            dayKey={key}
            stats={getDayStats(key)}
            currency={currency}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
