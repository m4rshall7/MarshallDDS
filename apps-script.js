// ═══════════════════════════════════════════════════════════
// Marshall DDS — Google Apps Script
// Вставь этот код в: Google Sheets → Расширения → Apps Script
// Затем: Развернуть → Новое развёртывание → Веб-приложение
// Доступ: Все (анонимные пользователи)
// ═══════════════════════════════════════════════════════════

const SHEET_NAME = 'Проводки';   // название листа куда пишем
const HEADER_ROW = 1;             // строка с заголовками

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const transactions = data.transactions || [];

    if (transactions.length === 0) {
      return jsonResponse({ ok: true, added: 0 });
    }

    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let   sheet = ss.getSheetByName(SHEET_NAME);

    // Создаём лист если его нет
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Заголовки
      sheet.getRange(1, 1, 1, 7).setValues([[
        'Дата', 'Статья', 'Тип', 'Вид деятельности', 'Сумма', 'Комментарий', 'ID'
      ]]);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
      sheet.getRange(1, 1, 1, 7).setBackground('#0F3460');
      sheet.getRange(1, 1, 1, 7).setFontColor('#FFFFFF');
    }

    // Находим последнюю строку с данными
    const lastRow = getLastDataRow(sheet);

    // Добавляем строки
    const rows = transactions.map(tx => [
      tx.date,
      tx.category,
      tx.type,
      tx.activity,
      tx.amount,
      tx.comment || '',
      tx.id || '',
    ]);

    if (rows.length > 0) {
      sheet.getRange(lastRow + 1, 1, rows.length, 7).setValues(rows);

      // Форматируем колонку суммы
      sheet.getRange(lastRow + 1, 5, rows.length, 1)
        .setNumberFormat('#,##0');

      // Цвет строк по типу
      rows.forEach((row, i) => {
        const r = lastRow + 1 + i;
        const color = row[2] === 'Поступление' ? '#D5F5E3' : '#FADBD8';
        sheet.getRange(r, 1, 1, 7).setBackground(color);
      });
    }

    return jsonResponse({ ok: true, added: rows.length });

  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

function doGet(e) {
  return jsonResponse({ ok: true, status: 'Marshall DDS Apps Script работает' });
}

function getLastDataRow(sheet) {
  const data = sheet.getDataRange().getValues();
  // Ищем последнюю строку где есть дата (колонка A)
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][0] !== '' && data[i][0] !== 'Дата') {
      return i + 1;
    }
  }
  return HEADER_ROW; // вернуть строку заголовка если данных нет
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
