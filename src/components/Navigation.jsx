// Reusable Bottom Navigation Component for Zen Tap
// Links Home, Stats, Rewards, and Settings together with soft glassmorphic visual indicators.

import React from 'react';
import { hapticSelection } from '../telegram';
import { Home, BarChart2, Gift, Settings } from 'lucide-react';

export const Navigation = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'stats', label: 'Stats', icon: <BarChart2 size={20} /> },
    { id: 'rewards', label: 'Rewards', icon: <Gift size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  const handleTabClick = (tabId) => {
    if (activeTab === tabId) return;
    hapticSelection();
    setActiveTab(tabId);
  };

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => handleTabClick(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
export default Navigation;
