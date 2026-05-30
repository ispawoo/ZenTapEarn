// Telegram WebApp SDK Integration and Simulator Wrapper
// This file ensures full Telegram capability and robust browser simulation for testing.

const isTelegramAvailable = typeof window !== 'undefined' && window.Telegram?.WebApp;

// Official TG SDK or local mockup
export const tg = isTelegramAvailable 
  ? window.Telegram.WebApp 
  : {
      ready: () => console.log('[Telegram Mock] WebApp ready'),
      expand: () => console.log('[Telegram Mock] WebApp expanded'),
      close: () => console.log('[Telegram Mock] WebApp closed'),
      headerColor: '#0a0f1d',
      backgroundColor: '#0a0f1d',
      themeParams: {
        bg_color: '#0a0f1d',
        text_color: '#ffffff',
        hint_color: '#8b9bb4',
        link_color: '#38bdf8',
        button_color: '#10b981',
        button_text_color: '#ffffff',
        secondary_bg_color: '#0f172a'
      },
      initDataUnsafe: {
        user: {
          id: 12345678,
          first_name: 'Zen',
          last_name: 'Seeker',
          username: 'zenseeker',
          language_code: 'en'
        }
      },
      HapticFeedback: {
        impactOccurred: (style) => console.log(`[Telegram Mock] Haptic feedback: impact (${style})`),
        notificationOccurred: (type) => console.log(`[Telegram Mock] Haptic feedback: notification (${type})`),
        selectionChanged: () => console.log('[Telegram Mock] Haptic feedback: selectionChanged')
      }
    };

// Initialization
export const initTelegram = () => {
  try {
    tg.ready();
    tg.expand();
    
    // Set theme properties if possible
    if (tg.setHeaderColor) tg.setHeaderColor('#0a0f1d');
    if (tg.setBackgroundColor) tg.setBackgroundColor('#0a0f1d');
  } catch (error) {
    console.error('Failed to initialize Telegram WebApp SDK', error);
  }
};

// Haptic feedback wrappers
export const hapticImpact = (style = 'medium') => {
  // Styles: 'light', 'medium', 'heavy', 'rigid', 'soft'
  try {
    if (tg.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(style);
    } else if (navigator.vibrate) {
      // Fallback for standard browsers supporting vibration
      const duration = style === 'light' ? 15 : style === 'medium' ? 30 : 50;
      navigator.vibrate(duration);
    }
  } catch (e) {
    // Ignore haptic failures
  }
};

export const hapticNotification = (type = 'success') => {
  // Types: 'error', 'success', 'warning'
  try {
    if (tg.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred(type);
    } else if (navigator.vibrate) {
      if (type === 'success') navigator.vibrate([30, 50, 30]);
      else if (type === 'warning') navigator.vibrate([40, 100, 40]);
      else if (type === 'error') navigator.vibrate([60, 150, 60]);
    }
  } catch (e) {}
};

export const hapticSelection = () => {
  try {
    if (tg.HapticFeedback) {
      tg.HapticFeedback.selectionChanged();
    }
  } catch (e) {}
};

// Get User Info
export const getTelegramUser = () => {
  return tg.initDataUnsafe?.user || {
    id: 999999,
    first_name: 'Zen',
    last_name: 'Seeker',
    username: 'zenseeker_local'
  };
};

export const isTelegram = () => {
  return !!isTelegramAvailable;
};
