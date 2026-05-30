// Zen Tap Progression & LocalStorage State Management
// Handles offline-first statistics, levels, streaks, rewards, settings.

const INITIAL_STATE = {
  calmPoints: 42,
  gems: 320,
  currentStreak: 3, // Mocked to 3 to match mockups on first load
  lastActiveDate: null,
  activeDays: [true, true, true, false, false, false, false], // Day 1-7 streaks (matches Day 7 challenge)
  weeklyPoints: {
    Mon: 45,
    Tue: 70,
    Wed: 55,
    Thu: 90,
    Fri: 110,
    Sat: 80,
    Sun: 0 // Will increment as they play today
  },
  unlockedThemes: ['forest', 'ocean'], // forest = Forest Zen, ocean = Ocean Waves
  unlockedSounds: ['rainy', 'ocean', 'forest'], // rainy = Rainy Day, ocean = Ocean Waves, forest = Forest Wind
  equippedTheme: 'forest',
  equippedSound: 'rainy',
  settings: {
    sound: true,
    music: true,
    haptic: true,
    language: 'English',
    darkMode: true
  },
  sessionLogs: []
};

// Calculate Zen Level based on XP (equal to calmPoints)
export const getZenLevel = (xp) => {
  if (xp <= 100) {
    return { level: 1, name: 'Beginner', minXp: 0, maxXp: 100, progress: xp };
  } else if (xp <= 300) {
    return { level: 2, name: 'Calm Explorer', minXp: 100, maxXp: 300, progress: xp - 100 };
  } else if (xp <= 600) {
    return { level: 3, name: 'Peace Seeker', minXp: 300, maxXp: 600, progress: xp - 300 };
  } else {
    // Zen Master levels
    const levelNum = 4 + Math.floor((xp - 600) / 400);
    const minXp = 600 + (levelNum - 4) * 400;
    const maxXp = minXp + 400;
    const progress = xp - minXp;
    return { level: levelNum, name: 'Zen Master', minXp, maxXp, progressPercentage: (progress / 400) * 100, progress };
  }
};

class ZenDatabase {
  constructor() {
    this.state = { ...INITIAL_STATE };
    this.listeners = [];
    this.load();
  }

  load() {
    try {
      const data = localStorage.getItem('zentap_state');
      if (data) {
        this.state = JSON.parse(data);
        // Retrofit new fields if missing
        this.state = { ...INITIAL_STATE, ...this.state };
      } else {
        // Fresh state, set last active date to yesterday to allow streak increment
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        this.state.lastActiveDate = yesterday.toISOString().split('T')[0];
        this.save();
      }
    } catch (e) {
      console.error('Failed to load Zen database state', e);
    }
  }

  save() {
    try {
      localStorage.setItem('zentap_state', JSON.stringify(this.state));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save Zen database state', e);
    }
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(l => l(this.state));
  }

  // Update calm points & weekly stats
  addPoints(points) {
    this.state.calmPoints += points;
    
    // Add to current day's weekly graph
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = days[new Date().getDay()];
    this.state.weeklyPoints[currentDay] = (this.state.weeklyPoints[currentDay] || 0) + points;
    
    this.save();
  }

  addGems(amount) {
    this.state.gems += amount;
    this.save();
  }

  // Handle Streaks & Day Check
  checkStreak() {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastActiveStr = this.state.lastActiveDate;

    if (!lastActiveStr) {
      this.state.currentStreak = 1;
      this.state.activeDays = [true, false, false, false, false, false, false];
      this.state.lastActiveDate = todayStr;
      this.save();
      return;
    }

    const today = new Date(todayStr);
    const lastActive = new Date(lastActiveStr);
    const diffTime = Math.abs(today - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Streak continues!
      this.state.currentStreak += 1;
      this.state.lastActiveDate = todayStr;
      
      // Mark active day in calendar
      const dayIndex = (this.state.currentStreak - 1) % 7;
      const updatedActiveDays = [...this.state.activeDays];
      updatedActiveDays[dayIndex] = true;
      this.state.activeDays = updatedActiveDays;
      
      this.save();
    } else if (diffDays > 1) {
      // Streak reset
      this.state.currentStreak = 1;
      this.state.activeDays = [true, false, false, false, false, false, false];
      this.state.lastActiveDate = todayStr;
      this.save();
    }
  }

  claimDailyChallenge() {
    // Reset or advance streak milestone
    this.addGems(50);
    this.addPoints(100);
    // Refresh streaker calendar visual to restart loop
    this.state.activeDays = [true, false, false, false, false, false, false];
    this.save();
  }

  // Logs session details
  logSession(mode, durationSeconds, score) {
    const log = {
      id: Date.now(),
      date: new Date().toISOString(),
      mode,
      durationSeconds,
      score
    };
    this.state.sessionLogs.unshift(log);
    // Limit log storage
    if (this.state.sessionLogs.length > 50) {
      this.state.sessionLogs.pop();
    }
    
    this.addPoints(score);
    this.save();
  }

  // Purchases or equips items
  unlockTheme(themeId, cost) {
    if (this.state.gems >= cost && !this.state.unlockedThemes.includes(themeId)) {
      this.state.gems -= cost;
      this.state.unlockedThemes.push(themeId);
      this.state.equippedTheme = themeId;
      this.save();
      return true;
    }
    return false;
  }

  equipTheme(themeId) {
    if (this.state.unlockedThemes.includes(themeId)) {
      this.state.equippedTheme = themeId;
      this.save();
      return true;
    }
    return false;
  }

  unlockSound(soundId, cost) {
    if (this.state.gems >= cost && !this.state.unlockedSounds.includes(soundId)) {
      this.state.gems -= cost;
      this.state.unlockedSounds.push(soundId);
      this.state.equippedSound = soundId;
      this.save();
      return true;
    }
    return false;
  }

  equipSound(soundId) {
    if (this.state.unlockedSounds.includes(soundId)) {
      this.state.equippedSound = soundId;
      this.save();
      return true;
    }
    return false;
  }

  updateSettings(settingsPatch) {
    this.state.settings = { ...this.state.settings, ...settingsPatch };
    this.save();
  }
}

export const db = new ZenDatabase();
