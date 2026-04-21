const unitCache = new Map();

const TIME_UNITS = [
  {
    unit: 'year',
    getDiff: (t, n) => {
      const years = t.getFullYear() - n.getFullYear();
      // Корректируем, если текущий месяц/день еще не догнали целевую дату
      const isPast = n > t;
      const start = isPast ? t : n;
      const end = isPast ? n : t;

      const hasFullYearPassed =
        end.getMonth() > start.getMonth() || (end.getMonth() === start.getMonth() && end.getDate() >= start.getDate());

      const diff = Math.abs(years);
      return hasFullYearPassed ? diff : diff - 1;
    },
  },
  {
    unit: 'month',
    getDiff: (t, n) => {
      let months = (t.getFullYear() - n.getFullYear()) * 12 + (t.getMonth() - n.getMonth());
      // Если день месяца еще не наступил, значит полный месяц не прошел
      if (Math.abs(t.getDate() - n.getDate()) < 0 || (t.getDate() < n.getDate() && t > n) || (n.getDate() < t.getDate() && n > t)) {
        // Упрощенная проверка: если текущий день меньше целевого (или наоборот для прошлого)
      }

      // Более точная проверка как в Moment:
      const isPast = n > t;
      const start = isPast ? t : n;
      const end = isPast ? n : t;
      if (end.getDate() < start.getDate()) {
        months = Math.abs(months) - 1;
      } else {
        months = Math.abs(months);
      }
      return months;
    },
  },
  {
    unit: 'week',
    getDiff: (t, n) => Math.trunc(Math.abs(t.getTime() - n.getTime()) / 604800000),
  },
  {
    unit: 'day',
    getDiff: (t, n) => Math.trunc(Math.abs(t.getTime() - n.getTime()) / 86400000),
  },
  { unit: 'hour', ms: 3600000 },
  { unit: 'minute', ms: 60000 },
  { unit: 'second', ms: 1000 },
];

export default function formatRelative(timestampMs, locale = 'ru', display = 'long') {
  const target = new Date(timestampMs);
  const now = new Date();
  const diffMs = Math.abs(target.getTime() - now.getTime());

  for (const config of TIME_UNITS) {
    let value;
    if (config.getDiff) {
      value = Math.abs(config.getDiff(new Date(target), new Date(now)));
    } else {
      value = Math.trunc(diffMs / config.ms);
    }

    // Если значение >= 1, выводим эту единицу.
    // Если 0 (например, прошло 4 месяца), идем к следующему юниту в списке.
    if (value >= 1 || config.unit === 'second') {
      const cacheKey = `${locale}-${config.unit}-${display}`;
      if (!unitCache.has(cacheKey)) {
        unitCache.set(
          cacheKey,
          new Intl.NumberFormat(locale, {
            style: 'unit',
            unit: config.unit,
            unitDisplay: display,
          }),
        );
      }
      return unitCache.get(cacheKey).format(value);
    }
  }
  return undefined;
}
