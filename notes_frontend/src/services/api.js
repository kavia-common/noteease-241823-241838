/**
 * API service module for NoteEase frontend.
 * Handles all HTTP communication with the FastAPI backend.
 */
import axios from 'axios';

/** Base URL for the backend API, configurable via environment variable */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/** Axios instance configured for the NoteEase API */
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Response interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.detail || error.message || 'An error occurred';
        return Promise.reject(new Error(message));
    }
);

/**
 * Notes API methods.
 */
// PUBLIC_INTERFACE
export const notesApi = {
    /**
     * List notes with optional filters.
     * @param {Object} params - Query parameters for filtering/pagination
     * @param {string} [params.query] - Text search query
     * @param {number[]} [params.tag_ids] - Filter by tag IDs
     * @param {boolean} [params.pinned_only] - Show only pinned notes
     * @param {number} [params.page=1] - Page number
     * @param {number} [params.page_size=20] - Items per page
     * @returns {Promise<Object>} Paginated list response
     */
    list: (params = {}) => {
        const queryParams = {};
        if (params.query) queryParams.query = params.query;
        if (params.tag_ids && params.tag_ids.length > 0) {
            queryParams.tag_ids = params.tag_ids;
        }
        if (params.pinned_only !== undefined && params.pinned_only !== null) {
            queryParams.pinned_only = params.pinned_only;
        }
        queryParams.page = params.page || 1;
        queryParams.page_size = params.page_size || 20;
        return apiClient.get('/notes', { params: queryParams });
    },

    /**
     * Get a single note by ID.
     * @param {number} id - Note ID
     * @returns {Promise<Object>} Note data
     */
    get: (id) => apiClient.get(`/notes/${id}`),

    /**
     * Create a new note.
     * @param {Object} data - Note data
     * @param {string} data.title - Note title
     * @param {string} data.content - Note content
     * @param {boolean} [data.is_pinned=false] - Whether to pin the note
     * @param {number[]} [data.tag_ids=[]] - Tag IDs to associate
     * @returns {Promise<Object>} Created note
     */
    create: (data) => apiClient.post('/notes', data),

    /**
     * Update an existing note.
     * @param {number} id - Note ID
     * @param {Object} data - Fields to update
     * @returns {Promise<Object>} Updated note
     */
    update: (id, data) => apiClient.put(`/notes/${id}`, data),

    /**
     * Delete a note.
     * @param {number} id - Note ID
     * @returns {Promise<Object>} Deletion confirmation
     */
    delete: (id) => apiClient.delete(`/notes/${id}`),

    /**
     * Toggle the pinned status of a note.
     * @param {number} id - Note ID
     * @returns {Promise<Object>} Updated note
     */
    togglePin: (id) => apiClient.patch(`/notes/${id}/pin`),
};

/**
 * Tags API methods.
 */
// PUBLIC_INTERFACE
export const tagsApi = {
    /**
     * List all tags.
     * @returns {Promise<Array>} List of tags
     */
    list: () => apiClient.get('/tags'),

    /**
     * Create a new tag.
     * @param {string} name - Tag name
     * @returns {Promise<Object>} Created tag
     */
    create: (name) => apiClient.post('/tags', { name }),

    /**
     * Delete a tag.
     * @param {number} id - Tag ID
     * @returns {Promise<Object>} Deletion confirmation
     */
    delete: (id) => apiClient.delete(`/tags/${id}`),
};

export default apiClient;
