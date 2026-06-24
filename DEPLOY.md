# Marshall DDS — Инструкция по деплою

## Что это
PWA приложение для быстрого учёта ДДС с телефона.
Синхронизируется с Google Sheets через Apps Script.

---

## Шаг 1: Firebase (база данных)

1. Открой https://console.firebase.google.com
2. Создай новый проект — назови "marshall-dds"
3. Перейди в **Firestore Database** → Создать базу данных → Production mode
4. Перейди в **Project Settings** → General → Your apps → Add app → Web (</>)
5. Назови "marshall-dds-web", скопируй конфиг:
   ```js
   apiKey: "...",
   authDomain: "...",
   projectId: "...",
   ...
   ```
6. Вставь эти значения в файл `src/firebase.js`

**Правила Firestore** (Project → Firestore → Rules):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /transactions/{doc} {
      allow read, write: if true;
    }
  }
}
```

---

## Шаг 2: Google Apps Script

1. Открой Google Sheets (создай новую таблицу)
2. Назови таблицу: **Marshall DDS 2026**
3. Перейди в **Расширения → Apps Script**
4. Удали весь код, вставь содержимое файла `apps-script.js`
5. Нажми 💾 Сохранить
6. Нажми **Развернуть → Новое развёртывание**
   - Тип: Веб-приложение
   - Описание: Marshall DDS v1
   - Выполнять как: Я (ваш аккаунт)
   - Доступ: **Все**
7. Нажми **Развернуть**, скопируй URL
   Выглядит так: `https://script.google.com/macros/s/AKfyc.../exec`

---

## Шаг 3: GitHub

```bash
cd dds-app
git init
git add .
git commit -m "Marshall DDS v1"
```

Создай репозиторий на github.com/m4rshall7 → назови `MarshallDDS`

```bash
git remote add origin https://github.com/m4rshall7/MarshallDDS.git
git push -u origin main
```

---

## Шаг 4: Vercel

1. Открой https://vercel.com
2. **Add New Project** → Import из GitHub → выбери `MarshallDDS`
3. Framework: **Create React App**
4. Root Directory: `.` (корень)
5. **Environment Variables** — добавь:
   | Name | Value |
   |------|-------|
   | `APPS_SCRIPT_URL` | URL из шага 2 |
6. Нажми **Deploy**

Через 2 минуты получишь ссылку типа `https://marshall-dds.vercel.app`

---

## Шаг 5: Установи на телефон (PWA)

**iPhone (Safari):**
1. Открой ссылку в Safari
2. Нажми кнопку "Поделиться" (квадрат со стрелкой)
3. Выбери "На экран «Домой»"
4. Назови "Marshall DDS" → Добавить

**Android (Chrome):**
1. Открой ссылку в Chrome
2. Нажми ⋮ → "Установить приложение" или "На главный экран"

---

## Как пользоваться

1. **Оплатил что-то** → открыл приложение → нажал **+**
2. Выбрал тип (Выплата/Поступление) → ввёл сумму → выбрал статью
3. Операция сохранена в Firebase мгновенно
4. Раз в день/неделю: **Синхр.** → кнопка "Синхронизировать" → данные летят в Google Sheets

---

## Структура Google Sheets (создаётся автоматически)

Лист "Проводки" с колонками:
| Дата | Статья | Тип | Вид деятельности | Сумма | Комментарий | ID |

Далее можно подключить этот лист к твоей ДДС-таблице через СУММЕСЛИМН.
