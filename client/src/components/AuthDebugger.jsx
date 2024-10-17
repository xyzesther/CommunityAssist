import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import '../style/authDebugger.css';

const AuthDebugger = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState('');

  const showToken = async () => {
    const token = await getAccessTokenSilently();
    setToken(token);
    console.log(token);
    alert(token);
  };

  return (
    <div className="auth-debugger-container">
      <h1>Auth Debugger</h1>
      <div>
        <p>User Info:</p>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
      <button onClick={showToken}>Show Token</button>
      {token && (
        <div>
          <p>Retrieved Token:</p>
          <pre>{token}</pre>
        </div>
      )}
    </div>
  );
};

export default AuthDebugger;
