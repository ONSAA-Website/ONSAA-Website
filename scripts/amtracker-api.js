const SPREADSHEET_ID = "1YNnDNz4w_Tu9DDZckf_jtRn-6e4aUKPd8WocnlW22o0";

// allowlist of Canadian higher-ed domains + .edu
const ALLOWED_DOMAINS = [
  "mail.utoronto.ca",
  "utoronto.ca",
  "mcgill.ca",
  "ubc.ca",
  "queensu.ca",
  "yorku.ca",
  "carleton.ca",
  "uottawa.ca",
  "ualberta.ca",
  "ucalgary.ca",
  "umanitoba.ca",
  "usask.ca",
  "mun.ca",
  "upei.ca",
  "acadiau.ca",
  "dal.ca",
  "concordia.ca",
  "mcmaster.ca",
  "uwaterloo.ca",
  "uoguelph.ca",
  "uwindsor.ca",
  "brocku.ca",
  "laurier.ca",
  "ocad.ca",
  "ryerson.ca",
  "tmu.ca",
  "sfu.ca",
  "uvic.ca",
  "unbc.ca",
  "viu.ca",
  "kpu.ca",
  "bcit.ca",
  "langara.ca",
  "capilanou.ca",
  "emilycarr.ca"
];

// entry point for POST requests
function doPost(e) {
  const action = e.parameter.action;

  if (action === "request-verify") {
    return handleRequestVerify(e);
  }
  
  if (action === "submit-exemption") {
    return handleSubmitExemption(e);
  }

  if (action === "report-submission") {
    return handleReport(e);
  }

  return jsonResp({ error: "Unknown action: " + action }, 400);
}

// entry point for GET requests
function doGet(e) {
  const action = e.parameter.action;
  const token = e.parameter.token;
  const email = e.parameter.email;

  if (action === "list-exemptions") {
    return handleListExemptions();
  }

  if (action === "verify-email" && token && email) {
    return handleVerifyEmail(token, email, e.parameter.scope);
  }

    if (action === "check-verify" && email) {
    return handleCheckVerify(email.toLowerCase().trim());
  }

  if (action === "check-token" && email && token) {
    return handleCheckToken(email, token, e.parameter.scope);
  }

  return jsonResp({ status: "ok" });
}


function handleListExemptions() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Submissions");
  if (!sheet) {
    return jsonResp({ error: "Submissions sheet not found" }, 500);
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return jsonResp({ items: [] });
  }

  const headers = data[0];
  const items = data.slice(1).map((row) => ({
    institution: row[headers.indexOf("institution")] || "",
    course_code: row[headers.indexOf("course_code")] || "",
    course_name: row[headers.indexOf("course_name")] || "",
    exemption_type: row[headers.indexOf("exemption_type")] || "",
    description: row[headers.indexOf("description")] || "",
    info: row[headers.indexOf("info")] || ""
  }));

  return jsonResp({ items });
}


