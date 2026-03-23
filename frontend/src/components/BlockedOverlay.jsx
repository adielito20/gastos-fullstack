import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function BlockedOverlay({ show, overspent, currency = 'S/' }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-accent-red/10 border border-accent-red/30 rounded-2xl p-4 flex items-center gap-3"
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
            transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
          >
            <AlertTriangle size={20} className="text-accent-red flex-shrink-0" />
          </motion.div>
          <div>
            <p className="font-display font-700 text-sm text-accent-red">
              Límite diario superado
            </p>
            <p className="text-xs text-paper-soft/40 font-body mt-0.5">
              Te pasaste por{' '}
              <span className="font-mono font-600 text-accent-red">
                {currency} {Math.abs(overspent).toFixed(2)}
              </span>
              . No gastes más hoy.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
