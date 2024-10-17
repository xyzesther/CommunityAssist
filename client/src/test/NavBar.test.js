import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import NavBar from '../components/NavBar';

jest.mock('@auth0/auth0-react');

test('renders NavBar with Home link', () => {
  useAuth0.mockReturnValue({ isAuthenticated: false, loginWithRedirect: jest.fn() });

  const { getByText } = render(
    <MemoryRouter>
      <NavBar />
    </MemoryRouter>
  );

  expect(getByText('Home')).toBeInTheDocument();
});

test('calls loginWithRedirect when clicking on Profile if not authenticated', () => {
  const mockLoginWithRedirect = jest.fn();
  useAuth0.mockReturnValue({ isAuthenticated: false, loginWithRedirect: mockLoginWithRedirect });

  const { getByText } = render(
    <MemoryRouter>
      <NavBar />
    </MemoryRouter>
  );

  fireEvent.click(getByText('Profile'));
  
  expect(mockLoginWithRedirect).toHaveBeenCalled();
});
