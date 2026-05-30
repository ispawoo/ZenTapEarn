// Zen Tap Session Summary Screen Component
// Displays key accomplishments (taps, time, streak progress) and triggers calming interstitial ads.

import React, { useEffect, useState } from 'react';
import { hapticImpact } from '../telegram';
import { adsManager, CalmingAdOverlay } from '../ads';
import { db } from '../database';
import { Heart } from 'lucide-react';

export const SummaryScreen = ({ sessionData, onRestart, onGoHome, onGoToDaily }) => {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    // Increment session count to trigger interstitial ads gracefully
    adsManager.incrementSessions();
    if (adsManager.shouldShowInterstitial()) {
      // Delay showing the ad slightly for a smooth transition
      const timer = setTimeout(() => {
        setShowAd(true);
        adsManager.resetSessions();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRestartClick = () => {
    hapticImpact('heavy');
    onRestart();
  };

  const handleHomeClick = () => {
    hapticImpact('medium');
    onGoHome();
  };

  // Convert seconds to human readable (e.g. 120 -> "2m 00s")
  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const rSecs = secs % 60;
    if (mins === 0) return `${rSecs}s`;
    return `${mins}m ${rSecs}s`;
  };

  // Harmonious supportive messages
  const calmMessages = [
    { title: "Your mind feels calmer 🌿", text: "Great job taking this slow pause to center yourself." },
    { title: "Great job slowing down 🫧", text: "Even a brief break helps build inner resilience." },
    { title: "Peace flows within you 🌸", text: "Your body is relaxed, and your focus is restored." }
  ];
  
  const randomMsg = calmMessages[sessionData.calmScore % calmMessages.length];

  return (
    <div className="screen fade-in">
      <div className="summary-container">
        <div className="header">
          <h2 className="title-lg" style={{ textAlign: 'center' }}>Zen Break Complete</h2>
          <p className="subtitle" style={{ textAlign: 'center' }}>You took a moment to breathe</p>
        </div>

        <div className="summary-illustration">
          <div className="summary-glow"></div>
          <span className="summary-avatar"><Heart size={80} color="var(--theme-accent)" strokeWidth={1.5} /></span>
        </div>

        {/* Stats Grid */}
        <div className="summary-card-grid">
          <div className="stat-box glass-card">
            <span className="stat-box-title">⏱ Time Spent</span>
            <span className="stat-box-val">{formatDuration(sessionData.durationSeconds || 120)}</span>
          </div>

          <div className="stat-box glass-card">
            <span className="stat-box-title">✨ Calm Score</span>
            <span className="stat-box-val">+{sessionData.calmScore}</span>
          </div>

          <div className="stat-box glass-card">
            <span className="stat-box-title">👆 Interactions</span>
            <span className="stat-box-val">{sessionData.interactionsCount} taps</span>
          </div>

          <div className="stat-box glass-card">
            <span className="stat-box-title">🔥 Streak</span>
            <span className="stat-box-val">{db.getState().currentStreak} days</span>
          </div>
        </div>

        {/* Dynamic Calming Message */}
        <div className="summary-message glass-card">
          <h4>{randomMsg.title}</h4>
          <p>{randomMsg.text}</p>
        </div>

        {/* Action Button Group */}
        <div className="summary-btn-group">
          <button className="glass-btn primary" onClick={handleRestartClick}>
            Another Zen Session
          </button>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
            <button className="glass-btn" onClick={onGoToDaily}>
              Daily Challenge
            </button>
            <button className="glass-btn" onClick={handleHomeClick}>
              Go Home
            </button>
          </div>
        </div>
      </div>

      {/* Breathing Interstitial Ad Simulation */}
      <CalmingAdOverlay
        isOpen={showAd}
        onClose={() => setShowAd(false)}
        type="interstitial"
      />
    </div>
  );
};
export default SummaryScreen;
