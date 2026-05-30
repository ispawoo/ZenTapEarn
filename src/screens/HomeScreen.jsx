// Zen Tap Home (Mood Selection) Screen Component
// Captures user's emotional state to offer tailored relaxation and launches their instant break.

import React, { useState } from 'react';
import { hapticImpact } from '../telegram';
import { Leaf, CloudRain, Moon, BrainCircuit, Target } from 'lucide-react';

export const HomeScreen = ({ onStartInstant }) => {
  const [selectedMood, setSelectedMood] = useState('calm');

  const moods = [
    { id: 'calm', label: 'Calm', icon: <Leaf size={32} strokeWidth={1.5} /> },
    { id: 'stressed', label: 'Stressed', icon: <CloudRain size={32} strokeWidth={1.5} /> },
    { id: 'sleepy', label: 'Sleepy', icon: <Moon size={32} strokeWidth={1.5} /> },
    { id: 'overthinking', label: 'Overthinking', icon: <BrainCircuit size={32} strokeWidth={1.5} /> }
  ];

  const handleMoodSelect = (moodId) => {
    hapticImpact('light');
    setSelectedMood(moodId);
  };

  const handleStart = () => {
    hapticImpact('heavy');
    // Map mood to default matching game modes
    let defaultMode = 'bubble';
    if (selectedMood === 'stressed') defaultMode = 'rain';
    if (selectedMood === 'sleepy') defaultMode = 'night';
    if (selectedMood === 'overthinking') defaultMode = 'nature';
    onStartInstant(defaultMode, selectedMood);
  };

  return (
    <div className="screen fade-in">
      <div className="header">
        <h2 className="title-lg">How are you feeling today?</h2>
        <p className="subtitle">Select your mood to begin your calming break</p>
      </div>

      <div className="mood-grid">
        {moods.map((mood) => (
          <div
            key={mood.id}
            className={`mood-card glass-card ${selectedMood === mood.id ? 'active' : ''}`}
            onClick={() => handleMoodSelect(mood.id)}
          >
            <span className="mood-icon">{mood.icon}</span>
            <span className="mood-title">{mood.label}</span>
          </div>
        ))}

        <div
          className={`mood-card glass-card focus-card ${selectedMood === 'focus' ? 'active' : ''}`}
          onClick={() => handleMoodSelect('focus')}
        >
          <span className="mood-icon"><Target size={32} strokeWidth={1.5} /></span>
          <span className="mood-title">Focus Mode</span>
        </div>
      </div>

      <div className="home-cta-container">
        <button className="glass-btn primary" onClick={handleStart} style={{ width: '100%' }}>
          Start Instant Zen
        </button>
      </div>
    </div>
  );
};
export default HomeScreen;
