import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import VerifyUser from "./components/VerifyUser";
import RequestDetails from "./components/RequestDetails";
import Profile from "./components/Profile";
import AuthDebugger from "./components/AuthDebugger";
import NotFound from "./components/NotFound";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { AuthTokenProvider } from "./AuthTokenContext";
import AppLayout from "./components/AppLayout";
import { requestedScopes } from "./constants";
import "./style/normalize.css";
import "./style/index.css";

const container = document.getElementById("root");

function MissingAuth0Config() {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN || "";
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || "";
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE || "";

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h2 style={{ marginTop: 0 }}>Auth0 is not configured</h2>
      <p>
        The frontend needs Auth0 env vars at <b>build time</b>. Fill them in <code>.env</code> and rebuild the
        <code>web</code> container.
      </p>

      <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8, overflowX: "auto" }}>
{`REACT_APP_AUTH0_DOMAIN=${domain || "<empty>"}
REACT_APP_AUTH0_CLIENT_ID=${clientId || "<empty>"}
REACT_APP_AUTH0_AUDIENCE=${audience || "<empty>"}`}
      </pre>

      <p style={{ marginBottom: 6 }}>
        Expected Auth0 Dashboard locations:
      </p>
      <ul style={{ marginTop: 0 }}>
        <li>
          <b>Domain / Client ID</b>: Applications → Your SPA → Settings
        </li>
        <li>
          <b>Audience</b> (API Identifier): Applications → APIs → Your API → Settings → Identifier
        </li>
      </ul>

      <p style={{ marginBottom: 6 }}>
        After editing <code>.env</code>, rebuild:
      </p>
      <pre style={{ background: "#f6f8fa", padding: 12, borderRadius: 8, overflowX: "auto" }}>
docker compose up -d --build web
      </pre>
    </div>
  );
}

function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();

  // If the user is not authenticated, redirect to the home page
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, display the children (the protected page)
  return children;
}

const root = ReactDOMClient.createRoot(container);

const auth0Domain = process.env.REACT_APP_AUTH0_DOMAIN;
const auth0ClientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
const auth0Audience = process.env.REACT_APP_AUTH0_AUDIENCE;
const hasAuth0Config = Boolean(auth0Domain && auth0ClientId && auth0Audience);

root.render(
  <React.StrictMode>
    {hasAuth0Config ? (
      <Auth0Provider
        domain={auth0Domain}
        clientId={auth0ClientId}
        authorizationParams={{
          redirect_uri: `${window.location.origin}/verify-user`,
          audience: auth0Audience,
          scope: requestedScopes.join(" "),
        }}
      >
        <AuthTokenProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="verify-user" element={<VerifyUser />} />
                <Route
                  path="profile"
                  element={
                    <RequireAuth>
                      <Profile />
                    </RequireAuth>
                  }
                />
                <Route
                  path="requests/:id"
                  element={
                    <RequireAuth>
                      <RequestDetails />
                    </RequireAuth>
                  }
                />
                <Route
                  path="auth-debugger"
                  element={
                    <RequireAuth>
                      <AuthDebugger />
                    </RequireAuth>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthTokenProvider>
      </Auth0Provider>
    ) : (
      <MissingAuth0Config />
    )}
  </React.StrictMode>
);
