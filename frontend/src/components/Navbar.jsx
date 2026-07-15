import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Navbar = ({ onStartTest }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    transition: 'all 0.3s ease',
    background: scrolled
      ? 'rgba(5, 13, 26, 0.9)'
      : 'transparent',
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
  };

  return (
    <nav style={navStyle}>
      <div className="container flex-between" style={{ height: '70px' }}>
        {/* Brand */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,212,255,0.4)',
            fontSize: '1rem', fontWeight: 800, color: '#fff',
            fontFamily: 'Outfit, sans-serif'
          }}>
            C
          </div>
          <span style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.25rem',
            background: 'linear-gradient(135deg, #00d4ff, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            CareerAI
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          {[
            { label: 'Home', href: '#hero' },
            { label: 'How It Works', href: '#how-it-works' },
          ].map(({ label, href }) => (
            <a key={label} href={href} style={{
              color: '#94a3b8', textDecoration: 'none', fontSize: '0.95rem',
              fontWeight: 500, transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = '#00d4ff'}
              onMouseLeave={e => e.target.style.color = '#94a3b8'}
            >
              {label}
            </a>
          ))}

          <button
            className="btn btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.9rem' }}
            onClick={onStartTest}
          >
            Start Test
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(5,13,26,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '1rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem'
          }}
        >
          <a href="#hero" style={{ color: '#94a3b8', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#how-it-works" style={{ color: '#94a3b8', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>How It Works</a>
          <button className="btn btn-primary" onClick={() => { onStartTest(); setMenuOpen(false); }}>Start Test</button>
        </motion.div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
