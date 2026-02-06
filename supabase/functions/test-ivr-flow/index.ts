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
    const { to, flowType = 'kba' } = await req.json();

    if (!to) {
      return new Response(
        JSON.stringify({ error: 'Missing "to" phone number' }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("VITE_TWILIO_FROM_NUMBER") || "+18885799021";
    const flowSid = "FWfbc7b7f41a22199aab7261079d59c701";

    if (!accountSid || !authToken) {
      return new Response(
        JSON.stringify({ error: "Missing Twilio credentials" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const auth = btoa(`${accountSid}:${authToken}`);

    if (to.includes("client:")) {
      let twiml = "";

      switch (flowType) {
        case 'kba':
          twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="4" action="/api/demo/kba-zip" method="POST">
    <Say>Welcome to Basic KBA Auth. Please enter your 4 digit Account ID.</Say>
  </Gather>
  <Redirect>/api/voice</Redirect>
</Response>`;
          break;

        case 'pin':
          twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="4" action="/api/demo/pin-check" method="POST">
    <Say>Welcome to PIN Authentication. Please enter your 4 digit PIN. Try 1 2 3 4.</Say>
  </Gather>
  <Redirect>/api/voice</Redirect>
</Response>`;
          break;

        case 'otp':
          twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Welcome to ID plus OTP. We are sending a code to your device.</Say>
  <Pause length="2"/>
  <Gather numDigits="6" action="/api/demo/auth-success" method="POST">
    <Say>Please enter the 6 digit code you just received. Try 1 2 3 4 5 6.</Say>
  </Gather>
  <Redirect>/api/voice</Redirect>
</Response>`;
          break;

        case 'voice':
          twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="/api/demo/voice-analyze" method="POST" timeout="4">
    <Say>Welcome to Voice Biometrics. Please say: My Voice is My Password.</Say>
  </Gather>
  <Redirect>/api/voice</Redirect>
</Response>`;
          break;

        case 'mfa':
          twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="4" action="/api/demo/mfa-step2" method="POST">
    <Say>Welcome to Full MFA. Step 1: Please enter your 4 digit PIN.</Say>
  </Gather>
  <Redirect>/api/voice</Redirect>
</Response>`;
          break;

        case 'trustid_short':
          twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Trust I.D. Analyzing Call Signal...</Say>
  <Pause length="1"/>
  <Say>Trust Score is Green. Device Verified.</Say>
  <Gather numDigits="4" action="/api/demo/auth-success" method="POST">
    <Say>Welcome back John. We recognized your trusted device. simply enter the last 4 digits of your account I.D. to proceed.</Say>
  </Gather>
  <Redirect>/api/voice</Redirect>
</Response>`;
          break;

        case 'trustid_selfservice':
          twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Trust I.D. Analyzing Call Signal...</Say>
  <Pause length="1"/>
  <Say>Trust Score is Green. Identity Assumed.</Say>
  <Gather numDigits="1" action="/api/demo/auth-success" method="POST">
    <Say>Because you are calling from a verified device, we have unlocked your Premium Menu. Press 1 for Limit Increases. Press 2 for Wire Transfers.</Say>
  </Gather>
  <Redirect>/api/voice</Redirect>
</Response>`;
          break;

        case 'trustid_routing':
          twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Trust I.D. Analyzing Call Signal...</Say>
  <Pause length="1"/>
  <Say>Warning. Trust Score is Red. Spoofing suspected.</Say>
  <Pause length="1"/>
  <Say>For your security, we are routing this call to a Fraud Prevention Specialist for manual identity verification. Please hold.</Say>
  <Play>http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3</Play>
</Response>`;
          break;

        default:
          twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Welcome to the IVR Demo. Please select a scenario.</Say>
</Response>`;
      }

      const params = new URLSearchParams();
      params.append("To", to);
      params.append("From", fromNumber);
      params.append("Twiml", twiml);

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Twilio API error: ${errorText}`);
      }

      const data = await response.json();
      return new Response(
        JSON.stringify({ sid: data.sid, status: data.status }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      const params = new URLSearchParams();
      params.append("To", to);
      params.append("From", fromNumber);
      params.append("Parameters", JSON.stringify({ flow_type: flowType }));

      const response = await fetch(
        `https://studio.twilio.com/v2/Flows/${flowSid}/Executions`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Twilio Studio API error: ${errorText}`);
      }

      const data = await response.json();
      return new Response(
        JSON.stringify({ sid: data.sid, status: data.status }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error testing IVR flow:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
