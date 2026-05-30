// Zen Tap Stats / Dashboard Screen Component
// Renders beautiful weekly bar charts, XP levels, streaks, and a banner ad integration.

import React from 'react';
import { db, getZenLevel } from '../database';
import { BannerAd } from '../ads';
import { Flame, User } from 'lucide-react';

export const StatsScreen = () => {
  const state = db.getState();
  const zenLevel = getZenLevel(state.calmPoints);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Calculate relative heights for weekly chart bars
  const maxPoints = Math.max(...Object.values(state.weeklyPoints), 20); // Fallback min baseline

  return (
    <div className="screen fade-in">
      <div className="header">
        <h2 className="title-lg">Your Zen Journey</h2>
        <p className="subtitle">Reflection and emotional progression</p>
      </div>

      {/* Streak Dashboard Card */}
      <div className="dashboard-streak glass-card slide-up">
        <div className="dashboard-streak-left">
          <span className="streak-badge-fire"><Flame size={32} color="var(--gold-color)" /></span>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 500 }}>Current Streak</h3>
            <p className="subtitle">{state.currentStreak} consecutive days</p>
          </div>
        </div>
        <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--theme-accent)' }}>
          {state.currentStreak} d
        </div>
      </div>

      {/* Zen Level XP Card */}
      <div className="glass-card slide-up" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="xp-level-badge">{zenLevel.name}</div>
            <div className="subtitle" style={{ fontSize: '12px' }}>Zen Level {zenLevel.level}</div>
          </div>
          <span style={{ fontSize: '32px' }}><User size={32} color="var(--theme-accent)" /></span>
        </div>

        <div>
          <div className="xp-header">
            <span className="xp-details">Progress to Next Stage</span>
            <span className="xp-details">{zenLevel.progress} / {zenLevel.maxXp - zenLevel.minXp} XP</span>
          </div>
          <div className="progress-container">
            <div 
              className="progress-fill" 
              style={{ width: `${(zenLevel.progress / (zenLevel.maxXp - zenLevel.minXp)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Calm Score (This Week) Bar Graph */}
      <div className="graph-container glass-card slide-up">
        <h3 className="graph-title">Calm Score (This Week)</h3>
        
        <div className="graph-canvas">
          {daysOfWeek.map((day) => {
            const score = state.weeklyPoints[day] || 0;
            // Height proportional to max score (limit to max 110px)
            const height = maxPoints > 0 ? (score / maxPoints) * 100 : 0;

            return (
              <div key={day} className="graph-bar-wrapper">
                <div 
                  className="graph-bar" 
                  style={{ height: `${Math.max(height, 5)}px` }}
                  data-score={`+${score}`}
                ></div>
                <span className="graph-day">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-Intrusive native banner ad */}
      <BannerAd />
    </div>
  );
};
export default StatsScreen;
