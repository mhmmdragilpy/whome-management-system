/* ============================================================
 *  Whome Management System – Google Apps Script Backend
 *  Database  : Google Sheets (DB_Pelanggan, DB_Transaksi)
 *  Endpoint  : Deployed as Web App
 * ============================================================ */

// ── Configuration ──────────────────────────────────────────────
const CONFIG = {
  API_KEY: 'WHOME_API_KEY_2026', // Change this to a strong random key
  SHEET_PELANGGAN: 'DB_Pelanggan',
  SHEET_TRANSAKSI: 'DB_Transaksi',
};

// ── Column definitions ─────────────────────────────────────────
const COLS_PELANGGAN = [
  'id_pelanggan', 'nama', 'alamat', 'no_hp',
  'paket', 'harga', 'status', 'tgl_daftar',
];

const COLS_TRANSAKSI = [
  'id_transaksi', 'id_pelanggan', 'nama', 'paket', 'harga',
  'periode', 'status_bayar', 'tgl_jatuh_tempo', 'tgl_bayar',
];

// ── Helpers ────────────────────────────────────────────────────

/**
 * Validate API key from request headers or query parameters.
 */
function isAuthorized(e) {
  // GAS Web App doGet/doPost receive parameters in e.parameter
  const key = (e && e.parameter && e.parameter.api_key) || '';
  return key === CONFIG.API_KEY;
}

/**
 * Build a JSON response with CORS headers.
 */
function jsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Convert a sheet's data (with headers) to an array of objects.
 */
function sheetToJson(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((header, idx) => {
      let val = data[i][idx];
      // Convert Date objects to ISO strings
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
      row[header] = val;
    });
    rows.push(row);
  }
  return rows;
}

/**
 * Generate a unique ID with a prefix.
 */
function generateId(prefix) {
  return prefix + '_' + new Date().getTime() + '_' + Math.random().toString(36).substr(2, 5);
}

// ── GET Handler ────────────────────────────────────────────────

