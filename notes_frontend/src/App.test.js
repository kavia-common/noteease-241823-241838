import { render, screen } from '@testing-library/react';
import App from './App';

// Mock axios to prevent actual API calls during tests
jest.mock('axios', () => ({
    create: () => ({
        get: jest.fn().mockResolvedValue({ data: { notes: [], total: 0, page: 1, page_size: 20 } }),
        post: jest.fn().mockResolvedValue({ data: {} }),
        put: jest.fn().mockResolvedValue({ data: {} }),
        delete: jest.fn().mockResolvedValue({ data: {} }),
        patch: jest.fn().mockResolvedValue({ data: {} }),
        interceptors: {
            response: { use: jest.fn() },
            request: { use: jest.fn() },
        },
    }),
}));

test('renders NoteEase application', () => {
    render(<App />);
    // Check that the brand name is rendered
    const brandElements = screen.getAllByText(/noteease/i);
    expect(brandElements.length).toBeGreaterThan(0);
});
