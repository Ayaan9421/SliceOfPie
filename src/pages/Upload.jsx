import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"; // Ensure this path is correct

const Upload = () => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("csv");
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setErrorMessage(""); // Reset error message when a new file is selected
  };

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
    setErrorMessage(""); // Reset error message when file type is changed
  };

  const handleCreateClick = () => {
    if (!file) {
      setErrorMessage("Please upload a file before proceeding.");
      return;
    }

    // Check file type based on extension
    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (
      (fileType === "csv" && fileExtension !== "csv") ||
      (fileType === "xlsx" && fileExtension !== "xlsx")
    ) {
      setErrorMessage(`Please upload a valid ${fileType.toUpperCase()} file.`);
      return;
    }

    // If file is valid, navigate to the output page
    navigate("/output", { state: { file, fileType } });
  };

  return (
    <div className="upload-container">
      <h1>Upload your data</h1>
      <form>
        <label htmlFor="file-type">Select File Type:</label>
        <select id="file-type" value={fileType} onChange={handleFileTypeChange}>
          <option value="csv">CSV</option>
          <option value="xlsx">XLSX</option>
        </select>
        <input
          type="file"
          id="file-upload"
          accept=".csv, .xlsx"
          onChange={handleFileChange}
        />
        <button type="button" onClick={handleCreateClick}>
          Create
        </button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}{" "}
      {/* Display error message */}
    </div>
  );
};

export default Upload;
