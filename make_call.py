import os
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Find your Account SID and Auth Token at twilio.com/console
# and set the environment variables. See http://twil.io/secure
account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
from_number = os.environ.get("VITE_TWILIO_FROM_NUMBER") or "+18885799021"

# Target number (using the one from previous tests)
to_number = "+14803881245" 

if not account_sid or not auth_token:
    print("Error: TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not found in environment.")
    exit(1)

client = Client(account_sid, auth_token)

print(f"Initiating call from {from_number} to {to_number}...")

try:
    call = client.calls.create(
        url="http://demo.twilio.com/docs/voice.xml",
        to=to_number,
        from_=from_number,
    )
    print(f"Call initiated successfully. SID: {call.sid}")
except Exception as e:
    print(f"Failed to initiate call: {e}")
