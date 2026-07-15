import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell,
} from 'recharts';

// ─── Motivational quotes ─────────────────────────────────────────
const QUOTES = [
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'Your career is a journey, not a destination. Every step counts.', author: 'CareerAI' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Choose a job you love and you will never have to work a day in your life.', author: 'Confucius' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela' },
  { text: 'Your time is limited. Do not waste it living someone else\'s life.', author: 'Steve Jobs' },
  { text: 'The best way to predict the future is to create it.', author: 'Peter Drucker' },
  { text: 'Believe you can and you are halfway there.', author: 'Theodore Roosevelt' },
];

// ─── Career color map for PCA scatter ─────────────────────────────
const CAREER_COLORS = {
  'AI Engineer': '#00d4ff', 'Software Engineer': '#3b82f6', 'Data Analyst': '#06b6d4',
  'UI/UX Designer': '#f472b6', 'Marketing Manager': '#fb923c', 'Cybersecurity Analyst': '#a78bfa',
  'Product Manager': '#fbbf24', 'Biomedical Researcher': '#4ade80', 'Finance Analyst': '#e879f9',
  'Content Creator': '#f87171', 'Architect': '#818cf8', 'Psychologist': '#2dd4bf',
  'Civil Services': '#d97706', 'Doctor': '#22d3ee', 'Lawyer': '#c084fc', 'Teacher': '#34d399',
};

// ─── Career roadmap content ─────────────────────────────────────
const ROADMAPS = {
  'AI Engineer':           ['Master Python & Math', 'Learn ML fundamentals (sklearn)', 'Deep Learning with PyTorch', 'Build MLOps pipelines'],
  'Software Engineer':     ['Master DSA & a language', 'Learn System Design', 'Build REST APIs & databases', 'Contribute to Open Source'],
  'Data Analyst':          ['Excel & SQL mastery', 'Python (Pandas, Matplotlib)', 'BI Tools — Tableau / PowerBI', 'Build end-to-end dashboards'],
  'UI/UX Designer':        ['Learn Figma & wireframing', 'Study Color Theory & Typography', 'Conduct User Research', 'Build a 5-case-study portfolio'],
  'Marketing Manager':     ['SEO & Content Marketing', 'Google Analytics & Meta Ads', 'Email & Social Media Strategy', 'Run a real campaign'],
  'Cybersecurity Analyst': ['Networking & Linux basics', 'Learn OWASP Top 10', 'Practice on TryHackMe / HackTheBox', 'Get CompTIA Security+ or CEH'],
  'Product Manager':       ['Learn Agile / Scrum', 'Write PRDs & user stories', 'Use Mixpanel / Amplitude', 'Build a product roadmap'],
  'Biomedical Researcher': ['Biology, Chemistry & Math base', 'Learn R or Python for data', 'Study bioinformatics tools', 'Publish or replicate research'],
  // 8 New Careers
  'Finance Analyst':       ['Learn accounting & financial statements', 'Master Excel & financial modelling (DCF)', 'Pursue CFA Level 1 or CA Foundation', 'Build a stock pitch / investment project'],
  'Content Creator':       ['Pick a niche & define your audience', 'Learn video editing or writing skills', 'Publish consistently for 6 months', 'Build multiple income streams'],
  'Architect':             ['Master technical drawing & design principles', 'Learn AutoCAD & Revit (BIM)', 'Build a 5-project design portfolio', 'Complete internship & register with Council of Architecture'],
  'Psychologist':          ['Study core psychology branches', 'Learn psychological assessment tools', 'Practice counselling through supervised sessions', 'Pursue MPhil Clinical or I/O Psychology specialisation'],
  'Civil Services':        ['Read all NCERTs (6th–12th)', 'Read The Hindu daily, take current affairs notes', 'Study Laxmikant, Bipan Chandra, Shankar IAS', 'Write mock answers & essays weekly'],
  'Doctor':                ['Clear NEET-UG (2–3 years prep)', 'Complete MBBS with clinical focus', 'Clear NEET-PG for MD/MS specialisation', 'Consider super-specialisation (DM/MCh)'],
  'Lawyer':                ['Clear CLAT for NLU admission', 'Participate in moot courts & law firm internships', 'Build expertise in one practice area (corporate/IP/criminal)', 'Enroll with Bar Council of India'],
  'Teacher':               ['Complete UG/PG in your subject', 'Pursue B.Ed for school or UGC-NET for college', 'Build content delivery & communication skills', 'Build online teaching presence (YouTube / EdTech)'],
};

