// CF worker for verification to proxy appscript link

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzER3j3__BhPZPQXMEVcipD58Gay-jOa0ET5Evb5tDQs9XCxnciV4eS0N3_X6ScnTfPhQ/exec";
const APP_ORIGIN = "onsaa.org"; 

function isTrustedOrigin(request) {
  const origin = request.headers.get("Origin");

  return origin === APP_ORIGIN;
}

function appsScriptUrl(url, env) {
  const target = new URL(APPS_SCRIPT_URL + url.search);
  target.searchParams.set("internal_secret", env.INTERNAL_SECRET);
  return target.toString();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      "Access-Control-Allow-Origin": APP_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // don't auto-verify on click (link scanners)
    if (path === "/exemption/verify" && request.method === "GET") {
      const token = url.searchParams.get("token");

      if (!token) {
        return new Response("Invalid verification link.", { status: 400 });
      }

      const confirmUrl =
        "/exemption/confirm" +
        "?token=" + encodeURIComponent(token);

      return new Response(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Confirm email verification</title>
          </head>
          <body style="
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
            box-sizing: border-box;
            background: #0a0a0a;
            color: #ffffff;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          ">
            <main style="
              width: 100%;
              max-width: 560px;
              box-sizing: border-box;
              padding: 28px;
              background: rgba(255, 255, 255, 0.04);
              border: 1px solid rgba(255, 255, 255, 0.14);
              border-radius: 10px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
            ">
              <p style="
                margin: 0 0 8px;
                color: rgba(255, 59, 48, 0.95);
                font-size: 0.85rem;
                font-weight: 700;
                letter-spacing: 0.06em;
                text-transform: uppercase;
              ">
                Academic Exemption Database
              </p>

              <h1 style="
                margin: 0 0 10px;
                font-size: 1.5rem;
                line-height: 1.25;
                color: #ffffff;
              ">
                Confirm your email
              </h1>

              <p style="
                margin: 0 0 24px;
                color: rgba(255, 255, 255, 0.85);
                font-size: 0.95rem;
                line-height: 1.5;
              ">
                Click below to finish verifying your institutional email address.
              </p>

              <form method="POST" action="${confirmUrl}" style="margin: 0;">
                <button
                  type="submit"
                  style="
                    appearance: none;
                    width: 100%;
                    padding: 11px 16px;
                    border: 0;
                    border-radius: 6px;
                    background: rgba(255, 59, 48, 0.85);
                    color: #ffffff;
                    font: inherit;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                  "
                >
                  Confirm email
                </button>
              </form>

              <p style="
                margin: 18px 0 0;
                color: rgba(255, 255, 255, 0.6);
                font-size: 0.8rem;
                line-height: 1.45;
              ">
                If you did not request this verification, you can close this page.
              </p>
            </main>
          </body>
        </html>
      `, {
        headers: { "Content-Type": "text/html; charset=UTF-8" }
      });
    }

    if (path === "/exemption/confirm" && request.method === "POST") {
      const token = url.searchParams.get("token");

      if (!token) {
        return new Response("Invalid verification request.", { status: 400 });
      }

      const verifyUrl =
        APPS_SCRIPT_URL +
        "?action=verify-email" +
        "&token=" + encodeURIComponent(token) +
        "&internal_secret=" + encodeURIComponent(env.INTERNAL_SECRET);

      const verified = await fetch(verifyUrl.toString());
      const verifiedText = await verified.text();

      let verificationResult;

      try {
        verificationResult = JSON.parse(verifiedText);
      } catch {
        return new Response(
          "Verification service returned unexpected data: " + verifiedText.slice(0, 300),
          { status: 502 }
        );
      }

      if (!verified.ok || !verificationResult.verified) {
        return new Response(
          "This verification link has expired or was already used. Request a new link.",
          { status: 400 }
        );
      }

      const sessionValue = encodeURIComponent(
        JSON.stringify({
          email: verificationResult.email,
          scope: verificationResult.scope,
          token: verificationResult.sessionToken,
        })
      );

      const redirectUrl =
        APP_ORIGIN +
        "/exemption?verified=1" + 
        "&scope=" + encodeURIComponent(verificationResult.scope);

      return new Response(null, {
        status: 303,
        headers: {
          Location: redirectUrl,
          "Set-Cookie":
            "exemption_session=" + sessionValue + // __Host- in production
            "; Path=/" +
            "; Max-Age=3600" +
            "; HttpOnly" + // cookie; frontend/JS cannot see token
            // "; Secure" + // add for production
            "; SameSite=Lax" // replace Lax with None for production
        }
      });
    }

    if (
      path === "/" &&
      request.method === "POST" &&
      (
        url.searchParams.get("action") === "submit-exemption" ||
        url.searchParams.get("action") === "report-submission"
      )
    ) {

      if (!isTrustedOrigin(request)) {
        return new Response(
          JSON.stringify({ error: "Blocked cross-site request." }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }

      const cookieHeader = request.headers.get("Cookie") || "";

      const match = cookieHeader.match(
        /(?:^|;\s*)exemption_session=([^;]+)/  // __Host-exemption_session
      );

      if (!match) {
        return new Response(
          JSON.stringify({
            error: "Your verification session has expired. Please verify your email again."
          }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }

      let session;

      try {
        session = JSON.parse(decodeURIComponent(match[1]));
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid verification session." }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }

      const action = url.searchParams.get("action");
      const requiredScope =
        action === "report-submission" ? "report" : "submit";

      if (session.scope !== requiredScope) {
        return new Response(
          JSON.stringify({ error: "This session cannot perform that action." }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }

      const body = await request.json();

      body.submitter_email = session.email;
      body.verification_token = session.token;

      const response = await fetch(appsScriptUrl(url, env), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      return new Response(await response.text(), {
        status: response.status,
        headers: {
          "Content-Type":
            response.headers.get("Content-Type") || "application/json",
          ...corsHeaders
        }
      });
    }

    // proxy to Apps Script
    const targetUrl = appsScriptUrl(url, env);

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