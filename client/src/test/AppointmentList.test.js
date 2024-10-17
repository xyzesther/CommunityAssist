import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import AppointmentList from '../components/AppointmentList';
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";

jest.mock('axios');
jest.mock('@auth0/auth0-react');

describe('AppointmentList Component', () => {
  const mockGetAccessTokenSilently = jest.fn();

  beforeEach(() => {
    useAuth0.mockReturnValue({
      getAccessTokenSilently: mockGetAccessTokenSilently,
    });
    jest.clearAllMocks();

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('renders without crashing', async () => {
    mockGetAccessTokenSilently.mockResolvedValue('fake-token');
    axios.get.mockResolvedValue({ data: [] });

    await act(async () => {
      render(<AppointmentList />);
    });

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());
  });

  it('fetches and displays appointments', async () => {
    mockGetAccessTokenSilently.mockResolvedValue('fake-token');
    const mockAppointments = [
      {
        appointmentId: 1,
        status: 'SCHEDULED',
        appointmentTime: '2024-08-15T10:00:00Z',
        request: {
          title: 'Dog Walking',
          user: { name: 'John Doe' },
          createdAt: '2024-08-01T10:00:00Z'
        },
      },
    ];
    axios.get.mockResolvedValue({ data: mockAppointments });

    await act(async () => {
      render(<AppointmentList />);
    });

    await waitFor(() => expect(screen.getByText(/dog walking/i)).toBeInTheDocument());
    expect(screen.getByText(/requested by: john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/appointment time:/i)).toBeInTheDocument(); // More flexible
    expect(screen.getByText(/8\/15\/2024/i)).toBeInTheDocument(); // Matching part of the text
    expect(screen.getByText(/status: scheduled/i)).toBeInTheDocument();
  });

  it('filters and limits appointments based on props', async () => {
    mockGetAccessTokenSilently.mockResolvedValue('fake-token');
    const mockAppointments = [
      {
        appointmentId: 1,
        status: 'SCHEDULED',
        appointmentTime: '2024-08-15T10:00:00Z',
        request: {
          title: 'Dog Walking',
          user: { name: 'John Doe' },
          createdAt: '2024-08-01T10:00:00Z'
        },
      },
      {
        appointmentId: 2,
        status: 'COMPLETED',
        appointmentTime: '2024-08-10T10:00:00Z',
        request: {
          title: 'Cat Sitting',
          user: { name: 'Jane Doe' },
          createdAt: '2024-08-01T12:00:00Z'
        },
      },
    ];
    axios.get.mockResolvedValue({ data: mockAppointments });

    await act(async () => {
      render(<AppointmentList filter={true} limit={1} />);
    });

    await waitFor(() => expect(screen.getByText(/dog walking/i)).toBeInTheDocument());
    expect(screen.queryByText(/cat sitting/i)).not.toBeInTheDocument();
  });

  it('calls onNoScheduledAppointments when no scheduled appointments are found', async () => {
    mockGetAccessTokenSilently.mockResolvedValue('fake-token');
    const mockOnNoScheduledAppointments = jest.fn();
    axios.get.mockResolvedValue({ data: [] });

    await act(async () => {
      render(<AppointmentList filter={true} onNoScheduledAppointments={mockOnNoScheduledAppointments} />);
    });

    await waitFor(() => expect(mockOnNoScheduledAppointments).toHaveBeenCalled());
  });

  it('handles appointment cancellation', async () => {
    mockGetAccessTokenSilently.mockResolvedValue('fake-token');
    const mockAppointments = [
      {
        appointmentId: 1,
        status: 'SCHEDULED',
        appointmentTime: '2024-08-15T10:00:00Z',
        request: {
          title: 'Dog Walking',
          user: { name: 'John Doe' },
          createdAt: '2024-08-01T10:00:00Z'
        },
      },
    ];
    axios.get.mockResolvedValue({ data: mockAppointments });
    axios.put.mockResolvedValue({});

    await act(async () => {
      render(<AppointmentList />);
    });

    await waitFor(() => expect(screen.getByText(/dog walking/i)).toBeInTheDocument());

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    await waitFor(() => expect(axios.put).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/appointments/1`,
      { status: 'CANCELLED' },
      expect.any(Object)
    ));
    expect(screen.getByText(/status: cancelled/i)).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    mockGetAccessTokenSilently.mockResolvedValue('fake-token');
    axios.get.mockRejectedValue(new Error('API Error'));
  
    await act(async () => {
      render(<AppointmentList />);
    });
  
    await waitFor(() => expect(screen.getByText(/error fetching appointments/i)).toBeInTheDocument());
  });
});
