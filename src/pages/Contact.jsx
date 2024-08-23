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
          <p>Email: contact@sliceofpie.com</p>
          <p>Phone: +1-234-567-890</p>
          <p>Address: 123 Data St., Data City, DC 12345</p>
        </div>
      </div>
    </>
  );
};

export default Contact;
