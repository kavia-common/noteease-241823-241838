/**
 * Sidebar component for NoteEase.
 * Displays navigation options, tag filters, and pinned note shortcuts.
 */
import React, { useState } from 'react';
import './Sidebar.css';

// PUBLIC_INTERFACE
/**
 * Sidebar navigation component.
 * @param {Object} props
 * @param {Array} props.tags - List of available tags
 * @param {number|null} props.selectedTagId - Currently selected tag filter
 * @param {boolean} props.showPinnedOnly - Whether pinned-only filter is active
 * @param {Function} props.onTagSelect - Callback when a tag is selected
 * @param {Function} props.onTogglePinned - Callback to toggle pinned filter
 * @param {Function} props.onShowAll - Callback to clear all filters
 * @param {Function} props.onCreateTag - Callback to create a new tag
 * @param {Function} props.onDeleteTag - Callback to delete a tag
 * @param {boolean} props.isOpen - Whether sidebar is open (mobile)
 * @param {Function} props.onClose - Callback to close sidebar (mobile)
 */
function Sidebar({
    tags,
    selectedTagId,
    showPinnedOnly,
    onTagSelect,
    onTogglePinned,
    onShowAll,
    onCreateTag,
    onDeleteTag,
    isOpen,
    onClose,
}) {
    const [newTagName, setNewTagName] = useState('');
    const [showTagInput, setShowTagInput] = useState(false);
    const [tagError, setTagError] = useState('');

    /**
     * Handle creation of a new tag.
     * @param {React.FormEvent} e - Form submit event
     */
    const handleCreateTag = async (e) => {
        e.preventDefault();
        const trimmed = newTagName.trim();
        if (!trimmed) {
            setTagError('Tag name cannot be empty');
            return;
        }
        try {
            await onCreateTag(trimmed);
            setNewTagName('');
            setShowTagInput(false);
            setTagError('');
        } catch (err) {
            setTagError(err.message || 'Failed to create tag');
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

            <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="sidebar-logo-icon">📝</span>
                        <span className="sidebar-logo-text">NoteEase</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {/* All Notes */}
                    <button
                        className={`sidebar-nav-item ${!selectedTagId && !showPinnedOnly ? 'active' : ''}`}
                        onClick={onShowAll}
                    >
                        <span className="nav-icon">📋</span>
                        <span>All Notes</span>
                    </button>

                    {/* Pinned Notes */}
                    <button
                        className={`sidebar-nav-item ${showPinnedOnly ? 'active' : ''}`}
                        onClick={onTogglePinned}
                    >
                        <span className="nav-icon">📌</span>
                        <span>Pinned</span>
                    </button>
                </nav>

                <div className="sidebar-section">
                    <div className="sidebar-section-header">
                        <span className="sidebar-section-title">TAGS</span>
                        <button
                            className="sidebar-add-btn"
                            onClick={() => setShowTagInput((v) => !v)}
                            aria-label="Add tag"
                            title="Add new tag"
                        >
                            {showTagInput ? '✕' : '+'}
                        </button>
                    </div>

                    {showTagInput && (
                        <form className="tag-create-form" onSubmit={handleCreateTag}>
                            <input
                                type="text"
                                className="tag-input"
                                value={newTagName}
                                onChange={(e) => {
                                    setNewTagName(e.target.value);
                                    setTagError('');
                                }}
                                placeholder="Tag name..."
                                maxLength={100}
                                autoFocus
                            />
                            {tagError && <p className="tag-error">{tagError}</p>}
                            <button type="submit" className="tag-create-btn">
                                Create Tag
                            </button>
                        </form>
                    )}

                    <div className="tags-list">
                        {tags.length === 0 ? (
                            <p className="no-tags-msg">No tags yet</p>
                        ) : (
                            tags.map((tag) => (
                                <div
                                    key={tag.id}
                                    className={`tag-item ${selectedTagId === tag.id ? 'active' : ''}`}
                                >
                                    <button
                                        className="tag-name-btn"
                                        onClick={() => onTagSelect(tag.id)}
                                    >
                                        <span className="tag-hash">#</span>
                                        {tag.name}
                                    </button>
                                    <button
                                        className="tag-delete-btn"
                                        onClick={() => onDeleteTag(tag.id)}
                                        aria-label={`Delete tag ${tag.name}`}
                                        title="Delete tag"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
