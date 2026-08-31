export const EUR_RUB = 97

export function annuityPayment(principal, annualPercent, years) {
  const monthlyRate = annualPercent / 12 / 100
  const months = years * 12
  const payment =
    (principal * monthlyRate * (1 + monthlyRate) ** months) /
    ((1 + monthlyRate) ** months - 1)
  const total = payment * months
  return {
    monthly: Math.round(payment),
    total: Math.round(total),
    overpay: Math.round(total - principal),
  }
}

export const STUDIO = {
  price: 8_000_000,
  downMin: 1_500_000,
  downMax: 2_000_000,
  profitRate: 0.2,
  years: 3,
}

export const NEXT_HOME = {
  price: 30_000_000,
  downRate: 0.2,
  termYears: 25,
}

STUDIO.salePrice = Math.round(STUDIO.price * (1 + STUDIO.profitRate))
STUDIO.profit = STUDIO.salePrice - STUDIO.price
STUDIO.downOptions = [
  {
    down: STUDIO.downMin,
    rest: STUDIO.price - STUDIO.downMin,
    yearly: Math.round((STUDIO.price - STUDIO.downMin) / STUDIO.years),
  },
  {
    down: STUDIO.downMax,
    rest: STUDIO.price - STUDIO.downMax,
    yearly: Math.round((STUDIO.price - STUDIO.downMax) / STUDIO.years),
  },
]

NEXT_HOME.down = Math.round(NEXT_HOME.price * NEXT_HOME.downRate)
NEXT_HOME.loan = NEXT_HOME.price - NEXT_HOME.down
NEXT_HOME.priceEur = Math.round(NEXT_HOME.price / EUR_RUB)
NEXT_HOME.downEur = Math.round(NEXT_HOME.down / EUR_RUB)
NEXT_HOME.loanEur = Math.round(NEXT_HOME.loan / EUR_RUB)
NEXT_HOME.afterSaleCash = STUDIO.salePrice - NEXT_HOME.down

export const INCOME_RULES = {
  russiaShare: 0.5,
  europeShare: 0.35,
  dekretCut: 0.4,
  dekretYears: 2,
}

export function neededIncome(payment, share, dekret) {
  const base = requiredIncome(payment, share)
  if (!dekret) return base
  return Math.round(base / (1 - INCOME_RULES.dekretCut))
}

export const FAMILY_MORTGAGE = {
  rate: 6,
  marketRate: 17,
  spbPreferentialLimit: 12_000_000,
  spbCombinedMax: 30_000_000,
}

export function getRussiaMortgage(family) {
  const years = NEXT_HOME.termYears
  const loan = NEXT_HOME.loan
  if (!family) {
    return {
      id: 'russia',
      title: 'Россия',
      rate: 17,
      family: false,
      ...annuityPayment(loan, 17, years),
    }
  }

  const prefAmount = Math.min(loan, FAMILY_MORTGAGE.spbPreferentialLimit)
  const restAmount = Math.max(0, loan - prefAmount)
  const pref = annuityPayment(prefAmount, FAMILY_MORTGAGE.rate, years)
  const rest = restAmount
    ? annuityPayment(restAmount, FAMILY_MORTGAGE.marketRate, years)
    : { monthly: 0, total: 0, overpay: 0 }

  return {
    id: 'russia',
    title: 'Россия',
    rate: FAMILY_MORTGAGE.rate,
    family: true,
    prefAmount,
    restAmount,
    pref,
    rest,
    monthly: pref.monthly + rest.monthly,
    total: pref.total + rest.total,
    overpay: pref.overpay + rest.overpay,
  }
}

export const MORTGAGES = {
  russia: getRussiaMortgage(false),
  europe: {
    id: 'europe',
    title: 'Европа',
    rate: 3.5,
    ...annuityPayment(NEXT_HOME.loan, 3.5, NEXT_HOME.termYears),
  },
}

export const CITIES = [
  {
    name: 'Петербург',
    country: 'Россия',
    priceM2: '≈ 250–350 тыс. ₽/м² в жилых районах',
    size: 'двушка в неплохом районе, не центр-премиум',
    rentRub: [100_000, 100_000],
    rentMidRub: 100_000,
    note: 'За 30 млн — обычная двухкомнатная в хорошем районе. Сдавать можно примерно за 100 тыс. ₽/мес.',
  },
  {
    name: 'Валенсия',
    country: 'Испания',
    priceM2: '≈ 3 300–3 500 €/м²',
    size: 'около 90–95 м², 2–3 спальни',
    rentEur: [1400, 1800],
    rentMid: 1550,
    note: 'За ~310 тыс. € — полноценная семейная квартира, не центр-премиум, но жилой район.',
  },
  {
    name: 'Милан',
    country: 'Италия',
    priceM2: '≈ 5 000–5 700 €/м²',
    size: 'около 55–60 м², студия или 2 комнаты вне центра',
    rentEur: [1100, 1600],
    rentMid: 1350,
    note: 'Тот же бюджет даёт меньшую площадь: полуцентр / хорошая периферия, не Брера.',
  },
  {
    name: 'Турин',
    country: 'Италия',
    priceM2: '≈ 2 200 €/м²',
    size: 'около 130–140 м², просторная 3–4 комнаты',
    rentEur: [1200, 1800],
    rentMid: 1450,
    note: 'Самый большой метраж из четырёх городов. Аренда ниже миланской при большей площади.',
  },
  {
    name: 'Лион',
    country: 'Франция',
    priceM2: '≈ 4 500–4 700 €/м²',
    size: 'около 65–70 м², T2/T3',
    rentEur: [1000, 1400],
    rentMid: 1200,
    note: 'Средний район, не 2-й и не 6-й округ. Типичная квартира под сдачу или жизнь.',
  },
]
