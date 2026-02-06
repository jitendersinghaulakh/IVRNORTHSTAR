from flask import Flask, jsonify, request, Response
from twilio.rest import Client
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VoiceGrant
from twilio.twiml.voice_response import VoiceResponse, Dial
import os
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

identity = 'user_browser' # The client name for the browser device

@app.route('/api/token', methods=['GET'])
def get_token():
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    api_key = os.environ.get("TWILIO_API_KEY_SID")
    api_secret = os.environ.get("TWILIO_API_KEY_SECRET")
    
    if not account_sid or not api_key or not api_secret:
        return jsonify({'error': 'Missing Creds'}), 500

    token = AccessToken(account_sid, api_key, api_secret, identity=identity)
    
    # Create a Voice grant for this token
    voice_grant = VoiceGrant(
        outgoing_application_sid=os.environ.get("TWILIO_TWIML_APP_SID"), # Optional for outgoing
        incoming_allow=True # Allow incoming calls
    )
    token.add_grant(voice_grant)

    return jsonify({'token': token.to_jwt(), 'identity': identity})

@app.route('/api/test-ivr-flow', methods=['POST'])
def test_ivr_flow():
    try:
        data = request.json
        to_number = data.get('to')
        
        if not to_number:
            return jsonify({'error': 'Missing "to" phone number'}), 400

        # Credentials
        account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
        from_number = os.environ.get("VITE_TWILIO_FROM_NUMBER") or "+18885799021"
        
        # The Studio Flow SID
        flow_sid = "FWfbc7b7f41a22199aab7261079d59c701"
        
        # Get flow_type from request (kba, pin, otp, voice, mfa)
        flow_type = data.get('flowType', 'kba')

        client = Client(account_sid, auth_token)

        # Explicitly handle Softphone (client:) vs PSTN (Executions API)
        if "client:" in to_number:
            # Softphone Logic: HARDCODED DEMO SCENARIOS using TwiML directly
            # This bypasses Studio to prevent "Application Error" issues during the specific demo use cases
            
            resp = VoiceResponse()
            
            if flow_type == 'kba':
                gather = resp.gather(num_digits=4, action='/api/demo/kba-zip', method='POST')
                gather.say("Welcome to Basic KBA Auth. Please enter your 4 digit Account ID.")
                resp.redirect('/api/voice') # Loop if no input
                
            elif flow_type == 'pin':
                gather = resp.gather(num_digits=4, action='/api/demo/pin-check', method='POST')
                gather.say("Welcome to PIN Authentication. Please enter your 4 digit PIN. Try 1 2 3 4.")
                resp.redirect('/api/voice')

            elif flow_type == 'otp':
                resp.say("Welcome to ID plus OTP. We are sending a code to your device.")
                resp.pause(length=2)
                gather = resp.gather(num_digits=6, action='/api/demo/auth-success', method='POST')
                gather.say("Please enter the 6 digit code you just received. Try 1 2 3 4 5 6.")
                resp.redirect('/api/voice')

            elif flow_type == 'voice':
                gather = resp.gather(input='speech', action='/api/demo/voice-analyze', method='POST', timeout=4)
                gather.say("Welcome to Voice Biometrics. Please say: My Voice is My Password.")
                resp.redirect('/api/voice')

            elif flow_type == 'mfa':
                gather = resp.gather(num_digits=4, action='/api/demo/mfa-step2', method='POST')
                gather.say("Welcome to Full MFA. Step 1: Please enter your 4 digit PIN.")
                resp.redirect('/api/voice')

            elif flow_type == 'trustid_short':
                # Use Case 1: Shortened ID&V
                resp.say("Trust I.D. Analyzing Call Signal...")
                resp.pause(length=1)
                resp.say("Trust Score is Green. Device Verified.")
                gather = resp.gather(num_digits=4, action='/api/demo/auth-success', method='POST')
                gather.say("Welcome back John. We recognized your trusted device. simply enter the last 4 digits of your account I.D. to proceed.")
                resp.redirect('/api/voice')

            elif flow_type == 'trustid_selfservice':
                # Use Case 2: Expanded Self-Service
                resp.say("Trust I.D. Analyzing Call Signal...")
                resp.pause(length=1)
                resp.say("Trust Score is Green. Identity Assumed.")
                gather = resp.gather(num_digits=1, action='/api/demo/auth-success', method='POST')
                gather.say("Because you are calling from a verified device, we have unlocked your Premium Menu. Press 1 for Limit Increases. Press 2 for Wire Transfers.")
                resp.redirect('/api/voice')
            
            elif flow_type == 'trustid_routing':
                # Use Case 3: Risk-Based Routing (High Risk/Fraud Path)
                resp.say("Trust I.D. Analyzing Call Signal...")
                resp.pause(length=1)
                resp.say("Warning. Trust Score is Red. Spoofing suspected.")
                resp.pause(length=1)
                resp.say("For your security, we are routing this call to a Fraud Prevention Specialist for manual identity verification. Please hold.")
                resp.play("http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3")
                
            else:
                # Default/Fallback
                resp.say("Welcome to the IVR Demo. Please select a scenario.")

            # We need to return the TwiML to the CALLER (which is actually the client in this outbound flow? No wait.)
            # The 'calls.create' url expects XML.
            # We can't just return XML here to the API caller.
            # We need to serve this XML at a URL that Twilio can fetch.
            # So we point the call to a specific endpoint that serves this content.
             
            # Construct a URL that points to a new endpoint we'll make: /api/demo/xml?flow_type=...
            # Note: server is running on 3001. ngrok is needed if public. 
            # BUT: If we are just using 'client:', we might not need public URL if we use the TwiML App?
            # Actually, `calls.create` URL MUST be public.
            
            # Since we are local and maybe not using ngrok globally for everything, 
            # we will rely on the existing "flow_url" strategy but point to a new TwiML Bin or just use the Fallback Studio Flow 
            # which we know works (the one with new SID).
            
            # WAIT. The user asked to "Hard Code the Data".
            # The previous error "Application Error" usually comes from Studio Failing.
            # If we want to hardcode, we should handle the logic inside the Python backend and just feed TwiML instructions.
            
            # Problem: Twilio needs to reach our localhost:3001 to get the TwiML. 
            # If we don't have ngrok, we can't do this easily unless we use the TwiML App SID which points to a webhook.
            # However, `server.py` creates a call with `url=...`. This `url` MUST be reachable by Twilio.
            
            # Assumption: The user has their environment set up such that 'answer_phone.py' (port 5000) or 'server.py' (port 3001) is reachable 
            # OR they are using the Studio Flow Webhook which is hosted by Twilio.
            
            # OPTION 2: Use the TwiML Bin / URL equivalent.
            # Let's try to inject the TwiML via the 'twiml' parameter of calls.create instead of 'url'.
            # This avoids the network reachability issue!
            
            call = client.calls.create(
                twiml=str(resp),
                to=to_number,
                from_=from_number
            )
            return jsonify({'sid': call.sid, 'status': call.status}), 200
        else:
            # PSTN Logic: Use Studio Executions API
            execution = client.studio.v2.flows(flow_sid).executions.create(
                to=to_number,
                from_=from_number,
                parameters={
                    'flow_type': flow_type
                }
            )
            return jsonify({'sid': execution.sid, 'status': execution.status}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice', methods=['POST'])
def voice():
    """Returns TwiML instructions to connect the call to the browser client"""
    resp = VoiceResponse()
    dial = Dial()
    dial.client(identity)
    resp.append(dial)
    
    return Response(str(resp), mimetype='text/xml')

@app.route('/api/make-call', methods=['POST'])
def make_call():
    try:
        # Get credentials from env
        account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
        auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
        from_number = os.environ.get("VITE_TWILIO_FROM_NUMBER") # Using VITE_ var or TWILIO_ var if set
        
        # Fallback for from_number if not in standard TWILIO_ var
        if not from_number:
            from_number = "+18885799021"

        if not account_sid or not auth_token:
            return jsonify({'error': 'Missing Twilio Credentials'}), 500

        client = Client(account_sid, auth_token)

        data = request.json
        to_number = data.get('to')
        
        if not to_number:
            return jsonify({'error': 'Missing "to" phone number'}), 400

        call = client.calls.create(
            url="http://demo.twilio.com/docs/voice.xml",
            to=to_number,
            from_=from_number
        )

        return jsonify({'sid': call.sid, 'status': call.status}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3001, debug=True)
