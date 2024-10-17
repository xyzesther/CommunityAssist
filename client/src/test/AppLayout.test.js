import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppLayout from '../components/AppLayout';

test('renders AppLayout with title and Navbar', () => {
  const { getByText } = render(
    <MemoryRouter>
      <AppLayout />
    </MemoryRouter>
  );

  expect(getByText('Community Assist')).toBeInTheDocument();
});
