import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateRequestModal from '../components/CreateRequestModal';
import { useAuth0 } from '@auth0/auth0-react';
import useCreateRequest from '../hooks/useCreateRequest';
import useUpdateRequest from '../hooks/useUpdateRequest';

jest.mock('@auth0/auth0-react');
jest.mock('../hooks/useCreateRequest');
jest.mock('../hooks/useUpdateRequest');

describe('CreateRequestModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnRequestCreated = jest.fn();
  const mockGetAccessTokenSilently = jest.fn();

  beforeEach(() => {
    useAuth0.mockReturnValue({
      getAccessTokenSilently: mockGetAccessTokenSilently,
    });
    jest.clearAllMocks();

    useCreateRequest.mockReturnValue({ 
      createRequest: jest.fn(), 
      loading: false, 
      error: null 
    });

    useUpdateRequest.mockReturnValue({
      updateRequest: jest.fn(),
      loading: false,
      error: null,
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('renders the create request form correctly', () => {
    render(
      <CreateRequestModal 
        onClose={mockOnClose} 
        onRequestCreated={mockOnRequestCreated} 
        request={null} 
      />
    );

    expect(screen.getByRole('heading', { name: /create request/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create request/i })).toBeInTheDocument();
  });

  it('renders the edit request form correctly', () => {
    const mockRequest = {
      requestId: 1,
      title: 'Dog Walking',
      description: 'Walk my dog in the park',
      status: 'OPEN',
    };

    render(
      <CreateRequestModal 
        onClose={mockOnClose} 
        onRequestCreated={mockOnRequestCreated} 
        request={mockRequest} 
      />
    );

    expect(screen.getByText(/edit request/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/dog walking/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/walk my dog in the park/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/open/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update request/i })).toBeInTheDocument();
  });

  it('handles creating a new request successfully', async () => {
    const mockCreateRequest = jest.fn().mockResolvedValue({ requestId: 2, title: 'New Request', description: 'New description', status: 'OPEN' });
    useCreateRequest.mockReturnValue({ createRequest: mockCreateRequest, loading: false, error: null });

    render(
      <CreateRequestModal 
        onClose={mockOnClose} 
        onRequestCreated={mockOnRequestCreated} 
        request={null} 
      />
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Request' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'New description' } });

    fireEvent.click(screen.getByRole('button', { name: /create request/i }));

    await waitFor(() => {
      expect(mockCreateRequest).toHaveBeenCalledWith(
        { title: 'New Request', description: 'New description', status: 'OPEN' },
        expect.any(Object)
      );
      expect(mockOnRequestCreated).toHaveBeenCalledWith({ requestId: 2, title: 'New Request', description: 'New description', status: 'OPEN' });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles updating an existing request successfully', async () => {
    const mockRequest = {
      requestId: 1,
      title: 'Dog Walking',
      description: 'Walk my dog in the park',
      status: 'OPEN',
    };
    const mockUpdateRequest = jest.fn().mockResolvedValue({ ...mockRequest, title: 'Updated Request', description: 'Updated description' });
    useUpdateRequest.mockReturnValue({ updateRequest: mockUpdateRequest, loading: false, error: null });

    render(
      <CreateRequestModal 
        onClose={mockOnClose} 
        onRequestCreated={mockOnRequestCreated} 
        request={mockRequest} 
      />
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Updated Request' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Updated description' } });

    fireEvent.click(screen.getByRole('button', { name: /update request/i }));

    await waitFor(() => {
      expect(mockUpdateRequest).toHaveBeenCalledWith(
        1,
        { title: 'Updated Request', description: 'Updated description', status: 'OPEN' },
        expect.any(Object)
      );
      expect(mockOnRequestCreated).toHaveBeenCalledWith({ ...mockRequest, title: 'Updated Request', description: 'Updated description' });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('displays an error message when creating a request fails', async () => {
    const mockCreateRequest = jest.fn().mockRejectedValue(new Error('Failed to create request'));
    useCreateRequest.mockReturnValue({ 
      createRequest: mockCreateRequest, 
      loading: false, 
      error: new Error('Failed to create request'), 
    });

    render(
      <CreateRequestModal 
        onClose={mockOnClose} 
        onRequestCreated={mockOnRequestCreated} 
        request={null} 
      />
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Request' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'New description' } });

    fireEvent.click(screen.getByRole('button', { name: /create request/i }));

    await waitFor(() => {
      expect(mockCreateRequest).toHaveBeenCalled();
      expect(screen.getByText(/error: failed to create request/i)).toBeInTheDocument();
    });

  });

  it('displays an error message when updating a request fails', async () => {
    const mockRequest = {
      requestId: 1,
      title: 'Dog Walking',
      description: 'Walk my dog in the park',
      status: 'OPEN',
    };
    const mockUpdateRequest = jest.fn().mockRejectedValue(new Error('Failed to update request'));
    useUpdateRequest.mockReturnValue({ 
      updateRequest: mockUpdateRequest, 
      loading: false, 
      error: new Error('Failed to update request'), });

    render(
      <CreateRequestModal 
        onClose={mockOnClose} 
        onRequestCreated={mockOnRequestCreated} 
        request={mockRequest} 
      />
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Updated Request' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Updated description' } });

    fireEvent.click(screen.getByRole('button', { name: /update request/i }));

    await waitFor(() => {
      expect(mockUpdateRequest).toHaveBeenCalled();
      expect(screen.getByText(/error: failed to update request/i)).toBeInTheDocument();
    });
  });
});
