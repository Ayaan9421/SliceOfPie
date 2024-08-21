import "./App.css";

function App() {
  return (
    <>
      <div className="container">
        <h1>Data Visualization Tool</h1>
        <p>Upload your data to visualize</p>
        <form>
          <label htmlFor="file-type">Select File Type:</label>
          <select id="file-type">
            <option value="csv">CSV</option>
            <option value="xlsx">XLSX</option>
          </select>
          <input type="file" id="file-upload" accept=".csv , .xlsx" />
          <button id="create-btn">Create</button>
        </form>
      </div>
    </>
  );
}

export default App;
