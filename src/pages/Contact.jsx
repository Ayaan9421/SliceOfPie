import React from "react";
import "../App.css"; // Ensure this path is correct
const Contact = () => {
  return (
    <>
      <div className="contact-container">
        <div className="contact-card">
          <h1>Contact Us</h1>
          <p>
            If you have any questions or feedback, feel free to reach out to us!
          </p>
          <div className="contact-info">
            <div className="inner-contact-info"><img src='./mail.png' /><p>Email: contact@sliceofpie.com</p></div>
            <div className="inner-contact-info"><img src='./phone-call.png' /><p>Phone: +1-234-567-890</p></div>
            <div className="inner-contact-info"><img src='./location.png' /><p>Address: 123 Data St., Data City, DC 12345</p></div>
          </div>
        </div>
        
      </div>
    </>
  );
};

export default Contact;
