import { useState } from 'react';
import axios from 'axios';

export const useMakeAppointment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeAppointment = async (data, token) => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/appointments`, data, config);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { makeAppointment, loading, error };
};
