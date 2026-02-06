import os
import json
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

# Account Credentials
account_sid = os.environ["TWILIO_ACCOUNT_SID"]
auth_token = os.environ["TWILIO_AUTH_TOKEN"]
phone_number_sid = "PN1e98fabf97cfaef4cb2021cbda2980d3"

client = Client(account_sid, auth_token)

# The IVR Flow Definition (JSON provided by user)
flow_definition = {
  "description": "IVR",
  "states": [
    {
      "name": "Trigger",
      "type": "trigger",
      "transitions": [
        {
          "event": "incomingMessage"
        },
        {
          "next": "gather_input",
          "event": "incomingCall"
        },
        {
          "event": "incomingConversationMessage"
        },
        {
          "event": "incomingRequest"
        },
        {
          "event": "incomingParent"
        }
      ],
      "properties": {
        "offset": {
          "x": 250,
          "y": 50
        }
      }
    },
    {
      "name": "gather_input",
      "type": "gather-input-on-call",
      "transitions": [
        {
          "next": "split_key_press",
          "event": "keypress"
        },
        {
          "next": "split_speech_result",
          "event": "speech"
        },
        {
          "event": "timeout"
        }
      ],
      "properties": {
        "voice": "alice",
        "offset": {
          "x": 290,
          "y": 250
        },
        "loop": 1,
        "say": "Hello, how can we direct your call? Press 1 for sales, or say sales. To reach support, press 2 or say support.",
        "language": "en",
        "timeout": 5
      }
    },
    {
      "name": "split_key_press",
      "type": "split-based-on",
      "transitions": [
        {
          "event": "noMatch"
        },
        {
          "next": "connect_call_to_sales",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "1",
              "arguments": [
                "{{widgets.gather_input.Digits}}"
              ],
              "type": "equal_to",
              "value": "1"
            }
          ]
        },
        {
          "next": "connect_call_to_support",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "2",
              "arguments": [
                "{{widgets.gather_input.Digits}}"
              ],
              "type": "equal_to",
              "value": "2"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{widgets.gather_input.Digits}}",
        "offset": {
          "x": 100,
          "y": 510
        }
      }
    },
    {
      "name": "split_speech_result",
      "type": "split-based-on",
      "transitions": [
        {
          "event": "noMatch"
        },
        {
          "next": "connect_call_to_sales",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "sales",
              "arguments": [
                "{{widgets.gather_input.SpeechResult}}"
              ],
              "type": "contains",
              "value": "sales"
            }
          ]
        },
        {
          "next": "connect_call_to_support",
          "event": "match",
          "conditions": [
            {
              "friendly_name": "support",
              "arguments": [
                "{{widgets.gather_input.SpeechResult}}"
              ],
              "type": "contains",
              "value": "support"
            }
          ]
        }
      ],
      "properties": {
        "input": "{{widgets.gather_input.SpeechResult}}",
        "offset": {
          "x": 510,
          "y": 510
        }
      }
    },
    {
      "name": "connect_call_to_sales",
      "type": "connect-call-to",
      "transitions": [
        {
          "event": "callCompleted"
        }
      ],
      "properties": {
        "offset": {
          "x": 100,
          "y": 750
        },
        "caller_id": "{{contact.channel.address}}",
        "noun": "number",
        "to": "15555551234"
      }
    },
    {
      "name": "connect_call_to_support",
      "type": "connect-call-to",
      "transitions": [
        {
          "event": "callCompleted"
        }
      ],
      "properties": {
        "offset": {
          "x": 520,
          "y": 750
        },
        "caller_id": "{{contact.channel.address}}",
        "noun": "number",
        "to": "15555555678"
      }
    }
  ],
  "initial_state": "Trigger",
  "flags": {
    "allow_concurrent_calls": True
  }
}

try:
    print("Deploying Twilio Studio Flow...")
    
    # 1. Create (or update) the Studio Flow
    flow = client.studio.v2.flows.create(
        commit_message='Initial Deployment from Script',
        friendly_name='NorthStar IVR Flow',
        status='published',
        definition=flow_definition
    )
    
    print(f"Flow Created! SID: {flow.sid}")
    print(f"Webhook URL: {flow.webhook_url}")

    # 2. Connect the Phone Number to this Flow
    print(f"Updating Phone Number {phone_number_sid}...")
    phone_number = client.incoming_phone_numbers(phone_number_sid).update(
        voice_url=flow.webhook_url,
        voice_method="POST"
    )

    print(f"Success! Phone Number {phone_number.phone_number} is now connected to the IVR Flow.")

except Exception as e:
    print(f"Error: {e}")
