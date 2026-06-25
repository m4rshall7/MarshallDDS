export const CATEGORIES = [
  { name: "Выручка WB (выплата)",       type: "Поступление", activity: "Текущая",        emoji: "💰" },
  { name: "Возврат от поставщика",       type: "Поступление", activity: "Текущая",        emoji: "↩️" },
  { name: "Получение займа / кредита",   type: "Поступление", activity: "Финансовая",     emoji: "🏦" },
  { name: "Личные вложения в бизнес",    type: "Поступление", activity: "Финансовая",     emoji: "💼" },
  { name: "Продажа оборудования",        type: "Поступление", activity: "Инвестиционная", emoji: "🔧" },
  { name: "Прочие поступления",          type: "Поступление", activity: "Текущая",        emoji: "📥" },
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

export const ACCOUNTS = [
  { id: "tinkoff",    name: "Тинькофф",              emoji: "🟡", color: "#F9A825" },
  { id: "sber",       name: "Сбербанк",               emoji: "🟢", color: "#1B6B40" },
  { id: "alfa",       name: "Альфа Банк",             emoji: "🔴", color: "#D32F2F" },
  { id: "vtb",        name: "ВТБ",                    emoji: "🔵", color: "#1565C0" },
  { id: "rshb",       name: "Россельхозбанк",         emoji: "🟤", color: "#5D4037" },
  { id: "tochka",     name: "Точка (расч. счёт)",     emoji: "⚫", color: "#212121" },
  { id: "cash",       name: "Наличные",               emoji: "💵", color: "#388E3C" },
];

export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxObPjHGuEj5J9p-ce_o2KZbT5H04TFU1ECEQes-nSMcrOL8KUKibmzWfOpLEVbdI5DjA/exec";
