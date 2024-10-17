import "../style/home.css";
import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import RequestList from "./RequestList";
import AppointmentList from "./AppointmentList";

export default function Home() {
  const { isAuthenticated } = useAuth0();
  const [hasScheduledAppointments, setHasScheduledAppointments] = useState(true);

  const handleNoScheduledAppointments = () => {
    setHasScheduledAppointments(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      setHasScheduledAppointments(true);

    }
  }, [isAuthenticated]);

  return (
    <div className="home">
      <div className="appointment-section">
        <h2>Your Upcoming Appointments</h2>
        {!isAuthenticated ? (
          <div>
            <p className="prompt-text">
              Please login to see your appointments
            </p>
          </div>
        ) : (
          <div>
            {hasScheduledAppointments ? (
              <AppointmentList 
                filter={true} 
                limit={3} 
                onNoScheduledAppointments={handleNoScheduledAppointments} 
              />
            ) : (
              <p className="prompt-text">
                You don't have any appointments in the future
              </p>
            )}
          </div>
        )}
      </div>
      <div className="requests-section">
        <h2>All Recent Requests</h2>
        <RequestList />
      </div>
    </div>
  );
}
