import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { read, utils } from "xlsx";
import { Chart } from "chart.js/auto";
import "../App.css"; // Ensure this path is correct

const DataSheetAndChart = ({ file, fileType }) => {
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [chartType, setChartType] = useState("bar"); // Default to 'bar' chart
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [validChartTypes, setValidChartTypes] = useState([]);
  const [hasNegativeValues, setHasNegativeValues] = useState(false); // State to track negative values

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

  const processAndRenderChart = () => {
    const ctx = chartRef.current.getContext("2d");

    console.log("Data:", data);
    console.log("Labels:", labels);

    const xAxisLabel = labels.find((label) => !isNumericColumn(data, label));
    const yAxisLabels = labels.filter((label) => isNumericColumn(data, label));

    const xAxisDisplayLabels = data.map((row) => {
      return labels
        .filter((label) => !isNumericColumn(data, label))
        .map((label) => row[label])
        .join(" - ");
    });

    if (!xAxisLabel || !yAxisLabels.length) {
      console.error("No valid categorical or numerical data for chart.");
      return;
    }

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
      </div>

      {/* Dropdown to select chart type */}
      {validChartTypes.length > 0 && (
        <div className="chart-type-options" style={{ marginTop: "20px" }}>
          <label htmlFor="chart-type-select">Select Chart Type:</label>
          <select
            id="chart-type-select"
            value={chartType}
            onChange={handleChartTypeChange}
          >
            {validChartTypes
              .filter(
                (type) =>
                  !(
                    hasNegativeValues &&
                    (type === "pie" || type === "doughnut")
                  )
              )
              .map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)} Chart
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default DataSheetAndChart;
