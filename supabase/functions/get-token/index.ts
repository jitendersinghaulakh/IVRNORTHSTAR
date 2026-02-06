import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const apiKey = Deno.env.get("TWILIO_API_KEY_SID");
    const apiSecret = Deno.env.get("TWILIO_API_KEY_SECRET");

    if (!accountSid || !apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ error: "Missing Twilio credentials" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const identity = "user_browser";

    const header = {
      cty: "twilio-fpa;v=1",
      typ: "JWT",
      alg: "HS256",
    };

    const now = Math.floor(Date.now() / 1000);
    const validFor = 3600;

    const payload = {
      jti: `${apiKey}-${now}`,
      iss: apiKey,
      sub: accountSid,
      exp: now + validFor,
      grants: {
        identity: identity,
        voice: {
          incoming: { allow: true },
        },
      },
    };

    const encoder = new TextEncoder();
    const base64url = (data: Uint8Array) =>
      btoa(String.fromCharCode(...data))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

    const encodedHeader = base64url(encoder.encode(JSON.stringify(header)));
    const encodedPayload = base64url(encoder.encode(JSON.stringify(payload)));
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(apiSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signingInput)
    );

    const encodedSignature = base64url(new Uint8Array(signature));
    const token = `${signingInput}.${encodedSignature}`;

    return new Response(
      JSON.stringify({ token, identity }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating token:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
