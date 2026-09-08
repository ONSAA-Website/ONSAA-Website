// CF worker for verification to proxy appscript link

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzER3j3__BhPZPQXMEVcipD58Gay-jOa0ET5Evb5tDQs9XCxnciV4eS0N3_X6ScnTfPhQ/exec";
const APP_ORIGIN = "http://localhost:4321"; 

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      "Access-Control-Allow-Origin": APP_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // don't auto-verify on click (link scanners)
    if (path === "/exemption/verify" && request.method === "GET") {
      const token = url.searchParams.get("token");
      const email = url.searchParams.get("email");
      const scope = url.searchParams.get("scope");

      if (!token || !email || !scope) {
        return new Response("Invalid verification link.", { status: 400 });
      }

      const confirmUrl =
        "/exemption/confirm" +
        "?token=" + encodeURIComponent(token) +
        "&email=" + encodeURIComponent(email) +
        "&scope=" + encodeURIComponent(scope);

      return new Response(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Confirm email verification</title>
          </head>
          <body>
            <h1>Confirm your email</h1>
            <p>Click the button below to finish verifying your email address.</p>
            <form method="POST" action="${confirmUrl}">
              <button type="submit">Confirm email</button>
            </form>
          </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html; charset=UTF-8" }
      });
    }

    if (path === "/exemption/confirm" && request.method === "POST") {
      const token = url.searchParams.get("token");
      const email = url.searchParams.get("email");
      const scope = url.searchParams.get("scope");

      if (!token || !email || !scope) {
        return new Response("Invalid verification request.", { status: 400 });
      }

      const verifyUrl =
        APPS_SCRIPT_URL +
        "?action=verify-email" +
        "&token=" + encodeURIComponent(token) +
        "&email=" + encodeURIComponent(email) +
        "&scope=" + encodeURIComponent(scope);

      const verified = await fetch(verifyUrl);

      if (!verified.ok) {
        return new Response("Could not verify this email. Request a new link.", {
          status: 500
        });
      }

      const redirectUrl =
        APP_ORIGIN +
        "/exemption?verified=1" +
        "&email=" + encodeURIComponent(email) +
        "&token=" + encodeURIComponent(token) +
        "&scope=" + encodeURIComponent(scope);

      return Response.redirect(redirectUrl, 303);
    }

    // proxy to Apps Script
    const targetUrl = APPS_SCRIPT_URL + url.search;

    const init = {
      method: request.method,
      headers: {
        "Content-Type": request.headers.get("Content-Type") || "application/json",
      },
    };

    if (request.method === "POST") {
      init.body = await request.text();
    }

    const response = await fetch(targetUrl, init);
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
        ...corsHeaders,
      },
    });
  },
};