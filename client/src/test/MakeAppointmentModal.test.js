import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth0 } from '@auth0/auth0-react';
import { useMakeAppointment } from '../hooks/useMakeAppointment';
import axios from 'axios';
import MakeAppointmentModal from '../components/MakeAppointmentModal';

jest.mock('@auth0/auth0-react');
jest.mock('../hooks/useMakeAppointment');
jest.mock('axios');

describe('MakeAppointmentModal', () => {
  const mockGetAccessTokenSilently = jest.fn();
  const mockMakeAppointment = jest.fn();
  const onCloseMock = jest.fn();
  const onAppointmentMadeMock = jest.fn();

  beforeEach(() => {
    useAuth0.mockReturnValue({
      getAccessTokenSilently: mockGetAccessTokenSilently,
    });
    useMakeAppointment.mockReturnValue({
      makeAppointment: mockMakeAppointment,
      loading: false,
    });
    mockGetAccessTokenSilently.mockResolvedValue('mocked_token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly when open', () => {
    render(<MakeAppointmentModal isOpen={true} onClose={onCloseMock} requestId={1} onAppointmentMade={onAppointmentMadeMock} />);

    expect(screen.getByRole('heading', /Make Appointment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Appointment Time:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Make Appointment/i })).toBeInTheDocument();
  });

  test('handles successful appointment creation', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });  // Mocking the appointments fetch
    mockMakeAppointment.mockResolvedValueOnce();  // Mocking the successful creation

    render(<MakeAppointmentModal isOpen={true} onClose={onCloseMock} requestId={1} onAppointmentMade={onAppointmentMadeMock} />);

    fireEvent.change(screen.getByLabelText(/Appointment Time:/i), { target: { value: '2024-08-08T10:30' } });
    fireEvent.click(screen.getByRole('button', { name: /Make Appointment/i }));
    
    await waitFor(() => {
      expect(mockGetAccessTokenSilently).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/appointments`, {
        headers: { Authorization: 'Bearer mocked_token' },
      });
      expect(mockMakeAppointment).toHaveBeenCalledWith({ requestId: 1, appointmentTime: '2024-08-08T10:30' }, 'mocked_token');
      expect(onAppointmentMadeMock).toHaveBeenCalled();
    });
  });

  test('handles failed appointment creation', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });  // Mocking the appointments fetch
    mockMakeAppointment.mockRejectedValueOnce(new Error('Failed to make appointment'));

    render(<MakeAppointmentModal isOpen={true} onClose={onCloseMock} requestId={1} onAppointmentMade={onAppointmentMadeMock} />);

    fireEvent.change(screen.getByLabelText(/Appointment Time:/i), { target: { value: '2024-08-08T10:30' } });
    fireEvent.click(screen.getByRole('button', { name: /Make Appointment/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to make appointment/i)).toBeInTheDocument();
    });
  });
});
