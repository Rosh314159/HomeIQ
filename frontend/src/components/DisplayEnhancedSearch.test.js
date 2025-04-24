import React from 'react';
import { render, screen } from '@testing-library/react';
import DisplayEnhancedSearch from './DisplayEnhancedSearch';

test('renders DisplayEnhancedSearch component', () => {
    render(<DisplayEnhancedSearch />);
    const linkElement = screen.getByText(/search/i);
    expect(linkElement).toBeInTheDocument();
});

test('displays correct search results', () => {
    const mockResults = ['Result 1', 'Result 2'];
    render(<DisplayEnhancedSearch results={mockResults} />);
    mockResults.forEach(result => {
        expect(screen.getByText(result)).toBeInTheDocument();
    });
});