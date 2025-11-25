import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../__tests__/test-utils';
import Login from './Login';

describe('Login Component', () => {
  beforeEach(() => {
    // Reset window.location before each test
    delete (window as any).location;
    window.location = { href: '' } as any;
  });

  it('renders the login page with title', () => {
    render(<Login />);

    expect(screen.getByText('DevLead Companion')).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
  });

  it('renders Google sign-in button', () => {
    render(<Login />);

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    expect(googleButton).toBeInTheDocument();
  });

  it('redirects to Google OAuth when button is clicked', async () => {
    render(<Login />);

    const googleButton = screen.getByRole('button', { name: /sign in with google/i });
    await userEvent.click(googleButton);

    await waitFor(() => {
      expect(window.location.href).toBe('http://localhost:3000/auth/google');
    });
  });
});
