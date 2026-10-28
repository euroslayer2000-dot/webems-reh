/**
 * FT EMS REH 2570 — Google Apps Script web app (API for the Next.js admin).
 *
 * Paste into Extensions > Apps Script of the Google Sheet, set TOKEN below,
 * run setupSheets() once, then Deploy > New deployment > Web app.
 * See apps-script/README.md for the step-by-step guide.
 */

// ===== CONFIG (edit to match the sheet) =====
var TOKEN = 'CHANGE_ME_TO_A_LONG_RANDOM_STRING'; // must equal FT_EMS_SCRIPT_TOKEN in .env

var SUMMARY_SHEET = 'FT EMS REH 2570';
// Monthly tab names, fiscal-year order (Oct..Sep). Must match the tab names exactly.
var MONTH_SHEETS = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];

var TRACKS = ['STEMI', 'STROKE', 'SEPSIS', 'HIP', 'OB-GYN', 'PED', 'SHI', 'TRAUMA'];
// Extra indicators: key -> label written in the monthly sheets (value goes in column H as a %).
var INDICATORS = {
  ROSC: 'อัตราการ CPR ที่มี ROSC ในผู้ป่วย OHCA',
  T10: 'ร้อยละการเข้าถึงผู้ป่วยของหน่วย EMS ภายใน 10 นาที หลังแจ้งเหตุ',
  T8: 'ร้อยละการเข้าถึงผู้ป่วยของหน่วย EMS ภายใน 8 นาที',
  T2: 'ร้อยละการเข้าถึงผู้ป่วยของหน่วย EMS ภายใน 2 นาที'
};
var INDICATOR_KEYS = ['ROSC', 'T10', 'T8', 'T2'];

// Monthly sheets: first columns searched for the row label; B..E = Walk in, ALS, BLS, EMR; H = result %.
var LABEL_COLS = 3;      // search labels in columns A..C
var COL_WALKIN = 2;      // B (C, D, E follow). F, G, H keep their formulas.
var COL_VALUE = 8;       // H

// Summary sheet: first data row (STEMI) and first month column (G = Oct) of the 12 x 12 grid.
var SUMMARY_FIRST_ROW = 6;
var SUMMARY_FIRST_COL = 7;
var SUMMARY_ROWS = 12;
// ============================================

function doGet() {
  return json_({ ok: true, data: 'FT EMS API is running' });
}

function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);
    if (req.token !== TOKEN) return json_({ ok: false, error: 'Unauthorized' });

    switch (req.action) {
      case 'getMonthly': return json_({ ok: true, data: getMonthly_(req.month, req.track) });
      case 'saveMonthly': saveMonthly_(req); return json_({ ok: true, data: null });
      case 'getIndicator': return json_({ ok: true, data: getIndicator_(req.month, req.indicator) });
      case 'saveIndicator': saveIndicator_(req); return json_({ ok: true, data: null });
      case 'summary': return json_({ ok: true, data: summary_() });
      default: return json_({ ok: false, error: 'Unknown action' });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------- helpers ----------

function monthSheet_(month) {
  var name = MONTH_SHEETS[month];
  if (name === undefined) throw new Error('เดือนไม่ถูกต้อง');
  var sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet) throw new Error('ไม่พบชีตเดือน "' + name + '"');
  return sheet;
}

/** Row number (1-based) whose A..C cell equals `label`, or 0. */
function findRow_(sheet, label) {
  var last = sheet.getLastRow();
  if (last < 1) return 0;
  var values = sheet.getRange(1, 1, last, LABEL_COLS).getDisplayValues();
  var want = String(label).trim().toLowerCase();
  for (var r = 0; r < values.length; r++) {
    for (var c = 0; c < LABEL_COLS; c++) {
      if (String(values[r][c]).trim().toLowerCase() === want) return r + 1;
    }
  }
  return 0;
}

function requireRow_(sheet, label) {
  var row = findRow_(sheet, label);
  if (!row) throw new Error('ไม่พบแถว "' + label + '" ในชีต "' + sheet.getName() + '"');
  return row;
}

function validCount_(v, label) {
  if (typeof v !== 'number' || v % 1 !== 0 || v < 0) throw new Error(label + ' ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป');
  return v;
}

/** Sheets Tables with typed columns refuse number-format changes; the value still shows fine, so ignore that. */
function percentFormat_(range) {
  // Apps Script buffers writes, so the typed-column error only surfaces at the next
  // flush/read. Flush before (commit earlier writes) and inside the try (catch it here).
  SpreadsheetApp.flush();
  try {
    range.setNumberFormat('0.00%');
    SpreadsheetApp.flush();
  } catch (e) { /* typed column: keep existing format */ }
}

/** Runs fn; on failure rethrows with the cell/step so setup errors say where they happened. */
function step_(where, fn) {
  try { return fn(); } catch (e) { throw new Error(where + ' -> ' + (e && e.message ? e.message : e)); }
}

function numOrNull_(v) {
  return typeof v === 'number' && !isNaN(v) ? v : null;
}

// ---------- monthly fast track counts ----------

function getMonthly_(month, track) {
  if (TRACKS.indexOf(track) < 0) throw new Error('Fast track ไม่ถูกต้อง');
  var sheet = monthSheet_(month);
  var row = requireRow_(sheet, track);
  var v = sheet.getRange(row, COL_WALKIN, 1, 4).getValues()[0];
  if (v.every(function (x) { return x === '' || x === null; })) return null;
  return { walkin: Number(v[0]) || 0, als: Number(v[1]) || 0, bls: Number(v[2]) || 0, emr: Number(v[3]) || 0 };
}