const DEFAULT_ROADMAP = ['Explore your field', 'Build core skills', 'Create real projects', 'Apply & iterate'];

// ─── Confidence Ring SVG ─────────────────────────────────────────
const ConfidenceRing = ({ value, label, color = '#00d4ff' }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = value / 50;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplayed(value); clearInterval(timer); }
      else setDisplayed(Math.round(start));
    }, 20);
    return () => clearInterval(timer);
  }, [value]);

  const offset = circumference - (displayed / 100) * circumference;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto' }}>
        <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id={`rg-${label}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
          <circle
            cx="65" cy="65" r={radius} fill="none"
            stroke={`url(#rg-${label})`}
            strokeWidth="9" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color }}>{displayed}%</span>
        </div>
      </div>
      <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '8px' }}>{label}</p>
    </div>
  );
};

// ─── Custom Tooltip ──────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(5,13,26,0.95)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem' }}>
        <p style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#00d4ff', fontWeight: 700 }}>Impact: {payload[0].value?.toFixed(4)}</p>
      </div>
    );
  }
  return null;
};

// ─── Main Dashboard ──────────────────────────────────────────
const ResultsDashboard = ({ data, onRetake }) => {
  if (!data) return null;

  const { prediction, confidence, calibrated_confidence, cluster_name, shap_data, pca_coords, pca_reference, skill_scores } = data;

  const roadmapSteps = ROADMAPS[prediction] || DEFAULT_ROADMAP;

  // Random motivational quote (changes each render/session)
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  // Low confidence flag
  const lowConfidence = confidence < 40;

  // Radar chart data from skill_scores
  const radarData = skill_scores
    ? Object.entries(skill_scores).map(([name, value]) => {
        const max = ['Math', 'Science'].includes(name) ? 100 : 10;
        return { subject: name, value: Math.round((value / max) * 100), fullMark: 100 };
      })
    : [];

  // PCA scatter: your point + reference students
  const pcaYou = [{ x: pca_coords?.[0] ?? 0, y: pca_coords?.[1] ?? 0, z: 200, name: 'You', career: prediction }];
  const pcaRef = (pca_reference || []).map(p => ({ ...p, z: 60 }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ minHeight: '100vh', paddingTop: '90px', paddingBottom: '60px' }}
    >
      <div className="container">

        {/* ── Motivational Quote ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(124,58,237,0.06)', borderRadius: '12px', border: '1px solid rgba(124,58,237,0.15)' }}
        >
          <p style={{ fontStyle: 'italic', color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
            "{quote.text}"
          </p>
          <p style={{ color: '#7c3aed', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>-- {quote.author}</p>
        </motion.div>

        {/* ── Low Confidence Warning ── */}
        {lowConfidence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', background: 'rgba(251,146,60,0.1)', borderRadius: '10px', border: '1px solid rgba(251,146,60,0.3)' }}
          >
            <p style={{ color: '#fb923c', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
              <strong>Low Confidence Warning:</strong> The AI model is less than 50% confident in this prediction. This usually happens when responses are too neutral or similar. For more accurate results, answer the questions honestly based on your real interests!
            </p>
          </motion.div>
        )}

        {/* ── Hero Result Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ textAlign: 'center', marginBottom: '2rem', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}
        >
          {/* Background glow */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% -20%, rgba(0,212,255,0.08), transparent 70%)', pointerEvents: 'none' }} />

          <p style={{ color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
            AI Recommended Career Path
          </p>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.1 }}>
            <span className="gradient-text">{prediction}</span>
          </h1>

          {cluster_name && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <span className="persona-badge">{cluster_name}</span>
            </div>
          )}

          {/* Confidence rings */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
            <ConfidenceRing value={Math.round(confidence)} label="RF Confidence" color="#00d4ff" />
            {calibrated_confidence != null && (
              <ConfidenceRing value={Math.round(calibrated_confidence)} label="AI Calibrated" color="#7c3aed" />
            )}
          </div>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid-2" style={{ marginBottom: '2rem' }}>

          {/* Skill Radar Chart */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>
              <span className="gradient-text-cyan">Your Skill Web</span>
            </h3>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1rem' }}>How your 6 abilities compare</p>
            {radarData.length > 0 && (
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Inter' }} />
                  <Radar name="Skills" dataKey="value" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2} dot={{ fill: '#00d4ff', r: 4 }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* SHAP Explainability */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>
              <span className="gradient-text-cyan">Explainable AI (SHAP)</span>
            </h3>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1rem' }}>Which inputs drove the AI decision</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={shap_data} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="feature" type="category" width={75} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="impact" fill="url(#shap-gradient)" radius={[0, 6, 6, 0]}>
                  <defs>
                    <linearGradient id="shap-gradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#00d4ff" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* ── Roadmap ── */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', marginBottom: '0.4rem' }}>
                <span className="gradient-text-cyan">Your Career Roadmap</span>
              </h3>
              <p style={{ color: '#475569', fontSize: '0.88rem' }}>Step-by-step path to becoming a <strong style={{ color: '#94a3b8' }}>{prediction}</strong></p>
            </div>
          </div>

          <div className="roadmap-timeline">
            {roadmapSteps.map((step, i) => (
              <motion.div
                key={i}
                className="roadmap-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="roadmap-dot">{i + 1}</div>
                <div className="roadmap-content">
                  <h4>{step}</h4>
                  <p>Build strong foundations and practice consistently to master this phase.</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Learner Persona ── */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ marginBottom: '2rem' }}
        >
          <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.4rem' }}>
            <span className="gradient-text-cyan">Learner Persona: {cluster_name || "The Versatile Builder"}</span>
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginTop: '1rem' }}>
            {
              {
                'The Mathematical Mind': 'You approach problems with strong quantitative logic and pattern recognition. You excel in structured, data-driven environments.',
                'The Analytical Thinker': 'You break down complex systems into logical steps. You are a natural problem solver who relies on objective analysis.',
                'The Creative Visionary': 'You thrive on innovation and aesthetics. You approach your career through imagination, design, and out-of-the-box thinking.',
                'The Business Strategist': 'You understand the big picture. You focus on efficiency, management, and translating ideas into real-world value.',
                'The Tech Innovator': 'You are highly adaptable to new tools and software. You love building digital solutions and staying ahead of the curve.',
                'The Deep Researcher': 'You are deeply curious and detail-oriented. You prefer diving deep into a single subject to master its core principles.',
                'The Versatile Builder': 'You have a balanced skill set across logic, creativity, and tech. You are a generalist who can adapt to any role.'
              }[cluster_name] || 'You have a balanced skill set across logic, creativity, and tech. You are a generalist who can adapt to any role.'
            }
          </p>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(124,58,237,0.1)', borderRadius: '8px', border: '1px solid rgba(124,58,237,0.3)' }}>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
              <strong>Why this matters:</strong> While your predicted career is <strong style={{color: '#fff'}}>{prediction}</strong>, your persona dictates <em>how</em> you will approach it. For example, two people can be Software Engineers, but a "Creative Visionary" will build beautiful frontend UIs, while an "Analytical Thinker" will optimize backend databases.
            </p>
          </div>
        </motion.div>

        {/* ── Actions ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          style={{ textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}
        >
          <button className="btn btn-ghost" onClick={onRetake}>
            ← Retake Test
          </button>
          <button
            className="btn btn-primary"
            onClick={() => document.querySelector('.chatbot-trigger')?.click()}
          >
            Chat with AI Counselor →
          </button>
        </motion.div>

        {/* ── Technical Analysis: PCA Skill-Space ── */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2rem' }}
        >
          <p style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>Technical Analysis</p>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.4rem' }}>
            <span className="gradient-text-cyan">PCA Skill-Space Visualization</span>
          </h3>
          <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>
            This chart uses <strong style={{ color: '#94a3b8' }}>Principal Component Analysis (PCA)</strong> to compress your 6 skill dimensions into a 2D plane. Each dot represents a student profile from the training dataset, colored by their career. Your position (star) shows where your skill profile sits relative to these clusters.
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
              <XAxis type="number" dataKey="x" name="PC1" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="number" dataKey="y" name="PC2" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <ZAxis type="number" dataKey="z" range={[30, 200]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }}
                contentStyle={{ background: 'rgba(5,13,26,0.95)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, fontSize: '0.85rem' }}
                formatter={(value, name) => [typeof value === 'number' ? value.toFixed(2) : value, name]}
                labelFormatter={() => ''}
              />
              {/* Reference students */}
              <Scatter name="Training Data" data={pcaRef}>
                {pcaRef.map((entry, idx) => (
                  <Cell key={idx} fill={CAREER_COLORS[entry.career] || '#475569'} fillOpacity={0.35} />
                ))}
              </Scatter>
              {/* Your point */}
              <Scatter name="You" data={pcaYou} shape="star">
                <Cell fill="#fff" stroke="#00d4ff" strokeWidth={2} />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: '0.75rem', justifyContent: 'center' }}>
            {Object.entries(CAREER_COLORS).map(([career, color]) => (
              <span key={career} style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                {career}
              </span>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default ResultsDashboard;
