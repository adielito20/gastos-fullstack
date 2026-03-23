import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { motion } from 'framer-motion'

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-soft border border-white/8 rounded-xl p-3 text-xs font-mono">
      <p className="text-paper-soft/50 mb-1 font-display font-600 uppercase tracking-wider">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="mb-0.5">
          {p.name}: {currency} {Number(p.value).toFixed(0)}
        </p>
      ))}
    </div>
  )
}

export default function WeeklyChart({ data, currency = 'S/' }) {
  const hasData = data.some(d => d.ingresos > 0 || d.gastos > 0)

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-paper-soft/20 text-sm font-body">Sin datos esta semana</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="h-36"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={8} barGap={2} barCategoryGap="30%">
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'rgba(248,246,241,0.3)', fontFamily: 'DM Sans' }}
          />
          <YAxis hide />
          <Tooltip
            content={<CustomTooltip currency={currency} />}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="ingresos" name="Ingresos" radius={[3, 3, 0, 0]} fill="#00c896" opacity={0.7} />
          <Bar dataKey="gastos" name="Gastos" radius={[3, 3, 0, 0]} fill="#ff3b30" opacity={0.7} />
          <Bar dataKey="ahorro" name="Ahorro" radius={[3, 3, 0, 0]} fill="#0066ff" opacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
