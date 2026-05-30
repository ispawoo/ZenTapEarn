// Zen Tap 7-Day Challenge Screen Component
// Motivates users to maintain a daily relaxation habit through Zen Gem rewards.

import React, { useState, useEffect } from 'react';
import { db } from '../database';
import { hapticImpact, hapticNotification } from '../telegram';
import { audio } from '../audio';
import { Check, Gift, Gem, Leaf } from 'lucide-react';

export const DailyChallengeScreen = ({ onBack }) => {
  const [dbState, setDbState] = useState(db.getState());
  
  useEffect(() => {
    // Check daily streak status on load
    db.checkStreak();
    setDbState(db.getState());
  }, []);

  const handleClaimReward = () => {
    hapticNotification('success');
    audio.playChime();
    
    // Increment DB wallet
    db.claimDailyChallenge();
    setDbState(db.getState());
    
    alert('7-Day Zen Challenge complete! 50 Zen Gems & 100 Calm Points added! Keep your daily mindfulness habit growing.');
  };

  const currentStreak = dbState.currentStreak;
  const isClaimable = dbState.activeDays.filter(Boolean).length >= 7;

  return (
    <div className="screen fade-in" style={{ paddingBottom: '30px' }}>
      <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        <button 
          className="glass-btn" 
          onClick={onBack}
          style={{ width: '42px', height: '42px', padding: 0, borderRadius: '50%', fontSize: '18px' }}
        >
          ‹
        </button>
        <div>
          <h2 className="title-lg" style={{ marginBottom: 0 }}>Daily Zen</h2>
          <p className="subtitle">Daily mindfulness rituals</p>
        </div>
      </div>

      <div className="daily-challenge-container glass-card slide-up" style={{ padding: '30px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 500 }}>Daily Challenge</h3>
        
        {/* Dotted Radial Tracker */}
        <div className="daily-progress-badge" style={{ margin: '20px 0' }}>
          <span className="daily-progress-val">Day {Math.min(currentStreak, 7)}</span>
          <span className="daily-progress-lbl">Streak</span>
        </div>

        <p className="subtitle" style={{ fontSize: '13px', lineHeight: 1.5, padding: '0 10px' }}>
          Relax for 7 days in a row and earn a special reward of <b>50 Zen Gems</b>!
        </p>

        {/* 7-Day Streak Bubble Grid */}
        <div className="calendar-grid">
          {[1, 2, 3, 4, 5, 6, 7].map((day, idx) => {
            // Day is completed if idx < streak
            const isActive = dbState.activeDays[idx];
            return (
              <div 
                key={day} 
                className={`calendar-day ${isActive ? 'active' : ''}`}
              >
                <span className="day-num">{day}</span>
                <span className="day-check">{isActive ? <Check size={12} strokeWidth={3} /> : '•'}</span>
              </div>
            );
          })}
        </div>

        {/* Reward Box */}
        <div 
          className="glass-card" 
          style={{ 
            width: '100%', 
            background: 'rgba(251, 191, 36, 0.08)', 
            borderColor: 'rgba(251, 191, 36, 0.3)', 
            margin: '24px 0 10px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}><Gift size={24} color="var(--gold-color)" /></span>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 500 }}>7-Day Reward</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Zen Gems bonus</p>
            </div>
          </div>
          <span style={{ color: 'var(--gold-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Gem size={16} /> 50</span>
        </div>

        <button 
          className="glass-btn primary" 
          onClick={handleClaimReward} 
          disabled={!isClaimable}
          style={{ 
            width: '100%', 
            opacity: isClaimable ? 1 : 0.6,
            cursor: isClaimable ? 'pointer' : 'default',
            marginTop: 'auto'
          }}
        >
          {isClaimable ? 'Claim Reward' : 'Complete 7 Days to Claim'}
        </button>
      </div>
    </div>
  );
};
export default DailyChallengeScreen;
