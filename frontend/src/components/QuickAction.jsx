import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Check, X, RefreshCw } from 'lucide-react'
import { parseAmount, vibrate } from '../utils/helpers'

export default function QuickAction({ onAddIncome, onAddExpense, currentIncome, currency = 'S/' }) {
  const [mode, setMode] = useState(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [incomeMode, setIncomeMode] = useState('replace') // 'replace' | 'add'
  const [floatingTexts, setFloatingTexts] = useState([])
  const inputRef = useRef(null)

  const hasIncome = currentIncome > 0

  const openMode = (m) => {
    setMode(m)
    setAmount('')
    setDescription('')
    setIncomeMode('replace')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const close = () => {
    setMode(null)
    setAmount('')
    setDescription('')
  }

  const addFloat = (text, color) => {
    const id = Date.now()
    setFloatingTexts(prev => [...prev, { id, text, color }])
    setTimeout(() => setFloatingTexts(prev => prev.filter(f => f.id !== id)), 1000)
  }

  const handleSubmit = () => {
    const parsed = parseAmount(amount)
    if (parsed <= 0) return

    if (mode === 'income') {
      // Si el modo es 'add', sumamos al ingreso actual. Si es 'replace', reemplazamos.
      const finalAmount = incomeMode === 'add' ? currentIncome + parsed : parsed
      onAddIncome(finalAmount)
      addFloat(`+ ${currency} ${parsed.toFixed(2)}`, 'text-accent-green')
      vibrate([50])
    } else {
      onAddExpense(parsed, description)
      addFloat(`- ${currency} ${parsed.toFixed(2)}`, 'text-accent-red')
      vibrate([30, 20, 30])
    }
    close()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') close()
  }

  const quickAmounts = mode === 'expense'
    ? [5, 10, 15, 20, 30, 50]
    : [30, 40, 50, 60, 80, 100]

  const previewAmount = () => {
    const parsed = parseAmount(amount)
    if (!parsed) return null
    if (incomeMode === 'add') return currentIncome + parsed
    return parsed
  }

  return (
    <div className="relative">
      {/* Floating feedback */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none z-50">
        <AnimatePresence>
          {floatingTexts.map(f => (
            <motion.div
              key={f.id}
              className={`font-mono font-600 text-lg ${f.color} text-center`}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ position: 'absolute', whiteSpace: 'nowrap', left: '50%', transform: 'translateX(-50%)' }}
            >
              {f.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {!mode ? (
          <motion.div
            key="buttons"
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Ingreso button */}
            <motion.button
              onClick={() => openMode('income')}
              className="relative flex flex-col items-center justify-center gap-1 py-4 rounded-2xl bg-accent-green/10 border border-accent-green/20 text-accent-green overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              <div className="flex items-center gap-2 font-display font-700 text-sm tracking-wide">
                <Plus size={18} strokeWidth={2.5} />
                <span>Ingreso</span>
              </div>
              {hasIncome && (
                <span className="text-accent-green/50 text-xs font-mono">
                  Actual: {currency} {currentIncome.toFixed(2)}
                </span>
              )}
            </motion.button>

            {/* Gasto button */}
            <motion.button
              onClick={() => openMode('expense')}
              className="relative flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-accent-red/10 border border-accent-red/20 text-accent-red font-display font-700 text-sm tracking-wide overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              <Minus size={18} strokeWidth={2.5} />
              <span>Gasto</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            className={`rounded-2xl p-4 border ${
              mode === 'income'
                ? 'bg-accent-green/5 border-accent-green/20'
                : 'bg-accent-red/5 border-accent-red/20'
            }`}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span className={`font-display font-700 text-sm tracking-wide ${
                mode === 'income' ? 'text-accent-green' : 'text-accent-red'
              }`}>
                {mode === 'income' ? '+ Registrar ingreso' : '− Registrar gasto'}
              </span>
              <button onClick={close} className="text-paper-soft/30 hover:text-paper-soft/60 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Si ya hay ingreso, mostrar opciones reemplazar/sumar */}
            {mode === 'income' && hasIncome && (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setIncomeMode('replace')}
                  className={`flex-1 py-2 rounded-xl text-xs font-display font-600 transition-colors ${
                    incomeMode === 'replace'
                      ? 'bg-accent-green text-ink'
                      : 'bg-ink-muted text-paper-soft/40'
                  }`}
                >
                  Reemplazar
                </button>
                <button
                  onClick={() => setIncomeMode('add')}
                  className={`flex-1 py-2 rounded-xl text-xs font-display font-600 transition-colors ${
                    incomeMode === 'add'
                      ? 'bg-accent-green text-ink'
                      : 'bg-ink-muted text-paper-soft/40'
                  }`}
                >
                  <RefreshCw size={11} className="inline mr-1" />
                  Sumar al actual
                </button>
              </div>
            )}

            {/* Info del modo seleccionado */}
            {mode === 'income' && hasIncome && (
              <div className="bg-ink-muted/50 rounded-xl px-3 py-2 mb-3 text-xs font-body text-paper-soft/40">
                {incomeMode === 'replace'
                  ? `Reemplazará el ingreso actual de ${currency} ${currentIncome.toFixed(2)}`
                  : `Se sumará a ${currency} ${currentIncome.toFixed(2)} → total: ${currency} ${previewAmount() !== null ? previewAmount().toFixed(2) : '...'}`
                }
              </div>
            )}

            {/* Amount input */}
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-paper-soft/30 text-lg">
                {currency}
              </span>
              <input
                ref={inputRef}
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="0.00"
                className="w-full bg-ink-soft border border-white/8 rounded-xl pl-12 pr-4 py-3.5 font-mono text-xl font-500 text-paper-DEFAULT placeholder-paper-soft/20 focus:outline-none focus:border-white/20 transition-colors"
                inputMode="decimal"
              />
            </div>

            {/* Description (solo gastos) */}
            {mode === 'expense' && (
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="¿En qué gastaste? (opcional)"
                maxLength={40}
                className="w-full bg-ink-soft border border-white/8 rounded-xl px-4 py-3 text-sm text-paper-DEFAULT placeholder-paper-soft/20 focus:outline-none focus:border-white/20 transition-colors mb-3 font-body"
              />
            )}

            {/* Quick amounts */}
            <div className="flex flex-wrap gap-2 mb-3">
              {quickAmounts.map(q => (
                <motion.button
                  key={q}
                  onClick={() => setAmount(q.toString())}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-500 transition-colors ${
                    amount === q.toString()
                      ? mode === 'income' ? 'bg-accent-green text-ink' : 'bg-accent-red text-paper-DEFAULT'
                      : 'bg-ink-muted text-paper-soft/50 hover:text-paper-soft/80'
                  }`}
                  whileTap={{ scale: 0.92 }}
                >
                  {q}
                </motion.button>
              ))}
            </div>

            {/* Submit */}
            <motion.button
              onClick={handleSubmit}
              disabled={parseAmount(amount) <= 0}
              className={`w-full py-3.5 rounded-xl font-display font-700 text-sm tracking-wide flex items-center justify-center gap-2 transition-all ${
                parseAmount(amount) > 0
                  ? mode === 'income'
                    ? 'bg-accent-green text-ink'
                    : 'bg-accent-red text-paper-DEFAULT'
                  : 'bg-ink-muted text-paper-soft/20 cursor-not-allowed'
              }`}
              whileTap={parseAmount(amount) > 0 ? { scale: 0.97 } : {}}
            >
              <Check size={16} strokeWidth={2.5} />
              {mode === 'income'
                ? incomeMode === 'add' && hasIncome
                  ? `Sumar → ${currency} ${previewAmount() !== null ? previewAmount().toFixed(2) : '...'}`
                  : 'Registrar ingreso'
                : 'Registrar gasto'
              }
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
