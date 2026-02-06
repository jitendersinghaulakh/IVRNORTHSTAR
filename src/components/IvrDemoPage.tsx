import React, { useState } from 'react';
import { IvrTester } from './IvrTester';
import { PhoneKeypad } from './PhoneKeypad';
import { IncomingCall } from './IncomingCall';
import { motion } from 'framer-motion';
import './IvrDemoPage.css';

export const IvrDemoPage: React.FC = () => {
    // Shared state or independent? 
    // The request implies two UIs. Let's keep them somewhat independent but side-by-side for comparison/interaction.

    const [phoneStatus, setPhoneStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
    const [selectedFlow, setSelectedFlow] = useState('kba');

    const handlePhoneCall = async () => {
        setPhoneStatus('calling');

        // Trigger the flow towards the browser (Softphone logic)
        try {
            await fetch('/api/test-ivr-flow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: 'client:user_browser',
                    flowType: selectedFlow
                })
            });

            setTimeout(() => setPhoneStatus('connected'), 2000);

        } catch (e) {
            console.error(e);
            setPhoneStatus('idle');
        }
    };

    const scenarios = [
        { id: 'kba', label: '1. Basic KBA (ID + Zip)' },
        { id: 'pin', label: '2. PIN Authentication' },
        { id: 'otp', label: '3. ID + Out-of-Band OTP' },
        { id: 'voice', label: '4. Voice Biometrics' },
        { id: 'mfa', label: '5. Full MFA (PIN+OTP+Voice)' },
        { id: 'trustid_short', label: '6. TrustID: Shortened Auth (Low Risk)' },
        { id: 'trustid_selfservice', label: '7. TrustID: Expanded Self-Service' },
        { id: 'trustid_routing', label: '8. TrustID: Risk-Based Routing (High Risk Demo)' }
    ];

    return (
        <div className="demo-page-container">
            <div className="demo-header">
                <h1>IVR Interactive Demo</h1>
                <p>Experience the IVR flow from two perspectives: The System Control Panel and the User's Device.</p>
            </div>

            <div className="demo-grid">
                {/* Left Column: Softphone / System Controls */}
                <motion.div
                    className="demo-column left-panel"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                >
                    <div className="panel-header">
                        <h2>System Control & Softphone</h2>
                        <span className="badge">Agent View</span>
                    </div>

                    <div className="scenario-selector glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>Select Authentication Scenario</h3>
                        <div className="scenario-options">
                            {scenarios.map(s => (
                                <button
                                    key={s.id}
                                    className={`scenario-btn ${selectedFlow === s.id ? 'active' : ''}`}
                                    onClick={() => setSelectedFlow(s.id)}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="control-stack">
                        <IvrTester /> {/* Note: IvrTester currently doesn't use the global selectedFlow, only its own internal logic. To fully integrate, we might need to prop drill or just rely on the iPhone demo right now. */}
                        <IncomingCall />
                    </div>
                </motion.div>

                {/* Right Column: iPhone Simulator */}
                <motion.div
                    className="demo-column right-panel"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="panel-header">
                        <h2>Customer Device</h2>
                        <span className="badge mobile">Mobile View</span>
                    </div>

                    <div className="phone-wrapper">
                        <PhoneKeypad onCall={handlePhoneCall} status={phoneStatus} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
