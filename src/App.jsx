import React from "react";

import "./App.css"; // Global styles
import Header from "./components/Header";
import { Outlet } from "react-router-dom";
function App() {
  return (
    <>
      
      <div className="app">
        <Header />
        <Outlet />
      </div>
    </>
  );
}

export default App;