function saveMonthly_(req) {
  if (TRACKS.indexOf(req.track) < 0) throw new Error('Fast track ไม่ถูกต้อง');
  var values = [[
    validCount_(req.walkin, 'Walk in'),
    validCount_(req.als, 'ALS'),
    validCount_(req.bls, 'BLS'),
    validCount_(req.emr, 'EMR')
  ]];
  var sheet = monthSheet_(req.month);
  var row = requireRow_(sheet, req.track);
  // Only B..E are written; F, G, H keep the sheet's own formulas.
  var range = sheet.getRange(row, COL_WALKIN, 1, 4);
  range.setValues(values);
}

// ---------- extra indicators (percent) ----------

function getIndicator_(month, key) {
  if (!INDICATORS[key]) throw new Error('ตัวชี้วัดไม่ถูกต้อง');
  var sheet = monthSheet_(month);
  var row = requireRow_(sheet, INDICATORS[key]);
  var v = numOrNull_(sheet.getRange(row, COL_VALUE).getValue());
  return v === null ? null : Math.round(v * 10000) / 100; // fraction -> percent
}

function saveIndicator_(req) {
  if (!INDICATORS[req.indicator]) throw new Error('ตัวชี้วัดไม่ถูกต้อง');
  if (typeof req.percent !== 'number' || isNaN(req.percent) || req.percent < 0 || req.percent > 100) {
    throw new Error('ร้อยละต้องอยู่ระหว่าง 0–100');
  }
  var sheet = monthSheet_(req.month);
  var row = requireRow_(sheet, INDICATORS[req.indicator]);
  var cell = sheet.getRange(row, COL_VALUE);
  percentFormat_(cell);
  cell.setValue(req.percent / 100);
}

// ---------- summary ----------

/** 12 x 12 grid of percentages (0–100) or null, read from the summary sheet. */
function summary_() {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SUMMARY_SHEET);
  if (!sheet) throw new Error('ไม่พบชีตสรุป "' + SUMMARY_SHEET + '"');
  var values = sheet.getRange(SUMMARY_FIRST_ROW, SUMMARY_FIRST_COL, SUMMARY_ROWS, 12).getValues();
  return values.map(function (row) {
    return row.map(function (v) {
      var n = numOrNull_(v);
      return n === null ? null : Math.round(n * 10000) / 100;
    });
  });
}

// ---------- one-time setup (run manually from the editor) ----------

/**
 * Adds the 4 indicator rows to every monthly sheet (right below the TRAUMA row)
 * and (re)writes summary rows 9-12 (SUMMARY_FIRST_ROW + 8 .. + 11) so they
 * link to those rows and the "รวม (%)" column averages the months with data.
 * Safe to re-run. Refuses to overwrite non-empty cells.
 */
function setupSheets() {
  var ss = SpreadsheetApp.getActive();
  var rows = {}; // key -> row number (same in every monthly sheet; checked below)

  MONTH_SHEETS.forEach(function (name, m) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) throw new Error('ไม่พบชีตเดือน "' + name + '"');
    var trauma = requireRow_(sheet, 'TRAUMA');
    INDICATOR_KEYS.forEach(function (key, i) {
      var row = findRow_(sheet, INDICATORS[key]);
      if (!row) {
        row = trauma + 1 + i;
        var existing = sheet.getRange(row, 1, 1, COL_VALUE).getValues()[0];
        var busy = existing.some(function (x) { return x !== '' && x !== null; });
        if (busy) throw new Error('ชีต "' + name + '" แถว ' + row + ' ไม่ว่าง จึงเพิ่มแถวตัวชี้วัดไม่ได้ — ย้ายหรือเคลียร์แถวนี้ก่อน');
        step_('เขียนชื่อตัวชี้วัดที่ ' + name + '!A' + row, function () { sheet.getRange(row, 1).setValue(INDICATORS[key]); });
        percentFormat_(sheet.getRange(row, COL_VALUE));
      }
      if (m > 0 && rows[key] !== row) throw new Error('แถว "' + INDICATORS[key] + '" อยู่คนละแถวในแต่ละเดือน (' + name + ')');
      rows[key] = row;
    });
  });

  var summary = ss.getSheetByName(SUMMARY_SHEET);
  if (!summary) throw new Error('ไม่พบชีตสรุป "' + SUMMARY_SHEET + '"');
  INDICATOR_KEYS.forEach(function (key, i) {
    var r = SUMMARY_FIRST_ROW + 8 + i;
    var formulas = MONTH_SHEETS.map(function (name) {
      var ref = "'" + name + "'!H" + rows[key];
      return '=IF(' + ref + '="","",' + ref + ')';
    });
    var months = summary.getRange(r, SUMMARY_FIRST_COL, 1, 12);
    step_('เขียนสูตรชีตสรุปแถว ' + r, function () { months.setFormulas([formulas]); });
    percentFormat_(months);
    var first = summary.getRange(r, SUMMARY_FIRST_COL).getA1Notation();
    var last = summary.getRange(r, SUMMARY_FIRST_COL + 11).getA1Notation();
    var total = summary.getRange(r, SUMMARY_FIRST_COL + 12);
    step_('เขียนสูตรรวมชีตสรุปแถว ' + r, function () { total.setFormula('=IFERROR(AVERAGE(' + first + ':' + last + '),"")'); });
    percentFormat_(total);
  });
  SpreadsheetApp.flush();
}
