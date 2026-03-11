/**
 * NotesList component for NoteEase.
 * Renders a scrollable list of note cards with search and creation options.
 */
import React from 'react';
import './NotesList.css';

/**
 * Format a date for display.
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Truncate text to a given length.
 * @param {string} text - Text to truncate
 * @param {number} maxLen - Maximum length
 * @returns {string} Truncated text
 */
function truncate(text, maxLen = 100) {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '...';
}

// PUBLIC_INTERFACE
/**
 * Notes list panel component.
 * @param {Object} props
 * @param {Array} props.notes - List of note objects
 * @param {number|null} props.selectedNoteId - Currently selected note ID
 * @param {boolean} props.loading - Whether notes are loading
 * @param {string|null} props.error - Error message if any
 * @param {string} props.searchQuery - Current search query
 * @param {Function} props.onSearchChange - Callback when search changes
 * @param {Function} props.onNoteSelect - Callback when a note is selected
 * @param {Function} props.onCreateNote - Callback to create a new note
 * @param {Function} props.onDeleteNote - Callback to delete a note
 * @param {Function} props.onTogglePin - Callback to toggle pin on a note
 */
function NotesList({
    notes,
    selectedNoteId,
    loading,
    error,
    searchQuery,
    onSearchChange,
    onNoteSelect,
    onCreateNote,
    onDeleteNote,
    onTogglePin,
}) {
    return (
        <div className="notes-list-panel">
            {/* Header */}
            <div className="notes-list-header">
                <div className="notes-list-title-row">
                    <h2 className="notes-list-title">NOTES</h2>
                    <button
                        className="create-note-btn"
                        onClick={onCreateNote}
                        aria-label="Create new note"
                        title="New Note"
                    >
                        + NEW
                    </button>
                </div>

                {/* Search */}
                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        aria-label="Search notes"
                    />
                    {searchQuery && (
                        <button
                            className="search-clear-btn"
                            onClick={() => onSearchChange('')}
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Notes list body */}
            <div className="notes-list-body">
                {loading && (
                    <div className="notes-status">
                        <span className="loading-dots">Loading</span>
                    </div>
                )}

                {error && !loading && (
                    <div className="notes-error">
                        <span>⚠ {error}</span>
                    </div>
                )}

                {!loading && !error && notes.length === 0 && (
                    <div className="notes-empty">
                        <p>No notes found.</p>
                        <button className="empty-create-btn" onClick={onCreateNote}>
                            + Create your first note
                        </button>
                    </div>
                )}

                {!loading && notes.map((note) => (
                    <div
                        key={note.id}
                        className={`note-card ${selectedNoteId === note.id ? 'active' : ''} ${note.is_pinned ? 'pinned' : ''}`}
                        onClick={() => onNoteSelect(note)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onNoteSelect(note)}
                        aria-label={`Note: ${note.title}`}
                    >
                        <div className="note-card-header">
                            <div className="note-card-title-row">
                                {note.is_pinned && (
                                    <span className="note-pin-badge" title="Pinned">📌</span>
                                )}
                                <h3 className="note-card-title">
                                    {note.title || 'Untitled'}
                                </h3>
                            </div>
                            <div className="note-card-actions">
                                <button
                                    className={`note-pin-btn ${note.is_pinned ? 'pinned' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTogglePin(note.id);
                                    }}
                                    aria-label={note.is_pinned ? 'Unpin note' : 'Pin note'}
                                    title={note.is_pinned ? 'Unpin' : 'Pin'}
                                >
                                    📌
                                </button>
                                <button
                                    className="note-delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteNote(note.id);
                                    }}
                                    aria-label="Delete note"
                                    title="Delete"
                                >
                                    🗑
                                </button>
                            </div>
                        </div>

                        <p className="note-card-preview">
                            {truncate(note.content, 90) || <em>Empty note</em>}
                        </p>

                        <div className="note-card-footer">
                            <span className="note-card-date">{formatDate(note.updated_at)}</span>
                            {note.tags && note.tags.length > 0 && (
                                <div className="note-card-tags">
                                    {note.tags.slice(0, 3).map((tag) => (
                                        <span key={tag.id} className="note-tag-badge">
                                            #{tag.name}
                                        </span>
                                    ))}
                                    {note.tags.length > 3 && (
                                        <span className="note-tag-more">+{note.tags.length - 3}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default NotesList;
