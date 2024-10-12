import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"; // Ensure this path is correct

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home-container">
        <h1>Welcome to SliceOfPie</h1>
        <p>
          Unlock the power of your data with real-time collaboration and
          interactive visualizations. Transform insights into action—together.
        </p>
        <button onClick={() => navigate("/upload")}>Get Started</button>
      </div>
      <div className="image-section">
        <img src="graph.jpg" alt="Data Chart" className="data-image" />
      </div>
    </div>
  );
};

export default Home;
