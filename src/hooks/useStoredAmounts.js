import { useEffect, useState } from 'react'

const STORAGE_KEY = 'family-budget:amounts:v1'

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function useStoredAmounts(period) {
  const [overrides, setOverrides] = useState(() => readStore()[period] ?? {})

  useEffect(() => {
    setOverrides(readStore()[period] ?? {})
  }, [period])

  function setAmount(id, value) {
    setOverrides((current) => {
      const next = { ...current, [id]: value }
      const store = readStore()
      store[period] = next
      writeStore(store)
      return next
    })
  }

  return [overrides, setAmount]
}
