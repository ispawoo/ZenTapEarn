// Zen Tap Splash Screen Component
// Welcomes the user with a breathing visual circle to immediately align their breathing.

import React from 'react';
import { hapticImpact } from '../telegram';
import { Leaf, Wind } from 'lucide-react';

export const SplashScreen = ({ onStart }) => {
  const handleStart = () => {
    hapticImpact('heavy');
    onStart();
  };

  return (
    <div className="splash-container fade-in">
      <div className="splash-logo-container">
        <div className="splash-breath-circle"></div>
        <div className="splash-icon"><Leaf size={64} color="var(--theme-accent)" strokeWidth={1.5} /></div>
      </div>

      <h1 className="splash-title">Zen Tap</h1>
      <p className="splash-subtitle">2 minutes to calm your mind</p>

      <button className="glass-btn primary" onClick={handleStart} style={{ width: '100%', maxWidth: '260px' }}>
        Start Zen Break
      </button>

      <div className="splash-instruction">
        <Wind size={16} /> Take a deep breath and relax
      </div>
    </div>
  );
};
export default SplashScreen;