function handleReport(e) {
  try {
    const params = JSON.parse(e.postData.contents);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Reports"); 

    if (!sheet) {
      return jsonResp({ error: "Reports sheet not found" });
    }

    const email = params.submitter_email;
    const token = String(params.verification_token || "");
    if (!isValidVerificationSession(email, token, "report")) {
      return jsonResp(
        { error: "Your verification session has expired. Please refresh the page and verify your email again." },
        403
      );
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    const row = {};
    row.course_name = params.course_name;
    row.reason = params.reason_select || "";
    row.instructor_contact = params.instructor_contact || "";
    row.other_explanation = params.other_explanation || "";
    row.reporter_email = email;

    // 5 submissions per hour per email
    const limit = checkEmailRateLimit(email, 3600000, 5);
    if (!limit.allowed) {
      return jsonResp({ error: limit.error }, 429);
    }
    
    const rowData = headers.map(h => row[h] ?? "");

    sheet.appendRow(rowData);

    return jsonResp({ success: true });
  }
  catch (err) {
    return jsonResp({ error: err.message || "Submission failed" });
  }
}


function handleSubmitExemption(e) {
  const lock = LockService.getScriptLock();
  // one submission written at a time
  lock.tryLock(10000);

  try {
    const params = JSON.parse(e.postData.contents);

    const email = String(params.submitter_email || "").toLowerCase().trim();
    const token = String(params.verification_token || "");

    if (!isValidVerificationSession(email, token, "submit")) {
      return jsonResp(
        { error: "Your verification session has expired. Please verify your email again." },
        403
      );
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Submissions"); 

    if (!sheet) {
      return jsonResp({ error: "Submissions sheet not found" });
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    const row = {};
    row.created_at = new Date().toISOString();
    row.institution = params.institution || "";
    row.institution_id = params.institution_id || "";
    row.course_code = params.course_code || "";
    row.course_name = params.course_name || "";
    row.exemption_type = params.exemption_type || "";
    row.description = params.description || "";
    row.submitter_name = params.submitter_name || "";
    row.submitter_email = email || "";
    row.vow = params.vow === true ? "TRUE" : "FALSE";
    row.info = params.info || "";
    row.email_verified = "TRUE";

    // 5 submissions per hour per email
    const limit = checkEmailRateLimit(email, 3600000, 5);
    if (!limit.allowed) {
      return jsonResp({ error: limit.error }, 429);
    }

    const rowData = headers.map(h => row[h] ?? "");

    sheet.appendRow(rowData);

    return jsonResp({ success: true });

  } catch (err) {
    return jsonResp({ error: err.message || "Submission failed" });
  } finally {
    lock.releaseLock();
  }
}

function checkEmailRateLimit(email, windowMs, maxPerWindow) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let rlSheet = ss.getSheetByName("rateLimits");
  if (!rlSheet) {
    rlSheet = ss.insertSheet("rateLimits");
    rlSheet.appendRow(["email", "count", "reset_at"]); // headers
  }

  const data = rlSheet.getDataRange().getValues();
  const headers = data[0] || [];
  const emailIndex = headers.indexOf("email");
  const countIndex = headers.indexOf("count");
  const resetIndex = headers.indexOf("reset_at");

  const now = new Date();
  let rowIdx = -1;

  // find existing row for this email
  for (let i = 1; i < data.length; i++) {
    if ((data[i][emailIndex] || "").toLowerCase() === email.toLowerCase()) {
      rowIdx = i + 1; // 1-based row number
      break;
    }
  }

  if (rowIdx === -1) {
    // new email: start count at 1
    rlSheet.appendRow([email, 1, new Date(now.getTime() + windowMs).toISOString()]);
    return { allowed: true };
  }

  const count = data[rowIdx - 1][countIndex] || 0;
  const resetAt = new Date(data[rowIdx - 1][resetIndex]);

  if (now > resetAt) {
    // window expired: reset
    rlSheet.getRange(rowIdx, countIndex + 1).setValue(1);
    rlSheet.getRange(rowIdx, resetIndex + 1).setValue(new Date(now.getTime() + windowMs).toISOString());
    return { allowed: true };
  }

  if (count >= maxPerWindow) {
    return { allowed: false, error: "Too many submissions from this email. Please try again later." };
  }

  // increment count
  rlSheet.getRange(rowIdx, countIndex + 1).setValue(count + 1);
  return { allowed: true };
}

/* helper: checking for duplicate submissions; UPDATE: valid dupicates are possible
function duplicateRow(checkRow) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Submissions"); 

  var lastRow = sheet.getLastRow();

  // loop from the last row up to row 2; assuming duplicate submissions are more likely back to back
  for (var i = lastRow; i >= 2; i--) {
    var rowValues = sheet.getRange(i, 1, 1, sheet.getLastColumn()).getValues();
    // each set of course : institution : exemption : email type must be unique 
    if ((checkRow[0] === rowValues[0]) & (checkRow[1] === rowValues[1]) & (checkRow[3] === rowValues[3]))
  }
}
*/

// helper: JSON response
function jsonResp(data, status = 200) {
  const json = JSON.stringify(data);
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

// helper: HTML response
function htmlResp(html) {
  return HtmlService
    .createHtmlOutput(html);
}

// helper: get verifications sheet
function getVerifSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName("verifications");
  if (!sheet) {
    sheet = ss.insertSheet("verifications");
    sheet.appendRow(["email", "token", "scope", "verified", "created_at", "expires_at"]);
  }
  return sheet;
}

// check if email domain is allowed (institutional emails only)
function isAllowedDomain(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;

  if (domain.endsWith(".edu")) return true;
  if (ALLOWED_DOMAINS.includes(domain) || ALLOWED_DOMAINS.includes(domain.split(".").slice(-2).join("."))) return true;
  if (domain.endsWith(".edu.ca") || domain.endsWith(".ac.ca")) return true;

  return false;
}

// send verification email (request-verify)
function handleRequestVerify(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const email = String(data.email || "").toLowerCase().trim();
    const scope = data.scope === "report" ? "report" : "submit";

    const existingEmail = String(data.existing_email || "")
      .toLowerCase()
      .trim();

    const existingToken = String(data.existing_token || "");

    if (!email || !email.includes("@")) {
      return jsonResp({ error: "Invalid email" }, 400);
    }

    if (!isAllowedDomain(email)) {
      return jsonResp(
        { error: "Email domain not recognized as a Canadian higher-education institution." },
        403
      );
    }

    const sessionActive =
      existingEmail === email &&
      isValidVerificationSession(existingEmail, existingToken, scope);

    if (sessionActive) {
      return jsonResp({
        success: true,
        alreadyVerified: true
      });
    }

    const verificationLimit = checkEmailRateLimit(
      "verify:" + email,
      60 * 60 * 1000,
      5
    );

    if (!verificationLimit.allowed) {
      return jsonResp(
        { error: "Too many verification emails requested. Please try again later." },
        429
      );
    }

    const token = Utilities.getUuid();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 60 * 60 * 1000);

    const verifSheet = getVerifSheet();

    verifSheet.appendRow([
      email,
      token,
      scope,
      false,
      createdAt,
      expiresAt
    ]);

    const verifyUrl =
      "https://autumn-term-3542.chrollobrollo.workers.dev/exemption/verify" +
      "?token=" + encodeURIComponent(token) +
      "&email=" + encodeURIComponent(email) +
      "&scope=" + encodeURIComponent(scope);

    GmailApp.sendEmail(
      email,
      "Verify your email – Academic Exemption Tracker",
      "Click the link to verify your email: " + verifyUrl,
      {
        htmlBody:
          "<p>Click the link below to verify your email address:</p>" +
          '<p><a href="' + verifyUrl + '">' + verifyUrl + "</a></p>" +
          "<p>If you did not request this, you can ignore this email.</p>"
      }
    );

    return jsonResp({ success: true, alreadyVerified: false });
  } catch (err) {
    return jsonResp({ error: err.message || "Could not request verification." }, 500);
  }
}

