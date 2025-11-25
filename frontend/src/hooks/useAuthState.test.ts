import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { useAuthState } from './useAuthState';
import * as client from '../client-api/client';

jest.mock('../client-api/client');

const mockGetUserProfile = client.getUserProfile as jest.MockedFunction<
  typeof client.getUserProfile
>;

describe('useAuthState', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    delete (window as any).location;
    window.location = { search: '', href: '' } as any;
    window.history.replaceState = jest.fn();
  });

  it('returns guest state when not authenticated', async () => {
    const { result } = renderHook(() => useAuthState(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isGuest).toBe(true);
    expect(result.current.userName).toBe('Guest');
    expect(result.current.userEmail).toBe('');
  });

  it('returns user data when authenticated', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    localStorage.setItem('token', 'test-token');
    mockGetUserProfile.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuthState(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isGuest).toBe(false);
    expect(result.current.userName).toBe('Test User');
    expect(result.current.userEmail).toBe('test@example.com');
    expect(result.current.user).toEqual(mockUser);
  });
});
