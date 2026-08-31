import { useEffect, useState } from 'react'
import { AmountInput } from './components/AmountInput'
import {
  GROUPS,
  MAX_YEAR,
  MIN_MONTH,
  MIN_YEAR,
  MONTH_NAMES,
  getMonthData,
  periodKey,
  isPeriodAllowed,
} from './data/budget'
import { useStoredAmounts } from './hooks/useStoredAmounts'
import { formatRub } from './lib/money'
import { PropertyPage } from './pages/PropertyPage'
import './App.css'

function getPage() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return hash === 'property' ? 'property' : 'budget'
}

function usePage() {
  const [page, setPage] = useState(getPage)

  useEffect(() => {
    function onHashChange() {
      setPage(getPage())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return page
}

function shiftPeriod(year, month, delta) {
  const date = new Date(year, month - 1 + delta, 1)
  return { year: date.getFullYear(), month: date.getMonth() + 1 }
}

function Donut({ slices, centerValue, centerLabel }) {
  const radius = 78
  const circumference = 2 * Math.PI * radius
  const arcs = slices.reduce((acc, slice) => {
    const length = circumference * slice.share
    const start = acc.at(-1)?.end ?? 0
    acc.push({ ...slice, length, start, end: start + length })
    return acc
  }, [])

  return (
    <div className="donut">
      <svg viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="var(--track)"
          strokeWidth="22"
        />
        {arcs.map((slice) => (
          <circle
            key={slice.id}
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth="22"
            strokeDasharray={`${slice.length} ${circumference - slice.length}`}
            strokeDashoffset={-slice.start}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="donut__center">
        <strong>{formatRub(centerValue)}</strong>
        <span>{centerLabel}</span>
      </div>
    </div>
  )
}

function MonthView({ data, period }) {
  const [overrides, setAmount] = useStoredAmounts(period)
  const items = data.items.map((item) =>
    Object.hasOwn(overrides, item.id) ? { ...item, amount: overrides[item.id] } : item,
  )
  const fundedItems = items.filter((item) => item.amount != null)
  const spend = fundedItems.reduce((sum, item) => sum + item.amount, 0)
  const free = data.income - spend - data.savings
  const maxBar = Math.max(...fundedItems.map((item) => item.amount), 1)
  const barTotal = Math.max(data.income, spend + data.savings, 1)
  const openUnset = items.filter((item) => item.open && item.amount == null)
  const cosmo = items.find((item) => item.planned)
  const composition = [
    { id: 'spend', label: 'Траты', value: spend, color: 'var(--neg)' },
    { id: 'save', label: 'Накопления', value: data.savings, color: 'var(--savings)' },
    { id: 'free', label: 'Свободно', value: Math.max(free, 0), color: 'var(--free)' },
  ]
  const grouped = []
  const groups = new Map()
  for (const item of items) {
    if (!groups.has(item.group)) {
      const list = []
      groups.set(item.group, list)
      grouped.push([item.group, list])
    }
    groups.get(item.group).push(item)
  }

  const donutSlices = [
    ...fundedItems.map((item) => ({
      id: item.id,
      color: GROUPS[item.group].color,
      share: item.amount / barTotal,
    })),
    {
      id: 'savings',
      color: 'var(--savings)',
      share: data.savings / barTotal,
    },
    {
      id: 'free',
      color: 'var(--free)',
      share: Math.max(free, 0) / barTotal,
    },
  ].filter((slice) => slice.share > 0)

  return (
    <>
      <div className="cards">
        <article className="card card--income">
          <div className="card__label">Доход</div>
          <div className="card__value">{formatRub(data.income)}</div>
        </article>
        <article className="card card--spend">
          <div className="card__label">Траты</div>
          <div className="card__value">{formatRub(spend)}</div>
          {cosmo ? (
            <div className="card__note">
              косметолог в этом месяце {formatRub(cosmo.amount)}
            </div>
          ) : null}
        </article>
        <article className="card card--save">
          <div className="card__label">Накопления</div>
          <div className="card__value">{formatRub(data.savings)}</div>
        </article>
        <article className={`card card--free${free < 0 ? ' is-negative' : ''}`}>
          <div className="card__label">Свободно</div>
          <div className="card__value">{formatRub(free)}</div>
          {openUnset.length > 0 ? (
            <div className="card__note">
              пока не вычтено: {openUnset.map((item) => item.name.toLowerCase()).join(', ')}
            </div>
          ) : null}
        </article>
      </div>

      <section className="panel">
        <h2>Как распределяется доход</h2>
        <div className="composition">
          {composition.map((slice) => (
            <div
              key={slice.id}
              className="composition__slice"
              style={{
                width: `${(slice.value / barTotal) * 100}%`,
                background: slice.color,
              }}
              title={`${slice.label}: ${formatRub(slice.value)}`}
            />
          ))}
        </div>
        <div className="legend">
          {composition.map((slice) => (
            <span key={slice.id}>
              <i className="legend__dot" style={{ background: slice.color }} />
              {slice.label} · {formatRub(slice.value)}
            </span>
          ))}
        </div>
      </section>

      <div className="layout">
        <section className="panel donut-wrap">
          <h2>Доли от дохода</h2>
          <Donut
            slices={donutSlices}
            centerValue={data.income}
            centerLabel="доход месяца"
          />
        </section>

        <section className="panel items-panel">
          <h2>Статьи месяца</h2>
          <div className="items">
            {grouped.map(([groupId, items]) => (
              <div key={groupId}>
                <div className="group__title">{GROUPS[groupId].label}</div>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={item.open && item.amount == null ? 'row row--open' : 'row'}
                  >
                    <div className="row__name">{item.name}</div>
                    <AmountInput
                      label={item.name}
                      value={item.amount}
                      onChange={(value) =>
                        setAmount(item.id, item.open ? value : (value ?? 0))
                      }
                    />
                    {item.note ? <div className="row__note">{item.note}</div> : null}
                    {item.amount != null ? (
                      <div className="row__bar">
                        <span
                          style={{
                            width: `${(item.amount / maxBar) * 100}%`,
                            background: GROUPS[item.group].color,
                          }}
                        />
                      </div>
                    ) : null}
                    {item.planned ? (
                      <div className="progress">
                        <div className="progress__meta">
                          <span>
                            Отложено {formatRub(item.prepaid)} из {formatRub(item.planned)}
                          </span>
                          <span>в этом месяце {formatRub(item.amount)}</span>
                        </div>
                        <div className="progress__track">
                          <div
                            className="progress__fill"
                            style={{
                              width: `${(item.prepaid / item.planned) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

function App() {
  const page = usePage()
  const [year, setYear] = useState(MIN_YEAR)
  const [month, setMonth] = useState(MIN_MONTH)
  const data = getMonthData(year, month)
  const prev = shiftPeriod(year, month, -1)
  const next = shiftPeriod(year, month, 1)
  const canGoPrev = isPeriodAllowed(prev.year, prev.month)
  const canGoNext = next.year <= MAX_YEAR

  function go(delta) {
    const nextPeriod = shiftPeriod(year, month, delta)
    if (!isPeriodAllowed(nextPeriod.year, nextPeriod.month)) return
    if (nextPeriod.year > MAX_YEAR) return
    setYear(nextPeriod.year)
    setMonth(nextPeriod.month)
  }

  return (
    <div className="app">
      <header className="header">
        <nav className="header__nav" aria-label="Разделы">
          <a
            className={`nav-link${page === 'budget' ? ' is-active' : ''}`}
            href="#budget"
            onClick={(event) => {
              event.preventDefault()
              window.location.hash = 'budget'
            }}
          >
            Бюджет
          </a>
          <a
            className={`nav-link${page === 'property' ? ' is-active' : ''}`}
            href="#property"
            onClick={(event) => {
              event.preventDefault()
              window.location.hash = 'property'
            }}
          >
            Покупка недвижимости
          </a>
        </nav>
        {page === 'budget' ? (
          <div className="header__period">
            <button
              className="nav-btn"
              type="button"
              aria-label="Предыдущий месяц"
              disabled={!canGoPrev}
              onClick={() => go(-1)}
            >
              ‹
            </button>
            <select
              className="select"
              value={year}
              onChange={(event) => {
                const nextYear = Number(event.target.value)
                setYear(nextYear)
                if (!isPeriodAllowed(nextYear, month)) setMonth(MIN_MONTH)
              }}
            >
              {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, index) => MIN_YEAR + index).map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ),
              )}
            </select>
            <select
              className="select"
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
            >
              {MONTH_NAMES.map((name, index) => {
                const value = index + 1
                return (
                  <option key={name} value={value} disabled={!isPeriodAllowed(year, value)}>
                    {name}
                  </option>
                )
              })}
            </select>
            <button
              className="nav-btn"
              type="button"
              aria-label="Следующий месяц"
              disabled={!canGoNext}
              onClick={() => go(1)}
            >
              ›
            </button>
          </div>
        ) : (
          <h1 className="header__title">Покупка недвижимости</h1>
        )}
      </header>

      <main className="main">
        {page === 'property' ? (
          <PropertyPage />
        ) : data ? (
          <MonthView data={data} period={periodKey(year, month)} />
        ) : (
          <div className="empty panel">
            <h2>
              {MONTH_NAMES[month - 1]} {year}
            </h2>
            <p>За этот месяц данных пока нет — можно будет добавить позже.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
