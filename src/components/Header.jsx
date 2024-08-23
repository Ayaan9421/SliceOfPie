import React from "react";
import logo from "/SLiceOfPieLogo.svg";
import { Link } from "react-router-dom";
function Header() {
  return (
    <>
      <div className="navbar">
          <img src="/SLiceOfPieLogo.svg" alt="SliceOfPie Logo" />
          <Link to="/">Home</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/about">About SliceOfPie</Link>
        </div>
    </>
  );
}

export default Header;