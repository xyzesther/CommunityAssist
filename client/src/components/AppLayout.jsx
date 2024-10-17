import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';
import '../style/appLayout.css';

export default function AppLayout() {
  return (
    <div className="app">
      <div className="title">
        <h1>Community Assist</h1>
      </div>
      <div className="header">
        <Navbar />
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};
