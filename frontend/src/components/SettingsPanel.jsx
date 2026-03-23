import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Download, RotateCcw, Moon, Sun, Check } from 'lucide-react'

export default function SettingsPanel({ settings, darkMode, onUpdate, onToggleDark, onExport, onReset, currency = 'S/' }) {
  const [savingsRate, setSavingsRate] = useState(settings.savingsRate)
  const [savingsGoal, setSavingsGoal] = useState(settings.savingsGoal)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onUpdate({ savingsRate: Number(savingsRate), savingsGoal: Number(savingsGoal) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Settings size={14} className="text-paper-soft/40" />
        <span className="font-display font-600 text-xs uppercase tracking-widest text-paper-soft/40">
          Configuración
        </span>
      </div>

      {/* Savings Rate */}
      <div className="bg-ink-soft rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display font-600 text-sm text-paper-DEFAULT">Porcentaje de ahorro</p>
          <span className="font-mono font-700 text-accent-blue text-lg">{savingsRate}%</span>
        </div>
        <input
          type="range"
          min="5"
          max="50"
          step="5"
          value={savingsRate}
          onChange={e => setSavingsRate(e.target.value)}
          className="w-full accent-accent-blue"
        />
        <div className="flex justify-between text-xs text-paper-soft/20 font-mono mt-1">
          <span>5%</span>
          <span>50%</span>
        </div>
        <p className="text-xs text-paper-soft/30 mt-2 font-body">
          Con un ingreso de {currency} 50, ahorras {currency} {(50 * savingsRate / 100).toFixed(2)} por día
        </p>
      </div>

      {/* Savings Goal */}
      <div className="bg-ink-soft rounded-2xl p-4">
        <p className="font-display font-600 text-sm text-paper-DEFAULT mb-3">Meta de ahorro</p>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-paper-soft/30">
            {currency}
          </span>
          <input
            type="number"
            value={savingsGoal}
            onChange={e => setSavingsGoal(e.target.value)}
            className="w-full bg-ink-muted border border-white/8 rounded-xl pl-10 pr-4 py-3 font-mono text-paper-DEFAULT focus:outline-none focus:border-white/20 transition-colors"
            inputMode="decimal"
          />
        </div>
      </div>

      {/* Save button */}
      <motion.button
        onClick={handleSave}
        className={`w-full py-3.5 rounded-xl font-display font-700 text-sm tracking-wide flex items-center justify-center gap-2 transition-colors ${
          saved ? 'bg-accent-green text-ink' : 'bg-paper-DEFAULT text-ink'
        }`}
        whileTap={{ scale: 0.97 }}
      >
        {saved ? <Check size={16} /> : <Settings size={16} />}
        {saved ? 'Guardado' : 'Guardar cambios'}
      </motion.button>

      {/* Divider */}
      <div className="border-t border-white/5 my-2" />

      {/* Dark mode */}
      <button
        onClick={onToggleDark}
        className="w-full flex items-center justify-between bg-ink-soft rounded-2xl px-4 py-3.5 text-paper-DEFAULT"
      >
        <div className="flex items-center gap-3">
          {darkMode ? <Moon size={16} className="text-paper-soft/50" /> : <Sun size={16} className="text-accent-yellow" />}
          <span className="font-body text-sm">Modo oscuro</span>
        </div>
        <div className={`w-10 h-5.5 rounded-full transition-colors relative ${darkMode ? 'bg-accent-blue' : 'bg-ink-muted'}`}
          style={{ height: '22px' }}>
          <motion.div
            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
            animate={{ left: darkMode ? '22px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>
      </button>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onExport}
          className="flex items-center justify-center gap-2 bg-ink-soft rounded-2xl px-4 py-3 text-paper-soft/50 hover:text-paper-soft/80 transition-colors text-sm font-body"
        >
          <Download size={14} />
          Exportar
        </button>
        <button
          onClick={() => {
            if (confirm('¿Resetear el día de hoy?')) onReset()
          }}
          className="flex items-center justify-center gap-2 bg-ink-soft rounded-2xl px-4 py-3 text-accent-red/50 hover:text-accent-red transition-colors text-sm font-body"
        >
          <RotateCcw size={14} />
          Resetear
        </button>
      </div>
    </div>
  )
}
