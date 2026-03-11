/**
 * Custom React hook for managing notes state and API interactions.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { notesApi } from '../services/api';

const AUTOSAVE_DELAY = 1500; // milliseconds

// PUBLIC_INTERFACE
/**
 * Hook for managing notes list with search, filter, and pagination.
 * @param {Object} filters - Current filter state
 * @returns {Object} Notes state and actions
 */
export function useNotesList(filters = {}) {
    const [notes, setNotes] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await notesApi.list(filters);
            setNotes(response.data.notes);
            setTotal(response.data.total);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const createNote = useCallback(async (data = {}) => {
        try {
            const response = await notesApi.create({
                title: 'Untitled',
                content: '',
                is_pinned: false,
                tag_ids: [],
                ...data,
            });
            setNotes((prev) => [response.data, ...prev]);
            setTotal((prev) => prev + 1);
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const deleteNote = useCallback(async (id) => {
        try {
            await notesApi.delete(id);
            setNotes((prev) => prev.filter((n) => n.id !== id));
            setTotal((prev) => prev - 1);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const togglePin = useCallback(async (id) => {
        try {
            const response = await notesApi.togglePin(id);
            setNotes((prev) =>
                prev.map((n) => (n.id === id ? response.data : n))
                    .sort((a, b) => {
                        if (a.is_pinned !== b.is_pinned) return b.is_pinned - a.is_pinned;
                        return new Date(b.updated_at) - new Date(a.updated_at);
                    })
            );
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const updateNoteInList = useCallback((updatedNote) => {
        setNotes((prev) =>
            prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
        );
    }, []);

    return {
        notes,
        total,
        loading,
        error,
        refresh: fetchNotes,
        createNote,
        deleteNote,
        togglePin,
        updateNoteInList,
    };
}

// PUBLIC_INTERFACE
/**
 * Hook for editing a single note with autosave support.
 * @param {Object} initialNote - The note to edit
 * @param {Function} onUpdate - Callback when note is saved
 * @returns {Object} Edit state and actions
 */
export function useNoteEditor(initialNote, onUpdate) {
    const [note, setNote] = useState(initialNote);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState(null);
    const [saveError, setSaveError] = useState(null);
    const autosaveTimer = useRef(null);
    const pendingChanges = useRef(null);

    // Sync with prop changes (e.g., when a new note is selected)
    useEffect(() => {
        setNote(initialNote);
        setSavedAt(null);
        setSaveError(null);
        // Clear any pending autosave
        if (autosaveTimer.current) {
            clearTimeout(autosaveTimer.current);
        }
        pendingChanges.current = null;
    }, [initialNote?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (autosaveTimer.current) {
                clearTimeout(autosaveTimer.current);
            }
        };
    }, []);

    const saveNote = useCallback(async (changes) => {
        if (!note) return;
        setSaving(true);
        setSaveError(null);
        try {
            const response = await notesApi.update(note.id, changes);
            setNote(response.data);
            setSavedAt(new Date());
            if (onUpdate) onUpdate(response.data);
            return response.data;
        } catch (err) {
            setSaveError(err.message);
        } finally {
            setSaving(false);
        }
    }, [note, onUpdate]);

    const handleChange = useCallback((field, value) => {
        setNote((prev) => ({ ...prev, [field]: value }));

        // Accumulate changes for autosave
        pendingChanges.current = {
            ...(pendingChanges.current || {}),
            [field]: value,
        };

        // Debounce the save
        if (autosaveTimer.current) {
            clearTimeout(autosaveTimer.current);
        }
        autosaveTimer.current = setTimeout(() => {
            if (pendingChanges.current) {
                saveNote(pendingChanges.current);
                pendingChanges.current = null;
            }
        }, AUTOSAVE_DELAY);
    }, [saveNote]);

    const saveNow = useCallback(() => {
        if (autosaveTimer.current) {
            clearTimeout(autosaveTimer.current);
        }
        if (pendingChanges.current) {
            saveNote(pendingChanges.current);
            pendingChanges.current = null;
        }
    }, [saveNote]);

    return {
        note,
        saving,
        savedAt,
        saveError,
        handleChange,
        saveNote,
        saveNow,
    };
}
