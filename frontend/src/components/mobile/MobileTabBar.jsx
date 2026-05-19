import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CreditCard, Plus, MessageSquare, User } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
  { id: 'transactions', label: 'Money', icon: CreditCard, path: '/transactions' },
  { id: 'import', label: 'Add', icon: Plus, path: '/onboarding/import', isCenter: true },
  { id: 'chat', label: 'AI', icon: MessageSquare, path: '/chat' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

const MobileTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Only render on Capacitor (mobile)
  if (!window.Capacitor) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="mobile-tab-bar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);

        if (tab.isCenter) {
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="mobile-tab-center"
              aria-label={tab.label}
            >
              <div className="mobile-tab-center-ring">
                <Icon size={24} strokeWidth={2.2} />
              </div>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`mobile-tab-item ${active ? 'mobile-tab-active' : ''}`}
            aria-label={tab.label}
          >
            <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
            <span className="mobile-tab-label">{tab.label}</span>
            {active && <span className="mobile-tab-dot" />}
          </button>
        );
      })}
    </nav>
  );
};

export default MobileTabBar;
