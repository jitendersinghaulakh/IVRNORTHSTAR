import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
    GitMerge,
    MessageSquare,
    ShieldCheck,
    LineChart,
    Target,
    CheckCircle2,
    Zap,
    Users,
    Clock,
    Award
} from 'lucide-react';
import { CallControl } from './CallControl';
import { IncomingCall } from './IncomingCall';
import { IvrTester } from './IvrTester';
import './Dashboard.css';

interface MetricItem {
    label: string;
    target: string;
    desc: string;
}

interface StrategyItem {
    id: number;
    title: string;
    icon: React.ElementType;
    points: string[];
    color: string;
    accent: string;
}

interface RoadmapPhase {
    phase: string;
    title: string;
    duration: string;
    items: string[];
}

const metricsData: MetricItem[] = [
    { label: "Task Completion Rate", target: "70-85%", desc: "Goal achievement via IVR" },
    { label: "Containment Rate", target: "50-80%", desc: "Resolved without agent" },
    { label: "Avg Time to Resolution", target: "2-4 min", desc: "Speed of self-service" },
    { label: "Cust. Satisfaction", target: "4.0+/5.0", desc: "Overall experience score" },
];

const strategyData: StrategyItem[] = [
    {
        id: 1,
        title: "1. Own the IVR Journey",
        icon: GitMerge,
        color: "rgba(99, 102, 241, 0.1)", // Primary
        accent: "#6366f1",
        points: [
            "Define North Star capabilities & strategic roadmap",
            "End-to-end journey maps (auth, intents, fallbacks)",
            "Prioritize intents via business value & volume",
            "Maintain strict intent taxonomy & governance"
        ]
    },
    {
        id: 2,
        title: "2. Conversational Standards",
        icon: MessageSquare,
        color: "rgba(236, 72, 153, 0.1)", // Pink
        accent: "#ec4899",
        points: [
            "Define persona: Clear, calm, confident, empathetic",
            "Principles: Zero jargon, one question at a time",
            "Structured failure pathways & fallback messaging",
            "Never blame users for system errors"
        ]
    },
    {
        id: 3,
        title: "3. CX Custodian",
        icon: ShieldCheck,
        color: "rgba(16, 185, 129, 0.1)", // Emerald
        accent: "#10b981",
        points: [
            "Review & certify all intents before deployment",
            "Enforce adherence to design principles",
            "Cross-pollinate learnings between LOBs",
            "Reject implementations failing certification"
        ]
    },
    {
        id: 4,
        title: "4. Data-Led Optimization",
        icon: LineChart,
        color: "rgba(245, 158, 11, 0.1)", // Amber
        accent: "#f59e0b",
        points: [
            "Baseline metrics for current state performance",
            "Transcript analysis for improvement opportunities",
            "Weekly/Monthly/Quarterly optimization cycles",
            "Translate customer behavior into design changes"
        ]
    }
];

const roadmapData: RoadmapPhase[] = [
    {
        phase: "Phase 1",
        title: "Foundation",
        duration: "Months 1-3",
        items: ["North Star vision & metrics", "Unified intent taxonomy", "Conversation design standards", "Baseline metrics setup"]
    },
    {
        phase: "Phase 2",
        title: "Stabilize",
        duration: "Months 4-9",
        items: ["Redesign top 10 failure journeys", "Fix authentication flows", "Reduce escalations by 25-40%", "Operationalize certification"]
    },
    {
        phase: "Phase 3",
        title: "Optimize & Scale",
        duration: "Months 10-18",
        items: ["Proactive/Predictive routing", "Personalization (VIP, etc.)", "Automated AI insights", "Self-sustaining improvement"]
    }
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
};

export const Dashboard: React.FC = () => {
    return (
        <div className="dashboard-container">
            {/* Hero Section */}
            <motion.div
                className="dashboard-header"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <h1 className="dashboard-title">IVR Experience Design</h1>
                <p className="dashboard-subtitle">
                    A coherent ecosystem that resolves customer needs with minimal effort,
                    driven by data and empathy.
                </p>

                <div className="mission-box glass-panel">
                    <div className="mission-icon"><Target size={24} /></div>
                    <div>
                        <strong>Core Mission:</strong> Create a fast, predictable, and human IVR that speaks in a clear
                        voice, delivers consistent experiences, and evolves based on real behavior.
                    </div>
                </div>
            </motion.div>

            {/* Communication Controls */}
            <motion.div
                className="comms-container"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <CallControl />
                <IncomingCall />
                <IvrTester />
            </motion.div>

            {/* Metrics Grid */}
            <motion.div
                className="metrics-grid"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                {metricsData.map((m, i) => (
                    <motion.div key={i} className="metric-card glass-panel" variants={itemVariants}>
                        <div className="metric-label">{m.label}</div>
                        <div className="metric-value">{m.target}</div>
                        <div className="metric-desc">{m.desc}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Operating Model Pillars */}
            <div className="section-title-wrapper">
                <h2 className="section-title">Operating Model</h2>
                <div className="section-line"></div>
            </div>

            <motion.div
                className="grid-container"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {strategyData.map((item) => (
                    <motion.div
                        key={item.id}
                        className="card glass-panel"
                        variants={itemVariants}
                    >
                        <div
                            className="card-icon-wrapper"
                            style={{ backgroundColor: item.color, color: item.accent }}
                        >
                            <item.icon size={28} />
                        </div>

                        <h3 className="card-title">{item.title}</h3>

                        <ul className="card-points">
                            {item.points.map((point, index) => (
                                <li key={index} className="card-point">
                                    <span className="point-bullet" style={{ color: item.accent }}></span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </motion.div>

            {/* Roadmap Section */}
            <div className="section-title-wrapper">
                <h2 className="section-title">Strategic Roadmap</h2>
                <div className="section-line"></div>
            </div>

            <motion.div
                className="roadmap-container"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                {roadmapData.map((phase, i) => (
                    <div key={i} className="roadmap-phase glass-panel">
                        <div className="phase-header">
                            <span className="phase-tag">{phase.phase}</span>
                            <span className="phase-duration">{phase.duration}</span>
                        </div>
                        <h3 className="phase-title">{phase.title}</h3>
                        <ul className="phase-items">
                            {phase.items.map((item, idx) => (
                                <li key={idx}><CheckCircle2 size={14} className="phase-icon" /> {item}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </motion.div>

            {/* Impact/Outcomes Section */}
            <div className="section-title-wrapper">
                <h2 className="section-title">Desired Outcomes</h2>
                <div className="section-line"></div>
            </div>

            <motion.div
                className="outcomes-grid"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <div className="outcome-item glass-panel">
                    <Zap className="outcome-icon" size={32} />
                    <h3>Coherent Ecosystem</h3>
                    <p>Unified standards versus scattered flows.</p>
                </div>
                <div className="outcome-item glass-panel">
                    <Clock className="outcome-icon" size={32} />
                    <h3>Rapid Velocity</h3>
                    <p>Faster releases with safety guardrails.</p>
                </div>
                <div className="outcome-item glass-panel">
                    <Users className="outcome-icon" size={32} />
                    <h3>Clear Accountability</h3>
                    <p>Empowered teams with specific owners.</p>
                </div>
                <div className="outcome-item glass-panel">
                    <Award className="outcome-icon" size={32} />
                    <h3>Continuous Evolution</h3>
                    <p>Compounding improvements quarter over quarter.</p>
                </div>
            </motion.div>
        </div>
    );
};
