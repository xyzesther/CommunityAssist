import { useState } from 'react';
import axios from 'axios';

export default function useUpdateRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateRequest = async (requestId, data, config) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/requests/${requestId}`, data, config);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateRequest, loading, error };
};
