import type React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export const Layout: React.FC = () => {
  return (
    <div className="layout">
      <Navigation />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
