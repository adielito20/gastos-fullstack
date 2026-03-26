export const getTodayKey = () => {
  const d = new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().split('T')[0]
}

export const formatCurrency = (amount, currency = 'S/') => {
  return `${currency} ${Math.abs(amount).toFixed(2)}`
}

export const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export const formatDateShort = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00')
  const today = getTodayKey()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const offset = yesterday.getTimezoneOffset() * 60000
  const yKey = new Date(yesterday.getTime() - offset).toISOString().split('T')[0]

  if (dateStr === today) return 'Hoy'
  if (dateStr === yKey) return 'Ayer'
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
}

export const getStatusConfig = (status) => {
  const configs = {
    idle: {
      color: 'text-paper-muted',
      bg: 'bg-ink-muted',
      bar: 'bg-ink-muted',
      label: 'Sin ingreso',
      emoji: '—',
    },
    safe: {
      color: 'text-accent-green',
      bg: 'bg-accent-green/10',
      bar: 'bg-accent-green',
      label: 'Saludable',
      emoji: '✓',
    },
    warning: {
      color: 'text-accent-yellow',
      bg: 'bg-accent-yellow/10',
      bar: 'bg-accent-yellow',
      label: 'Cuidado',
      emoji: '!',
    },
    danger: {
      color: 'text-accent-red',
      bg: 'bg-accent-red/10',
      bar: 'bg-accent-red',
      label: 'Límite',
      emoji: '!!',
    },
    blocked: {
      color: 'text-accent-red',
      bg: 'bg-accent-red/15',
      bar: 'bg-accent-red',
      label: 'BLOQUEADO',
      emoji: '✕',
    },
  }
  return configs[status] || configs.idle
}

export const vibrate = (pattern = [100]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

export const parseAmount = (str) => {
  const cleaned = str.replace(/[^0-9.]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100
}
