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

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/verify-user`,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: requestedScopes.join(" "),
      }}
    >
      <AuthTokenProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="verify-user" element={<VerifyUser />} />
              <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="requests/:id" element={<RequireAuth><RequestDetails /></RequireAuth>} />
              <Route path="auth-debugger" element={<RequireAuth><AuthDebugger /></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthTokenProvider>
    </Auth0Provider>
  </React.StrictMode>
);
