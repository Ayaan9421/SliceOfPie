import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Ensure this path is correct

const Upload = () => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('csv');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
  };

  const handleCreateClick = () => {
    if (file) {
      navigate('/output', { state: { file, fileType } });
    }
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
    </div>
  );
};

export default Upload;
