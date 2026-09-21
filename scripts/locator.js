const SPREADSHEET_ID = "1qD3RkKpTRnbQIehM7NdcXwV7LEkfyhhghnQjJr9ipoE";

function doGet(e) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Events");
  if (!sheet) {
    return jsonResp({ error: "Events sheet not found" }, 500);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0] || [];
  const rows = data.slice(1);

  const items = rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      let val = row[i];
      if (h === "lat" || h === "lng") {
        if (typeof val === "string") {
          // strip degrees, direction, spaces, etc.
          val = val.replace(/[°NnSsEeWw\s]/g, "");
        }
        val = Number(val);
        if (Number.isNaN(val)) val = null;
      }
      obj[h] = val;
    });
    return obj;
  });

  return jsonResp({ items: items });
}

function jsonResp(data, status = 200) {
  const json = JSON.stringify(data);
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}