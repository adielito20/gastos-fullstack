import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ShoppingCart } from 'lucide-react'

export default function ExpenseList({ expenses, onDelete, currency = 'S/' }) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-2xl bg-ink-muted flex items-center justify-center mx-auto mb-3">
          <ShoppingCart size={20} className="text-paper-soft/20" />
        </div>
        <p className="text-paper-soft/30 text-sm font-body">Sin gastos registrados hoy</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {[...expenses].reverse().map((expense) => (
          <motion.div
            key={expense.id}
            layout
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          >
            <div className="flex items-center justify-between bg-ink-soft rounded-xl px-4 py-3 group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-accent-red/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-red text-xs font-mono font-600">−</span>
                </div>
                <div className="min-w-0">
                  <p className="text-paper-DEFAULT text-sm font-body truncate max-w-[140px]">
                    {expense.description}
                  </p>
                  <p className="text-paper-soft/30 text-xs font-mono">
                    {expense.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="amount-display font-600 text-accent-red text-sm">
                  − {currency} {expense.amount.toFixed(2)}
                </span>
                <motion.button
                  onClick={() => onDelete(expense.id)}
                  className="text-paper-soft/0 group-hover:text-paper-soft/30 hover:!text-accent-red transition-colors"
                  whileTap={{ scale: 0.85 }}
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
