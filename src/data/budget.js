export const MIN_YEAR = 2026
export const MIN_MONTH = 9
export const MAX_YEAR = 2028

export const MONTH_NAMES = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

export const GROUPS = {
  medicine: { label: 'Медицина', color: '#2b74d9' },
  beauty: { label: 'Красота', color: '#db5a8c' },
  sport: { label: 'Спорт', color: '#1f8a5a' },
  home: { label: 'Дом и связь', color: '#d97706' },
  food: { label: 'Еда', color: '#e07a4a' },
  transport: { label: 'Транспорт', color: '#7c5cde' },
  family: { label: 'Семья', color: '#c45c8a' },
  leisure: { label: 'Досуг', color: '#0f9ea8' },
}

const september2026 = {
  income: 340_000,
  savings: 40_000,
  items: [
    {
      id: 'therapy-misha',
      group: 'medicine',
      name: 'Терапия — Миша',
      amount: 6_000,
      note: '2 сессии',
    },
    {
      id: 'therapy-sasha',
      group: 'medicine',
      name: 'Терапия — Саша',
      amount: 18_000,
      note: '4 сессии',
    },
    {
      id: 'medicine',
      group: 'medicine',
      name: 'Медицина',
      amount: null,
      open: true,
    },
    {
      id: 'tennis-wed',
      group: 'sport',
      name: 'Теннис по средам',
      amount: 12_000,
      note: '4 раза × 3 000 ₽, 1 час, ты и Саша',
    },
    {
      id: 'tennis-sat',
      group: 'sport',
      name: 'Теннис по субботам',
      amount: 24_000,
      note: '4 раза × ~6 000 ₽ на двоих',
    },
    {
      id: 'gym-sasha',
      group: 'sport',
      name: 'Тренировки в зале',
      amount: 20_000,
    },
    {
      id: 'utils',
      group: 'home',
      name: 'Коммуналка и связь',
      amount: 10_000,
      note: 'коммуналка, интернет, сотовая и прочее',
    },
    {
      id: 'subs',
      group: 'home',
      name: 'Подписки',
      amount: 5_000,
    },
    {
      id: 'cosmo',
      group: 'beauty',
      name: 'Косметолог — Саша',
      amount: 35_000,
      planned: 60_000,
      prepaid: 25_000,
    },
    {
      id: 'nails',
      group: 'beauty',
      name: 'Маникюр и педикюр',
      amount: 10_000,
    },
    {
      id: 'beauty',
      group: 'beauty',
      name: 'Красота',
      amount: null,
      open: true,
    },
    {
      id: 'food',
      group: 'food',
      name: 'Домашняя еда',
      amount: 35_000,
      note: 'около 35 000 ₽ в месяц',
    },
    {
      id: 'restaurants',
      group: 'food',
      name: 'Рестораны',
      amount: null,
      open: true,
    },
    {
      id: 'leisure',
      group: 'leisure',
      name: 'Досуг',
      amount: null,
      open: true,
    },
    {
      id: 'parents-visit',
      group: 'family',
      name: 'Приезд родителей',
      amount: 20_000,
    },
    {
      id: 'taxi',
      group: 'transport',
      name: 'Такси',
      amount: null,
      open: true,
    },
  ],
}

export const months = {
  '2026-09': september2026,
}

export function periodKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function isPeriodAllowed(year, month) {
  return year > MIN_YEAR || (year === MIN_YEAR && month >= MIN_MONTH)
}

export function getMonthData(year, month) {
  return months[periodKey(year, month)] ?? null
}
