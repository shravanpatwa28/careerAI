import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const SKILLS = ['Math', 'Science', 'Logic', 'Creative', 'Tech', 'Business', 'AI', 'Design', 'Data', 'Strategy'];

const HeroSection = ({ onStartTest }) => {
  const canvasRef = useRef(null);

  // Animated particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particles
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${p.alpha})`;
        ctx.fill();
      });

      // Connect nearby particles
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - d / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const stats = [
    { value: '16', label: 'Career Paths' },
    { value: '99%', label: 'Accuracy' },
    { value: '6', label: 'AI Models' },
  ];

  return (
    <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>

      {/* Particle Canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '15%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '120px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>

          {/* Eyebrow tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="chip" style={{ borderColor: 'rgba(0,212,255,0.3)', color: '#00d4ff', background: 'rgba(0,212,255,0.08)', marginBottom: '1.5rem', display: 'inline-flex' }}>
              ✦ Powered by Random Forest + HDBSCAN + LLaMA 3.3
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem' }}
          >
            <span className="gradient-text">Discover Your</span>
            <br />
            AI-Powered Career Path
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 560, margin: '0 auto 2.5rem' }}
          >
            Answer 12 questions. Our multi-model AI analyses your aptitude,
            clusters your learner persona, and recommends your ideal career -- designed
            for students after Class 10 and above.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}
          >
            <button
              className="btn btn-primary"
              style={{ fontSize: '1.05rem', padding: '14px 36px' }}
              onClick={onStartTest}
            >
              Take the Test →
            </button>
            <a href="#how-it-works" className="btn btn-ghost" style={{ fontSize: '1.05rem', padding: '14px 28px' }}>
              How It Works
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}
          >
            {stats.map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div className="stat-number gradient-text-cyan">{value}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ position: 'relative', zIndex: 1, padding: '5rem 0', background: 'rgba(5,13,26,0.5)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2.2rem', marginBottom: '1rem' }}>
              <span className="gradient-text">How It Works</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>Three steps. Powered by 6 AI models working together.</p>
          </motion.div>

          <div className="grid-3">
            {[
              {
                step: '01',
                title: 'Answer 12 Questions',
                desc: 'Enter your Class 10 marks in Math & Science, then rate your interest in logical, creative, tech, and business activities on a 1-5 scale.',
                icon: '📝',
                color: '#00d4ff',
              },
              {
                step: '02',
                title: 'AI Analyses Your Profile',
                desc: 'Random Forest predicts your career. HDBSCAN clusters your learner persona. PyTorch calibrates confidence. SHAP explains every decision.',
                icon: '🧠',
                color: '#7c3aed',
              },
              {
                step: '03',
                title: 'Get Your Roadmap',
                desc: 'See your recommended career, persona type, explainability chart, and a personalised roadmap. Chat with your AI counselor anytime.',
                icon: '🚀',
                color: '#ff6b6b',
              },
            ].map(({ step, title, desc, icon, color }, i) => (
              <motion.div
                key={step}
                className="glass-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'absolute', top: '1rem', right: '1.2rem', fontFamily: 'Outfit, sans-serif', fontSize: '3rem', fontWeight: 900, color, opacity: 0.08 }}>
                  {step}
                </div>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.15rem', fontWeight: 700, color, marginBottom: '0.75rem' }}>
                  {title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.7 }}>{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Skill chips row */}
          <div style={{ marginTop: '3rem', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {SKILLS.map(s => (
              <motion.span
                key={s}
                className="chip"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                {s}
              </motion.span>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
};

export default HeroSection;
