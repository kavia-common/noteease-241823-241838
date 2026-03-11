/**
 * NoteEditor component for NoteEase.
 * Provides a full-featured editor for creating and editing notes,
 * with autosave, tag management, and pin controls.
 */
import React, { useState, useEffect } from 'react';
import { useNoteEditor } from '../hooks/useNotes';
import './NoteEditor.css';

// PUBLIC_INTERFACE
/**
 * Note editor component.
 * @param {Object} props
 * @param {Object|null} props.note - The note being edited
 * @param {Array} props.allTags - All available tags
 * @param {Function} props.onUpdate - Callback when note is updated
 * @param {Function} props.onCreateTag - Callback to create a new tag
 * @param {Function} props.onDelete - Callback to delete the current note
 * @param {Function} props.onTogglePin - Callback to toggle pin
 */
function NoteEditor({ note, allTags, onUpdate, onCreateTag, onDelete, onTogglePin }) {
    const { note: editNote, saving, savedAt, saveError, handleChange } = useNoteEditor(
        note,
        onUpdate
    );
    const [showTagPicker, setShowTagPicker] = useState(false);
    const [newTagInput, setNewTagInput] = useState('');
    const [tagPickerError, setTagPickerError] = useState('');

    // Close tag picker on outside click
    useEffect(() => {
        if (!showTagPicker) return;
        const handleClick = (e) => {
            if (!e.target.closest('.tag-picker-container')) {
                setShowTagPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showTagPicker]);

    if (!editNote) {
        return (
            <div className="editor-empty">
                <div className="editor-empty-content">
                    <span className="editor-empty-icon">📝</span>
                    <h2 className="editor-empty-title">Select a note</h2>
                    <p className="editor-empty-subtitle">
                        Choose a note from the list or create a new one.
                    </p>
                </div>
            </div>
        );
    }

    const currentTagIds = editNote.tags ? editNote.tags.map((t) => t.id) : [];

    /**
     * Toggle a tag association on the current note.
     * @param {number} tagId - The tag ID to toggle
     */
    const handleTagToggle = (tagId) => {
        const newTagIds = currentTagIds.includes(tagId)
            ? currentTagIds.filter((id) => id !== tagId)
            : [...currentTagIds, tagId];
        handleChange('tag_ids', newTagIds);
    };

    /**
     * Handle creating and adding a new tag inline.
     * @param {React.FormEvent} e - Form submit event
     */
    const handleCreateAndAddTag = async (e) => {
        e.preventDefault();
        const trimmed = newTagInput.trim();
        if (!trimmed) return;
        try {
            const newTag = await onCreateTag(trimmed);
            setNewTagInput('');
            setTagPickerError('');
            // Add to note
            if (newTag) {
                const newTagIds = [...currentTagIds, newTag.id];
                handleChange('tag_ids', newTagIds);
            }
        } catch (err) {
            setTagPickerError(err.message || 'Failed to create tag');
        }
    };

    const saveStatusText = saveError
        ? `⚠ ${saveError}`
        : saving
        ? '● Saving...'
        : savedAt
        ? `✓ Saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : '● Autosave on';

    return (
        <div className="note-editor">
            {/* Editor toolbar */}
            <div className="editor-toolbar">
                <div className="editor-toolbar-left">
                    <button
                        className={`editor-pin-btn ${editNote.is_pinned ? 'pinned' : ''}`}
                        onClick={() => onTogglePin(editNote.id)}
                        aria-label={editNote.is_pinned ? 'Unpin note' : 'Pin note'}
                        title={editNote.is_pinned ? 'Unpin' : 'Pin to top'}
                    >
                        📌 {editNote.is_pinned ? 'Pinned' : 'Pin'}
                    </button>

                    <div className="tag-picker-container">
                        <button
                            className="editor-tag-btn"
                            onClick={() => setShowTagPicker((v) => !v)}
                            aria-label="Manage tags"
                            title="Manage tags"
                        >
                            🏷 Tags
                            {currentTagIds.length > 0 && (
                                <span className="tag-count-badge">{currentTagIds.length}</span>
                            )}
                        </button>

                        {showTagPicker && (
                            <div className="tag-picker-dropdown">
                                <div className="tag-picker-header">Manage Tags</div>

                                {/* Existing tags */}
                                <div className="tag-picker-list">
                                    {allTags.length === 0 && (
                                        <p className="tag-picker-empty">No tags yet. Create one below.</p>
                                    )}
                                    {allTags.map((tag) => (
                                        <label key={tag.id} className="tag-picker-item">
                                            <input
                                                type="checkbox"
                                                checked={currentTagIds.includes(tag.id)}
                                                onChange={() => handleTagToggle(tag.id)}
                                                className="tag-picker-checkbox"
                                            />
                                            <span className="tag-picker-name">#{tag.name}</span>
                                        </label>
                                    ))}
                                </div>

                                {/* Create new tag */}
                                <form className="tag-picker-create" onSubmit={handleCreateAndAddTag}>
                                    <input
                                        type="text"
                                        value={newTagInput}
                                        onChange={(e) => {
                                            setNewTagInput(e.target.value);
                                            setTagPickerError('');
                                        }}
                                        placeholder="New tag name..."
                                        className="tag-picker-input"
                                        maxLength={100}
                                    />
                                    <button type="submit" className="tag-picker-add-btn">Add</button>
                                </form>
                                {tagPickerError && (
                                    <p className="tag-picker-error">{tagPickerError}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="editor-toolbar-right">
                    <span className={`save-status ${saveError ? 'error' : saving ? 'saving' : 'saved'}`}>
                        {saveStatusText}
                    </span>
                    <button
                        className="editor-delete-btn"
                        onClick={() => onDelete(editNote.id)}
                        aria-label="Delete note"
                        title="Delete note"
                    >
                        🗑 Delete
                    </button>
                </div>
            </div>

            {/* Title input */}
            <div className="editor-title-wrapper">
                <input
                    type="text"
                    className="editor-title-input"
                    value={editNote.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Untitled"
                    aria-label="Note title"
                    maxLength={255}
                />
            </div>

            {/* Tags display */}
            {editNote.tags && editNote.tags.length > 0 && (
                <div className="editor-tags-display">
                    {editNote.tags.map((tag) => (
                        <span key={tag.id} className="editor-tag-chip">
                            #{tag.name}
                            <button
                                className="editor-tag-remove"
                                onClick={() => handleTagToggle(tag.id)}
                                aria-label={`Remove tag ${tag.name}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Content textarea */}
            <textarea
                className="editor-content"
                value={editNote.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="Start writing your note..."
                aria-label="Note content"
            />

            {/* Footer with metadata */}
            <div className="editor-footer">
                <span className="editor-meta">
                    Created: {new Date(editNote.created_at).toLocaleString()}
                </span>
                <span className="editor-meta">
                    Modified: {new Date(editNote.updated_at).toLocaleString()}
                </span>
            </div>
        </div>
    );
}

export default NoteEditor;
