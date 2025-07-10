import type React from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home' },
  { path: '/tic-tac-toe', label: 'Tic Tac Toe' },
  { path: '/connect-four', label: 'Connect Four' },
  { path: '/mancala', label: 'Mancala' },
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMenuActive, setIsMenuActive] = useState(false);

  const toggleMenu = () => {
    setIsMenuActive(!isMenuActive);
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar is-primary" aria-label="main navigation">
      <div className="navbar-brand">
        <Link className="navbar-item" to="/">
          <strong>Bodoge!</strong>
        </Link>

        <button
          type="button"
          className={`navbar-burger ${isMenuActive ? 'is-active' : ''}`}
          aria-label="menu"
          aria-expanded={isMenuActive}
          onClick={toggleMenu}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
      </div>

      <div className={`navbar-menu ${isMenuActive ? 'is-active' : ''}`}>
        <div className="navbar-start">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-item ${isActive(item.path) ? 'is-active' : ''}`}
              onClick={() => setIsMenuActive(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
