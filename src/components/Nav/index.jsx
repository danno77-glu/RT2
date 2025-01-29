import React, { useState, useRef, useEffect } from 'react';
    import { Link } from 'react-router-dom';
    import './styles.css';
    import { ASSET_PATHS } from '../../utils/assetPaths';

    const Nav = () => {
      const [isMenuOpen, setIsMenuOpen] = useState(false);
      const menuRef = useRef(null);

      const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
      };

      useEffect(() => {
        const handleClickOutside = (event) => {
          if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuOpen(false);
          }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [menuRef]);

      return (
        <nav>
          <div className="nav-container">
            <div className="nav-brand">
              <Link to="/">
                <img src={ASSET_PATHS.COMPANY_LOGO} alt="Company Logo" className="nav-logo" />
              </Link>
              <button
                className="menu-toggle"
                onClick={toggleMenu}
                aria-expanded={isMenuOpen}
              >
                <span className="menu-icon"></span>
              </button>
            </div>
            <ul
              ref={menuRef}
              className={`nav-links ${isMenuOpen ? 'active' : ''}`}
            >
              <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Dashboard</Link></li>
              <li><Link to="/audits" onClick={() => setIsMenuOpen(false)}>Audit List</Link></li>
              <li><Link to="/form" onClick={() => setIsMenuOpen(false)}>Rack Audit</Link></li>
              <li><Link to="/templates" onClick={() => setIsMenuOpen(false)}>Reports</Link></li>
              <li><Link to="/settings" onClick={() => setIsMenuOpen(false)}>Settings</Link></li>
              <li><Link to="/customers" onClick={() => setIsMenuOpen(false)}>Customers</Link></li>
              <li><Link to="/scheduled-audits" onClick={() => setIsMenuOpen(false)}>Scheduled Audits</Link></li>
            </ul>
          </div>
        </nav>
      );
    };

    export default Nav;
