import React from 'react';
import Header from '../common/Header';
import { cn } from '../../lib/utils';

const AppShell = ({ user, children, className, narrow = false }) => (
  <div className="app-auth-shell min-h-screen text-slate-100">
    <div className="app-auth-bg" />
    <div className="relative z-10">
      <Header user={user} />
      <main className={cn(narrow ? 'max-w-5xl' : 'max-w-7xl', 'mx-auto px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32', className)}>
        {children}
      </main>
    </div>
  </div>
);

export default AppShell;
