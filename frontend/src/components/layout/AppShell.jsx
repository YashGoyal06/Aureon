import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../common/Header';
import MobileTabBar from '../mobile/MobileTabBar';
import { cn } from '../../lib/utils';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Menu, X, Home, WalletCards, CreditCard, Target, Bell, MessageSquare, User, LogOut, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const isMobile = () => !!window.Capacitor;

const navItems = [
  { id: 'home', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'budget', label: 'Budget', icon: WalletCards, path: '/budget' },
  { id: 'transactions', label: 'Transactions', icon: CreditCard, path: '/transactions' },
  { id: 'goals', label: 'Goals', icon: Target, path: '/goals' },
  { id: 'bills', label: 'Bills', icon: Bell, path: '/bills' },
  { id: 'chat', label: 'Assistant', icon: MessageSquare, path: '/chat' },
];

const AppShell = ({ user, children, className, narrow = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('supabase_token');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const renderAvatar = (size = 'h-8 w-8', textClass = 'text-xs') => {
    if (user?.avatar) {
      return <img src={user.avatar} alt={user.name || 'User'} referrerPolicy="no-referrer" className={cn(size, 'rounded-lg object-cover ring-1 ring-white/15')} />;
    }
    return (
      <div className={cn(size, 'flex items-center justify-center rounded-lg bg-emerald-400 font-bold text-slate-950', textClass)}>
        {(user?.name || 'U').charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
  <div className="app-auth-shell min-h-screen text-slate-100">
    <div className="app-auth-bg" />
    <div className="relative z-10">
      {/* Desktop: Full Header | Mobile: Hidden (we use bottom tabs) */}
      {!isMobile() && <Header user={user} />}
      
      {/* Mobile: Compact inline header with just logo + name */}
      {isMobile() && (
        <div className="mobile-compact-header flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
              <Dialog.Trigger asChild>
                <button className="mr-1 text-white hover:bg-white/10 p-1.5 rounded-lg">
                  <Menu size={22} />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm" />
                <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[86vw] max-w-sm border-r border-white/10 bg-slate-950 p-5 text-white shadow-2xl">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {renderAvatar('h-10 w-10', 'text-sm')}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{user?.name || 'User'}</p>
                        <p className="truncate text-xs text-slate-500">{user?.email || ''}</p>
                      </div>
                    </div>
                    <Dialog.Close asChild>
                      <button className="rounded-lg p-1 hover:bg-white/10">
                        <X size={18} />
                      </button>
                    </Dialog.Close>
                  </div>
                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigate(item.path);
                          setMobileOpen(false);
                        }}
                        className={cn(
                          'relative flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition',
                          isActive(item.path) ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/7 hover:text-white'
                        )}
                      >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                        {isActive(item.path) && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-emerald-300" />}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <button onClick={() => navigate('/profile')} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-white/7 hover:text-white">
                      <User size={18} /> Profile
                    </button>
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-200 hover:bg-red-500/10">
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <img src="/Aureon_logo.png" alt="Aureon" className="h-7 w-7 rounded-lg object-cover" />
            <span className="text-sm font-semibold text-white">Aureon</span>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center justify-center">
                  {renderAvatar('h-8 w-8', 'text-xs')}
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={8} className="z-[9999] w-48 overflow-hidden rounded-xl border border-white/10 bg-slate-950/96 p-2 text-slate-100 shadow-2xl backdrop-blur-xl">
                  <DropdownMenu.Item onClick={() => navigate('/profile')} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-white/7">
                    <User size={16} /> Profile
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-white/7">
                    <Settings size={16} /> Settings
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-white/10" />
                  <DropdownMenu.Item onClick={handleLogout} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-200 outline-none hover:bg-red-500/10">
                    <LogOut size={16} /> Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      )}

      <main className={cn(
        narrow ? 'max-w-5xl' : 'max-w-7xl',
        'mx-auto px-4 pb-16 sm:px-6 lg:px-8',
        isMobile() ? 'pt-4' : 'pt-28 lg:pt-32',
        className
      )}>
        <div className={isMobile() ? 'mobile-page-enter' : ''}>
          {children}
        </div>
      </main>

      {/* Mobile: Bottom Tab Navigation */}
      {isMobile() && <MobileTabBar />}
    </div>
  </div>
  );
};

export default AppShell;
