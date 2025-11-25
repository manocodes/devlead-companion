import { render, screen, waitFor } from './__tests__/test-utils';
import App from './App';

describe('App Component', () => {
  it('renders login page when not authenticated', async () => {
    render(<App />);

    await waitFor(() => {
      const titleElement = screen.getByText(/DevLead Companion/i);
      expect(titleElement).toBeInTheDocument();
    });
  });

  it('shows sign in button on login page', async () => {
    render(<App />);

    await waitFor(() => {
      const signInButton = screen.getByRole('button', { name: /sign in with google/i });
      expect(signInButton).toBeInTheDocument();
    });
  });
});
