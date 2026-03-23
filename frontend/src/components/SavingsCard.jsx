import { motion } from 'framer-motion'
import { Target, TrendingUp, Calendar } from 'lucide-react'

// Converts days into a human-readable string
function formatTimeToGoal(days) {
  if (days <= 0) return '¡Meta alcanzada! 🎉'
  if (days === 1) return '1 día'
  if (days < 7) return `${days} días`
  if (days < 30) {
    const weeks = Math.ceil(days / 7)
    return weeks === 1 ? '1 semana' : `${weeks} semanas`
  }
  if (days < 365) {
    const months = Math.ceil(days / 30)
    return months === 1 ? '1 mes' : `${months} meses`
  }
  const years = (days / 365).toFixed(1)
  return `${years} años`
}

export default function SavingsCard({ stats, progress, currency = 'S/' }) {
  const { savingsAmount, income } = stats
  const { totalSaved, goal, percent } = progress

  const remaining = Math.max(0, goal - totalSaved)

  // Use today's savings as daily rate — if 0 show N/A
  const dailyRate = savingsAmount > 0 ? savingsAmount : null
  const daysToGoal = dailyRate ? Math.ceil(remaining / dailyRate) : null
  const timeLabel  = daysToGoal !== null ? formatTimeToGoal(daysToGoal) : null

  // Extra context strings
  const weeksToGoal  = daysToGoal ? Math.ceil(daysToGoal / 7) : null
  const monthsToGoal = daysToGoal ? (daysToGoal / 30).toFixed(1) : null

  const goalReached = totalSaved >= goal

  return (
    <div className="rounded-2xl bg-ink-soft p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-accent-blue" />
          <span className="font-display font-600 text-xs uppercase tracking-widest text-paper-soft/50">
            Objetivo de ahorro
          </span>
        </div>
        {goalReached && (
          <span className="text-xs font-display font-700 text-accent-green bg-accent-green/10 px-2.5 py-1 rounded-full">
            ¡Meta lograda! 🎉
          </span>
        )}
      </div>

      {/* Circle + numbers */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#2a2a2a" strokeWidth="5" />
            <motion.circle
              cx="32" cy="32" r="26"
              fill="none"
              stroke={goalReached ? '#00c896' : '#0066ff'}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 26}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 26) * (1 - percent / 100) }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-mono font-700 text-sm ${goalReached ? 'text-accent-green' : 'text-paper-DEFAULT'}`}>
              {percent.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-paper-soft/40 text-xs mb-0.5">Ahorrado</p>
          <p className="amount-display font-700 text-xl text-paper-DEFAULT">
            {currency} {totalSaved.toFixed(2)}
          </p>
          <p className="text-paper-soft/30 text-xs mt-0.5">
            Meta: {currency} {goal.toFixed(2)}
            {!goalReached && (
              <span className="text-paper-soft/20 ml-1">
                (faltan {currency} {remaining.toFixed(2)})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-ink-muted rounded-full overflow-hidden mb-4">
        <motion.div
          className={`h-full rounded-full ${goalReached ? 'bg-accent-green' : 'bg-accent-blue'}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Time estimate — the new feature */}
      {!goalReached && timeLabel && (
        <div className="bg-accent-blue/5 border border-accent-blue/15 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={13} className="text-accent-blue flex-shrink-0" />
            <p className="text-xs font-display font-600 text-accent-blue uppercase tracking-wider">
              Estimado para llegar a tu meta
            </p>
          </div>
          <p className="font-display font-800 text-2xl text-paper-DEFAULT tracking-tight">
            {timeLabel}
          </p>
          <p className="text-paper-soft/30 text-xs font-mono mt-1">
            ≈ {daysToGoal} días · {weeksToGoal} semanas · {monthsToGoal} meses
          </p>
          <p className="text-paper-soft/20 text-xs font-body mt-1.5">
            Basado en {currency} {savingsAmount.toFixed(2)} de ahorro diario
          </p>
        </div>
      )}

      {/* Today's auto savings */}
      {income > 0 && (
        <div className="flex items-center gap-2 bg-accent-blue/5 border border-accent-blue/15 rounded-xl px-3 py-2.5">
          <TrendingUp size={13} className="text-accent-blue flex-shrink-0" />
          <p className="text-xs text-paper-soft/60">
            Hoy ahorras{' '}
            <span className="font-mono font-600 text-accent-blue">
              {currency} {savingsAmount.toFixed(2)}
            </span>
            {' '}automáticamente
          </p>
        </div>
      )}
    </div>
  )
}
