import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import useCreateRequest from '../hooks/useCreateRequest';
import useUpdateRequest from '../hooks/useUpdateRequest';
import '../style/modal.css';

export default function CreateRequestModal({ onClose, onRequestCreated, request }) {
  const { getAccessTokenSilently } = useAuth0();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('OPEN');
  const { createRequest, loading: creating, error: createError } = useCreateRequest();
  const { updateRequest, loading: updating, error: updateError } = useUpdateRequest();

  useEffect(() => {
    if (request) {
      setTitle(request.title);
      setDescription(request.description);
      setStatus(request.status);
    } else {
      setStatus('OPEN');
    }
  }, [request]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const requestData = { title, description, status };

      if (request) {
        // Update existing request
        const updatedRequest = await updateRequest(request.requestId, requestData, config);
        onRequestCreated(updatedRequest);
      } else {
        // Create new request
        const newRequest = await createRequest(requestData, config);
        onRequestCreated(newRequest);
      }
      onClose();
    } catch (error) {
      console.error('Failed to create/update request:', error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{request ? 'Edit Request' : 'Create Request'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Title:
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            Description:
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
          </label>
          <label>
            Status:
            <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={!request}>
              <option value="OPEN">Open</option>
              {request && <option value="COMPLETED">Completed</option>}
            </select>
          </label>
          <button type="submit" disabled={creating || updating}>
            {request ? 'Update Request' : 'Create Request'}
          </button>
        </form>
        {(createError || updateError) && <p className="error">Error: {createError?.message || updateError?.message}</p>}
      </div>
    </div>
  );
}
