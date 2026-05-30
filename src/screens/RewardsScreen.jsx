// Zen Tap Rewards Screen Component
// Implements coin wallets, unlocks for themes and sound packs, and rewarded ad simulations.

import React, { useState, useEffect } from 'react';
import { db } from '../database';
import { hapticImpact, hapticNotification } from '../telegram';
import { audio } from '../audio';
import { CalmingAdOverlay } from '../ads';
import { Gem, Check, TreePine, Waves, Star, Flame, Wand2, Wind, Sparkles } from 'lucide-react';

export const RewardsScreen = () => {
  const [dbState, setDbState] = useState(db.getState());
  const [activeTab, setActiveTab] = useState('themes');
  const [rewardedAdOpen, setRewardedAdOpen] = useState(false);
  const [adRewardType, setAdRewardType] = useState(''); // 'gems' or 'theme24h'

  useEffect(() => {
    // Sync React state with LocalStorage database updates
    const unsubscribe = db.subscribe((nextState) => {
      setDbState(nextState);
    });
    return () => unsubscribe();
  }, []);

  const handleTabClick = (tabId) => {
    hapticImpact('light');
    setActiveTab(tabId);
  };

  const handleThemeClick = (themeId, cost) => {
    const isUnlocked = dbState.unlockedThemes.includes(themeId);
    
    if (isUnlocked) {
      hapticImpact('medium');
      db.equipTheme(themeId);
      // Change body class to update global theme variables
      document.body.className = `theme-${themeId}`;
    } else {
      if (dbState.gems >= cost) {
        hapticNotification('success');
        db.unlockTheme(themeId, cost);
        document.body.className = `theme-${themeId}`;
      } else {
        hapticNotification('error');
        alert(`Insufficient Zen Gems. You need ${cost - dbState.gems} more gems. Complete Daily Challenges or watch a relaxing pause!`);
      }
    }
  };

  const handleSoundClick = (soundId, cost) => {
    const isUnlocked = dbState.unlockedSounds.includes(soundId);

    if (isUnlocked) {
      hapticImpact('medium');
      db.equipSound(soundId);
      // Play a quick test sound chime
      audio.playChime();
    } else {
      if (dbState.gems >= cost) {
        hapticNotification('success');
        db.unlockSound(soundId, cost);
        audio.playChime();
      } else {
        hapticNotification('error');
        alert(`Insufficient Zen Gems. You need ${cost - dbState.gems} more gems.`);
      }
    }
  };

  const handleUnlockAllSounds = () => {
    const cost = 199;
    if (dbState.gems >= cost) {
      hapticNotification('success');
      // Unlock remaining sounds: fireplace, white
      db.addGems(-cost);
      if (!dbState.unlockedSounds.includes('fireplace')) dbState.unlockedSounds.push('fireplace');
      if (!dbState.unlockedSounds.includes('white')) dbState.unlockedSounds.push('white');
      db.save();
      audio.playChime();
    } else {
      hapticNotification('error');
      alert(`You need ${cost} gems to unlock all sound packs.`);
    }
  };

  // Launch Rewarded Ad Simulator
  const triggerRewardedAd = (rewardType) => {
    hapticImpact('heavy');
    setAdRewardType(rewardType);
    setRewardedAdOpen(true);
  };

  const claimAdReward = () => {
    if (adRewardType === 'gems') {
      db.addGems(50);
      db.addPoints(50);
      alert('Peaceful pause complete! +50 Gems and +50 Calm Points awarded! ✨');
    } else if (adRewardType === 'theme24h') {
      // Unlock night theme for free
      if (!dbState.unlockedThemes.includes('night')) {
        dbState.unlockedThemes.push('night');
        db.equipTheme('night');
        document.body.className = 'theme-night';
        db.save();
        alert('Dreamy Night theme unlocked for your next sessions! 🌌');
      }
    }
  };

  // Theme descriptions & thumbnails mapping
  const themesList = [
    { id: 'forest', name: 'Forest Zen', cost: 0, icon: <TreePine size={38} />, color: '#022c22' },
    { id: 'ocean', name: 'Ocean Waves', cost: 0, icon: <Waves size={38} />, color: '#0c4a6e' },
    { id: 'night', name: 'Night Sky', cost: 150, icon: <Star size={38} />, color: '#1e1b4b' },
    { id: 'fireplace', name: 'Fireplace Warmth', cost: 150, icon: <Flame size={38} />, color: '#451a03' },
    { id: 'pastel', name: 'Pastel Dream', cost: 250, icon: <Wand2 size={38} />, color: '#4c1d95' }
  ];

  // Sound packs mapping
  const soundsList = [
    { id: 'rainy', name: 'Rainy Day', desc: 'Calming rain sound', cost: 0, icon: <Wind size={20} /> },
    { id: 'ocean', name: 'Ocean Waves', desc: 'Peaceful ocean sound', cost: 0, icon: <Waves size={20} /> },
    { id: 'forest', name: 'Forest Wind', desc: 'Soft forest breeze', cost: 0, icon: <TreePine size={20} /> },
    { id: 'fireplace', name: 'Fireplace', desc: 'Warm fireplace sound', cost: 100, icon: <Flame size={20} /> },
    { id: 'white', name: 'White Noise', desc: 'Classic white noise', cost: 100, icon: <Wind size={20} /> }
  ];

  return (
    <div className="screen fade-in">
      <div className="header">
        <h2 className="title-lg">Rewards & Unlocks</h2>
        <p className="subtitle">Enhance your sensory breathing space</p>
      </div>

      {/* Rewards Diamond Balance */}
      <div className="rewards-balance-bar glass-card">
        <div className="balance-item">
          <Gem size={20} color="var(--theme-accent)" />
          <span>{dbState.gems} Zen Gems</span>
        </div>
        <button 
          className="glass-btn primary" 
          onClick={() => triggerRewardedAd('gems')}
          style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '10px' }}
        >
          +50 Gems (Ad)
        </button>
      </div>

      {/* Tab Nav */}
      <div className="tab-nav">
        <button 
          className={`tab-btn ${activeTab === 'themes' ? 'active' : ''}`}
          onClick={() => handleTabClick('themes')}
        >
          Themes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sounds' ? 'active' : ''}`}
          onClick={() => handleTabClick('sounds')}
        >
          Sounds
        </button>
        <button 
          className={`tab-btn ${activeTab === 'effects' ? 'active' : ''}`}
          onClick={() => handleTabClick('effects')}
        >
          Effects
        </button>
      </div>

      {/* Tab: Themes Grid */}
      {activeTab === 'themes' && (
        <div className="rewards-grid">
          {themesList.map((theme) => {
            const isUnlocked = dbState.unlockedThemes.includes(theme.id);
            const isEquipped = dbState.equippedTheme === theme.id;

            return (
              <div 
                key={theme.id} 
                className="reward-card glass-card slide-up"
                onClick={() => handleThemeClick(theme.id, theme.cost)}
              >
                <div 
                  className="reward-preview-img" 
                  style={{ backgroundColor: theme.color, color: 'var(--text-primary)' }}
                >
                  <span style={{ zIndex: 2, display: 'flex' }}>{theme.icon}</span>
                  <div className="theme-preview-overlay"></div>
                </div>

                <div className="reward-card-info">
                  <span className="reward-card-title">{theme.name}</span>
                  {isEquipped ? (
                    <span className="reward-equipped-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> Active</span>
                  ) : isUnlocked ? (
                    <span className="reward-card-status" style={{ color: 'var(--text-secondary)' }}>Owned</span>
                  ) : (
                    <span className="reward-card-status" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Gem size={12} /> {theme.cost}</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Quick Ad unlock for Premium theme */}
          {!dbState.unlockedThemes.includes('night') && (
            <div 
              className="reward-card glass-card slide-up" 
              onClick={() => triggerRewardedAd('theme24h')}
              style={{ gridColumn: 'span 2', background: 'rgba(99, 102, 241, 0.15)', borderColor: 'var(--theme-accent)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Star size={24} color="var(--theme-accent)" />
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 500 }}>Unlock Night Sky Theme Free</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Watch a soothing pause to claim</p>
                  </div>
                </div>
                <span className="reward-card-status" style={{ color: 'var(--theme-accent)' }}>FREE</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Sounds List */}
      {activeTab === 'sounds' && (
        <div className="sound-list fade-in">
          {soundsList.map((sound) => {
            const isUnlocked = dbState.unlockedSounds.includes(sound.id);
            const isEquipped = dbState.equippedSound === sound.id;

            return (
              <div 
                key={sound.id} 
                className="sound-item glass-card slide-up"
                onClick={() => handleSoundClick(sound.id, sound.cost)}
              >
                <div className="sound-item-left">
                  <span className="sound-icon">{sound.icon}</span>
                  <div className="sound-meta">
                    <h4>{sound.name}</h4>
                    <p>{sound.desc}</p>
                  </div>
                </div>

                {isEquipped ? (
                  <span className="sound-check" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--theme-accent)' }}><Check size={16} /> Active</span>
                ) : isUnlocked ? (
                  <span className="sound-check" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Owned</span>
                ) : (
                  <span className="sound-cost"><Gem size={14} style={{ marginRight: '2px' }} /> {sound.cost}</span>
                )}
              </div>
            );
          })}

          <button 
            className="glass-btn primary" 
            onClick={handleUnlockAllSounds}
            style={{ width: '100%', marginTop: '10px' }}
          >
            Unlock All Packs <Gem size={16} style={{ marginLeft: '4px', marginRight: '4px' }} /> 199
          </button>
        </div>
      )}

      {/* Tab: Effects */}
      {activeTab === 'effects' && (
        <div className="fade-in" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
          <Sparkles size={32} color="var(--theme-accent)" style={{ margin: '0 auto' }} />
          <p style={{ fontSize: '13px', marginTop: '10px', fontWeight: 300 }}>Tapping effects coming soon! Explore themes and soundscapes in the meantime.</p>
        </div>
      )}

      {/* Rewarded Ad simulation screen */}
      <CalmingAdOverlay
        isOpen={rewardedAdOpen}
        onClose={() => setRewardedAdOpen(false)}
        type="rewarded"
        onRewardEarned={claimAdReward}
      />
    </div>
  );
};
export default RewardsScreen;
