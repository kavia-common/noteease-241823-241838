/**
 * TopBar component for NoteEase.
 * Provides the application header with theme toggle and mobile menu.
 */
import React from 'react';
import './TopBar.css';

// PUBLIC_INTERFACE
/**
 * Top navigation bar component.
 * @param {Object} props
 * @param {string} props.theme - Current theme ('light' or 'dark')
 * @param {Function} props.onToggleTheme - Callback to toggle theme
 * @param {Function} props.onToggleSidebar - Callback to toggle mobile sidebar
 */
function TopBar({ theme, onToggleTheme, onToggleSidebar }) {
    return (
        <header className="topbar">
            <div className="topbar-left">
                <button
                    className="topbar-menu-btn"
                    onClick={onToggleSidebar}
                    aria-label="Toggle navigation"
                    title="Menu"
                >
                    ☰
                </button>
                <div className="topbar-brand">
                    <span className="topbar-brand-icon">📝</span>
                    <span className="topbar-brand-name">NoteEase</span>
                    <span className="topbar-brand-tagline">// retro notes</span>
                </div>
            </div>

            <div className="topbar-right">
                <button
                    className="theme-toggle-btn"
                    onClick={onToggleTheme}
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? '🌙 DARK' : '☀️ LIGHT'}
                </button>
            </div>
        </header>
    );
}

export default TopBar;
