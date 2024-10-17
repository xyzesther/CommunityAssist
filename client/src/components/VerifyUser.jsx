import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export default function VerifyUser() {
  const navigate = useNavigate();
  const { getAccessTokenSilently, user, isLoading } = useAuth0();

  useEffect(() => {
    async function verifyUser() {
      if (user) {
        const token = await getAccessTokenSilently();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/verify-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
          }),
        });

        const result = await response.json();

        if (result.auth0Id) {
          navigate('/');
        }
      }
    }

    if (!isLoading) {
      verifyUser();
    }
  }, [getAccessTokenSilently, user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="loading">
        <h1>Loading...</h1>
        <p>If you keep seeing this message after logging in, please check your network tab in the browser's Developer Tools to see if there are any errors.</p>
        <p>Check also your API terminal for any errors in the POST /verify-user route.</p>
      </div>
    );
  }

  return null;
}
