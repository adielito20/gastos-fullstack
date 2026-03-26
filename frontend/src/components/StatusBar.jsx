import { motion, AnimatePresence } from 'framer-motion'
import { getStatusConfig } from '../utils/helpers'

export default function StatusBar({ stats, currency = 'S/' }) {
  const {
    status, usedPercent, available,
    totalExpenses, income, savingsAmount, plannedSavings, overspent
  } = stats
  const config = getStatusConfig(status)

  const isBlocked = status === 'blocked'
  const isDanger = status === 'danger' || status === 'blocked'
  const eatingSavings = overspent > 0

  // What's really left to spend (negative when eating savings)
  const realRemaining = available - totalExpenses

  return (
    <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${isDanger ? 'glow-red' : status === 'warning' ? 'glow-yellow' : status === 'safe' ? 'glow-green' : ''
      }`}>
      <div className={`absolute inset-0 transition-colors duration-500 ${isBlocked ? 'bg-accent-red/8' : 'bg-ink-soft'}`} />

      <div className={`relative p-5 ${isBlocked ? 'blocked-state' : ''}`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              className={`w-2 h-2 rounded-full ${status === 'safe' ? 'bg-accent-green' :
                  status === 'warning' ? 'bg-accent-yellow' :
                    isDanger ? 'bg-accent-red' : 'bg-ink-muted'
                }`}
              animate={isDanger ? { scale: [1, 1.4, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <span className="font-display font-600 text-xs uppercase tracking-widest text-paper-soft/50">
              Estado del día
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={status}
              className={`text-xs font-display font-700 uppercase tracking-wider px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {config.label}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Main balance */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${realRemaining.toFixed(2)}-${status}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5"
          >
            {isBlocked ? (
              <div className="text-center py-2">
                <p className="font-display font-800 text-accent-red text-2xl tracking-tight">
                  NO deberías gastar más hoy
                </p>
                <p className="text-paper-soft/40 text-sm font-body mt-1 mb-2">
                  Gastaste todo tu ingreso del día
                </p>
                <p className="amount-display font-display font-800 text-4xl tracking-tight text-accent-red">
                  {realRemaining < 0 ? '− ' : ''}{currency} {Math.abs(realRemaining).toFixed(2)}
                </p>
              </div>
            ) : eatingSavings ? (
              /* EATING SAVINGS — show negative amount prominently */
              <div>
                <p className="text-accent-red/70 text-xs font-body mb-1">
                  Estás usando tu ahorro
                </p>
                <p className="amount-display font-display font-800 text-4xl tracking-tight text-accent-red">
                  − {currency} {overspent.toFixed(2)}
                </p>
                <p className="text-paper-soft/40 text-xs mt-1.5 font-body">
                  Te pasaste {currency} {overspent.toFixed(2)} del límite disponible
                </p>
              </div>
            ) : (
              <>
                <p className="text-paper-soft/40 text-xs font-body mb-1">Puedes gastar</p>
                <p className={`amount-display font-display font-700 text-4xl tracking-tight ${status === 'idle' ? 'text-paper-soft/30' : config.color
                  }`}>
                  {currency} {realRemaining.toFixed(2)}
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        {income > 0 && (
          <div className="mb-4">
            <div className="h-1.5 bg-ink-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${config.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${usedPercent}%` }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              />
            </div>
            {/* Marker at available limit */}
            <div className="relative mt-0.5 h-2">
              <div
                className="absolute w-px h-2 bg-paper-soft/25"
                style={{ left: `${Math.min((available / income) * 100, 99)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-paper-soft/30 font-mono">{currency} 0</span>
              <span className={`text-xs font-mono font-500 ${config.color}`}>
                {usedPercent.toFixed(0)}% del ingreso
              </span>
              <span className="text-xs text-paper-soft/30 font-mono">{currency} {income.toFixed(0)}</span>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-ink-muted/50 rounded-xl p-3">
            <p className="text-paper-soft/30 text-xs mb-0.5">Gastado</p>
            <p className="amount-display font-600 text-paper-soft text-sm">
              {currency} {totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="bg-ink-muted/50 rounded-xl p-3">
            <p className="text-paper-soft/30 text-xs mb-0.5">Límite Diario</p>
            <p className="amount-display font-600 text-paper-soft text-sm">
              {currency} {available.toFixed(2)}
            </p>
          </div>
          <div className={`rounded-xl p-3 transition-colors ${eatingSavings ? 'bg-accent-red/10' : 'bg-ink-muted/50'}`}>
            <p className="text-paper-soft/30 text-xs mb-0.5">
              Ahorro{eatingSavings ? ' 🔻' : ''}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={savingsAmount}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`amount-display font-600 text-sm ${eatingSavings ? 'text-accent-red' : 'text-accent-blue'}`}
              >
                {currency} {savingsAmount.toFixed(2)}
              </motion.p>
            </AnimatePresence>
            {eatingSavings && (
              <p className="text-accent-red/40 text-xs font-mono line-through">
                {currency} {plannedSavings.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
