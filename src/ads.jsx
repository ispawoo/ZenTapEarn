// Ads Monetization Integration and Simulator Hooks for Zen Tap
// Implements highly integrated, calm-themed simulated ad placements.
// Prevents stress or jarring UX by using serene breathing overlays as ads.

import React, { useState, useEffect } from 'react';
import { hapticImpact, hapticNotification } from './telegram';

class AdsSystem {
  constructor() {
    this.sessionCount = 0;
    this.interstitialThreshold = 2; // Show every 2 sessions
  }

  incrementSessions() {
    this.sessionCount += 1;
  }

  shouldShowInterstitial() {
    return this.sessionCount >= this.interstitialThreshold;
  }

  resetSessions() {
    this.sessionCount = 0;
  }
}

export const adsManager = new AdsSystem();

// Peaceful Breathing Interstitial Overlay Component
export const CalmingAdOverlay = ({ isOpen, onClose, type = 'interstitial', onRewardEarned }) => {
  const [countdown, setCountdown] = useState(type === 'rewarded' ? 5 : 4);
  const [breatheState, setBreatheState] = useState('Inhale');

  useEffect(() => {
    if (!isOpen) return;

    // Reset countdown when opened
    setCountdown(type === 'rewarded' ? 5 : 4);
    hapticImpact('light');

    // Breathing instruction cycle: 2s Inhale, 2s Exhale
    const breatheInterval = setInterval(() => {
      setBreatheState(prev => prev === 'Inhale' ? 'Exhale' : 'Inhale');
      hapticImpact('soft');
    }, 2000);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          clearInterval(breatheInterval);
          hapticNotification('success');
          if (type === 'rewarded' && onRewardEarned) {
            onRewardEarned();
          }
          setTimeout(() => {
            onClose();
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(breatheInterval);
    };
  }, [isOpen, type, onClose, onRewardEarned]);

  if (!isOpen) return null;

  return (
    <div className="ad-overlay">
      <div className="ad-card glass-card">
        <div className="ad-badge">{type === 'rewarded' ? '✨ Rewarded Pause' : '🌿 Mindful Minute'}</div>
        
        <h3 className="ad-title">
          {type === 'rewarded' 
            ? 'Breathing for 2x Calm Points' 
            : 'Relax your shoulders...'}
        </h3>
        
        <div className={`ad-breather ${breatheState.toLowerCase()}`}>
          <div className="breather-circle"></div>
          <div className="breather-text">{breatheState}</div>
        </div>

        <p className="ad-instruction">
          {type === 'rewarded' 
            ? 'Complete this short cycle to claim double rewards!' 
            : 'A gentle pause to keep your mind centered.'}
        </p>

        <div className="ad-footer">
          <span>Resuming Zen in <b>{countdown}s</b></span>
        </div>
      </div>
    </div>
  );
};

// Non-intrusive Banner Ad Component for Dashboard Screen
export const BannerAd = () => {
  const [clicked, setClicked] = useState(false);

  const handleBannerClick = () => {
    if (clicked) return;
    hapticImpact('medium');
    setClicked(true);
    // Simple popup or redirection placeholder
    alert('Thank you for supporting Zen Tap! +10 Calm Points added for exploring our sponsor.');
    
    // Dynamically update db points
    import('./database').then(({ db }) => {
      db.addPoints(10);
      db.addGems(10);
    });
  };

  return (
    <div className="banner-ad glass-card" onClick={handleBannerClick}>
      <div className="banner-badge">Sponsor</div>
      <div className="banner-content">
        <span className="banner-icon">🌸</span>
        <div className="banner-text">
          <h4>Mindful Garden app</h4>
          <p>Grow virtual bonsai trees as you meditate.</p>
        </div>
      </div>
      <button className="banner-btn" disabled={clicked}>
        {clicked ? '✓ Visited' : 'Explore'}
      </button>
    </div>
  );
};
export default CalmingAdOverlay;
