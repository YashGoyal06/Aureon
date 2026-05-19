import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Bell,
  CreditCard,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Target,
  User,
  WalletCards,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

const navItems = [
  { id: 'home', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'budget', label: 'Budget', icon: WalletCards, path: '/budget' },
  { id: 'transactions', label: 'Transactions', icon: CreditCard, path: '/transactions' },
  { id: 'goals', label: 'Goals', icon: Target, path: '/goals' },
  { id: 'bills', label: 'Bills', icon: Bell, path: '/bills' },
  { id: 'chat', label: 'Assistant', icon: MessageSquare, path: '/chat' },
];

const notifications = [
  { id: 1, text: 'Netflix subscription renews tomorrow', time: '1h ago', tone: 'warning' },
  { id: 2, text: 'Transportation budget is running hot', time: '3h ago', tone: 'danger' },
  { id: 3, text: 'Monthly spending summary is ready', time: '1d ago', tone: 'info' },
];

const Header = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('supabase_token');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const renderAvatar = (size = 'h-9 w-9') => {
    if (user?.avatar) {
      return <img src={user.avatar} alt={user.name || 'User'} className={cn(size, 'rounded-lg object-cover ring-1 ring-white/15')} />;
    }

    return (
      <div className={cn(size, 'flex items-center justify-center rounded-lg bg-emerald-400 text-sm font-semibold text-slate-950')}>
        {(user?.name || 'U').charAt(0).toUpperCase()}
      </div>
    );
  };

  const renderNavButton = (item, compact = false) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <button
        key={item.id}
        onClick={() => {
          navigate(item.path);
          setMobileOpen(false);
        }}
        className={cn(
          'relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
          active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/7 hover:text-white',
          compact && 'w-full justify-start px-4 py-3'
        )}
      >
        <Icon size={18} />
        <span className={compact ? 'inline' : 'hidden xl:inline'}>{item.label}</span>
        {active && <span className="absolute inset-x-3 -bottom-px h-px rounded-full bg-emerald-300" />}
      </button>
    );
  };

  return (
    <Tooltip.Provider delayDuration={180}>
      <header className="fixed left-0 right-0 top-0 z-[1000] px-4 pt-4 sm:px-6">
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-xl border border-white/10 bg-slate-950/84 px-3 py-3 shadow-[0_20px_60px_rgba(2,6,23,0.38)] backdrop-blur-xl">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-white/7">
            <img src="/Aureon_logo.png" alt="Aureon" className="h-8 w-8 rounded-lg object-cover" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none text-white">Aureon</p>
              <p className="mt-1 text-[11px] text-slate-500">Wealth Management</p>
            </div>
          </button>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Tooltip.Root key={item.id}>
                <Tooltip.Trigger asChild>{renderNavButton(item)}</Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content sideOffset={10} className="rounded-md border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs text-white shadow-xl">
                    {item.label}
                    <Tooltip.Arrow className="fill-slate-950" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-300">
                  <Bell size={19} />
                  <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-amber-300" />
                </Button>
              </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={12} className="z-[9999] w-80 overflow-hidden rounded-xl border border-white/10 bg-slate-950/96 p-2 text-slate-100 shadow-2xl backdrop-blur-xl">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-white">Notifications</p>
                    <p className="text-xs text-slate-500">Financial signals that need attention</p>
                  </div>
                  {notifications.map((notification) => (
                    <DropdownMenu.Item key={notification.id} className="rounded-lg px-3 py-3 outline-none transition hover:bg-white/7">
                      <p className="text-sm text-slate-200">{notification.text}</p>
                      <p className="mt-1 text-xs text-slate-500">{notification.time}</p>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="hidden items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white/7 lg:flex">
                  {renderAvatar()}
                  <span className="max-w-24 truncate text-sm font-medium text-white">{user?.name?.split(' ')[0] || 'User'}</span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={12} className="z-[9999] w-64 overflow-hidden rounded-xl border border-white/10 bg-slate-950/96 p-2 text-slate-100 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center gap-3 px-3 py-3">
                    {renderAvatar('h-11 w-11')}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{user?.name || 'User'}</p>
                      <p className="truncate text-xs text-slate-500">{user?.email || ''}</p>
                    </div>
                  </div>
                  <DropdownMenu.Separator className="my-1 h-px bg-white/10" />
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

            <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
              <Dialog.Trigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu size={20} />
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm" />
                <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-[86vw] max-w-sm border-l border-white/10 bg-slate-950 p-5 text-white shadow-2xl">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {renderAvatar('h-10 w-10')}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{user?.name || 'User'}</p>
                        <p className="truncate text-xs text-slate-500">{user?.email || ''}</p>
                      </div>
                    </div>
                    <Dialog.Close asChild>
                      <Button variant="ghost" size="icon">
                        <X size={18} />
                      </Button>
                    </Dialog.Close>
                  </div>
                  <div className="space-y-1">
                    {navItems.map((item) => renderNavButton(item, true))}
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
          </div>
        </nav>
      </header>
    </Tooltip.Provider>
  );
};

export default Header;
