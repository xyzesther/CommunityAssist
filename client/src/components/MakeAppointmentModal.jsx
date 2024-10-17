import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useMakeAppointment } from '../hooks/useMakeAppointment';
import axios from 'axios';
import '../style/modal.css';

export default function MakeAppointmentModal({ isOpen, onClose, requestId, onAppointmentMade }) {
  const { getAccessTokenSilently } = useAuth0();
  const [appointmentTime, setAppointmentTime] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const { makeAppointment, loading } = useMakeAppointment();
  const [errorMessage, setErrorMessage] = useState('');
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    setErrorMessage('');
  }, [isOpen]);

  // Fetch OpenWeather data for the appointment date
  const fetchWeather = async (date) => {
    try {
      const API_KEY = 'f41887c006785f4a7d412ab0ada922ef';
      const latitude = '49.25'; // Vancouver
      const longitude = '-123.12'; // Vancouver
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: API_KEY,
          units: 'metric',
        }
      });

      const forecasts = response.data?.list || [];
      const selectedDate = new Date(date);

      const today = new Date();
      const daysDifference = (selectedDate - today) / (1000 * 60 * 60 * 24);
      
      if (daysDifference > 5) {
        setWeather(null);
        return;
      }

      if (forecasts.length === 0) {
        setWeather(null);
        return;
      }
      
      const closestForecast = forecasts.reduce((prev, curr) => {
        const prevDiff = Math.abs(new Date(prev.dt_txt) - selectedDate);
        const currDiff = Math.abs(new Date(curr.dt_txt) - selectedDate);
        return currDiff < prevDiff ? curr : prev;
      });

      if (closestForecast) {
        setWeather({
          summary: closestForecast.weather[0].description,
          temp: closestForecast.main.temp,
          icon: `https://openweathermap.org/img/wn/${closestForecast.weather[0].icon}.png`,
        });
      } else {
        setWeather(null);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeather(null);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setAppointmentTime(selectedDate);
    fetchWeather(selectedDate);
  };

  const checkExistingAppointment = async (token) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const existingAppointments = response?.data || [];
      return existingAppointments.some(appointment =>
        appointment.requestId === requestId &&
        appointment.status !== 'CANCELLED'
      );
    } catch (err) {
      console.error('Error checking existing appointments:', err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const token = await getAccessTokenSilently();
      const appointmentExists = await checkExistingAppointment(token);

      if (appointmentExists) {
        setErrorMessage('An active appointment already exists for this request');
        return;
      }

      await makeAppointment({ requestId, appointmentTime }, token);
      onAppointmentMade();
    } catch (err) {
      setErrorMessage('Failed to make appointment');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal make-appointment-modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Make Appointment</h2>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            Appointment Time:&nbsp;&nbsp;&nbsp; 
            <input
              type="datetime-local"
              value={appointmentTime}
              onChange={handleDateChange}
              required
            />
          </label>
          {weather ? (
            <div className="weather-info">
              <p className="weather-forecast">
              Weather Forecast: <span className="weather-summary">{weather.summary}</span>
              <span className="weather-temp">Temperature: {weather.temp}°C</span>
              <img src={weather.icon} alt="weather icon" />
              </p>
            </div>
          ) : (
            <p>Weather data not available for this date</p>
          )}
          <button type="submit" disabled={loading}>
            {loading ? 'Making Appointment...' : 'Make Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}
