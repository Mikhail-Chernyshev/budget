import { formatAmountInput, parseAmount } from '../lib/money'

export function AmountInput({ value, onChange, label }) {
  return (
    <label className="amount-field">
      <span className="visually-hidden">{label}</span>
      <input
        className="amount-input"
        inputMode="numeric"
        autoComplete="off"
        placeholder="—"
        value={formatAmountInput(value)}
        onChange={(event) => onChange(parseAmount(event.target.value))}
      />
      <span className="amount-field__suffix">₽</span>
    </label>
  )
}
