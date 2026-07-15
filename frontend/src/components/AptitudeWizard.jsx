import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = [
  { name: 'q1', text: 'I enjoy solving puzzles and logical problems', emoji: '🧩' },
  { name: 'q2', text: 'I like working with numbers and patterns', emoji: '🔢' },
  { name: 'q3', text: 'I enjoy drawing, writing, or creative activities', emoji: '🎨' },
  { name: 'q4', text: 'I like thinking of new ideas and solutions', emoji: '💡' },
  { name: 'q5', text: 'I enjoy using computers and technology', emoji: '💻' },
  { name: 'q6', text: 'I want to learn how apps and websites work', emoji: '🌐' },
  { name: 'q7', text: 'I enjoy managing money or planning things', emoji: '📊' },
  { name: 'q8', text: 'I like convincing and communicating with people', emoji: '🤝' },
  { name: 'q9', text: 'I can easily spot flaws in arguments or systems', emoji: '🔍' },
  { name: 'q10', text: 'I enjoy designing things that look visually appealing', emoji: '✨' },
  { name: 'q11', text: 'I like keeping up with the latest gadgets and software', emoji: '📱' },
  { name: 'q12', text: 'I am interested in how companies make money', emoji: '💰' },
];

const LABELS = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

const AptitudeWizard = ({ onSubmit }) => {
  const [step, setStep] = useState(0); // 0 = marks, 1-8 = questions
  const [formData, setFormData] = useState({
    math: '', science: '',
    q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3,
    q9: 3, q10: 3, q11: 3, q12: 3,
  });

  const totalSteps = 13; // 1 marks step + 12 questions
  const progress = ((step) / totalSteps) * 100;

  const handleChange = (e) => {
    const val = e.target.type === 'range' ? parseInt(e.target.value) : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: val }));
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
    const payload = {
      math:     parseInt(formData.math),
      science:  parseInt(formData.science),
      logical:  Math.round(((formData.q1 + formData.q2 + formData.q9) / 3) * 2),
      creative: Math.round(((formData.q3 + formData.q4 + formData.q10) / 3) * 2),
      tech:     Math.round(((formData.q5 + formData.q6 + formData.q11) / 3) * 2),
      business: Math.round(((formData.q7 + formData.q8 + formData.q12) / 3) * 2),
    };
    onSubmit(payload);
  };

  const sliderValue = step > 0 ? formData[QUESTIONS[step - 1]?.name] : 3;
  const sliderLabel = step > 0 ? LABELS[sliderValue - 1] : '';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 1.5rem 2rem' }}>

      {/* Card */}
      <div className="glass-card" style={{ width: '100%', maxWidth: 560 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            <span className="gradient-text">AI Career Aptitude Test</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Step {Math.min(step + 1, totalSteps)} of {totalSteps}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="progress-track" style={{ marginBottom: '2rem' }}>
          <motion.div
            className="progress-fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 0: Academic Marks ── */}
          {step === 0 && (
            <motion.div key="marks" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', color: '#e2e8f0' }}>Academic Marks</h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Enter your latest exam scores</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { name: 'math', label: 'Math', emoji: '📐' },
                  { name: 'science', label: 'Science', emoji: '🔬' },
                ].map(({ name, label, emoji }) => (
                  <div key={name}>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px' }}>
                      {emoji} {label} Score <span style={{ color: '#64748b' }}>(out of 100)</span>
                    </label>
                    <input
                      type="number"
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      min="0" max="100"
                      placeholder="e.g. 85"
                    />
                  </div>
                ))}
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={handleNext}
                disabled={!formData.math || !formData.science || formData.math > 100 || formData.science > 100}
              >
                Continue →
              </button>
            </motion.div>
          )}

          {/* ── Steps 1–12: Aptitude Questions ── */}
          {step >= 1 && step <= 12 && (
            <motion.div key={`q${step}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              {(() => {
                const q = QUESTIONS[step - 1];
                const val = formData[q.name];
                return (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>{q.emoji}</div>
                      <p style={{ fontSize: '1.05rem', color: '#e2e8f0', lineHeight: 1.6, fontWeight: 500 }}>
                        {q.text}
                      </p>
                    </div>

                    {/* Slider */}
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#475569' }}>Strongly Disagree</span>
                        <span style={{ fontSize: '0.78rem', color: '#475569' }}>Strongly Agree</span>
                      </div>

                      <input
                        type="range"
                        name={q.name}
                        min="1" max="5"
                        value={val}
                        onChange={handleChange}
                        style={{
                          background: `linear-gradient(to right, #00d4ff ${(val - 1) * 25}%, rgba(255,255,255,0.1) ${(val - 1) * 25}%)`,
                        }}
                      />

                      {/* Dots */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <span key={n} style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: n <= val ? '#00d4ff' : 'rgba(255,255,255,0.15)',
                            transition: 'background 0.2s',
                            display: 'inline-block',
                          }} />
                        ))}
                      </div>

                      {/* Label */}
                      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 18px',
                          background: 'rgba(0,212,255,0.12)',
                          border: '1px solid rgba(0,212,255,0.25)',
                          borderRadius: 50,
                          color: '#00d4ff',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          fontFamily: 'Outfit, sans-serif',
                        }}>
                          {LABELS[val - 1]}
                        </span>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="btn btn-ghost" style={{ flex: 1 }} onClick={handleBack}>
                        ← Back
                      </button>
                      {step < 12 ? (
                        <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleNext}>
                          Next →
                        </button>
                      ) : (
                        <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit}>
                          Get AI Recommendation 🚀
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default AptitudeWizard;
