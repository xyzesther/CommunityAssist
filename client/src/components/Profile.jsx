import React, { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import '../style/profile.css';
import axios from 'axios';
import AppointmentList from './AppointmentList';
import RequestList from './RequestList';

export default function Profile() {
  const { user, getAccessTokenSilently, isLoading } = useAuth0();
  const [displayName, setDisplayName] = useState('');
  const [displayEmail, setDisplayEmail] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [requests, setRequests] = useState([]);

  const fetchAppointments = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/appointments/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }, [getAccessTokenSilently]);

  const fetchRequests = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/requests/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = response.data;
        setDisplayName(userData.name || user.name);
        setDisplayEmail(userData.email || user.email);
        setName(userData.name || user.name);
        setEmail(userData.email || user.email);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (user) {
      fetchProfile();
      fetchAppointments();
      fetchRequests();
    }
  }, [user, getAccessTokenSilently, fetchAppointments, fetchRequests]);

  const handleUpdate = async () => {
    try {
      const token = await getAccessTokenSilently();
      await axios.put(`${process.env.REACT_APP_API_URL}/user`, { name, email }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDisplayName(name);
      setDisplayEmail(email);
      setMessage('Profile updated successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile.');
      setMessageType('error');
    }

    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Error: User not found</div>;
  }

  return (
    <div className="profile">
      <div className="profile-card">
        <img src={user.picture} width="70" alt="profile avatar" className="profile-avatar" />
        <h2 className="profile-name">{displayName}</h2>
        <p className="profile-email">📧 {displayEmail}</p>
        <p className="profile-id">🔑 Auth0Id: {user.sub}</p>
        <p className="profile-verified">✅ Email verified: {user.email_verified?.toString()}</p>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <button onClick={handleUpdate}>Update Profile</button>
        {message && <p className={`message ${messageType}`}>{message}</p>}
      </div>

      <div className="profile-appointments">
        <h2>Your Appointments</h2>
        <AppointmentList appointments={appointments} />
      </div>

      <div className="profile-requests">
        <h2>Your Requests</h2>
        <RequestList requests={requests} showCreateButton={false} filterByUser={true} />
      </div>
    </div>
  );
}
