import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as client from '../client-api/client';

// Mock the client API
jest.mock('../client-api/client');

const mockGetUserProfile = client.getUserProfile as jest.MockedFunction<
  typeof client.getUserProfile
>;

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    // Reset window.location
    delete (window as any).location;
    window.location = {
      search: '',
      href: '',
    } as any;

    // Mock window.history
    window.history.replaceState = jest.fn();
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('initializes with unauthenticated state', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('loads user from localStorage token on mount', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    localStorage.setItem('token', 'test-token');
    mockGetUserProfile.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(mockGetUserProfile).toHaveBeenCalledWith('test-token');
  });

  it('handles login with token', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    mockGetUserProfile.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.login('new-token');

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe('new-token');
  });

  it('handles logout', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    localStorage.setItem('token', 'test-token');
    mockGetUserProfile.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    result.current.logout();

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('handles token from URL query parameter', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    window.location.search = '?token=url-token';
    mockGetUserProfile.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe('url-token');
    expect(window.history.replaceState).toHaveBeenCalled();
  });

  it('handles failed profile fetch', async () => {
    localStorage.setItem('token', 'invalid-token');
    mockGetUserProfile.mockRejectedValue(new Error('Unauthorized'));

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();

    consoleSpy.mockRestore();
  });
});
