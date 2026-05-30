// Zen Tap Active Gameplay Screen Component
// Integrates 60 FPS Canvas with session timers, live scores, and pause overlays.

import React, { useState, useEffect, useRef } from 'react';
import { CanvasGame } from '../components/CanvasGame';
import { hapticImpact, hapticNotification } from '../telegram';
import { audio } from '../audio';
import { db } from '../database';
import { Play, Pause, Shuffle, Square } from 'lucide-react';

export const GameScreen = ({ selectedMode, initialStreak, onSessionEnded, onSwitchMode }) => {
  const [calmScore, setCalmScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2-minute sessions (120 seconds)
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Start background ambient sound loop when gameplay starts
  useEffect(() => {
    audio.toggleAmbient(selectedMode);
    
    // Timer Tick Interval
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      audio.stopAmbient();
    };
  }, [selectedMode]);

  const handlePointScored = (pts) => {
    setCalmScore((prev) => prev + pts);
  };

  const handlePauseToggle = () => {
    hapticImpact('medium');
    setIsPaused((prev) => {
      const nextState = !prev;
      if (nextState) {
        audio.stopAmbient();
      } else {
        audio.toggleAmbient(selectedMode);
      }
      return nextState;
    });
  };

  const handleSessionComplete = () => {
    hapticNotification('success');
    audio.stopAmbient();
    
    // Log the actual session details in database
    const sessionDuration = 120 - timeLeft;
    db.logSession(selectedMode, sessionDuration, calmScore);
    
    onSessionEnded({
      durationSeconds: sessionDuration,
      calmScore: calmScore,
      interactionsCount: calmScore, // 1 point = 1 interaction
      mode: selectedMode
    });
  };

  const handleForceEnd = () => {
    hapticImpact('heavy');
    handleSessionComplete();
  };

  // Formatting timer: e.g. 120 -> "02:00"
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="game-screen fade-in">
      {/* Top Stats Bar */}
      <div className="game-top-bar">
        <div className="game-stat-widget">
          <span className="game-stat-label">Calm Score</span>
          <span className="game-stat-val">{calmScore}</span>
        </div>

        <div className="game-timer">
          {formatTime(timeLeft)}
        </div>

        <div className="game-stat-widget">
          <span className="game-stat-label">🔥 Streak</span>
          <span className="game-stat-val">{initialStreak} d</span>
        </div>
      </div>

      {/* Floating Canvas Game Renderer */}
      <CanvasGame
        mode={selectedMode}
        isPaused={isPaused}
        onPointScored={handlePointScored}
      />

      {/* Bottom Panel Controls */}
      <div className="game-bottom-bar">
        <button className="game-control-btn glass-btn" onClick={handlePauseToggle}>
          <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
            {isPaused ? <Play size={20} /> : <Pause size={20} />}
          </span>
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <button className="game-control-btn glass-btn" onClick={() => { hapticImpact('medium'); onSwitchMode(); }}>
          <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
            <Shuffle size={20} />
          </span>
          Switch Mode
        </button>

        <button className="game-control-btn glass-btn" onClick={handleForceEnd}>
          <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
            <Square size={20} />
          </span>
          End Session
        </button>
      </div>

      {/* Pause Full-Screen Glass Overlay */}
      {isPaused && (
        <div className="pause-overlay fade-in">
          <h2 className="pause-title">Mindfulness Paused</h2>
          <p className="subtitle">Take a slow, deep breath... hold it... and exhale.</p>
          
          <div className="pause-btn-group">
            <button className="glass-btn primary" onClick={handlePauseToggle}>
              Resume Meditation
            </button>
            <button className="glass-btn" onClick={() => { hapticImpact('medium'); onSwitchMode(); }}>
              Change Relax Mode
            </button>
            <button className="glass-btn" onClick={handleForceEnd} style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              End & Save Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default GameScreen;
