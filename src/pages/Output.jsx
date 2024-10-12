import React from "react";
import { useLocation } from "react-router-dom";
import DataSheetAndChart from "../components/DataSheetAndCharts";
import "../App.css"; // Ensure this path is correct

const Output = () => {
  const location = useLocation();
  const { file, fileType } = location.state || {}; // Handle undefined state

  if (!file) {
    return <div>No data to display. Please upload a file first.</div>;
  }

  return (
    <div className="output-container">
      <h1>Visualize your Data</h1>
      <DataSheetAndChart file={file} fileType={fileType} />
    </div>
  );
};

export default Output;
