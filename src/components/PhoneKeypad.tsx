import React, { useState } from 'react';
import { Phone, Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './PhoneKeypad.css';

interface PhoneKeypadProps {
    onCall: () => void;
    status: 'idle' | 'calling' | 'connected' | 'ended';
}

export const PhoneKeypad: React.FC<PhoneKeypadProps> = ({ onCall, status }) => {
    const [digits, setDigits] = useState('');

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
