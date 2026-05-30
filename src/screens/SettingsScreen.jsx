// Zen Tap Settings Screen Component
// Toggles music loops, program audio synthesizers, and Telegram haptic feedback layers.

import React, { useState } from 'react';
import { db } from '../database';
import { hapticImpact } from '../telegram';
import { audio } from '../audio';
import { Volume2, Music, Smartphone, Moon, Globe, Bell, Shield, Info } from 'lucide-react';

export const SettingsScreen = () => {
  const [dbState, setDbState] = useState(db.getState());
  const settings = dbState.settings;

  const handleToggle = (settingKey) => {
    const nextVal = !settings[settingKey];
    hapticImpact('light');
    
    // Update local DB
    db.updateSettings({ [settingKey]: nextVal });
    setDbState(db.getState());

    // Connect switches with procedural engine triggers
    if (settingKey === 'sound') {
      audio.setSoundEnabled(nextVal);
    }
    if (settingKey === 'music') {
      // Toggles ambient background drone
      if (nextVal && settings.sound) {
        audio.startAmbient(dbState.equippedSound || 'rainy');
      } else {
        audio.stopAmbient();
      }
    }
  };

  return (
    <div className="screen fade-in">
      <div className="header">
        <h2 className="title-lg">Settings</h2>
        <p className="subtitle">Customize your sensory relaxation options</p>
      </div>

      <div className="settings-list">
        {/* Toggle Sound */}
        <div className="setting-row glass-card slide-up">
          <div className="setting-info">
            <span className="setting-icon"><Volume2 size={20} /></span>
            <span className="setting-label">Sound Effects</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.sound} 
              onChange={() => handleToggle('sound')}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Toggle Music */}
        <div className="setting-row glass-card slide-up">
          <div className="setting-info">
            <span className="setting-icon"><Music size={20} /></span>
            <span className="setting-label">Ambient Background Music</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.music} 
              onChange={() => handleToggle('music')}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Toggle Haptics */}
        <div className="setting-row glass-card slide-up">
          <div className="setting-info">
            <span className="setting-icon"><Smartphone size={20} /></span>
            <span className="setting-label">Haptic Feedback</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.haptic} 
              onChange={() => handleToggle('haptic')}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Toggle Dark Mode */}
        <div className="setting-row glass-card slide-up">
          <div className="setting-info">
            <span className="setting-icon"><Moon size={20} /></span>
            <span className="setting-label">Dark Mode</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.darkMode} 
              onChange={() => handleToggle('darkMode')}
            />
            <span className="slider"></span>
          </label>
        </div>

        {/* Language Selection selector */}
        <div className="setting-row glass-card slide-up" onClick={() => { hapticImpact('medium'); alert('Zen Tap is fully optimized in English. Additional tranquil soundscapes & languages are rolling out soon!'); }}>
          <div className="setting-info">
            <span className="setting-icon"><Globe size={20} /></span>
            <span className="setting-label">Language</span>
          </div>
          <div className="setting-val-arrow">
            <span>{settings.language}</span>
            <span>›</span>
          </div>
        </div>

        {/* Info Rows */}
        <div className="setting-row glass-card slide-up" onClick={() => hapticImpact('light')}>
          <div className="setting-info">
            <span className="setting-icon"><Bell size={20} /></span>
            <span className="setting-label">Notifications</span>
          </div>
          <span className="setting-val-arrow">›</span>
        </div>

        <div className="setting-row glass-card slide-up" onClick={() => { hapticImpact('light'); alert('Zen Tap is a local-first application. No private telemetry is transmitted off your Telegram client.'); }}>
          <div className="setting-info">
            <span className="setting-icon"><Shield size={20} /></span>
            <span className="setting-label">Privacy Policy</span>
          </div>
          <span className="setting-val-arrow">›</span>
        </div>

        <div className="setting-row glass-card slide-up" onClick={() => { hapticImpact('medium'); alert('Zen Tap v1.0.0. Relax, breathe, tap, unwind. Crafted for Telegram Mini Apps.'); }}>
          <div className="setting-info">
            <span className="setting-icon"><Info size={20} /></span>
            <span className="setting-label">About Zen Tap</span>
          </div>
          <span className="setting-val-arrow">›</span>
        </div>
      </div>
    </div>
  );
};
export default SettingsScreen;
