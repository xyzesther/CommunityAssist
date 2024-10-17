import { useState } from 'react';
import axios from 'axios';

export default function useCreateRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRequest = async (data, config) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/requests`, data, config);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createRequest, loading, error };
};
