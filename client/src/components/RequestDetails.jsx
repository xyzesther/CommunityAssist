import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import MakeAppointmentModal from './MakeAppointmentModal';
import '../style/requestDetails.css';

export default function RequestDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth0();
  const [request, setRequest] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      const result = await axios.get(`${process.env.REACT_APP_API_URL}/requests/${id}`);
      setRequest(result.data);
    };

    const fetchAppointments = async () => {
      const result = await axios.get(`${process.env.REACT_APP_API_URL}/appointments?requestId=${id}`);
      const appointmentData = result.data;

      if (Array.isArray(appointmentData)) {
        setAppointments(appointmentData);
      } else if (appointmentData) {
        setAppointments([appointmentData]);
      } else {
        setAppointments([]);
      }
    };

    fetchRequest();
    fetchAppointments();
  }, [id]);

  if (!request) return <div>Loading...</div>;

  const handleMakeAppointment = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAppointmentMade = async () => {
    handleCloseModal();
    const result = await axios.get(`${process.env.REACT_APP_API_URL}/requests/${id}`);
    setRequest(result.data);
    const resultApp = await axios.get(`${process.env.REACT_APP_API_URL}/appointments?requestId=${id}`);
    const appointmentData = resultApp.data;

    if (Array.isArray(appointmentData)) {
      setAppointments(appointmentData);
    } else if (appointmentData) {
      setAppointments([appointmentData]);
    } else {
      setAppointments([]);
    }
  };

  const formatDate = (date) => {
    const options = { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' };
    return new Date(date).toLocaleString('en-US', options).replace(',', '');
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

  return (
    <div className="request-details">
      <div className="request-details-header">
        <h1 className="request-details-title">{request.title}</h1>
        <span className={`status-tag ${request.status.toLowerCase()}`}>{formatStatus(request.status)}</span>
      </div>
      <div className="request-details-info">
        <p className="request-details-description">{request.description}</p>
        <p className="request-details-user-info">Requested by: {request.user.name}</p>
        <p className="request-details-time-info">Posted on {formatDate(request.createdAt)}</p>
      </div>
      {request.status === 'OPEN' && (
        <button
          className="request-details-btn-primary"
          onClick={handleMakeAppointment}
          disabled={isAuthenticated && user.email === request.user.email}
        >
          Make Appointment
        </button>
      )}
      {appointments.length > 0 && (
        <div className="appointments-list">
          <div className="divider"></div>
          <h2>Appointment Details</h2>
          {appointments.map((appointment, index) => (
            <div key={index} className="appointment-info">
              <p>Appointment Time: {formatDate(appointment.appointmentTime)}</p>
              <p>Volunteer: {appointment.volunteer.name}</p>
              <p>Status: {formatStatus(appointment.status)}</p>
              <div className="divider-small"></div>
            </div>
          ))}
        </div>
      )} 
      {isModalOpen && (
        <MakeAppointmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          requestId={request.requestId}
          onAppointmentMade={handleAppointmentMade}
        />
      )}
    </div>
  );
}
