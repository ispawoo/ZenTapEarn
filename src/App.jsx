// Zen Tap Core React Application Orchestrator
// Coordinates the Splash, Home, Mode Selection, Game, Summary, and Settings dashboards.

import React, { useState, useEffect } from 'react';
import { initTelegram, getTelegramUser, tg } from './telegram';
import { db } from './database';
import { audio } from './audio';

// Screen Imports
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import ModeSelectionScreen from './screens/ModeSelectionScreen';
import GameScreen from './screens/GameScreen';
import SummaryScreen from './screens/SummaryScreen';
import StatsScreen from './screens/StatsScreen';
import RewardsScreen from './screens/RewardsScreen';
import SettingsScreen from './screens/SettingsScreen';
import DailyChallengeScreen from './screens/DailyChallengeScreen';

// Navigation Bar
import Navigation from './components/Navigation';

export default function App() {
  const [screen, setScreen] = useState('splash'); // 'splash', 'home', 'modes', 'game', 'summary', 'daily'
  const [activeTab, setActiveTab] = useState('home'); // Navigation tabs: 'home', 'stats', 'rewards', 'settings'
  const [selectedGameMode, setSelectedGameMode] = useState('bubble');
  const [sessionResults, setSessionResults] = useState(null);
  const [dbState, setDbState] = useState(db.getState());

  useEffect(() => {
    // Initialize Telegram WebApp SDK
    initTelegram();
    
    // Load initial settings and apply theme styling
    const state = db.getState();
    setDbState(state);
    
    // Apply theme body class
    document.body.className = `theme-${state.equippedTheme || 'forest'}`;
    
    // Initialize sound systems
    audio.setSoundEnabled(state.settings.sound);

    // Sync state updates
    const unsubscribe = db.subscribe((nextState) => {
      setDbState(nextState);
    });

    return () => {
      unsubscribe();
      audio.stopAmbient();
    };
  }, []);

  // Screen Routing Logic
  const handleStartZenBreak = () => {
    setScreen('home');
    setActiveTab('home');
  };

  const handleStartInstantZen = (defaultMode) => {
    setSelectedGameMode(defaultMode);
    setScreen('game');
  };

  const handleSelectGameMode = (modeId) => {
    setSelectedGameMode(modeId);
    setScreen('game');
  };

  const handleSessionEnded = (results) => {
    setSessionResults(results);
    setScreen('summary');
  };

  const handleGoHome = () => {
    setActiveTab('home');
    setScreen('home');
  };

  const handleRestartSession = () => {
    // Rerun using the same mode
    setScreen('game');
  };

  const handleNavigateTab = (tabId) => {
    setActiveTab(tabId);
    setScreen('home'); // Reset gameplay flows if they click bottom bar
  };

  // Render current active tab / screen combination
  const renderMainContent = () => {
    // If we're on Gameplay, Summary, Splash, or Daily Challenge, hide navbar and render full screen
    if (screen === 'splash') {
      return <SplashScreen onStart={handleStartZenBreak} />;
    }
    if (screen === 'game') {
      return (
        <GameScreen
          selectedMode={selectedGameMode}
          initialStreak={dbState.currentStreak}
          onSessionEnded={handleSessionEnded}
          onSwitchMode={() => setScreen('modes')}
        />
      );
    }
    if (screen === 'summary') {
      return (
        <SummaryScreen
          sessionData={sessionResults}
          onRestart={handleRestartSession}
          onGoHome={handleGoHome}
          onGoToDaily={() => setScreen('daily')}
        />
      );
    }
    if (screen === 'modes') {
      return (
        <ModeSelectionScreen
          onSelectMode={handleSelectGameMode}
        />
      );
    }
    if (screen === 'daily') {
      return (
        <DailyChallengeScreen
          onBack={() => setScreen('home')}
        />
      );
    }

    // Standard Navbar Tab Traversal
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onStartInstant={handleStartInstantZen}
          />
        );
      case 'stats':
        return <StatsScreen />;
      case 'rewards':
        return <RewardsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen onStartInstant={handleStartInstantZen} />;
    }
  };

  // Check if we should display bottom navigation bar
  const shouldShowNav = screen !== 'splash' && screen !== 'game' && screen !== 'summary' && screen !== 'daily' && screen !== 'modes';

  return (
    <>
      {renderMainContent()}
      {shouldShowNav && (
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={handleNavigateTab} 
        />
      )}
    </>
  );
}
