function doGet(e) {
  // cached count reduces latency; useful for high traffic
  const cache = CacheService.getScriptCache();
  const cached = cache.get("signature_count");
  if (cached !== null) {
    console.log(Number(cached))
    return ContentService
      .createTextOutput(JSON.stringify({ count: Number(cached) }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const shareSpreadsheetId = "";
  const tableSpreadsheetId = "";
  const columnRange = "A2:A";

  try {
    const signatures = countNonEmptyRows(shareSpreadsheetId, columnRange) + countNonEmptyRows(tableSpreadsheetId, columnRange);
    console.log(signatures);

    // 60 second cache
    cache.put("signature_count", String(signatures), 60);

    /* const signatures = 
    Number(SpreadsheetApp.openById(shareSpreadsheetId).getSheets()[0].getRange(rangeName).getValue() || 0)
    + Number(SpreadsheetApp.openById(tableSpreadsheetId).getSheets()[0].getRange(rangeName).getValue() || 0);

    console.log(Number(Sheets.Spreadsheets.Values.get(shareSpreadsheetId, rangeName,).values));
    console.log(Number(Sheets.Spreadsheets.Values.get(tableSpreadsheetId, rangeName,).values));
    console.log(signatures);
    */

    if (!signatures) {
      return;
    }

    const data = {
      count: signatures
    };

    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
      return ContentService
      .createTextOutput(JSON.stringify({ count : 0 }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// calculation done in script
function countNonEmptyRows(spreadsheetId, range) {
  const rows = Sheets.Spreadsheets.Values.get(spreadsheetId, range).values || [];
  return rows.filter(row => row[0] !== undefined && row[0] !== "").length;
}
