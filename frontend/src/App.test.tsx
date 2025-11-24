import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page when not authenticated', () => {
  render(<App />);
  const titleElement = screen.getByText(/DevLead Companion/i);
  expect(titleElement).toBeInTheDocument();
});

