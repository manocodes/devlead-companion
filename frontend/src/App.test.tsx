import { render, screen } from '@testing-library/react';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';

const queryClient = new QueryClient();

test('renders login page when not authenticated', () => {
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  );
  const titleElement = screen.getByText(/DevLead Companion/i);
  expect(titleElement).toBeInTheDocument();
});

