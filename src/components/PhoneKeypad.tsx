import React, { useState } from 'react';
import { Phone, Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './PhoneKeypad.css';

interface PhoneKeypadProps {
    onCall: () => void;
    status: 'idle' | 'calling' | 'connected' | 'ended';
    scenario?: string; // Add scenario prop
}

export const PhoneKeypad: React.FC<PhoneKeypadProps> = ({ onCall, status, scenario = 'kba' }) => {
    const [digits, setDigits] = useState('');
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const voiceRef = React.useRef<HTMLAudioElement | null>(null);

    // Effect for Ringback Tone
    React.useEffect(() => {
        // Simple ringing tone simulation
        if (status === 'calling') {
            // Create audio object if not exists. Using a public domain ringtone or synthetic beep
            if (!audioRef.current) {
                audioRef.current = new Audio('https://upload.wikimedia.org/wikipedia/commons/e/e5/US_ringback_tone.ogg');
                audioRef.current.loop = true;
                // Reduce volume so it's not jarring
                audioRef.current.volume = 0.5;
            }
            audioRef.current.play().catch(e => console.warn("Audio play prevented", e));
        } else {
            // Stop ringing on connect or other states
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        }
    }, [status]);

    // Effect for Voice Prompts on Connect
    React.useEffect(() => {
        if (status === 'connected') {
            // Stop any ringing
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }

            // Map scenario to Text-to-Speech Audio URL (using free TTS generic endpoints for demo or standard files)
            // For robustness in this demo without a real backend TTS, we will specific MP3s if available, or just generic "Welcome" ones.
            // Since we don't have custom MP3s hosted, I will use a reliable generic Voice Greeting for the demo purpose.

            // NOTE: In a real app, this would stream from Twilio. Here we simulate the "Hearing" part for the Bolt demo.

            let audioUrl = '';

            // Simple switch to pick different 'simulated' prompts
            // Using generic placeholders or public domain speech samples for the demo effect
            switch (scenario) {
                case 'kba':
                    // "Welcome... please enter ID"
                    audioUrl = 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav'; // Placeholder: Using a known short clip or synthesize one? 
                    // Actually, let's use the browser's Native Speech Synthesis API! It's better for dynamic demo without external files.
                    speakText("Welcome to NorthStar. Please enter your 4 digit Account I.D.");
                    break;
                case 'pin':
                    speakText("Welcome to Secure Banking. Please enter your 4 digit PIN.");
                    break;
                case 'otp':
                    speakText("We have sent a one-time passcode to your authentic device. Please enter the 6 digit code.");
                    break;
                case 'voice':
                    speakText("Voice Security Check. Please say: My voice is my password.");
                    break;
                case 'mfa':
                    speakText("Multi-Factor Authentication Required. Step one: Enter your PIN.");
                    break;
                case 'trustid_short':
                    speakText("Welcome back John. Trust I.D. verified. Enter last 4 digits of account.");
                    break;
                case 'trustid_selfservice':
                    speakText("Identity Verified. Premium Menu Unlocked. Press 1 for transfers.");
                    break;
                case 'trustid_routing':
                    speakText("Security Warning. We are routing you to a fraud specialist. Please hold.");
                    break;
                default:
                    speakText("Welcome to the Interactive Demo.");
            }
        } else {
            // Stop speaking if call ends
            window.speechSynthesis.cancel();
        }
    }, [status, scenario]);

    const speakText = (text: string) => {
        // Use Web Speech API for instant feedback without backend assets
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower for phone clarity
        utterance.pitch = 1;
        utterance.volume = 1;
        // Try to pick a female voice if available
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
        if (femaleVoice) utterance.voice = femaleVoice;

        window.speechSynthesis.speak(utterance);
    };

    const handlePress = (digit: string) => {
        if (status === 'idle') {
            setDigits(prev => prev + digit);
        }
    };

    const handleDelete = () => {
        setDigits(prev => prev.slice(0, -1));
    };

    return (
        <div className="phone-device">
            <div className="phone-bezel">
                <div className="phone-notch"></div>
                <div className="phone-screen">
                    <div className="status-bar">
                        <span>9:41</span>
                        <div className="status-icons">
                            <span>Signal</span>
                            <span>WiFi</span>
                            <span>Bat</span>
                        </div>
                    </div>

                    <div className="phone-content" style={{ position: 'relative', overflow: 'hidden' }}>
                        <AnimatePresence mode="wait">
                            {status === 'idle' ? (
                                <motion.div
                                    key="dialer"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                                >
                                    <div className="digits-display">
                                        {digits || <span className="placeholder">Enter Number</span>}
                                    </div>

                                    <div className="keypad-grid">
                                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                                            <button
                                                key={key}
                                                className="keypad-btn"
                                                onClick={() => handlePress(key)}
                                            >
                                                <div className="key-number">{key}</div>
                                                {key === '2' && <div className="key-sub">ABC</div>}
                                                {key === '3' && <div className="key-sub">DEF</div>}
                                                {key === '4' && <div className="key-sub">GHI</div>}
                                                {key === '5' && <div className="key-sub">JKL</div>}
                                                {key === '6' && <div className="key-sub">MNO</div>}
                                                {key === '7' && <div className="key-sub">PQRS</div>}
                                                {key === '8' && <div className="key-sub">TUV</div>}
                                                {key === '9' && <div className="key-sub">WXYZ</div>}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="call-action">
                                        <button
                                            className="call-btn-large"
                                            onClick={onCall}
                                        >
                                            <Phone size={32} fill="currentColor" />
                                        </button>
                                        {digits.length > 0 && (
                                            <button className="delete-btn" onClick={handleDelete}>
                                                <Delete size={24} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="in-call"
                                    className="in-call-ui"
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <div className="caller-avatar-large">
                                        <span className="avatar-initials">NS</span>
                                    </div>
                                    <h3 className="caller-name">NorthStar IVR</h3>
                                    <div className="call-status-text">
                                        {status === 'calling' ? 'Calling...' : status === 'connected' ? '00:05' : 'Ended'}
                                    </div>

                                    <div className="call-controls-row">
                                        <div className="control-btn"><span className="icon">🎤</span>Mute</div>
                                        <div className="control-btn"><span className="icon">⌨️</span>Keypad</div>
                                        <div className="control-btn"><span className="icon">🔊</span>Speaker</div>
                                    </div>

                                    <button className="end-call-btn">
                                        <Phone size={32} fill="currentColor" style={{ transform: 'rotate(135deg)' }} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="home-indicator"></div>
                </div>
            </div>
        </div>
    );
};
