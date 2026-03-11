/**
 * Custom React hook for managing tags state and API interactions.
 */
import { useState, useEffect, useCallback } from 'react';
import { tagsApi } from '../services/api';

// PUBLIC_INTERFACE
/**
 * Hook for managing the tags list.
 * @returns {Object} Tags state and actions
 */
function useTags() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTags = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await tagsApi.list();
            setTags(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    const createTag = useCallback(async (name) => {
        try {
            const response = await tagsApi.create(name);
            // Avoid duplicates (API returns existing tag if name matches)
            setTags((prev) => {
                const exists = prev.find((t) => t.id === response.data.id);
                return exists ? prev : [...prev, response.data];
            });
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const deleteTag = useCallback(async (id) => {
        try {
            await tagsApi.delete(id);
            setTags((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    return {
        tags,
        loading,
        error,
        refresh: fetchTags,
        createTag,
        deleteTag,
    };
}

export default useTags;
