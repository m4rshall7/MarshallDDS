export const CATEGORIES = [
  // ПОСТУПЛЕНИЯ
  { name: "Выручка WB (выплата)",       type: "Поступление", activity: "Текущая",        emoji: "💰" },
  { name: "Возврат от поставщика",       type: "Поступление", activity: "Текущая",        emoji: "↩️" },
  { name: "Получение займа / кредита",   type: "Поступление", activity: "Финансовая",     emoji: "🏦" },
  { name: "Личные вложения в бизнес",    type: "Поступление", activity: "Финансовая",     emoji: "💼" },
  { name: "Продажа оборудования",        type: "Поступление", activity: "Инвестиционная", emoji: "🔧" },
  { name: "Прочие поступления",          type: "Поступление", activity: "Текущая",        emoji: "📥" },

  // ВЫПЛАТЫ
  { name: "Закупка товара",              type: "Выплата", activity: "Текущая",        emoji: "📦" },
  { name: "Логистика / доставка",        type: "Выплата", activity: "Текущая",        emoji: "🚚" },
  { name: "Реклама WB",                  type: "Выплата", activity: "Текущая",        emoji: "📣" },
  { name: "Зарплата / выплаты команде",  type: "Выплата", activity: "Текущая",        emoji: "👥" },
  { name: "Операционные расходы",        type: "Выплата", activity: "Текущая",        emoji: "🔩" },
  { name: "Налоги (УСН)",                type: "Выплата", activity: "Текущая",        emoji: "📋" },
  { name: "Дивиденды / вывод прибыли",   type: "Выплата", activity: "Финансовая",     emoji: "💸" },
  { name: "Погашение займа / кредита",   type: "Выплата", activity: "Финансовая",     emoji: "🏦" },
  { name: "Банковские комиссии",         type: "Выплата", activity: "Финансовая",     emoji: "🏛️" },
  { name: "Закупка оборудования",        type: "Выплата", activity: "Инвестиционная", emoji: "🔧" },
  { name: "Прочие расходы",              type: "Выплата", activity: "Текущая",        emoji: "📤" },
];

export const INCOME_CATS  = CATEGORIES.filter(c => c.type === "Поступление");
export const EXPENSE_CATS = CATEGORIES.filter(c => c.type === "Выплата");

export const SHEETS_PROXY_URL = process.env.REACT_APP_SHEETS_URL || "";
