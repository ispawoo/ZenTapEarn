// Zen Tap Mode Selection Screen Component
// Presents the 4 relaxation modes: Bubble, Rain, Nature, and Night.

import React from 'react';
import { hapticImpact } from '../telegram';
import { CircleDashed, CloudRain, Leaf, Star } from 'lucide-react';

export const ModeSelectionScreen = ({ onSelectMode }) => {
  const modes = [
    {
      id: 'bubble',
      name: 'Bubble Mode',
      desc: 'Pop bubbles and relax your mind',
      icon: <CircleDashed size={24} color="var(--theme-accent)" />,
      colorClass: 'bubble'
    },
    {
      id: 'rain',
      name: 'Rain Mode',
      desc: 'Tap the rain and feel the rhythm',
      icon: <CloudRain size={24} color="var(--theme-accent)" />,
      colorClass: 'rain'
    },
    {
      id: 'nature',
      name: 'Nature Drift',
      desc: 'Tap leaves and enjoy the breeze',
      icon: <Leaf size={24} color="var(--theme-accent)" />,
      colorClass: 'nature'
    },
    {
      id: 'night',
      name: 'Night Glow',
      desc: 'Collect fireflies and light up the night',
      icon: <Star size={24} color="var(--theme-accent)" />,
      colorClass: 'night'
    }
  ];

  const handleModeClick = (modeId) => {
    hapticImpact('heavy');
    onSelectMode(modeId);
  };

  return (
    <div className="screen fade-in">
      <div className="header">
        <h2 className="title-lg">Choose Your Zen Mode</h2>
        <p className="subtitle">Each environment is designed for gentle decompression</p>
      </div>

      <div className="mode-list">
        {modes.map((mode) => (
          <div
            key={mode.id}
            className="mode-card glass-card slide-up"
            onClick={() => handleModeClick(mode.id)}
          >
            <div className="mode-icon-container">
              {mode.icon}
            </div>
            <div className="mode-info">
              <h3 className="mode-name">{mode.name}</h3>
              <p className="mode-desc">{mode.desc}</p>
            </div>
            <div className="mode-chevron">›</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ModeSelectionScreen;
