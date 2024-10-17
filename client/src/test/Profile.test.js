import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Profile from '../components/Profile';
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";

jest.mock('axios');
jest.mock('@auth0/auth0-react');

describe('Profile Component', () => {
  const mockGetAccessTokenSilently = jest.fn();
  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    picture: 'http://example.com/avatar.jpg',
    sub: 'auth0|123456789',
    email_verified: true,
  };

  beforeEach(() => {
    useAuth0.mockReturnValue({
      user: mockUser,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      isLoading: false,
    });
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.warn.mockRestore();
    console.error.mockRestore();
  });

  it('renders user profile data correctly', async () => {
    mockGetAccessTokenSilently.mockResolvedValue('fake-token');
    axios.get.mockImplementation((url) => {
      if (url.includes('/appointments/user')) {
        return Promise.resolve({
          data: [{
            appointmentId: 1,
            status: 'SCHEDULED',
            appointmentTime: '2024-08-15T10:00:00Z',
            request: {
              title: 'Dog Walking',
              user: { name: 'John Doe', email: 'john.doe@example.com' },
              createdAt: '2024-08-01T10:00:00Z'
            }
          }]
        });
      }
      if (url.includes('/requests/user')) {
        return Promise.resolve({
          data: [{
            requestId: 1,
            title: 'Dog Walking',
            status: 'OPEN',
            user: { name: 'John Doe', email: 'john.doe@example.com' },
            createdAt: '2024-08-01T10:00:00Z'
          }]
        });
      }
      return Promise.resolve({
        data: {
          name: 'John Doe',
          email: 'john.doe@example.com',
        }
      });
    });

    await act(async () => {
      render(
        <Router>
          <Profile />
        </Router>
      );
    });

    expect(screen.getByText(/john doe/i, { selector: '.profile-name' })).toBeInTheDocument();
    expect(screen.getByText(/john.doe@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/auth0id: auth0|123456789/i)).toBeInTheDocument();
    expect(screen.getByText(/email verified: true/i)).toBeInTheDocument();
    expect(screen.getByAltText(/profile avatar/i)).toHaveAttribute('src', 'http://example.com/avatar.jpg');
  });

  it('fetches and displays appointments and requests', async () => {
    mockGetAccessTokenSilently.mockResolvedValue('fake-token');
    axios.get.mockImplementation((url) => {
      if (url.includes('/appointments/user')) {
        return Promise.resolve({
          data: [{
            appointmentId: 1,
            status: 'SCHEDULED',
            appointmentTime: '2024-08-15T10:00:00Z',
            request: {
              title: 'Dog Walking',
              user: { name: 'John Doe', email: 'john.doe@example.com' },
              createdAt: '2024-08-01T10:00:00Z'
            }
          }]
        });
      }
      if (url.includes('/requests/user')) {
        return Promise.resolve({
          data: [{
            requestId: 1,
            title: 'Dog Walking',
            status: 'OPEN',
            user: { name: 'John Doe', email: 'john.doe@example.com' },
            createdAt: '2024-08-01T10:00:00Z'
          }]
        });
      }
      return Promise.resolve({ data: {} });
    });

    await act(async () => {
      render(
        <Router>
          <Profile />
        </Router>
      );
    });

    await waitFor(() => expect(screen.getByText(/your appointments/i)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/your requests/i)).toBeInTheDocument());
  });

  it('handles profile update successfully', async () => {
    mockGetAccessTokenSilently.mockResolvedValue('fake-token');
    axios.put.mockResolvedValue({});

    await act(async () => {
      render(
        <Router>
          <Profile />
        </Router>
      );
    });

    fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'jane.doe@example.com' } });

    fireEvent.click(screen.getByText(/update profile/i));

    await waitFor(() => expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument());
  });

  it('handles profile update failure', async () => {
    mockGetAccessTokenSilently.mockResolvedValue('fake-token');
    axios.put.mockRejectedValue(new Error('Failed to update profile'));

    await act(async () => {
      render(
        <Router>
          <Profile />
        </Router>
      );
    });

    fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'jane.doe@example.com' } });

    fireEvent.click(screen.getByText(/update profile/i));

    await waitFor(() => expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument());
  });

  it('renders loading state', () => {
    useAuth0.mockReturnValue({
      user: null,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      isLoading: true,
    });

    render(
      <Router>
        <Profile />
      </Router>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders error state when user is not found', () => {
    useAuth0.mockReturnValue({
      user: null,
      getAccessTokenSilently: mockGetAccessTokenSilently,
      isLoading: false,
    });

    render(
      <Router>
        <Profile />
      </Router>
    );

    expect(screen.getByText(/error: user not found/i)).toBeInTheDocument();
  });
});
