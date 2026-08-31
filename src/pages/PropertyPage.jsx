import { useEffect, useState } from 'react'
import {
  CITIES,
  EUR_RUB,
  FAMILY_MORTGAGE,
  INCOME_RULES,
  MORTGAGES,
  NEXT_HOME,
  STUDIO,
  getRussiaMortgage,
  neededIncome,
  studioPaymentIncome,
} from '../data/propertyPlan'
import { formatCompactRub, formatEur, formatRub } from '../lib/money'

const NOTES_KEY = 'family-budget:property-notes:v1'
const FAMILY_KEY = 'family-budget:family-mortgage'
const DEKRET_KEY = 'family-budget:dekret'

function toEur(value) {
  return Math.round(value / EUR_RUB)
}

export function PropertyPage() {
  const [note, setNote] = useState(() => {
    try {
      return localStorage.getItem(NOTES_KEY) ?? ''
    } catch {
      return ''
    }
  })
  const [familyMortgage, setFamilyMortgage] = useState(() => {
    try {
      return localStorage.getItem(FAMILY_KEY) === '1'
    } catch {
      return false
    }
  })
  const [dekret, setDekret] = useState(() => {
    try {
      return localStorage.getItem(DEKRET_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, note)
  }, [note])

  useEffect(() => {
    localStorage.setItem(FAMILY_KEY, familyMortgage ? '1' : '0')
  }, [familyMortgage])

  useEffect(() => {
    localStorage.setItem(DEKRET_KEY, dekret ? '1' : '0')
  }, [dekret])

  const ru = getRussiaMortgage(familyMortgage)
  const eu = MORTGAGES.europe
  const maxMonthly = Math.max(ru.monthly, eu.monthly)
  const ruNeeded = neededIncome(ru.monthly, INCOME_RULES.russiaShare, false)
  const euNeeded = neededIncome(eu.monthly, INCOME_RULES.europeShare, false)
  const studioIncome = studioPaymentIncome(dekret)

  return (
    <>
      <p className="page-lead">
        Двухшаговый план: сначала инвестиционная студия/однушка в рассрочку, затем продажа
        с прибылью и ипотека на квартиру около {formatCompactRub(NEXT_HOME.price)}. Курс для
        перевода: <strong>1 € = {EUR_RUB} ₽</strong> (ориентир ЦБ, август 2026). Цифры
        округлены, аренда — рыночный ориентир на 2026, не оферта.
      </p>

      <ol className="timeline">
        <li>
          <span className="timeline__when">ноя 2026 — апр 2027</span>
          <strong>Покупка студии / однушки за {formatCompactRub(STUDIO.price)}</strong>
          <p>Первый взнос 1,5–2 млн ₽, остаток — рассрочка на 3 года.</p>
        </li>
        <li>
          <span className="timeline__when">2028 — 2030</span>
          <strong>Три ежегодных платежа и продажа +20%</strong>
          <p>
            Квартира выкупается, затем продаётся примерно за {formatCompactRub(STUDIO.salePrice)}.
          </p>
        </li>
        <li>
          <span className="timeline__when">после продажи</span>
          <strong>Ипотека на квартиру {formatCompactRub(NEXT_HOME.price)}</strong>
          <p>Взнос 20%. Сравниваем Россию (17%) и Европу (3,5%) на 25 лет.</p>
        </li>
      </ol>

      <section className="panel">
        <h2>Шаг 1. Инвестиционная студия / однушка</h2>
        <div className="panel-toolbar">
          <p className="panel-intro">
            Поиск и сделка с ноября 2026 по апрель 2027. Цена {formatRub(STUDIO.price)}. На
            контракте — взнос из накоплений, дальше три равных платежа раз в год. Нужный доход
            считаем от годового платежа рассрочки: не больше 50% дохода.
          </p>
          <label className="check-field">
            <input
              type="checkbox"
              checked={dekret}
              onChange={(event) => setDekret(event.target.checked)}
            />
            Декрет
          </label>
        </div>
        {dekret ? (
          <p className="dekret-note">
            Декрет на {INCOME_RULES.dekretYears} года с апреля 2027: доход −40%. В этот период
            попадают платежи апреля 2028 и 2029. Нужный доход до декрета выше в 1,67 раза, чтобы
            после урезания всё ещё откладывать годовой платёж. Апрель 2030 — уже без декрета.
          </p>
        ) : null}
        <div className="cards cards--3">
          <article className="card">
            <div className="card__label">Цена</div>
            <div className="card__value">{formatCompactRub(STUDIO.price)}</div>
            <div className="card__note">{formatEur(toEur(STUDIO.price))}</div>
          </article>
          <article className="card card--save">
            <div className="card__label">Взнос на сделке</div>
            <div className="card__value">1,5–2 млн ₽</div>
            <div className="card__note">нужно накопить к апрелю 2027</div>
          </article>
          <article className="card card--income">
            <div className="card__label">Продажа через 3 года</div>
            <div className="card__value">{formatCompactRub(STUDIO.salePrice)}</div>
            <div className="card__note">+20% → прибыль {formatCompactRub(STUDIO.profit)}</div>
          </article>
        </div>
        <div className="table-wrap">
          <table className="plan-table">
            <thead>
              <tr>
                <th>Сценарий взноса</th>
                <th>На контракте</th>
                <th>Остаток</th>
                <th>Платёж раз в год × 3</th>
                <th>Это в месяц</th>
                <th>Нужный доход</th>
              </tr>
            </thead>
            <tbody>
              {studioIncome.map((option) => (
                <tr key={option.down}>
                  <td>{formatCompactRub(option.down)}</td>
                  <td>{formatRub(option.down)}</td>
                  <td>{formatRub(option.rest)}</td>
                  <td>{formatRub(option.yearly)}</td>
                  <td>{formatRub(option.monthly)}</td>
                  <td>
                    {formatRub(option.needed)}
                    {dekret ? (
                      <div className="table-sub">
                        в 3-й год без декрета {formatRub(option.neededBase)}
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="plan-list">
          <li>Апрель 2027 — контракт и первый взнос.</li>
          <li>Апрель 2028, 2029, 2030 — три крупных платежа рассрочки.</li>
          <li>
            После последнего платежа объект в собственности, продажа около{' '}
            {formatRub(STUDIO.salePrice)}.
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2>Шаг 2. Что остаётся после продажи</h2>
        <p className="panel-intro">
          Вырученные {formatRub(STUDIO.salePrice)} идут во взнос по следующей квартире.{' '}
          {formatRub(NEXT_HOME.down)} (20%) закрывается с продажи, ещё{' '}
          {formatRub(NEXT_HOME.afterSaleCash)} остаётся на комиссии, ремонт и подушку.
        </p>
      </section>

      <section className="panel">
        <h2>Шаг 3. Ипотека на квартиру {formatCompactRub(NEXT_HOME.price)}</h2>
        <div className="panel-toolbar">
          <p className="panel-intro">
            Кредит {formatRub(NEXT_HOME.loan)} ({formatEur(NEXT_HOME.loanEur)}) на 25 лет, взнос
            20%. Нужный доход: в России платёж не больше 50% дохода (ПДН), в Европе — около 35%.
          </p>
        </div>
        <div className="mortgage-grid">
          <article className="mortgage-card mortgage-card--russia">
            <div className="mortgage-card__head">
              <h3>Россия</h3>
              <label className="check-field">
                <input
                  type="checkbox"
                  checked={familyMortgage}
                  onChange={(event) => setFamilyMortgage(event.target.checked)}
                />
                Семейная ипотека
              </label>
            </div>
            <p className="mortgage-card__rate">
              {familyMortgage
                ? `6% на ${formatCompactRub(FAMILY_MORTGAGE.spbPreferentialLimit)} + ${FAMILY_MORTGAGE.marketRate}% на остаток · 25 лет`
                : `${ru.rate}% годовых · 25 лет`}
            </p>
            <dl className="mortgage-stats">
              <div>
                <dt>Платёж в месяц</dt>
                <dd>{formatRub(ru.monthly)}</dd>
                <dd className="mortgage-stats__sub">{formatEur(toEur(ru.monthly))}</dd>
              </div>
              <div>
                <dt>Всего выплатите</dt>
                <dd>{formatRub(ru.total)}</dd>
              </div>
              <div>
                <dt>Переплата</dt>
                <dd>{formatRub(ru.overpay)}</dd>
                <dd className="mortgage-stats__sub">
                  {Math.round((ru.overpay / NEXT_HOME.loan) * 100)}% от кредита
                </dd>
              </div>
              <div>
                <dt>Нужный доход</dt>
                <dd>{formatRub(ruNeeded)}</dd>
                <dd className="mortgage-stats__sub">
                  ПДН до 50% · {formatEur(toEur(ruNeeded))}
                </dd>
              </div>
            </dl>
            {familyMortgage && ru.restAmount > 0 ? (
              <p className="mortgage-card__split">
                {formatRub(ru.pref.monthly)} по льготе 6% ({formatCompactRub(ru.prefAmount)}) +{' '}
                {formatRub(ru.rest.monthly)} по рыночной {FAMILY_MORTGAGE.marketRate}% (
                {formatCompactRub(ru.restAmount)}).
              </p>
            ) : null}
            <p className="mortgage-card__limit">
              В Петербурге по семейной ипотеке льгота — максимум{' '}
              <strong>{formatCompactRub(FAMILY_MORTGAGE.spbPreferentialLimit)}</strong> кредита под
              6%. Квартира за 30 млн с взносом 20% требует {formatCompactRub(NEXT_HOME.loan)}, поэтому
              целиком под 6% не проходит. Банки собирают комбинированный кредит: льгота до 12 млн, остаток
              по рыночной ставке, общий лимит до{' '}
              {formatCompactRub(FAMILY_MORTGAGE.spbCombinedMax)}.
            </p>
            <div className="mortgage-bar" aria-hidden="true">
              <span style={{ width: `${(ru.monthly / maxMonthly) * 100}%` }} />
            </div>
          </article>

          <article className="mortgage-card mortgage-card--europe">
            <h3>Европа</h3>
            <p className="mortgage-card__rate">{eu.rate}% годовых · 25 лет</p>
            <dl className="mortgage-stats">
              <div>
                <dt>Платёж в месяц</dt>
                <dd>{formatRub(eu.monthly)}</dd>
                <dd className="mortgage-stats__sub">{formatEur(toEur(eu.monthly))}</dd>
              </div>
              <div>
                <dt>Всего выплатите</dt>
                <dd>{formatRub(eu.total)}</dd>
              </div>
              <div>
                <dt>Переплата</dt>
                <dd>{formatRub(eu.overpay)}</dd>
                <dd className="mortgage-stats__sub">
                  {Math.round((eu.overpay / NEXT_HOME.loan) * 100)}% от кредита
                </dd>
              </div>
              <div>
                <dt>Нужный доход</dt>
                <dd>{formatRub(euNeeded)}</dd>
                <dd className="mortgage-stats__sub">
                  нагрузка до 35% · {formatEur(toEur(euNeeded))}
                </dd>
              </div>
            </dl>
            <div className="mortgage-bar" aria-hidden="true">
              <span style={{ width: `${(eu.monthly / maxMonthly) * 100}%` }} />
            </div>
          </article>
        </div>
        <p className="property-loan">
          {familyMortgage ? (
            <>
              С семейной ипотекой платёж падает с {formatRub(MORTGAGES.russia.monthly)} до{' '}
              {formatRub(ru.monthly)}, но всё ещё примерно в {Math.max(1, Math.round(ru.monthly / eu.monthly))}{' '}
              раза выше европейского. Чистые 6% на все {formatCompactRub(NEXT_HOME.loan)} в Петербурге
              недоступны из‑за потолка 12 млн.
            </>
          ) : (
            <>
              Европейская ставка даёт платёж примерно в {Math.round(ru.monthly / eu.monthly)} раза
              ниже и переплату меньше на {formatRub(ru.overpay - eu.overpay)}. В России за 25 лет
              банку уходит больше трёх тел кредита.
            </>
          )}
        </p>
      </section>

      <section className="panel">
        <h2>Какая квартира получается за ~{formatEur(NEXT_HOME.priceEur)}</h2>
        <p className="panel-intro">
          {formatCompactRub(NEXT_HOME.price)} ≈ {formatEur(NEXT_HOME.priceEur)} по курсу{' '}
          {EUR_RUB} ₽. Париж и Рим не берём: там этот бюджет почти не покупает семью. Аренда —
          за объект такого класса, не «средняя по городу».
        </p>
        <div className="city-grid">
          {CITIES.map((city) => {
            const rentLow = city.rentRub?.[0] ?? city.rentEur[0]
            const rentHigh = city.rentRub?.[1] ?? city.rentEur[1]
            const inRub = Boolean(city.rentRub)
            return (
            <article key={city.name} className="city-card">
              <h3>
                {city.name}
                <span>{city.country}</span>
              </h3>
              <p className="city-card__size">{city.size}</p>
              <p className="city-card__meta">{city.priceM2}</p>
              <p className="city-card__rent">
                Аренда{' '}
                {inRub
                  ? rentLow === rentHigh
                    ? formatRub(rentLow)
                    : `${formatRub(rentLow)}–${formatRub(rentHigh)}`
                  : `${formatEur(rentLow)}–${formatEur(rentHigh)}`}{' '}
                / мес
              </p>
              <p className="city-card__rent-rub">
                {inRub
                  ? `≈ ${formatEur(Math.round(rentLow / EUR_RUB))}`
                  : `≈ ${formatRub(city.rentEur[0] * EUR_RUB)}–${formatRub(city.rentEur[1] * EUR_RUB)}`}
              </p>
              <p className="city-card__note">{city.note}</p>
            </article>
            )
          })}
        </div>
        <div className="table-wrap">
          <table className="plan-table">
            <thead>
              <tr>
                <th>Город</th>
                <th>Аренда, середина</th>
                <th>vs платёж РФ</th>
                <th>vs платёж ЕС</th>
              </tr>
            </thead>
            <tbody>
              {CITIES.map((city) => {
                const rentRub = city.rentMidRub ?? city.rentMid * EUR_RUB
                return (
                  <tr key={city.name}>
                    <td>{city.name}</td>
                    <td>
                      {city.rentMidRub
                        ? formatRub(rentRub)
                        : `${formatEur(city.rentMid)} · ${formatRub(rentRub)}`}
                    </td>
                    <td className="neg-cell">
                      аренда покрывает {Math.round((rentRub / ru.monthly) * 100)}% платежа
                    </td>
                    <td className={rentRub >= eu.monthly ? 'pos-cell' : 'neg-cell'}>
                      {rentRub >= eu.monthly
                        ? `аренда выше платежа на ${formatRub(rentRub - eu.monthly)}`
                        : `не хватает ${formatRub(eu.monthly - rentRub)}`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="property-loan">
          В Петербурге двушка за {formatCompactRub(NEXT_HOME.price)} сдаётся примерно за 100 тыс. ₽/мес —
          это около {Math.round((100_000 / ru.monthly) * 100)}% российского платежа. В Валенсии, Турине и
          Лионе аренда такого бюджета уже близка к европейскому платежу или его покрывает.
        </p>
      </section>

      <section className="panel">
        <h2>Заметки</h2>
        <textarea
          className="note-input"
          rows={5}
          placeholder="Район, застройщик, банк, что ещё учесть…"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </section>
    </>
  )
}
