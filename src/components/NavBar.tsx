import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Phone } from 'lucide-react';
import './NavBar.css';

export const NavBar: React.FC = () => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <div className="brand-logo">
                    <Activity size={24} />
                </div>
                <span className="brand-name">NorthStar IVR</span>
            </div>
            <div className="navbar-links">
                <Link
                    to="/"
                    className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                >
                    Dashboard
                </Link>
                <Link
                    to="/demo"
                    className={`nav-link ${location.pathname === '/demo' ? 'active' : ''}`}
                >
                    <Phone size={16} />
                    IVR Interactive Demo
                </Link>
            </div>
        </nav>
    );
};