function doGet(e) {
  // Auth check
  if (!isAuthorized(e)) {
    return jsonResponse({ success: false, error: 'Unauthorized' });
  }

  try {
    const action = (e.parameter && e.parameter.action) || 'fetch';
    const sheet = (e.parameter && e.parameter.sheet) || 'pelanggan';

    if (action === 'fetch') {
      let data;
      if (sheet === 'transaksi') {
        data = sheetToJson(CONFIG.SHEET_TRANSAKSI);
      } else if (sheet === 'pelanggan') {
        data = sheetToJson(CONFIG.SHEET_PELANGGAN);
      } else {
        return jsonResponse({ success: false, error: 'Invalid sheet parameter' });
      }
      return jsonResponse({ success: true, data: data });
    }

    if (action === 'summary') {
      const pelanggan = sheetToJson(CONFIG.SHEET_PELANGGAN);
      const transaksi = sheetToJson(CONFIG.SHEET_TRANSAKSI);

      const aktivCustomers = pelanggan.filter(p => p.status === 'Aktif').length;
      const totalCustomers = pelanggan.length;

      // Current month transactions
      const now = new Date();
      const currentPeriode = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM');
      const currentTransaksi = transaksi.filter(t => String(t.periode).startsWith(currentPeriode));

      const lunas = currentTransaksi.filter(t => t.status_bayar === 'Lunas');
      const belumBayar = currentTransaksi.filter(t => t.status_bayar === 'Belum Bayar');

      const totalRevenue = lunas.reduce((sum, t) => sum + Number(t.harga || 0), 0);
      const totalPending = belumBayar.reduce((sum, t) => sum + Number(t.harga || 0), 0);

      return jsonResponse({
        success: true,
        data: {
          totalCustomers: totalCustomers,
          aktivCustomers: aktivCustomers,
          totalRevenue: totalRevenue,
          totalPending: totalPending,
          lunasCount: lunas.length,
          belumBayarCount: belumBayar.length,
          currentPeriode: currentPeriode,
        },
      });
    }

    return jsonResponse({ success: false, error: 'Invalid action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ── POST Handler ───────────────────────────────────────────────

function doPost(e) {
  // Auth check
  if (!isAuthorized(e)) {
    return jsonResponse({ success: false, error: 'Unauthorized' });
  }

  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    // ── Konfirmasi Lunas ──
    if (action === 'konfirmasi_lunas') {
      const idTransaksi = body.id_transaksi;
      if (!idTransaksi) {
        return jsonResponse({ success: false, error: 'id_transaksi is required' });
      }

      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(CONFIG.SHEET_TRANSAKSI);
      if (!sheet) {
        return jsonResponse({ success: false, error: 'Sheet DB_Transaksi not found' });
      }

      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idCol = headers.indexOf('id_transaksi');
      const statusCol = headers.indexOf('status_bayar');
      const tglBayarCol = headers.indexOf('tgl_bayar');

      if (idCol === -1 || statusCol === -1 || tglBayarCol === -1) {
        return jsonResponse({ success: false, error: 'Invalid sheet structure' });
      }

      let found = false;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] === idTransaksi) {
          const now = new Date();
          const tglBayar = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
          sheet.getRange(i + 1, statusCol + 1).setValue('Lunas');
          sheet.getRange(i + 1, tglBayarCol + 1).setValue(tglBayar);
          found = true;
          break;
        }
      }

      if (!found) {
        return jsonResponse({ success: false, error: 'Transaction not found' });
      }

      return jsonResponse({ success: true, message: 'Payment confirmed successfully' });
    }

    // ── Add Customer ──
    if (action === 'add_customer') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(CONFIG.SHEET_PELANGGAN);
      if (!sheet) {
        return jsonResponse({ success: false, error: 'Sheet DB_Pelanggan not found' });
      }

      const id = generateId('PLG');
      const tglDaftar = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

      const row = [
        id,
        body.nama || '',
        body.alamat || '',
        body.no_hp || '',
        body.paket || '',
        Number(body.harga) || 0,
        'Aktif',
        tglDaftar,
      ];

      sheet.appendRow(row);
      return jsonResponse({ success: true, message: 'Customer added', id: id });
    }

    return jsonResponse({ success: false, error: 'Invalid action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ── Auto Generate Monthly Billing ──────────────────────────────

/**
 * Creates billing entries in DB_Transaksi for all "Aktif" customers.
 * Designed to run on the 1st of every month via a time-driven trigger.
 */
function autoGenerateMonthlyBilling() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pelangganSheet = ss.getSheetByName(CONFIG.SHEET_PELANGGAN);
  const transaksiSheet = ss.getSheetByName(CONFIG.SHEET_TRANSAKSI);

  if (!pelangganSheet || !transaksiSheet) {
    Logger.log('ERROR: Required sheets not found');
    return;
  }

  const pelangganData = pelangganSheet.getDataRange().getValues();
  if (pelangganData.length < 2) {
    Logger.log('No customer data found');
    return;
  }

  const pelangganHeaders = pelangganData[0];
  const now = new Date();
  const periode = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM');
  const tglJatuhTempo = periode + '-05'; // Due on the 5th

  // Check if billing for this period already exists
  const transaksiData = transaksiSheet.getDataRange().getValues();
  const transaksiHeaders = transaksiData[0];
  const periodeColIdx = transaksiHeaders.indexOf('periode');

  if (periodeColIdx !== -1) {
    const existingPeriods = transaksiData.slice(1).map(row => String(row[periodeColIdx]));
    if (existingPeriods.includes(periode)) {
      Logger.log('Billing for period ' + periode + ' already generated. Skipping.');
      return;
    }
  }

  // Generate billing for each active customer
  const idIdx = pelangganHeaders.indexOf('id_pelanggan');
  const namaIdx = pelangganHeaders.indexOf('nama');
  const paketIdx = pelangganHeaders.indexOf('paket');
  const hargaIdx = pelangganHeaders.indexOf('harga');
  const statusIdx = pelangganHeaders.indexOf('status');

  let count = 0;

  for (let i = 1; i < pelangganData.length; i++) {
    const row = pelangganData[i];
    if (row[statusIdx] !== 'Aktif') continue;

    const idTransaksi = generateId('TRX');
    const newRow = [
      idTransaksi,
      row[idIdx],
      row[namaIdx],
      row[paketIdx],
      row[hargaIdx],
      periode,
      'Belum Bayar',
      tglJatuhTempo,
      '',  // tgl_bayar empty
    ];

    transaksiSheet.appendRow(newRow);
    count++;
  }

  Logger.log('Generated ' + count + ' billing entries for period ' + periode);
}

// ── Database Initialization ────────────────────────────────────

/**
 * Run this once to create the DB sheets with proper headers.
 */
function initializeDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create DB_Pelanggan if not exists
  let pelangganSheet = ss.getSheetByName(CONFIG.SHEET_PELANGGAN);
  if (!pelangganSheet) {
    pelangganSheet = ss.insertSheet(CONFIG.SHEET_PELANGGAN);
    pelangganSheet.appendRow(COLS_PELANGGAN);
    pelangganSheet.getRange(1, 1, 1, COLS_PELANGGAN.length)
      .setFontWeight('bold')
      .setBackground('#4285f4')
      .setFontColor('#ffffff');

    // Add sample data
    pelangganSheet.appendRow([
      'PLG_001', 'Ahmad Fauzi', 'Jl. Melati No. 10', '081234567890',
      'Paket 10 Mbps', 100000, 'Aktif', '2025-01-15',
    ]);
    pelangganSheet.appendRow([
      'PLG_002', 'Siti Nurhaliza', 'Jl. Mawar No. 5', '082345678901',
      'Paket 20 Mbps', 150000, 'Aktif', '2025-02-01',
    ]);
    pelangganSheet.appendRow([
      'PLG_003', 'Budi Santoso', 'Jl. Anggrek No. 3', '083456789012',
      'Paket 50 Mbps', 250000, 'Aktif', '2025-03-10',
    ]);
    pelangganSheet.appendRow([
      'PLG_004', 'Dewi Lestari', 'Jl. Dahlia No. 7', '084567890123',
      'Paket 30 Mbps', 200000, 'Nonaktif', '2025-01-20',
    ]);

    Logger.log('DB_Pelanggan created with sample data');
  } else {
    Logger.log('DB_Pelanggan already exists');
  }

  // Create DB_Transaksi if not exists
  let transaksiSheet = ss.getSheetByName(CONFIG.SHEET_TRANSAKSI);
  if (!transaksiSheet) {
    transaksiSheet = ss.insertSheet(CONFIG.SHEET_TRANSAKSI);
    transaksiSheet.appendRow(COLS_TRANSAKSI);
    transaksiSheet.getRange(1, 1, 1, COLS_TRANSAKSI.length)
      .setFontWeight('bold')
      .setBackground('#34a853')
      .setFontColor('#ffffff');

    Logger.log('DB_Transaksi created');
  } else {
    Logger.log('DB_Transaksi already exists');
  }

  // Auto-size columns
  pelangganSheet.autoResizeColumns(1, COLS_PELANGGAN.length);
  transaksiSheet.autoResizeColumns(1, COLS_TRANSAKSI.length);

  Logger.log('Database initialization complete!');
}

// ── Trigger Setup ──────────────────────────────────────────────

/**
 * Run this once to set up the monthly billing trigger.
 * Fires on the 1st of every month between 00:00-01:00.
 */
function setupTrigger() {
  // Remove existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'autoGenerateMonthlyBilling') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new monthly trigger
  ScriptApp.newTrigger('autoGenerateMonthlyBilling')
    .timeBased()
    .onMonthDay(1)
    .atHour(0)
    .create();

  Logger.log('Monthly billing trigger set for the 1st of every month at 00:00-01:00');
}
