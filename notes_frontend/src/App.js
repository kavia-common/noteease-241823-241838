/**
 * Main App component for NoteEase.
 * Orchestrates the layout: TopBar, Sidebar, NotesList, and NoteEditor.
 * Manages global state: theme, selected note, search, and filters.
 */
import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import { useNotesList } from './hooks/useNotes';
import useTags from './hooks/useTags';

// PUBLIC_INTERFACE
/**
 * Root application component for NoteEase.
 * @returns {JSX.Element} The full application UI
 */
function App() {
    // Theme state
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('noteease-theme') || 'dark';
    });

    // Mobile sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Selected note state
    const [selectedNote, setSelectedNote] = useState(null);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTagId, setSelectedTagId] = useState(null);
    const [showPinnedOnly, setShowPinnedOnly] = useState(false);

    // Confirmation dialog state
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Build filters for notes list
    const noteFilters = {
        query: searchQuery || undefined,
        tag_ids: selectedTagId ? [selectedTagId] : undefined,
        pinned_only: showPinnedOnly || undefined,
        page: 1,
        page_size: 50,
    };

    // Notes and tags data
    const {
        notes,
        loading: notesLoading,
        error: notesError,
        createNote,
        deleteNote,
        togglePin,
        updateNoteInList,
        refresh: refreshNotes,
    } = useNotesList(noteFilters);

    const {
        tags,
        createTag,
        deleteTag,
    } = useTags();

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('noteease-theme', theme);
    }, [theme]);

    // Toggle theme
    const handleToggleTheme = useCallback(() => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    // Create a new note and select it
    const handleCreateNote = useCallback(async () => {
        try {
            const newNote = await createNote();
            setSelectedNote(newNote);
            setSidebarOpen(false);
        } catch (err) {
            console.error('Failed to create note:', err);
        }
    }, [createNote]);

    // Select a note for editing
    const handleSelectNote = useCallback((note) => {
        setSelectedNote(note);
        setSidebarOpen(false);
    }, []);

    // Prompt to delete a note
    const handleDeleteRequest = useCallback((noteId) => {
        setConfirmDelete(noteId);
    }, []);

    // Confirm deletion
    const handleConfirmDelete = useCallback(async () => {
        if (!confirmDelete) return;
        try {
            await deleteNote(confirmDelete);
            if (selectedNote && selectedNote.id === confirmDelete) {
                setSelectedNote(null);
            }
        } catch (err) {
            console.error('Failed to delete note:', err);
        } finally {
            setConfirmDelete(null);
        }
    }, [confirmDelete, deleteNote, selectedNote]);

    // Toggle pin for a note
    const handleTogglePin = useCallback(async (noteId) => {
        try {
            const updated = await togglePin(noteId);
            // Sync selected note if it's the pinned one
            if (selectedNote && selectedNote.id === noteId && updated) {
                setSelectedNote(updated);
            }
        } catch (err) {
            console.error('Failed to toggle pin:', err);
        }
    }, [togglePin, selectedNote]);

    // Handle note updates from editor (autosave)
    const handleNoteUpdate = useCallback((updatedNote) => {
        updateNoteInList(updatedNote);
        setSelectedNote(updatedNote);
    }, [updateNoteInList]);

    // Tag management
    const handleTagSelect = useCallback((tagId) => {
        setSelectedTagId((prev) => (prev === tagId ? null : tagId));
        setShowPinnedOnly(false);
    }, []);

    const handleTogglePinned = useCallback(() => {
        setShowPinnedOnly((prev) => !prev);
        setSelectedTagId(null);
    }, []);

    const handleShowAll = useCallback(() => {
        setSelectedTagId(null);
        setShowPinnedOnly(false);
        setSearchQuery('');
    }, []);

    const handleDeleteTag = useCallback(async (tagId) => {
        try {
            await deleteTag(tagId);
            if (selectedTagId === tagId) {
                setSelectedTagId(null);
            }
            // Refresh notes since tag associations change
            refreshNotes();
        } catch (err) {
            console.error('Failed to delete tag:', err);
        }
    }, [deleteTag, selectedTagId, refreshNotes]);

    const handleSearchChange = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    return (
        <div className="app">
            {/* Top navigation bar */}
            <TopBar
                theme={theme}
                onToggleTheme={handleToggleTheme}
                onToggleSidebar={() => setSidebarOpen((v) => !v)}
            />

            <div className="app-body">
                {/* Sidebar */}
                <Sidebar
                    tags={tags}
                    selectedTagId={selectedTagId}
                    showPinnedOnly={showPinnedOnly}
                    onTagSelect={handleTagSelect}
                    onTogglePinned={handleTogglePinned}
                    onShowAll={handleShowAll}
                    onCreateTag={createTag}
                    onDeleteTag={handleDeleteTag}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Notes list panel */}
                <NotesList
                    notes={notes}
                    selectedNoteId={selectedNote?.id}
                    loading={notesLoading}
                    error={notesError}
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    onNoteSelect={handleSelectNote}
                    onCreateNote={handleCreateNote}
                    onDeleteNote={handleDeleteRequest}
                    onTogglePin={handleTogglePin}
                />

                {/* Note editor */}
                <NoteEditor
                    note={selectedNote}
                    allTags={tags}
                    onUpdate={handleNoteUpdate}
                    onCreateTag={createTag}
                    onDelete={handleDeleteRequest}
                    onTogglePin={handleTogglePin}
                />
            </div>

            {/* Confirmation dialog */}
            {confirmDelete && (
                <div className="confirm-overlay">
                    <div className="confirm-dialog">
                        <h3>Delete Note</h3>
                        <p>Are you sure you want to permanently delete this note?<br />This action cannot be undone.</p>
                        <div className="confirm-actions">
                            <button
                                className="confirm-btn-cancel"
                                onClick={() => setConfirmDelete(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirm-btn-delete"
                                onClick={handleConfirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
