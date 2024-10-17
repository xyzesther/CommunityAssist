import React, { useEffect, useState } from 'react';
import "../style/requestList.css";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import CreateRequestModal from "./CreateRequestModal";

export default function RequestList({ showCreateButton = true, filterByUser = false }) { 
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently, user } = useAuth0();
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestBeingEdited, setRequestBeingEdited] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        let config = {};
        if (isAuthenticated) {
          const token = await getAccessTokenSilently();
          config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
        }
        const result = await axios.get(`${process.env.REACT_APP_API_URL}/requests`, config);
        let fetchedRequests = result.data;

        if (!Array.isArray(fetchedRequests)) {
          fetchedRequests = [fetchedRequests];
        }

        if (filterByUser && isAuthenticated && user) {
          fetchedRequests = fetchedRequests.filter(request => request.user.email === user.email);
        }

        setRequests(fetchedRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, [getAccessTokenSilently, isAuthenticated, user, filterByUser]);

  const handleDetailsClick = (e, requestId) => {
    if (!isAuthenticated) {
      e.preventDefault();
      loginWithRedirect();
    } else {
      navigate(`/requests/${requestId}`);
    }
  };

  const handleCreateRequest = () => {
    if (!isAuthenticated) {
      loginWithRedirect();
    } else {
      setRequestBeingEdited(null);
      setIsModalOpen(true);
    }
  };

  const handleEditRequest = (request) => {
    setRequestBeingEdited(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleRequestCreated = async (newRequest) => {
    try {
      const token = await getAccessTokenSilently();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/requests/${newRequest.requestId}`, config);
      const fullRequest = response.data;

      setRequests((prevRequests) => {
        const existingRequestIndex = prevRequests.findIndex(r => r.requestId === fullRequest.requestId);
        if (existingRequestIndex >= 0) {
          const updatedRequests = [...prevRequests];
          updatedRequests[existingRequestIndex] = fullRequest;
          return updatedRequests;
        } else {
          return [...prevRequests, fullRequest];
        }
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error fetching full request details:', error);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      const token = await getAccessTokenSilently();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(`${process.env.REACT_APP_API_URL}/requests/${requestId}`, config);
      setRequests(requests.filter(request => request.requestId !== requestId));
      setErrorMessage('');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage('Request with appointments cannot be deleted');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      } else {
        setErrorMessage('Error deleting request');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      }
      console.error('Error deleting request:', error);
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'OPEN':
        return 'Open';
      case 'IN_PROGRESS':
        return 'In progress';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const formatDate = (date) => {
    const options = { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' };
    return new Date(date).toLocaleString('en-US', options).replace(',', '');
  };

  return (
    <div className="request-list-container">
      {showCreateButton && (
        <div className="create-request-container">
          <button className="btn-primary" onClick={handleCreateRequest}>
            Create Request
          </button>
        </div>
      )}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="request-list">
        {requests.map((request) => (
          <div key={`request_${request.requestId}`} className="request-card">
            <div className="request-header">
              <span className={`status-tag ${request.status ? request.status.toLowerCase() : 'OPEN'}`}>{formatStatus(request.status)}</span>
              {isAuthenticated && user.email === request.user.email && (
                <button className="delete-btn" onClick={() => handleDeleteRequest(request.requestId)}>X</button>
              )}
            </div>
            <div className="request-body">
              <h3 className="request-title">{request.title}</h3>
              <div className="request-info">
                {request.user && (
                  <>
                    <p className="user-info">{request.user.name}</p>
                    <p className="time-info">Posted on {formatDate(request.createdAt)}</p>
                  </>
                )}
              </div>
              <div className="request-actions">
                {isAuthenticated && user.email === request.user.email && (
                  <Link to="#" className="edit-btn" onClick={() => handleEditRequest(request)}>Edit</Link>
                )}
                <Link to={`/requests/${request.requestId}`} className="details-btn" onClick={(e) => handleDetailsClick(e, request.requestId)}>Details</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <CreateRequestModal 
          onClose={handleCloseModal} 
          onRequestCreated={handleRequestCreated} 
          request={requestBeingEdited} 
        />
      )}
    </div>
  );
}
