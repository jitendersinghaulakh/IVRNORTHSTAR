import os
import json
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

account_sid = os.environ["TWILIO_ACCOUNT_SID"]
auth_token = os.environ["TWILIO_AUTH_TOKEN"]
client = Client(account_sid, auth_token)

flow_definition = {
  "description": "Master Auth Demo Flow",
  "states": [
    {
      "name": "Trigger",
      "type": "trigger",
      "transitions": [
        {
          "next": "check_flow_type",
          "event": "incomingCall"
        },
        {
          "event": "incomingMessage"
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
        "offset": { "x": 50, "y": 50 }
      }
    },
    {
      "name": "check_flow_type",
      "type": "split-based-on",
      "transitions": [
        { "event": "noMatch", "next": "kba_start" },
        {
          "event": "match",
          "conditions": [
            { "friendly_name": "KBA", "arguments": ["{{trigger.call.parameters.flow_type}}"], "type": "equal_to", "value": "kba" }
          ],
          "next": "kba_start"
        },
        {
          "event": "match",
           "conditions": [
            { "friendly_name": "PIN", "arguments": ["{{trigger.call.parameters.flow_type}}"], "type": "equal_to", "value": "pin" }
          ],
          "next": "pin_start"
        },
        {
          "event": "match",
           "conditions": [
            { "friendly_name": "OTP", "arguments": ["{{trigger.call.parameters.flow_type}}"], "type": "equal_to", "value": "otp" }
          ],
          "next": "otp_start"
        },
        {
          "event": "match",
           "conditions": [
            { "friendly_name": "Voice", "arguments": ["{{trigger.call.parameters.flow_type}}"], "type": "equal_to", "value": "voice" }
          ],
          "next": "voice_start"
        },
        {
          "event": "match",
           "conditions": [
            { "friendly_name": "MFA", "arguments": ["{{trigger.call.parameters.flow_type}}"], "type": "equal_to", "value": "mfa" }
          ],
          "next": "mfa_start"
        }
      ],
      "properties": {
        "input": "{{trigger.call.parameters.flow_type}}",
        "offset": { "x": 50, "y": 200 }
      }
    },
    # KBA
    {
        "name": "kba_start",
        "type": "gather-input-on-call",
        "transitions": [
            { "event": "keypress", "next": "kba_zip" },
            { "event": "speech", "next": "kba_zip" },
            { "event": "timeout", "next": "kba_zip" }
        ],
        "properties": { "say": "Basic KBA. Enter random ID.", "timeout": 3 }
    },
    {
        "name": "kba_zip",
        "type": "gather-input-on-call",
        "transitions": [
            { "event": "keypress", "next": "auth_success" },
            { "event": "speech", "next": "auth_success" },
            { "event": "timeout", "next": "auth_success" }
        ],
        "properties": { "say": "Enter Zip Code.", "timeout": 3 }
    },

    # PIN
    {
        "name": "pin_start",
        "type": "gather-input-on-call",
        "transitions": [ { "event": "keypress", "next": "auth_success" }, { "event": "timeout", "next": "auth_success" } ],
        "properties": { "say": "PIN Auth. Enter 1 2 3 4.", "timeout": 5 }
    },

    # OTP
    {
        "name": "otp_start",
        "type": "say-play",
        "transitions": [ { "event": "audioComplete", "next": "otp_enter" } ],
        "properties": { "say": "Sending OTP to your device..." }
    },
    {
        "name": "otp_enter",
        "type": "gather-input-on-call",
        "transitions": [ { "event": "keypress", "next": "auth_success" }, { "event": "timeout", "next": "auth_success" } ],
        "properties": { "say": "Enter the 6 digit OTP.", "timeout": 5 }
    },

    # VOICE
    {
        "name": "voice_start",
        "type": "gather-input-on-call",
        "transitions": [ { "event": "speech", "next": "auth_success" }, { "event": "timeout", "next": "auth_success" } ],
        "properties": { "say": "Voice Auth. Say your passphrase.", "input": "speech", "timeout": 5 }
    },
    
    # MFA
    {
        "name": "mfa_start",
        "type": "gather-input-on-call",
        "transitions": [ { "event": "keypress", "next": "mfa_otp_step" }, { "event": "timeout", "next": "mfa_otp_step" } ],
        "properties": { "say": "MFA Step 1. Enter PIN.", "timeout": 4 }
    },
    {
        "name": "mfa_otp_step",
         "type": "gather-input-on-call",
        "transitions": [ { "event": "keypress", "next": "auth_success" }, { "event": "timeout", "next": "auth_success" } ],
        "properties": { "say": "MFA Step 2. Enter OTP.", "timeout": 4 }
    },

    # Success
    {
        "name": "auth_success",
        "type": "say-play",
        "transitions": [ { "event": "audioComplete" } ],
        "properties": { "say": "Authentication Successful. Demo Complete." }
    }
  ],
  "initial_state": "Trigger",
  "flags": {
    "allow_concurrent_calls": True
  }
}

try:
    print("Deploying Simplified Master Auth Flow...")
    flow = client.studio.v2.flows.create(
        commit_message='Master Auth v2',
        friendly_name='NorthStar Master Auth Flow v2',
        status='published',
        definition=flow_definition
    )
    print(f"NEW_FLOW_SID:{flow.sid}")
except Exception as e:
    print(f"Error: {e}")
