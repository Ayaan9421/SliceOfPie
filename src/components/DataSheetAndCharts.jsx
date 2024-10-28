import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { read, utils, writeFile } from "xlsx"; // Import writeFile for XLSX export
import { Chart } from "chart.js/auto";
import jsPDF from "jspdf"; // Import jsPDF for PDF export
import { useNavigate } from "react-router-dom";
import "../App.css"; // Ensure this path is correct

const DataSheetAndChart = ({ file, fileType }) => {
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [chartType, setChartType] = useState("bar"); // Default to 'bar' chart
  const [saveFormat, setSaveFormat] = useState("png"); // Default save format
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [validChartTypes, setValidChartTypes] = useState([]);
  const [hasNegativeValues, setHasNegativeValues] = useState(false); // State to track negative values
  const [originalFileName, setOriginalFileName] = useState(""); // Store the original file name
  const navigate = useNavigate();

  // Detect if a column should be treated as numerical based on consistency
  const isIncrementingColumn = (data, field) => {
    const values = data
      .map((row) => parseFloat(row[field]))
      .filter((v) => !isNaN(v));
    return (
      values.length > 1 &&
      values.every((val, index) => index === 0 || val - values[index - 1] === 1)
    );
  };

  const isNumericColumn = (data, field) => {
    return (
      data.every((row) => !isNaN(parseFloat(row[field]))) &&
      !isIncrementingColumn(data, field)
    );
  };

  // Generate random colors for graphs
  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Generate distinct colors for each data point or dataset
  const generateRandomColors = (numColors) => {
    return Array.from({ length: numColors }, () => generateRandomColor());
  };

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (fileType === "csv") {
        Papa.parse(e.target.result, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setLabels(result.meta.fields);
            setData(result.data);
            validateChartTypes(result.data, result.meta.fields);
          },
        });
        setOriginalFileName(file.name.split(".")[0]); // Store the original file name without extension
      } else if (fileType === "xlsx") {
        const workbook = read(e.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = utils.sheet_to_json(sheet, { header: 1 });
        const [header, ...rows] = jsonData;
        const dataWithKeys = rows.map((row) => {
          let obj = {};
          header.forEach((key, index) => {
            obj[key] = row[index];
          });
          return obj;
        });
        setLabels(header);
        setData(dataWithKeys);
        validateChartTypes(dataWithKeys, header);
        setOriginalFileName(file.name.split(".")[0]); // Store the original file name without extension
      }
    };
    reader.readAsBinaryString(file);
  }, [file, fileType]);

  const validateChartTypes = (data, headers) => {
    const numColumns = headers.length;

    // Check for negative values in numeric columns
    const hasNegatives = headers.some((header) => {
      return (
        isNumericColumn(data, header) &&
        data.some((row) => parseFloat(row[header]) < 0)
      );
    });

    // Store the result of negative value check in state
    setHasNegativeValues(hasNegatives);

    // Validate which chart types can be shown
    const validTypes = [];

    // Bar, Line, and Radar charts are valid if we have multiple rows and multiple columns
    if (data.length && numColumns > 2) {
      validTypes.push("bar", "line", "radar");
    }

    // Pie and Donut charts are valid only if no negative values are present
    else if (numColumns === 2 && !hasNegatives) {
      validTypes.push("bar", "line", "pie", "doughnut");
    } else {
      validTypes.push("bar", "line"); // Always include bar and line charts
    }

    setValidChartTypes(validTypes);
  };

  useEffect(() => {
    if (data.length && chartRef.current) {
      processAndRenderChart();
    }
  }, [data, chartType]); // Rerun when chartType changes or data updates

  const [errorMessage, setErrorMessage] = useState("");

  const processAndRenderChart = () => {
    const ctx = chartRef.current.getContext("2d");

    const xAxisLabel = labels.find((label) => !isNumericColumn(data, label));
    const yAxisLabels = labels.filter((label) => isNumericColumn(data, label));
    const hasNumericRows = yAxisLabels.some((label) =>
      data.some((row) => !isNaN(parseFloat(row[label])))
    );

    if (!xAxisLabel || !yAxisLabels.length || !hasNumericRows) {
      console.error("No valid categorical or numerical data for chart.");
      setErrorMessage("No valid categorical or numerical data for chart."); // Update state for UI display
      return;
    }

    setErrorMessage("");
    const xAxisDisplayLabels = data.map((row) => {
      return labels
        .filter((label) => !isNumericColumn(data, label))
        .map((label) => row[label])
        .join(" - ");
    });

    const datasets = yAxisLabels.map((subject, index) => {
      const dataValues = data.map((row) => parseFloat(row[subject]) || 0);
      return {
        label: subject,
        data: dataValues,
        backgroundColor:
          chartType !== "radar"
            ? generateRandomColors(dataValues.length)
            : `hsl(${(index * 60) % 360}, 50%, 60%, 0.5)`,
        borderColor:
          chartType !== "radar"
            ? generateRandomColors(dataValues.length)
            : `hsl(${(index * 60) % 360}, 100%, 50%)`,
        fill: chartType !== "line",
      };
    });

    if (chartInstance) {
      chartInstance.destroy();
    }

    const newChartInstance = new Chart(ctx, {
      type: chartType,
      data: {
        labels: xAxisDisplayLabels,
        datasets: datasets,
      },
      options: {
        scales: {
          x: {
            stacked: chartType === "bar",
            title: {
              display: true,
              text: xAxisLabel,
            },
          },
          y: {
            stacked: chartType === "bar",
            beginAtZero: true,
            title: {
              display: true,
              text:
                chartType === "pie" || chartType === "doughnut" ? "" : "Value",
            },
          },
        },
        plugins: {
          legend: { position: "top" },
          tooltip: {
            backgroundColor: "white",
            titleColor: "black",
            bodyColor: "black",
          }, // Ensure tooltip visibility
        },
      },
    });
    setChartInstance(newChartInstance);
  };

  const handleInputChange = (index, label, value) => {
    const updatedData = [...data];
    updatedData[index][label] = value;
    setData(updatedData);

    // Validate chart types after updating data to check for negatives
    validateChartTypes(updatedData, labels);
  };

  const handleChartTypeChange = (e) => {
    setChartType(e.target.value);
  };

  const handleFormatChange = (e) => {
    setSaveFormat(e.target.value);
  };

  const handleSaveChart = () => {
    if (!chartRef.current) return;

    const canvas = chartRef.current;

    // Create a new canvas to draw the chart on without clearing the original
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    // Fill the temporary canvas with a white background
    tempCtx.fillStyle = "white"; // Set the fill color to white
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height); // Fill the canvas with white

    // Draw the current chart onto the temporary canvas
    tempCtx.drawImage(canvas, 0, 0);

    const format = saveFormat;
    const xAxisLabel = labels.find((label) => !isNumericColumn(data, label));
    const fileName = originalFileName; // Use the original file name without extension

    if (format === "png" || format === "jpg") {
      const link = document.createElement("a");
      link.download = `${fileName}.${format}`; // Save with the original name and chosen format
      link.href = tempCanvas.toDataURL(`image/${format}`);
      link.click();
    } else if (format === "pdf") {
      const pdf = new jsPDF();
      const imgData = tempCanvas.toDataURL("image/png");

      const imgWidth = 180; // Set image width for PDF
      const imgHeight = (tempCanvas.height * imgWidth) / tempCanvas.width; // Maintain aspect ratio
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`${fileName}.pdf`); // Save with the original name and .pdf extension
    }
  };

  // New function to export data as CSV
  const handleExportDataAsCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `modified_${originalFileName}.csv`); // Updated filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // New function to export data as XLSX
  const handleExportDataAsXLSX = () => {
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Sheet1");
    writeFile(workbook, `modified_${originalFileName}.xlsx`); // Updated filename
  };

  return (
    <div>
      <div className="data-container">
        <table className="data-table">
          <thead>
            <tr>
              {labels.map((label, index) => (
                <th key={index}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {labels.map((label, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type={isNumericColumn(data, label) ? "number" : "text"}
                      value={row[label] || ""}
                      onChange={(e) =>
                        handleInputChange(rowIndex, label, e.target.value)
                      }
                      style={{
                        width: "100px",
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div id="chart">
          <canvas ref={chartRef}></canvas>
        </div>

        {/* Error Message Display */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>

      {/* Dropdown to select chart type */}
      {validChartTypes.length > 0 && (
        <div className="chart-type-options" style={{ marginTop: "10px" }}>
          <label>Chart Type:</label>
          <select onChange={handleChartTypeChange} value={chartType}>
            {validChartTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          {/* Dropdown for save format */}
          <label style={{ marginLeft: "0px" }}>Save Format:</label>
          <select onChange={handleFormatChange} value={saveFormat}>
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="pdf">PDF</option>
          </select>

          <button
            className="exportbtn"
            onClick={handleSaveChart}
            style={{ marginLeft: "20px" }}
          >
            Save Chart
          </button>

          {/* New buttons for exporting data */}
          <button
            className="exportbtn"
            onClick={handleExportDataAsCSV}
            style={{ marginLeft: "20px" }}
          >
            Export as CSV
          </button>
          <button
            className="exportbtn"
            onClick={handleExportDataAsXLSX}
            style={{ marginLeft: "20px" }}
          >
            Export as XLSX
          </button>
        </div>
      )}
    </div>
  );
};

export default DataSheetAndChart;
