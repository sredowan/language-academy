import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../styles/GlobalStyles.css';

const Layout = ({ children, title }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <Topbar title={title} />
      <main className="canvas">
        {children}
      </main>
    </div>
  );
};

export default Layout;
