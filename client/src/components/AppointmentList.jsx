import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../style/appointmentList.css';
import { useAuth0 } from "@auth0/auth0-react";

export default function AppointmentList({ filter = false, limit = null, onNoScheduledAppointments }) {
  const { getAccessTokenSilently } = useAuth0();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = await getAccessTokenSilently();
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/appointments/user`, config);
        let fetchedAppointments = response.data;

        if (!Array.isArray(fetchedAppointments)) {
          fetchedAppointments = [fetchedAppointments];
        }

        if (filter) {
          fetchedAppointments = fetchedAppointments
            .filter(appointment => appointment.status === 'SCHEDULED')
            .sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));

          if (fetchedAppointments.length === 0 && onNoScheduledAppointments) {
            onNoScheduledAppointments();
          }
        }

        if (limit) {
          fetchedAppointments = fetchedAppointments.slice(0, limit);
        }

        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Error fetching appointments');
      }
    };

    fetchAppointments();
  }, [getAccessTokenSilently, filter, limit, onNoScheduledAppointments]);

  if (error) {
    return <div className="appointment-list">{error}</div>;
  }
  
  const handleCancelAppointment = async (appointmentId) => {
    try {
      const token = await getAccessTokenSilently();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.put(`${process.env.REACT_APP_API_URL}/appointments/${appointmentId}`, { status: 'CANCELLED' }, config);
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.appointmentId === appointmentId ? { ...appointment, status: 'CANCELLED' } : appointment
        )
      );
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    if (a.status !== 'SCHEDULED' && b.status === 'SCHEDULED') return 1;
    if (a.status === 'SCHEDULED' && b.status !== 'SCHEDULED') return -1;
    return new Date(a.appointmentTime) - new Date(b.appointmentTime);
  });

  return (
    <div className="appointment-list">
      {sortedAppointments.map((appointment, index) => {
        if (!appointment || !appointment.request || !appointment.request.user) {
          console.warn('Invalid appointment data', appointment);
          return null;
        }

        const isCancelable = appointment.status === 'SCHEDULED';

        return (
          <div key={index} className="appointment-card">
            <div className="appointment-header">
              <h3 className="appointment-title">{appointment.request.title}</h3>
            </div>
            <div className="request-info">
              <p>Requested by: {appointment.request.user.name}</p>
              <p>Posted on {new Date(appointment.request.createdAt).toLocaleString()}</p>
            </div>
            <div className="divider"></div>
            <div className="appointment-info">
              <p className='appointment-time'>Appointment Time: {new Date(appointment.appointmentTime).toLocaleString()}</p>
              <p>
                Status: {appointment.status}
                {isCancelable && (
                  <button 
                    className="cancel-appointment-button" 
                    onClick={() => handleCancelAppointment(appointment.appointmentId)}
                  >
                    Cancel
                  </button>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
