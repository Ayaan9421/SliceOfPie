import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DataSheetAndChart from "../components/DataSheetAndCharts";
import "../App.css"; // Ensure this path is correct

const Output = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { file, fileType } = location.state || {}; // Handle undefined state

  // If there is no file, show a message and a back button
  if (!file) {
    return (
      <div className="error-container">
        <h2>No data to display. Please upload a file first.</h2>
        <button onClick={() => navigate("/upload")} className="back-button">
          Back to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="output-container">
      <h1>Visualize your Data</h1>
      <DataSheetAndChart file={file} fileType={fileType} />
    </div>
  );
};

export default Output;
