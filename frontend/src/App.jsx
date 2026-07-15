import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AptitudeWizard from './components/AptitudeWizard';
import ResultsDashboard from './components/ResultsDashboard';
import Chatbot from './components/Chatbot';

// ─────────────────────────────────────────────────────────────
// App States: 'home' → 'quiz' → 'loading' → 'results'
// ─────────────────────────────────────────────────────────────

function App() {
  const [appState, setAppState] = useState('home'); // 'home' | 'quiz' | 'loading' | 'results'
  const [results, setResults] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState('');

  const handleStartTest = () => {
    setAppState('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTestSubmit = async (payload) => {
    setAppState('loading');
    setLoadingMsg('Running Random Forest + SHAP...');

    const messages = [
      'Running Random Forest + SHAP...',
      'Clustering your learner persona...',
      'Calibrating with PyTorch model...',
      'Fetching your career roadmap...',
    ];

    let i = 0;
    const msgTimer = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingMsg(messages[i]);
    }, 1200);

    try {
      // Use Render's dynamically provided VITE_API_URL if it exists, otherwise default to local dev
      const API_BASE = import.meta.env.VITE_API_URL ? `https://${import.meta.env.VITE_API_URL}` : 'http://localhost:5000';
      const res = await axios.post(`${API_BASE}/api/predict`, payload);
      
      clearInterval(msgTimer);
      setResults(res.data);
      setAppState('results');
    } catch (err) {
      clearInterval(msgTimer);
      alert('Could not reach the AI backend. Make sure the Flask server is running on port 5000.');
      setAppState('quiz');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetake = () => {
    setResults(null);
    setAppState('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Navbar onStartTest={handleStartTest} />

      {/* ── Home ── */}
      {appState === 'home' && (
        <HeroSection onStartTest={handleStartTest} />
      )}

      {/* ── Quiz ── */}
      {appState === 'quiz' && (
        <AptitudeWizard onSubmit={handleTestSubmit} />
      )}

      {/* ── Loading ── */}
      {appState === 'loading' && (
        <div className="loading-screen">
          <div className="loading-orb" />
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
              <span className="gradient-text">Analysing Your Profile</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>{loadingMsg}</p>
          </div>
          <div className="loading-dots">
            <span /><span /><span />
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {appState === 'results' && results && (
        <ResultsDashboard data={results} onRetake={handleRetake} />
      )}

      {/* Chatbot — always visible */}
      <Chatbot />
    </>
  );
}

export default App;
