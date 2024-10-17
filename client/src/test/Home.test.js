import React from 'react';
import { render } from '@testing-library/react';
import Home from '../components/Home';
import { useAuth0 } from '@auth0/auth0-react';

jest.mock('@auth0/auth0-react');
jest.mock('../components/AppointmentList', () => () => <div>Mocked Appointment List</div>);
jest.mock('../components/RequestList', () => () => <div>Mocked Request List</div>);

test('renders login prompt if not authenticated', () => {
  useAuth0.mockReturnValue({ isAuthenticated: false });

  const { getByText } = render(<Home />);

  expect(getByText('Please login to see your appointments')).toBeInTheDocument();
});

test('renders AppointmentList if authenticated', () => {
  useAuth0.mockReturnValue({ isAuthenticated: true });

  const { getByText } = render(<Home />);

  expect(getByText('Mocked Appointment List')).toBeInTheDocument();
});
