// cloudflare worker script for email verification links

const APPS_SCRIPT_URL = "";
const APP_ORIGIN = "";

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

    if (path === "/amnesty/verify") {
      const token = url.searchParams.get("token");
      const email = url.searchParams.get("email");
      if (!token || !email) {
        return new Response("Missing token", { status: 400, headers: corsHeaders });
      }

      const verifyUrl = APPS_SCRIPT_URL + "?action=verify-email&token=" + encodeURIComponent(token);
      await fetch(verifyUrl);

      const redirectUrl = APP_ORIGIN + "/amnesty?verified=1&token=" + encodeURIComponent(token) + "&email=" + encodeURIComponent(email);

      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Email verified</title>
            <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          </head>
          <body>
            <p>Email verified successfully.</p>
            <p>Redirecting to the form…</p>
          </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html", ...corsHeaders },
      });
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