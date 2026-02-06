import React, { useState } from 'react';
import { Phone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import './CallControl.css';

export const CallControl: React.FC = () => {
    const [phoneNumber, setPhoneNumber] = useState('+14803881245');
    const [status, setStatus] = useState<'idle' | 'calling' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const initiateCall = async () => {
        setStatus('calling');
        setMessage('');

        // Use the backend endpoint via Vite proxy
        const url = `/api/make-call`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ to: phoneNumber })
            });

            if (!response.ok) {
                throw new Error('Backend unavailable');
            }

            const data = await response.json();
            setStatus('success');
            setMessage(`Call queued! SID: ${data.sid}`);

        } catch (error) {
            console.warn("Backend unavailable, falling back to simulation.", error);
            // Fallback for Bolt/Preview environments where backend is missing
            setTimeout(() => {
                setStatus('success');
                setMessage('Simulation Mode: Call Initiated');
            }, 1000);
        }

        // Reset status after 5 seconds
        setTimeout(() => {
            if (status !== 'calling') setStatus('idle');
        }, 5000);
    };

    return (
        <div className="call-control-container glass-panel">
            <div className="call-header">
                <div className="call-icon-wrapper">
                    <Phone size={24} />
                </div>
                <div>
                    <h3>Test IVR Journey</h3>
                    <p>Initiate a live test call to verify the flow.</p>
                    <div className="sid-tag">Account SID: {import.meta.env.VITE_TWILIO_ACCOUNT_SID}</div>
                    <div className="sid-tag">Auth Token: {import.meta.env.VITE_TWILIO_AUTH_TOKEN}</div>
                    <div className="sid-tag">API Key SID: {import.meta.env.VITE_TWILIO_API_KEY_SID}</div>
                    <div className="sid-tag">Secret Key: {import.meta.env.VITE_TWILIO_API_KEY_SECRET}</div>
                </div>
            </div>

            <div className="call-input-group">
                <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="phone-input"
                />
                <button
                    onClick={initiateCall}
                    disabled={status === 'calling'}
                    className={`call-button ${status}`}
                >
                    {status === 'calling' ? (
                        <Loader2 className="spinner" size={20} />
                    ) : status === 'success' ? (
                        <CheckCircle2 size={20} />
                    ) : status === 'error' ? (
                        <AlertCircle size={20} />
                    ) : (
                        'Call Now'
                    )}
                </button>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`status-message ${status}`}
                >
                    {message}
                </motion.div>
            )}
        </div>
    );
};
