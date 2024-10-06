import React from "react";
import "../App.css"; // Ensure this path is correct
const Contact = () => {
  return (
    <>
      <div className="contact-container">
        <h1>Contact Us</h1>
        <p>
          If you have any questions or feedback, feel free to reach out to us!
        </p>
        <div className="contact-info">
          <p>Team Members: </p>
          <ul>
            <li>Ayaan Shaikh</li>
            <li>Aayush Sharma</li>
            <li>Simriti Tahilramani</li>
          </ul>
          <p>Project Guide: Sonal Shroff</p>
        </div>
      </div>
    </>
  );
};

export default Contact;
