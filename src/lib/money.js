const rub = new Intl.NumberFormat('ru-RU')

export function formatRub(value) {
  if (value == null) return '—'
  return `${rub.format(value)} ₽`
}

export function parseAmount(text) {
  const digits = text.replace(/\D/g, '')
  if (digits === '') return null
  return Number(digits.slice(0, 10))
}

export function formatAmountInput(value) {
  if (value == null) return ''
  return rub.format(value)
}

export function formatEur(value) {
  if (value == null) return '—'
  return `${rub.format(value)} €`
}

export function formatCompactRub(value) {
  if (value == null) return '—'
  if (Math.abs(value) >= 1_000_000) {
    const millions = value / 1_000_000
    const digits = Number.isInteger(millions) ? 0 : 1
    return `${millions.toLocaleString('ru-RU', { maximumFractionDigits: digits })} млн ₽`
  }
  return formatRub(value)
}
