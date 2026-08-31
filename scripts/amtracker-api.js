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
  return jsonResp({ error: "Unknown action" }, 400);
}

// entry point for GET requests
function doGet(e) {
  const action = e.parameter.action;
  const token = e.parameter.token;
  const email = e.parameter.email;

  if (action === "verify-email" && token) {
    return handleVerifyEmail(token);
  }

  if (action === "check-verify" && email) {
    return handleCheckVerify(email.toLowerCase().trim());
  }

  if (action === "check-token" && email && token) {
    return handleCheckToken(email, token);
  }

  return jsonResp({ status: "ok" });
}

function handleSubmitExemption(e) {
  const lock = LockService.getScriptLock();
  // one submission written at a time
  lock.tryLock(10000);

  try {
    Logger.log("=== handleSubmitExemption called ===");
    Logger.log("e.parameter:", e.parameter);
    Logger.log("e.postData:", e.postData);
    const params = JSON.parse(e.postData.contents);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Submissions"); // or your sheet name

    if (!sheet) {
      return jsonResp({ error: "Submissions sheet not found" });
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    const row = {};
    row.timestamp = new Date().toISOString();
    row.institution = params.institution || "";
    row.institution_id = params.institution_id || "";
    row.course_code = params.course_code || "";
    row.course_name = params.course_name || "";
    row.exemption_type = params.exemption_type || "";
    row.description = params.description || "";
    row.submitter_name = params.submitter_name || "";
    row.submitter_email = params.submitter_email || "";
    row.vow = params.vow === true ? "TRUE" : "FALSE";
    row.info = params.info || "";

    const rowData = headers.map(h => row[h] ?? "");

    sheet.appendRow(rowData);

    return jsonResp({ success: true });

  } catch (err) {
    return jsonResp({ error: err.message || "Submission failed" });
  } finally {
    lock.releaseLock();
  }
}

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
    sheet.appendRow(["email", "token", "verified", "created_at"]);
  }
  return sheet;
}

// check if email domain is allowed (institutional emails only)
function isAllowedDomain(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;

  if (domain.endsWith(".edu")) return true;
  if (ALLOWED_DOMAINS.includes(domain) || ALLOWED_DOMAINS.includes(domain.split(".")[1])) return true;
  if (domain.endsWith(".edu.ca") || domain.endsWith(".ac.ca")) return true;

  return false;
}

// send verification email (request-verify)
function handleRequestVerify(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const email = (body.email || "").toLowerCase().trim();

    if (!email || !email.includes("@")) {
      return jsonResp({ error: "Invalid email" }, 400);
    }

    if (!isAllowedDomain(email)) {
      return jsonResp(
        { error: "Email domain not recognized as a Canadian higher-education institution." },
        403
      );
    }

    const verifSheet = getVerifSheet();
    const data = verifSheet.getDataRange().getValues();
    const headers = data[0];
    const emailIdx = headers.indexOf("email");
    const verifiedIdx = headers.indexOf("verified");

    // if already verified, say so
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[emailIdx] === email && row[verifiedIdx] === true) {
        return jsonResp({ success: true, alreadyVerified: true });
      }
    }

    // create token and store
    const token = Utilities.getUuid();
    verifSheet.appendRow([email, token, false, new Date()]);


    // proxy URL for verification + redirect (cloudflare worker)
    const verifyUrl = "https://autumn-term-3542.chrollobrollo.workers.dev/exemption/verify?token=" + encodeURIComponent(token) + "&email=" + encodeURIComponent(email);

    GmailApp.sendEmail(
      email,
      "Verify your email – Academic Exemption Tracker",
      "Click the link to verify your email: " + verifyUrl,
      {
        htmlBody: `
          <p>Click the link below to verify your email address:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        `
      }
    );

    return jsonResp({ success: true, alreadyVerified: false });
  } catch (err) {
    return jsonResp({ error: err.message }, 500);
  }
}

// handle email verification request (request-verify)
function handleVerifyEmail(token) {
  try {
    const verifSheet = getVerifSheet();
    const data = verifSheet.getDataRange().getValues();
    const headers = data[0];

    const tokenIdx = headers.indexOf("token");
    const emailIdx = headers.indexOf("email");
    const verifiedIdx = headers.indexOf("verified");

    if (tokenIdx === -1 || verifiedIdx === -1 || emailIdx === -1) {
      return htmlResp("Error: verification sheet structure is invalid.");
    }

    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][tokenIdx] === token) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      return htmlResp("Invalid or expired verification link.");
    }

    verifSheet.getRange(rowIndex, verifiedIdx + 1).setValue(true);
    const email = data[rowIndex - 1][emailIdx];
    
    const redirectBase = "http://localhost:4321/exemption";
    const redirectUrl =
      redirectBase +
      "?signal-verify=1&email=" +
      encodeURIComponent(email) +
      "&token=" +
      encodeURIComponent(token);

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
  } catch (err) {
    return htmlResp("Error verifying email: " + err.message);
  }
}

// check if an email is verified (legacy)
function handleCheckVerify(email) {
  try {
    const verifSheet = getVerifSheet();
    const data = verifSheet.getDataRange().getValues();
    const headers = data[0];

    const emailIdx = headers.indexOf("email");
    const verifiedIdx = headers.indexOf("verified");

    if (emailIdx === -1 || verifiedIdx === -1) {
      return jsonResp({ verified: false });
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[emailIdx] === email && row[verifiedIdx] === true) {
        return jsonResp({ verified: true });
      }
    }

    return jsonResp({ verified: false });
  } catch (err) {
    return jsonResp({ verified: false });
  }
}

// check if email+token pair is valid and verified
function handleCheckToken(email, token) {
  try {
    const verifSheet = getVerifSheet();
    const data = verifSheet.getDataRange().getValues();
    const headers = data[0];

    const emailIdx = headers.indexOf("email");
    const tokenIdx = headers.indexOf("token");
    const verifiedIdx = headers.indexOf("verified");

    if (emailIdx === -1 || tokenIdx === -1 || verifiedIdx === -1) {
      return jsonResp({ verified: false });
    }

    const emailNorm = (email || "").toLowerCase().trim();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[emailIdx] === emailNorm && row[tokenIdx] === token && row[verifiedIdx] === true) {
        return jsonResp({ verified: true, email: emailNorm });
      }
    }

    return jsonResp({ verified: false });
  } catch (err) {
    return jsonResp({ verified: false });
  }
}