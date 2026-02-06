from flask import Flask, request
from twilio.twiml.voice_response import VoiceResponse, Gather, Dial

app = Flask(__name__)

@app.route("/answer", methods=['GET', 'POST'])
def answer_call():
    """Start the IVR flow (gather_input state)"""
    resp = VoiceResponse()
    
    # "gather_input" state equivalent
    gather = Gather(
        input='dtmf speech',
        timeout=5,
        numDigits=1,
        action='/handle-input',
        loop=1,
        language='en'
    )
    gather.say("Hello, how can we direct your call? Press 1 for sales, or say sales. To reach support, press 2 or say support.", voice='alice')
    
    resp.append(gather)
    
    # If no input, loop connection or hangup (JSON implies simple timeout, we'll redirect to start)
    resp.redirect('/answer')
    
    return str(resp)

@app.route("/handle-input", methods=['POST'])
def handle_input():
    """Handle the split_key_press and split_speech_result logic"""
    resp = VoiceResponse()
    
    # Get input
    digits = request.values.get('Digits', '')
    speech = request.values.get('SpeechResult', '').lower()
    
    target_number = None
    
    # "split_key_press" logic
    if digits == '1':
        target_number = "15555551234"
    elif digits == '2':
        target_number = "15555555678"
        
    # "split_speech_result" logic
    elif "sales" in speech:
         target_number = "15555551234"
    elif "support" in speech:
         target_number = "15555555678"
         
    if target_number:
        # "connect_call_to_..." logic
        resp.say(f"Connecting you to { 'Sales' if '1234' in target_number else 'Support' }.")
        resp.dial(target_number)
    else:
        # "noMatch" -> Loop back
        resp.say("Sorry, I didn't catch that.")
        resp.redirect('/answer')
        
    return str(resp)

if __name__ == "__main__":
    app.run(port=5000, debug=True)