// handle email verification request (request-verify)
function handleVerifyEmail(token, email, scope) {
  const sheet = getVerifSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const emailIdx = headers.indexOf("email");
  const tokenIdx = headers.indexOf("token");
  const scopeIdx = headers.indexOf("scope");
  const verifiedIdx = headers.indexOf("verified");
  const expiresIdx = headers.indexOf("expires_at");

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    const validToken = row[tokenIdx] === token;
    const validScope = row[scopeIdx] === scope;
    const notExpired = new Date(row[expiresIdx]) > new Date();
    const normEmail = String(email).toLowerCase().trim();

    if (
      validToken &&
      validScope &&
      String(row[emailIdx]).toLowerCase().trim() === normEmail &&
      notExpired
    ) {
      sheet.getRange(i + 1, verifiedIdx + 1).setValue(true);

      
      const redirectUrl =
        "https://localhost:4321/exemption" +
        "?verified=1" +
        "&email=" + encodeURIComponent(email) +
        "&token=" + encodeURIComponent(token) +
        "&scope=" + encodeURIComponent(scope);

      return htmlResp(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Email verified</title>
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
        </head>
        <body>
          <p>Email verified successfully: <strong>${email}</strong></p>
          <p>Redirecting to the form…</p>
          <p>If you are not redirected within 2 seconds, <a href="${redirectUrl}" target="_top">click here</a>.</p>
          <script>
            // Force redirect
            window.top.location.href="${redirectUrl}";
          </script>
        </body>
      </html>
    `);
    }
  }
}

// check if email+token pair is valid and verified
function handleCheckToken(email, token, scope) {
  try {
    const verifSheet = getVerifSheet();
    const vdata = verifSheet.getDataRange().getValues();
    const headers = vdata[0];

    const emailIdx = headers.indexOf("email");
    const tokenIdx = headers.indexOf("token");
    const verifiedIdx = headers.indexOf("verified");

    if (emailIdx === -1 || tokenIdx === -1 || verifiedIdx === -1) {
      return jsonResp({ verified: false });
    }

    const verified = isValidVerificationSession(email, token, scope);

    return jsonResp({ verified });
  } catch (err) {
    return jsonResp({ verified: false });
  }
}

function isValidVerificationSession(email, token, scope) {
  const sheet = getVerifSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const emailIdx = headers.indexOf("email");
  const tokenIdx = headers.indexOf("token");
  const scopeIdx = headers.indexOf("scope");
  const verifiedIdx = headers.indexOf("verified");
  const expiresIdx = headers.indexOf("expires_at");

  const normalizedEmail = String(email || "").toLowerCase().trim();

  return data.slice(1).some((row) => {
    return (
      String(row[emailIdx]).toLowerCase().trim() === normalizedEmail &&
      row[tokenIdx] === token &&
      row[scopeIdx] === scope &&
      String(row[verifiedIdx]).toUpperCase() === "TRUE" &&
      new Date(row[expiresIdx]) > new Date()
    );
  });
}
