import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PiggyBank, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { parseAmount } from '../utils/helpers'

export default function SurplusCard({ stats, onSaveSurplus, currency = 'S/' }) {
  const { pendingSurplus, rawSurplus, manualSavings, income } = stats
  const [customAmount, setCustomAmount] = useState('')
  const [saved, setSaved] = useState(false)
  const [expanded, setExpanded] = useState(false)

  // Only show if there's a surplus and income was registered
  if (income === 0 || rawSurplus <= 0) return null

  const handleSave = async (amount) => {
    if (amount <= 0) return
    await onSaveSurplus(amount)
    setSaved(true)
    setCustomAmount('')
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCustomSave = () => {
    const parsed = parseAmount(customAmount)
    if (parsed > 0 && parsed <= pendingSurplus) handleSave(parsed)
  }

  // If everything is already saved
  if (pendingSurplus <= 0 && manualSavings > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-accent-blue/5 border border-accent-blue/20 px-4 py-3 flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-xl bg-accent-blue/15 flex items-center justify-center flex-shrink-0">
          <Check size={15} className="text-accent-blue" />
        </div>
        <div>
          <p className="text-sm font-display font-600 text-accent-blue">
            Sobrante ahorrado
          </p>
          <p className="text-xs text-paper-soft/40 font-mono">
            {currency} {manualSavings.toFixed(2)} guardados hoy extra
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-accent-green/5 border border-accent-green/20 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3.5"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent-green/15 flex items-center justify-center flex-shrink-0">
            <PiggyBank size={15} className="text-accent-green" />
          </div>
          <div className="text-left">
            <p className="text-sm font-display font-600 text-accent-green">
              Tienes sobrante hoy
            </p>
            <p className="text-xs text-paper-soft/40 font-body">
              <span className="font-mono font-600 text-accent-green">
                {currency} {pendingSurplus.toFixed(2)}
              </span>
              {' '}sin usar — ¿lo ahorras?
            </p>
          </div>
        </div>
        {expanded
          ? <ChevronUp size={16} className="text-paper-soft/30" />
          : <ChevronDown size={16} className="text-paper-soft/30" />
        }
      </button>

      {/* Expanded options */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-accent-green/10 pt-3">

              {/* Save all button */}
              <motion.button
                onClick={() => handleSave(pendingSurplus)}
                className={`w-full py-3 rounded-xl font-display font-700 text-sm flex items-center justify-center gap-2 transition-colors ${
                  saved
                    ? 'bg-accent-blue text-paper-DEFAULT'
                    : 'bg-accent-green text-ink'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                {saved ? <Check size={15} /> : <PiggyBank size={15} />}
                {saved
                  ? '¡Guardado!'
                  : `Ahorrar todo — ${currency} ${pendingSurplus.toFixed(2)}`
                }
              </motion.button>

              {/* Save custom amount */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-paper-soft/30 text-sm">
                    {currency}
                  </span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    placeholder={`0 — ${pendingSurplus.toFixed(2)} máx`}
                    className="w-full bg-ink-muted border border-white/8 rounded-xl pl-9 pr-3 py-2.5 font-mono text-sm text-paper-DEFAULT placeholder-paper-soft/20 focus:outline-none focus:border-accent-green/30 transition-colors"
                    inputMode="decimal"
                  />
                </div>
                <motion.button
                  onClick={handleCustomSave}
                  disabled={!parseAmount(customAmount) || parseAmount(customAmount) > pendingSurplus}
                  className={`px-4 rounded-xl font-display font-700 text-sm transition-colors ${
                    parseAmount(customAmount) > 0 && parseAmount(customAmount) <= pendingSurplus
                      ? 'bg-accent-green/20 text-accent-green border border-accent-green/30'
                      : 'bg-ink-muted text-paper-soft/20 cursor-not-allowed'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  Ahorrar
                </motion.button>
              </div>

              <p className="text-xs text-paper-soft/25 font-body text-center">
                El resto queda disponible para gastar
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
